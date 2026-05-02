import React, { useState } from 'react';
import { api } from '../services/api';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle,
  Target,
  Shield,
  DollarSign,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react';

export default function AISignals({ signal, symbol, price }) {
  const [tradeAmount, setTradeAmount] = useState(10);
  const [executing, setExecuting] = useState(false);
  const [tradeResult, setTradeResult] = useState(null);

  if (!signal) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        <Loader className="w-6 h-6 animate-spin mr-2" />
        Analyzing market data...
      </div>
    );
  }

  const getActionColor = (action) => {
    switch (action) {
      case 'BUY': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'SELL': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'BUY': return TrendingUp;
      case 'SELL': return TrendingDown;
      default: return Minus;
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'LOW': return 'text-emerald-400';
      case 'MEDIUM': return 'text-amber-400';
      case 'HIGH': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const ActionIcon = getActionIcon(signal.action);

  const executeTrade = async () => {
    if (signal.action === 'HOLD') return;
    
    setExecuting(true);
    setTradeResult(null);
    
    try {
      const result = await api.executeTrade(symbol, signal.action, tradeAmount);
      setTradeResult({ success: true, ...result });
    } catch (err) {
      setTradeResult({ success: false, error: err.message });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">AI Trading Signal</h3>
      </div>

      {/* Main Signal Card */}
      <div className={`rounded-xl border-2 p-6 ${getActionColor(signal.action)}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-800 rounded-xl">
              <ActionIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="text-3xl font-bold">{signal.action}</div>
              <div className="text-sm opacity-75">Recommended Action</div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm opacity-75">Confidence</div>
            <div className="text-4xl font-bold">{(signal.confidence * 100).toFixed(0)}%</div>
          </div>
        </div>

        {/* Confidence Bar */}
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden mb-4">
          <div 
            className={`h-full transition-all duration-500 ${
              signal.action === 'BUY' ? 'bg-emerald-500' : 
              signal.action === 'SELL' ? 'bg-red-500' : 'bg-amber-500'
            }`}
            style={{ width: `${signal.confidence * 100}%` }}
          ></div>
        </div>

        {/* Risk Level */}
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm">Risk Level:</span>
          <span className={`font-semibold ${getRiskColor(signal.risk_level)}`}>
            {signal.risk_level}
          </span>
        </div>
      </div>

      {/* Price Targets */}
      {(signal.target_price || signal.stop_loss || signal.take_profit) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {signal.target_price && (
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-gray-400 text-sm">Target Price</span>
              </div>
              <div className="text-2xl font-bold text-white">
                ${signal.target_price.toFixed(2)}
              </div>
              {price && (
                <div className="text-sm text-gray-400 mt-1">
                  {((signal.target_price - price) / price * 100).toFixed(2)}% from current
                </div>
              )}
            </div>
          )}
          
          {signal.stop_loss && (
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-red-400" />
                <span className="text-gray-400 text-sm">Stop Loss</span>
              </div>
              <div className="text-2xl font-bold text-red-400">
                ${signal.stop_loss.toFixed(2)}
              </div>
              {price && (
                <div className="text-sm text-gray-400 mt-1">
                  {((signal.stop_loss - price) / price * 100).toFixed(2)}% from current
                </div>
              )}
            </div>
          )}
          
          {signal.take_profit && (
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-gray-400 text-sm">Take Profit</span>
              </div>
              <div className="text-2xl font-bold text-emerald-400">
                ${signal.take_profit.toFixed(2)}
              </div>
              {price && (
                <div className="text-sm text-gray-400 mt-1">
                  {((signal.take_profit - price) / price * 100).toFixed(2)}% from current
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reasoning */}
      <div className="bg-gray-700/50 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Analysis Reasoning</h4>
        <ul className="space-y-2">
          {signal.reasoning.map((reason, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {/* Execute Trade */}
      {signal.action !== 'HOLD' && (
        <div className="bg-gray-700/50 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Execute Trade (Paper Trading)</h4>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm text-gray-400 block mb-1">Shares</label>
              <input
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
                min="1"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-400 block mb-1">Estimated Total</label>
              <div className="text-xl font-bold text-white py-2">
                ${price ? (price * tradeAmount).toFixed(2) : '0.00'}
              </div>
            </div>
            <button
              onClick={executeTrade}
              disabled={executing}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                signal.action === 'BUY'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-red-600 hover:bg-red-500 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {executing ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                `${signal.action} ${tradeAmount} Shares`
              )}
            </button>
          </div>

          {/* Trade Result */}
          {tradeResult && (
            <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
              tradeResult.success 
                ? 'bg-emerald-900/50 text-emerald-300' 
                : 'bg-red-900/50 text-red-300'
            }`}>
              {tradeResult.success ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>
                    Successfully {tradeResult.action.toLowerCase()}ed {tradeResult.shares} shares 
                    of {tradeResult.symbol} at ${tradeResult.price.toFixed(2)} 
                    (Total: ${tradeResult.total.toFixed(2)})
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  <span>{tradeResult.error}</span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div className="text-xs text-gray-500 text-center">
        This is simulated paper trading. AI signals are for educational purposes only 
        and should not be considered financial advice.
      </div>
    </div>
  );
}
