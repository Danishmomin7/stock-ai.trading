import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from models.schemas import StockQuote, HistoricalData

class StockService:
    def __init__(self):
        self.cache = {}
        self.cache_duration = timedelta(minutes=1)

    def get_quote(self, symbol: str) -> StockQuote:
        """Fetch real-time stock quote."""
        ticker = yf.Ticker(symbol)
        info = ticker.info
        hist = ticker.history(period="2d")
        
        if hist.empty:
            raise ValueError(f"No data found for symbol: {symbol}")
        
        current = hist.iloc[-1]
        previous = hist.iloc[-2] if len(hist) > 1 else current
        
        price = current['Close']
        prev_close = previous['Close']
        change = price - prev_close
        change_pct = (change / prev_close) * 100
        
        return StockQuote(
            symbol=symbol.upper(),
            price=round(price, 2),
            change=round(change, 2),
            change_percent=round(change_pct, 2),
            volume=int(current['Volume']),
            high=round(current['High'], 2),
            low=round(current['Low'], 2),
            open=round(current['Open'], 2),
            previous_close=round(prev_close, 2),
            timestamp=datetime.now()
        )

    def get_historical_data(
        self, 
        symbol: str, 
        period: str = "6mo"
    ) -> list[HistoricalData]:
        """Fetch historical OHLCV data."""
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period)
        
        data = []
        for date, row in hist.iterrows():
            data.append(HistoricalData(
                date=date.strftime("%Y-%m-%d"),
                open=round(row['Open'], 2),
                high=round(row['High'], 2),
                low=round(row['Low'], 2),
                close=round(row['Close'], 2),
                volume=int(row['Volume'])
            ))
        return data

    def get_dataframe(self, symbol: str, period: str = "6mo") -> pd.DataFrame:
        """Get historical data as DataFrame for analysis."""
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period)
        df.reset_index(inplace=True)
        df.columns = [c.lower() for c in df.columns]
        return df

    def search_symbols(self, query: str) -> list[dict]:
        """Search for stock symbols."""
        # Common US stocks for autocomplete
        common_stocks = {
            "AAPL": "Apple Inc.",
            "GOOGL": "Alphabet Inc.",
            "MSFT": "Microsoft Corporation",
            "AMZN": "Amazon.com Inc.",
            "TSLA": "Tesla Inc.",
            "META": "Meta Platforms Inc.",
            "NVDA": "NVIDIA Corporation",
            "JPM": "JPMorgan Chase & Co.",
            "V": "Visa Inc.",
            "JNJ": "Johnson & Johnson",
            "WMT": "Walmart Inc.",
            "PG": "Procter & Gamble Co.",
            "MA": "Mastercard Inc.",
            "HD": "Home Depot Inc.",
            "DIS": "Walt Disney Co.",
            "NFLX": "Netflix Inc.",
            "PYPL": "PayPal Holdings Inc.",
            "INTC": "Intel Corporation",
            "AMD": "Advanced Micro Devices",
            "CRM": "Salesforce Inc."
        }
        
        query = query.upper()
        results = []
        for symbol, name in common_stocks.items():
            if query in symbol or query.lower() in name.lower():
                results.append({"symbol": symbol, "name": name})
        return results[:10]
