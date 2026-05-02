from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class StockQuote(BaseModel):
    """Schema for real-time stock quote data."""
    symbol: str
    price: float
    change: float
    change_percent: float
    volume: int
    high: float
    low: float
    open: float
    previous_close: float
    timestamp: datetime


class HistoricalData(BaseModel):
    """Schema for historical stock OHLCV data."""
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class TechnicalIndicators(BaseModel):
    """Schema for technical indicators."""
    rsi: Optional[float] = None
    macd: Optional[float] = None
    macd_signal: Optional[float] = None
    macd_histogram: Optional[float] = None
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    ema_12: Optional[float] = None
    ema_26: Optional[float] = None
    bollinger_upper: Optional[float] = None
    bollinger_middle: Optional[float] = None
    bollinger_lower: Optional[float] = None
    atr: Optional[float] = None


class AISignal(BaseModel):
    """Schema for AI-generated trading signals."""
    symbol: str
    signal: str  # BUY, SELL, HOLD
    confidence: float  # 0-100
    score: float
    reasoning: str
    indicators_aligned: int
    timestamp: datetime


class PortfolioPosition(BaseModel):
    """Schema for individual portfolio position."""
    symbol: str
    shares: float
    avg_cost: float
    current_price: float
    market_value: float
    profit_loss: float
    profit_loss_percent: float


class Portfolio(BaseModel):
    """Schema for portfolio overview."""
    cash: float
    total_value: float
    positions: list[PortfolioPosition]
    daily_pnl: float
    total_pnl: float
