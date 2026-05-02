from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import uvicorn
from sqlalchemy.orm import Session

from services.stock_service import StockService
from services.technical_service import TechnicalService
from services.ai_service import AIService
from models.schemas import (
    StockQuote, 
    HistoricalData, 
    TechnicalIndicators,
    AISignal,
    Portfolio,
    PortfolioPosition
)
from database import init_db, get_db, SessionLocal
from models.database_models import (
    User, Portfolio as DBPortfolio, Position, Trade, AISignal as DBAISignal
)

app = FastAPI(
    title="Stock AI Trading Platform",
    description="AI-powered stock analysis and trading signals",
    version="1.0.0"
)

# Initialize database
@app.on_event("startup")
async def startup():
    """Initialize database on app startup"""
    init_db()
    print("✅ Database initialized on startup")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
stock_service = StockService()
technical_service = TechnicalService()
ai_service = AIService()

# Default user ID (in production, get from authentication)
DEFAULT_USER_ID = 1


@app.get("/")
async def root():
    return {
        "message": "Stock AI Trading Platform API",
        "version": "1.0.0",
        "endpoints": [
            "/quote/{symbol}",
            "/history/{symbol}",
            "/indicators/{symbol}",
            "/ai-signal/{symbol}",
            "/search",
            "/portfolio",
            "/trade"
        ]
    }


@app.get("/quote/{symbol}", response_model=StockQuote)
async def get_quote(symbol: str):
    """Get real-time stock quote."""
    try:
        return stock_service.get_quote(symbol.upper())
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/history/{symbol}", response_model=list[HistoricalData])
async def get_history(
    symbol: str,
    period: str = Query(default="6mo", pattern="^(1mo|3mo|6mo|1y|2y|5y)$")
):
    """Get historical OHLCV data."""
    try:
        return stock_service.get_historical_data(symbol.upper(), period)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/indicators/{symbol}", response_model=TechnicalIndicators)
async def get_indicators(
    symbol: str,
    period: str = Query(default="6mo")
):
    """Get technical indicators for a stock."""
    try:
        df = stock_service.get_dataframe(symbol.upper(), period)
        return technical_service.calculate_indicators(df)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/indicator-history/{symbol}/{indicator}")
async def get_indicator_history(
    symbol: str,
    indicator: str,
    period: str = Query(default="6mo")
):
    """Get historical values for a specific indicator."""
    try:
        df = stock_service.get_dataframe(symbol.upper(), period)
        return technical_service.get_indicator_history(df, indicator)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/ai-signal/{symbol}", response_model=AISignal)
async def get_ai_signal(symbol: str):
    """Get AI-generated trading signal."""
    try:
        # Fetch all required data
        quote = stock_service.get_quote(symbol.upper())
        df = stock_service.get_dataframe(symbol.upper(), "6mo")
        indicators = technical_service.calculate_indicators(df)
        
        # Get historical prices for momentum analysis
        prices = df['close'].tolist()
        
        # Generate AI signal
        signal = ai_service.generate_signal(
            symbol=symbol.upper(),
            current_price=quote.price,
            indicators=indicators,
            historical_prices=prices
        )
        
        return signal
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/search")
async def search_symbols(q: str = Query(..., min_length=1)):
    """Search for stock symbols."""
    return stock_service.search_symbols(q)


@app.get("/portfolio", response_model=Portfolio)
async def get_portfolio(db: Session = Depends(get_db)):
    """Get current paper trading portfolio."""
    # Get user's portfolio from database
    db_portfolio = db.query(DBPortfolio).filter(
        DBPortfolio.user_id == DEFAULT_USER_ID
    ).first()
    
    if not db_portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    positions = []
    total_market_value = 0
    total_cost = 0
    
    for position in db_portfolio.positions:
        try:
            quote = stock_service.get_quote(position.symbol)
            market_value = position.shares * quote.price
            cost_basis = position.shares * position.avg_cost
            pnl = market_value - cost_basis
            pnl_pct = (pnl / cost_basis) * 100 if cost_basis > 0 else 0
            
            # Update position in database
            position.current_price = quote.price
            position.market_value = round(market_value, 2)
            position.profit_loss = round(pnl, 2)
            position.profit_loss_percent = round(pnl_pct, 2)
            
            positions.append(PortfolioPosition(
                symbol=position.symbol,
                shares=position.shares,
                avg_cost=position.avg_cost,
                current_price=quote.price,
                market_value=round(market_value, 2),
                profit_loss=round(pnl, 2),
                profit_loss_percent=round(pnl_pct, 2)
            ))
            
            total_market_value += market_value
            total_cost += cost_basis
        except Exception as e:
            print(f"Error updating position {position.symbol}: {e}")
            continue
    
    # Update portfolio totals
    total_value = db_portfolio.cash + total_market_value
    total_pnl = total_market_value - total_cost
    
    db_portfolio.total_value = round(total_value, 2)
    db_portfolio.total_pnl = round(total_pnl, 2)
    db.commit()
    
    return Portfolio(
        cash=round(db_portfolio.cash, 2),
        total_value=round(total_value, 2),
        positions=positions,
        daily_pnl=db_portfolio.daily_pnl,  
        total_pnl=round(total_pnl, 2)
    )


@app.post("/trade")
async def execute_trade(
    symbol: str,
    action: str = Query(..., pattern="^(BUY|SELL)$"),
    shares: float = Query(..., gt=0),
    db: Session = Depends(get_db)
):
    """Execute a paper trade."""
    try:
        # Get user's portfolio
        db_portfolio = db.query(DBPortfolio).filter(
            DBPortfolio.user_id == DEFAULT_USER_ID
        ).first()
        
        if not db_portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        
        quote = stock_service.get_quote(symbol.upper())
        total_cost = shares * quote.price
        
        if action == "BUY":
            if total_cost > db_portfolio.cash:
                raise HTTPException(
                    status_code=400, 
                    detail="Insufficient funds"
                )
            
            # Update cash
            db_portfolio.cash -= total_cost
            
            # Find or create position
            position = db.query(Position).filter(
                Position.portfolio_id == db_portfolio.id,
                Position.symbol == symbol.upper()
            ).first()
            
            if position:
                # Update existing position
                new_shares = position.shares + shares
                new_cost = (
                    (position.shares * position.avg_cost) + total_cost
                ) / new_shares
                position.shares = new_shares
                position.avg_cost = new_cost
            else:
                # Create new position
                position = Position(
                    portfolio_id=db_portfolio.id,
                    symbol=symbol.upper(),
                    shares=shares,
                    avg_cost=quote.price
                )
                db.add(position)
        
        else:  # SELL
            position = db.query(Position).filter(
                Position.portfolio_id == db_portfolio.id,
                Position.symbol == symbol.upper()
            ).first()
            
            if not position:
                raise HTTPException(
                    status_code=400, 
                    detail="No position to sell"
                )
            
            if shares > position.shares:
                raise HTTPException(
                    status_code=400, 
                    detail="Insufficient shares"
                )
            
            # Update cash
            db_portfolio.cash += total_cost
            position.shares -= shares
            
            # Delete position if fully sold
            if position.shares == 0:
                db.delete(position)
        
        # Record trade in history
        trade = Trade(
            user_id=DEFAULT_USER_ID,
            symbol=symbol.upper(),
            action=action,
            shares=shares,
            price=quote.price,
            total=total_cost
        )
        db.add(trade)
        db.commit()
        
        return {
            "success": True,
            "action": action,
            "symbol": symbol.upper(),
            "shares": shares,
            "price": round(quote.price, 2),
            "total": round(total_cost, 2)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Stock AI Trading Platform"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
