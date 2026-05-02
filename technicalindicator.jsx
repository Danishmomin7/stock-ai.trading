import React from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, BarChart3 } from 'lucide-react';

export default function TechnicalIndicators({ indicators, price }) {
  if (!indicators) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        Loading indicators...
      </div>
    );
  }

  const getSignal = (indicator, value) => {
    switch (indicator) {
      case 'rsi':
        if (value < 30) return { signal: 'Oversold', color: 'text-emerald-400', icon: TrendingUp };
        if (value > 70) return { signal: 'Overbought', color: 'text-red-400', icon: TrendingDown };
        return { signal: 'Neutral', color: 'text-gray-400', icon: Minus };
      
      case 'macd':
        if (value > 0) return { signal: 'Bullish', color: 'text-emerald-400', icon: TrendingUp };
        if (value < 0) return { signal: 'Bearish', color: 'text-red-400', icon: TrendingDown };
        return { signal: 'Neutral', color: 'text-gray-400', icon: Minus };
      
      case 'trend':
        if (price > indicators.sma_20 && indicators.sma_20 > indicators.sma_50) {
          return { signal: 'Strong Uptrend', color: 'text-emerald-400', icon: TrendingUp };
        }
        if (price < indicators.sma_20 && indicators.sma_20 < indicators.sma_50) {
          return { signal: 'Strong Downtrend', color: 'text-red-400', icon: TrendingDown };
        }
        return { signal: 'Consolidating', color: 'text-amber-400', icon: Minus };
      
      default:
        return { signal: 'N/A', color: 'text-gray-400', icon: Minus };
    }
  };

  const rsiSignal = getSignal('rsi', indicators.rsi);
  const macdSignal = getSignal('macd', indicators.macd);
  const trendSignal = getSignal('trend', null);

  const IndicatorCard = ({ title, value, signal, icon: Icon, description, children }) => (
    <div className="bg-gray-700/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-medium">{title}</h4>
        <div className={`flex items-center gap-1 ${signal.color}`}>
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium">{signal.signal}</span>
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-2">{value}</div>
      {description && <p className="text-sm text-gray-400">{description}</p>}
      {children}
    </div>
  );

  // RSI gauge visualization
  const RSIGauge = ({ value }) => {
    const position = Math.min(Math.max(value, 0), 100);
    return (
      <div className="mt-3">
        <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
          <div className="h-full flex">
            <div className="w-[30%] bg-emerald-500/50"></div>
            <div className="w-[40%] bg-gray-500/50"></div>
            <div className="w-[30%] bg-red-500/50"></div>
          </div>
        </div>
        <div className="relative h-4">
          <div 
            className="absolute top-0 w-0.5 h-4 bg-white"
            style={{ left: `${position}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>0</span>
          <span>30</span>
          <span>50</span>
          <span>70</span>
          <span>100</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-semibold text-white">Technical Analysis</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* RSI */}
        <IndicatorCard
          title="RSI (14)"
          value={indicators.rsi?.toFixed(2) || 'N/A'}
          signal={rsiSignal}
          icon={rsiSignal.icon}
          description="Relative Strength Index measures momentum"
        >
          {indicators.rsi && <RSIGauge value={indicators.rsi} />}
        </IndicatorCard>

        {/* MACD */}
        <IndicatorCard
          title="MACD"
          value={indicators.macd?.toFixed(4) || 'N/A'}
          signal={macdSignal}
          icon={macdSignal.icon}
          description="Moving Average Convergence Divergence"
        >
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Signal Line:</span>
              <span className="text-white">{indicators.macd_signal?.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Histogram:</span>
              <span className={indicators.macd_histogram >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {indicators.macd_histogram?.toFixed(4)}
              </span>
            </div>
          </div>
        </IndicatorCard>

        {/* Trend */}
        <IndicatorCard
          title="Trend Analysis"
          value={trendSignal.signal}
          signal={trendSignal}
          icon={trendSignal.icon}
          description="Based on SMA crossover"
        >
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">SMA 20:</span>
              <span className="text-white">${indicators.sma_20?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">SMA 50:</span>
              <span className="text-white">${indicators.sma_50?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Price vs SMA20:</span>
              <span className={price > indicators.sma_20 ? 'text-emerald-400' : 'text-red-400'}>
                {price > indicators.sma_20 ? 'Above' : 'Below'}
              </span>
            </div>
          </div>
        </IndicatorCard>

        {/* Bollinger Bands */}
        <IndicatorCard
          title="Bollinger Bands"
          value={`$${indicators.bollinger_middle?.toFixed(2) || 'N/A'}`}
          signal={{ 
            signal: price > indicators.bollinger_upper ? 'Overbought' : 
                   price < indicators.bollinger_lower ? 'Oversold' : 'Normal',
            color: price > indicators.bollinger_upper ? 'text-red-400' : 
                   price < indicators.bollinger_lower ? 'text-emerald-400' : 'text-gray-400'
          }}
          icon={BarChart3}
          description="20-period, 2 standard deviations"
        >
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Upper:</span>
              <span className="text-red-400">${indicators.bollinger_upper?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Lower:</span>
              <span className="text-emerald-400">${indicators.bollinger_lower?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Band Width:</span>
              <span className="text-white">
                ${((indicators.bollinger_upper - indicators.bollinger_lower) || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </IndicatorCard>

        {/* Moving Averages */}
        <IndicatorCard
          title="Exponential MAs"
          value={indicators.ema_12 > indicators.ema_26 ? 'Bullish Cross' : 'Bearish Cross'}
          signal={{ 
            signal: indicators.ema_12 > indicators.ema_26 ? 'Bullish' : 'Bearish',
            color: indicators.ema_12 > indicators.ema_26 ? 'text-emerald-400' : 'text-red-400'
          }}
          icon={indicators.ema_12 > indicators.ema_26 ? TrendingUp : TrendingDown}
          description="EMA 12/26 crossover"
        >
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">EMA 12:</span>
              <span className="text-white">${indicators.ema_12?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">EMA 26:</span>
              <span className="text-white">${indicators.ema_26?.toFixed(2)}</span>
            </div>
          </div>
        </IndicatorCard>

        {/* Volatility */}
        <IndicatorCard
          title="Volatility (ATR)"
          value={`$${indicators.atr?.toFixed(2) || 'N/A'}`}
          signal={{ 
            signal: indicators.atr > (price * 0.03) ? 'High' : 
                   indicators.atr > (price * 0.015) ? 'Medium' : 'Low',
            color: indicators.atr > (price * 0.03) ? 'text-red-400' : 
                   indicators.atr > (price * 0.015) ? 'text-amber-400' : 'text-emerald-400'
          }}
          icon={Activity}
          description="Average True Range (14-period)"
        >
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">ATR %:</span>
              <span className="text-white">
                {price ? ((indicators.atr / price) * 100).toFixed(2) : 0}%
              </span>
            </div>
          </div>
        </IndicatorCard>
      </div>
    </div>
  );
}
