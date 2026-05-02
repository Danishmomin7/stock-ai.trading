import pandas as pd
import numpy as np
import ta
from ta.momentum import RSIIndicator
from ta.trend import MACD, SMAIndicator, EMAIndicator
from ta.volatility import BollingerBands, AverageTrueRange
from models.schemas import TechnicalIndicators

class TechnicalService:
    def calculate_indicators(self, df: pd.DataFrame) -> TechnicalIndicators:
        """Calculate all technical indicators."""
        if len(df) < 50:
            return TechnicalIndicators()
        
        close = df['close']
        high = df['high']
        low = df['low']
        
        # RSI (14-period)
        rsi = RSIIndicator(close=close, window=14)
        rsi_value = rsi.rsi().iloc[-1]
        
        # MACD
        macd = MACD(close=close)
        macd_line = macd.macd().iloc[-1]
        macd_signal = macd.macd_signal().iloc[-1]
        macd_hist = macd.macd_diff().iloc[-1]
        
        # Moving Averages
        sma_20 = SMAIndicator(close=close, window=20).sma_indicator().iloc[-1]
        sma_50 = SMAIndicator(close=close, window=50).sma_indicator().iloc[-1]
        ema_12 = EMAIndicator(close=close, window=12).ema_indicator().iloc[-1]
        ema_26 = EMAIndicator(close=close, window=26).ema_indicator().iloc[-1]
        
        # Bollinger Bands
        bb = BollingerBands(close=close, window=20, window_dev=2)
        bb_upper = bb.bollinger_hband().iloc[-1]
        bb_middle = bb.bollinger_mavg().iloc[-1]
        bb_lower = bb.bollinger_lband().iloc[-1]
        
        # ATR
        atr = AverageTrueRange(high=high, low=low, close=close, window=14)
        atr_value = atr.average_true_range().iloc[-1]
        
        return TechnicalIndicators(
            rsi=round(rsi_value, 2) if not np.isnan(rsi_value) else None,
            macd=round(macd_line, 4) if not np.isnan(macd_line) else None,
            macd_signal=round(macd_signal, 4) if not np.isnan(macd_signal) else None,
            macd_histogram=round(macd_hist, 4) if not np.isnan(macd_hist) else None,
            sma_20=round(sma_20, 2) if not np.isnan(sma_20) else None,
            sma_50=round(sma_50, 2) if not np.isnan(sma_50) else None,
            ema_12=round(ema_12, 2) if not np.isnan(ema_12) else None,
            ema_26=round(ema_26, 2) if not np.isnan(ema_26) else None,
            bollinger_upper=round(bb_upper, 2) if not np.isnan(bb_upper) else None,
            bollinger_middle=round(bb_middle, 2) if not np.isnan(bb_middle) else None,
            bollinger_lower=round(bb_lower, 2) if not np.isnan(bb_lower) else None,
            atr=round(atr_value, 2) if not np.isnan(atr_value) else None
        )

    def get_indicator_history(
        self, 
        df: pd.DataFrame, 
        indicator: str
    ) -> list[dict]:
        """Get historical values for a specific indicator."""
        close = df['close']
        high = df['high']
        low = df['low']
        dates = df['date'].dt.strftime("%Y-%m-%d").tolist()
        
        if indicator == "rsi":
            rsi = RSIIndicator(close=close, window=14)
            values = rsi.rsi().tolist()
        elif indicator == "macd":
            macd = MACD(close=close)
            values = macd.macd().tolist()
        elif indicator == "sma_20":
            values = SMAIndicator(close=close, window=20).sma_indicator().tolist()
        elif indicator == "sma_50":
            values = SMAIndicator(close=close, window=50).sma_indicator().tolist()
        else:
            return []
        
        result = []
        for i, (date, value) in enumerate(zip(dates, values)):
            if not np.isnan(value):
                result.append({
                    "date": date,
                    "value": round(value, 2),
                    "close": round(close.iloc[i], 2)
                })
        return result
