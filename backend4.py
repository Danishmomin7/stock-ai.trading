import numpy as np
from models.schemas import AISignal, TechnicalIndicators

class AIService:
    """
    AI-powered trading signal generator using technical analysis confluence.
    Uses a rule-based scoring system that mimics ML decision-making.
    """
    
    def __init__(self):
        # Scoring weights for different indicators
        self.weights = {
            "rsi": 0.20,
            "macd": 0.20,
            "trend": 0.25,
            "bollinger": 0.15,
            "momentum": 0.20
        }

    def generate_signal(
        self, 
        symbol: str,
        current_price: float,
        indicators: TechnicalIndicators,
        historical_prices: list[float]
    ) -> AISignal:
        """Generate AI trading signal based on technical confluence."""
        
        scores = {}
        reasoning = []
        
        # RSI Analysis
        rsi_score, rsi_reason = self._analyze_rsi(indicators.rsi)
        scores["rsi"] = rsi_score
        if rsi_reason:
            reasoning.append(rsi_reason)
        
        # MACD Analysis
        macd_score, macd_reason = self._analyze_macd(
            indicators.macd, 
            indicators.macd_signal,
            indicators.macd_histogram
        )
        scores["macd"] = macd_score
        if macd_reason:
            reasoning.append(macd_reason)
        
        # Trend Analysis (SMA)
        trend_score, trend_reason = self._analyze_trend(
            current_price,
            indicators.sma_20,
            indicators.sma_50
        )
        scores["trend"] = trend_score
        if trend_reason:
            reasoning.append(trend_reason)
        
        # Bollinger Bands Analysis
        bb_score, bb_reason = self._analyze_bollinger(
            current_price,
            indicators.bollinger_upper,
            indicators.bollinger_middle,
            indicators.bollinger_lower
        )
        scores["bollinger"] = bb_score
        if bb_reason:
            reasoning.append(bb_reason)
        
        # Momentum Analysis
        momentum_score, momentum_reason = self._analyze_momentum(historical_prices)
        scores["momentum"] = momentum_score
        if momentum_reason:
            reasoning.append(momentum_reason)
        
        # Calculate weighted final score
        final_score = sum(
            scores.get(k, 0) * v 
            for k, v in self.weights.items()
        )
        
        # Determine action and confidence
        action, confidence = self._determine_action(final_score, scores)
        
        # Calculate risk level
        risk_level = self._calculate_risk(indicators, historical_prices)
        
        # Calculate price targets
        atr = indicators.atr or (current_price * 0.02)
        
        if action == "BUY":
            stop_loss = round(current_price - (2 * atr), 2)
            take_profit = round(current_price + (3 * atr), 2)
            target_price = round(current_price * 1.05, 2)
        elif action == "SELL":
            stop_loss = round(current_price + (2 * atr), 2)
            take_profit = round(current_price - (3 * atr), 2)
            target_price = round(current_price * 0.95, 2)
        else:
            stop_loss = None
            take_profit = None
            target_price = None
        
        return AISignal(
            action=action,
            confidence=confidence,
            reasoning=reasoning,
            risk_level=risk_level,
            target_price=target_price,
            stop_loss=stop_loss,
            take_profit=take_profit
        )

    def _analyze_rsi(self, rsi: float | None) -> tuple[float, str | None]:
        """Analyze RSI for overbought/oversold conditions."""
        if rsi is None:
            return 0, None
        
        if rsi < 30:
            return 1.0, f"RSI at {rsi:.1f} indicates oversold - potential buying opportunity"
        elif rsi < 40:
            return 0.5, f"RSI at {rsi:.1f} approaching oversold territory"
        elif rsi > 70:
            return -1.0, f"RSI at {rsi:.1f} indicates overbought - potential selling pressure"
        elif rsi > 60:
            return -0.5, f"RSI at {rsi:.1f} approaching overbought territory"
        else:
            return 0, f"RSI at {rsi:.1f} in neutral zone"

    def _analyze_macd(
        self, 
        macd: float | None, 
        signal: float | None,
        histogram: float | None
    ) -> tuple[float, str | None]:
        """Analyze MACD for trend momentum."""
        if macd is None or signal is None:
            return 0, None
        
        # Bullish crossover
        if macd > signal and histogram > 0:
            strength = min(abs(histogram) * 100, 1.0)
            return strength, "MACD bullish crossover - positive momentum building"
        # Bearish crossover
        elif macd < signal and histogram < 0:
            strength = min(abs(histogram) * 100, 1.0)
            return -strength, "MACD bearish crossover - negative momentum"
        else:
            return 0, "MACD showing neutral momentum"

    def _analyze_trend(
        self, 
        price: float, 
        sma_20: float | None, 
        sma_50: float | None
    ) -> tuple[float, str | None]:
        """Analyze trend using moving averages."""
        if sma_20 is None or sma_50 is None:
            return 0, None
        
        # Strong uptrend: price > SMA20 > SMA50
        if price > sma_20 > sma_50:
            return 1.0, "Strong uptrend - price above both SMAs with golden cross"
        # Uptrend: price > SMA20
        elif price > sma_20:
            return 0.5, "Moderate uptrend - price above 20-day SMA"
        # Strong downtrend: price < SMA20 < SMA50
        elif price < sma_20 < sma_50:
            return -1.0, "Strong downtrend - price below both SMAs with death cross"
        # Downtrend: price < SMA20
        elif price < sma_20:
            return -0.5, "Moderate downtrend - price below 20-day SMA"
        else:
            return 0, "Trend is consolidating"

    def _analyze_bollinger(
        self, 
        price: float,
        upper: float | None,
        middle: float | None,
        lower: float | None
    ) -> tuple[float, str | None]:
        """Analyze Bollinger Bands for volatility and mean reversion."""
        if upper is None or lower is None:
            return 0, None
        
        band_width = upper - lower
        position = (price - lower) / band_width if band_width > 0 else 0.5
        
        if position < 0.1:
            return 0.8, "Price at lower Bollinger Band - potential bounce"
        elif position < 0.3:
            return 0.4, "Price near lower band - approaching support"
        elif position > 0.9:
            return -0.8, "Price at upper Bollinger Band - potential pullback"
        elif position > 0.7:
            return -0.4, "Price near upper band - approaching resistance"
        else:
            return 0, "Price within normal Bollinger Band range"

    def _analyze_momentum(
        self, 
        prices: list[float]
    ) -> tuple[float, str | None]:
        """Analyze price momentum over recent periods."""
        if len(prices) < 20:
            return 0, None
        
        # Calculate returns
        recent_5 = (prices[-1] - prices[-5]) / prices[-5] * 100
        recent_20 = (prices[-1] - prices[-20]) / prices[-20] * 100
        
        if recent_5 > 3 and recent_20 > 5:
            return 0.8, f"Strong bullish momentum: +{recent_5:.1f}% (5d), +{recent_20:.1f}% (20d)"
        elif recent_5 > 1 and recent_20 > 2:
            return 0.4, f"Positive momentum: +{recent_5:.1f}% (5d), +{recent_20:.1f}% (20d)"
        elif recent_5 < -3 and recent_20 < -5:
            return -0.8, f"Strong bearish momentum: {recent_5:.1f}% (5d), {recent_20:.1f}% (20d)"
        elif recent_5 < -1 and recent_20 < -2:
            return -0.4, f"Negative momentum: {recent_5:.1f}% (5d), {recent_20:.1f}% (20d)"
        else:
            return 0, "Momentum is neutral"

    def _determine_action(
        self, 
        score: float, 
        component_scores: dict
    ) -> tuple[str, float]:
        """Determine trading action and confidence from scores."""
        # Count agreeing signals
        bullish = sum(1 for s in component_scores.values() if s > 0.3)
        bearish = sum(1 for s in component_scores.values() if s < -0.3)
        
        # Strong buy: high score with multiple confirming signals
        if score > 0.5 and bullish >= 3:
            return "BUY", min(0.45 + score * 0.4, 0.92)
        elif score > 0.25 and bullish >= 2:
            return "BUY", min(0.45 + score * 0.3, 0.75)
        # Strong sell: low score with multiple confirming signals
        elif score < -0.5 and bearish >= 3:
            return "SELL", min(0.45 + abs(score) * 0.4, 0.92)
        elif score < -0.25 and bearish >= 2:
            return "SELL", min(0.45 + abs(score) * 0.3, 0.75)
        # Hold: mixed or neutral signals
        else:
            return "HOLD", max(0.50, 0.70 - abs(score) * 0.2)

    def _calculate_risk(
        self, 
        indicators: TechnicalIndicators,
        prices: list[float]
    ) -> str:
        """Calculate overall risk level."""
        risk_score = 0
        
        # High RSI = higher risk for longs
        if indicators.rsi and indicators.rsi > 70:
            risk_score += 2
        elif indicators.rsi and indicators.rsi < 30:
            risk_score += 1
        
        # High ATR = high volatility = higher risk
        if indicators.atr and len(prices) > 0:
            atr_percent = (indicators.atr / prices[-1]) * 100
            if atr_percent > 3:
                risk_score += 2
            elif atr_percent > 2:
                risk_score += 1
        
        # Price volatility
        if len(prices) >= 20:
            returns = np.diff(prices[-20:]) / prices[-21:-1]
            volatility = np.std(returns) * 100
            if volatility > 3:
                risk_score += 2
            elif volatility > 2:
                risk_score += 1
        
        if risk_score >= 4:
            return "HIGH"
        elif risk_score >= 2:
            return "MEDIUM"
        else:
            return "LOW"
