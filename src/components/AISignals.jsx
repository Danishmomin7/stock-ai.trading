import React, { useState } from 'react';
import { api } from '../api';
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
        <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
            style={{ width: `${signal.confidence * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Signal Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Score Info */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-gray-400">Signal Score</span>
          </div>
          <div className="text-2xl font-bold text-white">{(signal.score * 100).toFixed(1)}%</div>
        </div>

        {/* Indicators Aligned */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-400">Indicators Aligned</span>
          </div>
          <div className="text-2xl font-bold text-white">{signal.indicators_aligned || 0}</div>
        </div>
      </div>

      {/* Reasoning */}
      <div className="bg-gray-700/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="text-white font-medium">Analysis</span>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">
          {signal.reasoning || 'Analyzing market indicators...'}
        </p>
      </div>

      {/* Trade Execution */}
      {signal.action !== 'HOLD' && (
        <div className="bg-gray-700/50 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Shares to Trade
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-emerald-500 outline-none"
            />
            <div className="text-xs text-gray-400 mt-1">
              Estimated value: ${(tradeAmount * price).toFixed(2)}
            </div>
          </div>

          <button
            onClick={executeTrade}
            disabled={executing}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
              signal.action === 'BUY'
                ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-700/50'
                : 'bg-red-600 hover:bg-red-700 disabled:bg-red-700/50'
            } text-white disabled:opacity-50`}
          >
            {executing ? (
              <>
                <Loader className="w-4 h-4 inline animate-spin mr-2" />
                Executing...
              </>
            ) : (
              `${signal.action} ${tradeAmount} Shares`
            )}
          </button>
        </div>
      )}

      {/* Trade Result */}
      {tradeResult && (
        <div className={`rounded-lg p-4 ${tradeResult.success ? 'bg-emerald-900/30 border border-emerald-600' : 'bg-red-900/30 border border-red-600'}`}>
          <div className="flex items-center gap-2 mb-2">
            {tradeResult.success ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <span className={tradeResult.success ? 'text-emerald-400' : 'text-red-400'} >
              {tradeResult.success ? 'Trade Executed!' : 'Trade Failed'}
            </span>
          </div>
          {tradeResult.success && (
            <div className="text-sm text-gray-300">
              {tradeResult.action} {tradeResult.shares} shares @ ${tradeResult.price.toFixed(2)} = ${tradeResult.total}
            </div>
          )}
          {tradeResult.error && (
            <div className="text-sm text-red-300">{tradeResult.error}</div>
          )}
        </div>
      )}
    </div>
  );
}
