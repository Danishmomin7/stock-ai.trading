import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StockChart from './StockChart';
import TechnicalIndicators from './TechnicalIndicators';
import AISignals from './AISignals';
import Portfolio from './Portfolio';
import { Search, RefreshCw, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [symbol, setSymbol] = useState('AAPL');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [quote, setQuote] = useState(null);
  const [history, setHistory] = useState([]);
  const [indicators, setIndicators] = useState(null);
  const [aiSignal, setAiSignal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('chart');

  const loadData = async (sym) => {
    setLoading(true);
    setError(null);
    try {
      const [quoteData, historyData, indicatorData, signalData] = await Promise.all([
        api.getQuote(sym),
        api.getHistory(sym),
        api.getIndicators(sym),
        api.getAISignal(sym)
      ]);
      setQuote(quoteData);
      setHistory(historyData);
      setIndicators(indicatorData);
      setAiSignal(signalData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(symbol);
  }, [symbol]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length >= 1) {
      try {
        const results = await api.searchSymbols(query);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const selectSymbol = (sym) => {
    setSymbol(sym);
    setSearchQuery('');
    setSearchResults([]);
  };

  const tabs = [
    { id: 'chart', label: 'Price Chart' },
    { id: 'indicators', label: 'Technical Analysis' },
    { id: 'ai', label: 'AI Signals' },
    { id: 'portfolio', label: 'Portfolio' }
  ];

  return (
    <div className="space-y-6">
      {/* Search and Quote Header */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search stocks (e.g., AAPL, TSLA)"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-10 max-h-60 overflow-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.symbol}
                    onClick={() => selectSymbol(result.symbol)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-600 flex justify-between items-center"
                  >
                    <span className="font-medium text-white">{result.symbol}</span>
                    <span className="text-sm text-gray-400">{result.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quote Display */}
          {quote && (
            <div className="flex items-center gap-6">
              <div>
                <div className="text-2xl font-bold text-white">{quote.symbol}</div>
                <div className="text-3xl font-bold text-white">${quote.price.toFixed(2)}</div>
              </div>
              <div className={`text-right ${quote.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                <div className="text-xl font-semibold">
                  {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)}
                </div>
                <div className="text-lg">
                  ({quote.change >= 0 ? '+' : ''}{quote.change_percent.toFixed(2)}%)
                </div>
              </div>
              <button
                onClick={() => loadData(symbol)}
                disabled={loading}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </div>

        {/* Quote Details */}
        {quote && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-700">
            <div>
              <div className="text-gray-400 text-sm">Open</div>
              <div className="text-white font-medium">${quote.open.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">High</div>
              <div className="text-white font-medium">${quote.high.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Low</div>
              <div className="text-white font-medium">${quote.low.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Volume</div>
              <div className="text-white font-medium">
                {(quote.volume / 1000000).toFixed(2)}M
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-200">{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-800 rounded-xl p-6">
        {activeTab === 'chart' && (
          <StockChart data={history} symbol={symbol} />
        )}
        {activeTab === 'indicators' && (
          <TechnicalIndicators indicators={indicators} price={quote?.price} />
        )}
        {activeTab === 'ai' && (
          <AISignals signal={aiSignal} symbol={symbol} price={quote?.price} />
        )}
        {activeTab === 'portfolio' && (
          <Portfolio onTrade={() => loadData(symbol)} />
        )}
      </div>
    </div>
  );
}
