from datetime import datetime
from models.schemas import AISignal, TechnicalIndicators


class AIService:
    def generate_signal(
        self,
        symbol: str,
        current_price: float,
        indicators: TechnicalIndicators,
        historical_prices: list[float]
    ) -> AISignal:
        """Generate AI-based trading signal."""
        signal, confidence, score, reasoning = self._analyze_indicators(
            indicators,
            current_price,
            historical_prices
        )
        
        return AISignal(
            symbol=symbol,
            signal=signal,
            confidence=confidence,
            score=score,
            reasoning=reasoning,
            indicators_aligned=self._count_aligned_indicators(indicators, signal),
            timestamp=datetime.now()
        )

    def _analyze_indicators(
        self,
        indicators: TechnicalIndicators,
        current_price: float,
        historical_prices: list[float]
    ) -> tuple[str, float, float, str]:
        """Analyze technical indicators and generate signal."""
        buy_signals = 0
        sell_signals = 0
        total_signals = 0
        
        # RSI Analysis (0-30 oversold, 70-100 overbought)
        if indicators.rsi:
            total_signals += 1
            if indicators.rsi < 30:
                buy_signals += 1
            elif indicators.rsi > 70:
                sell_signals += 1
        
        # MACD Analysis
        if indicators.macd and indicators.macd_signal:
            total_signals += 1
            if indicators.macd > indicators.macd_signal:
                buy_signals += 1
            else:
                sell_signals += 1
        
        # Moving Average Analysis
        if indicators.sma_20 and indicators.sma_50:
            total_signals += 1
            if indicators.sma_20 > indicators.sma_50:
                buy_signals += 1
            else:
                sell_signals += 1
        
        # Bollinger Bands Analysis
        if (indicators.bollinger_upper and 
            indicators.bollinger_lower and 
            indicators.bollinger_middle):
            total_signals += 1
            if current_price < indicators.bollinger_lower:
                buy_signals += 1
            elif current_price > indicators.bollinger_upper:
                sell_signals += 1
        
        # Price Momentum (comparing to SMA)
        if indicators.ema_12 and indicators.ema_26:
            total_signals += 1
            if indicators.ema_12 > indicators.ema_26:
                buy_signals += 1
            else:
                sell_signals += 1
        
        # Determine signal
        if buy_signals > sell_signals:
            signal = "BUY"
        elif sell_signals > buy_signals:
            signal = "SELL"
        else:
            signal = "HOLD"
        
        # Calculate confidence
        if total_signals > 0:
            confidence = max(buy_signals, sell_signals) / total_signals * 100
        else:
            confidence = 0
        
        # Calculate score (-100 to 100)
        score = ((buy_signals - sell_signals) / max(total_signals, 1)) * 100
        
        # Generate reasoning
        reasoning = self._generate_reasoning(
            signal, indicators, buy_signals, sell_signals
        )
        
        return signal, round(confidence, 2), round(score, 2), reasoning

    def _count_aligned_indicators(
        self,
        indicators: TechnicalIndicators,
        signal: str
    ) -> int:
        """Count how many indicators align with the signal."""
        count = 0
        total = 0
        
        # Check each indicator
        if indicators.rsi:
            total += 1
            if signal == "BUY" and indicators.rsi < 30:
                count += 1
            elif signal == "SELL" and indicators.rsi > 70:
                count += 1
        
        if indicators.macd and indicators.macd_signal:
            total += 1
            if signal == "BUY" and indicators.macd > indicators.macd_signal:
                count += 1
            elif signal == "SELL" and indicators.macd < indicators.macd_signal:
                count += 1
        
        return count

    def _generate_reasoning(
        self,
        signal: str,
        indicators: TechnicalIndicators,
        buy_count: int,
        sell_count: int
    ) -> str:
        """Generate human-readable reasoning."""
        reasons = []
        
        if indicators.rsi:
            if indicators.rsi < 30:
                reasons.append(f"RSI {indicators.rsi} indicates oversold conditions")
            elif indicators.rsi > 70:
                reasons.append(f"RSI {indicators.rsi} indicates overbought conditions")
        
        if indicators.macd and indicators.macd_signal:
            if indicators.macd > indicators.macd_signal:
                reasons.append("MACD above signal line")
            else:
                reasons.append("MACD below signal line")
        
        if signal == "BUY":
            return f"Buy signal: {'; '.join(reasons[:2])}"
        elif signal == "SELL":
            return f"Sell signal: {'; '.join(reasons[:2])}"
        else:
            return "Hold signal: Mixed indicator signals"
