import React, { useState, useEffect } from 'react';
import { api } from '../api';
import StockChart from './StockChart';
import TechnicalIndicators from './TechnicalIndicators';
import AISignals from './AISignals';
import Portfolio from './Portfolio';
import { Search } from 'lucide-react';

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
      const [quoteData, historyData, indicatorsData, signalData] = await Promise.all([
        api.getQuote(sym),
        api.getHistory(sym),
        api.getIndicators(sym),
        api.getAISignal(sym)
      ]);
      setQuote(quoteData);
      setHistory(historyData);
      setIndicators(indicatorsData);
      setAiSignal(signalData);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData(symbol);
  }, [symbol]);

  const handleSearch = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await api.searchSymbols(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const selectSymbol = (sym) => {
    setSymbol(sym);
    setSearchResults([]);
    setSearchQuery('');
  };

  const tabs = [
    { id: 'chart', label: 'Price Chart' },
    { id: 'indicators', label: 'Technical Analysis' },
    { id: 'ai', label: 'AI Signals' },
    { id: 'portfolio', label: 'Portfolio' }
  ];

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search stocks..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded border border-gray-600 focus:border-emerald-500 outline-none"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-12 left-0 right-0 bg-gray-700 border border-gray-600 rounded mt-1 z-10">
              {searchResults.map((result) => (
                <button
                  key={result.symbol}
                  onClick={() => selectSymbol(result.symbol)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-600 text-white"
                >
                  {result.symbol}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quote Display */}
      {quote && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white">{quote.symbol}</h2>
              <p className="text-xl font-semibold text-white mt-2">${quote.price}</p>
            </div>
            <div className={`text-right ${quote.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <p className="text-2xl font-bold">{quote.change >= 0 ? '+' : ''}{quote.change}</p>
              <p className="text-lg">{quote.change_percent >= 0 ? '+' : ''}{quote.change_percent}%</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-6 text-sm">
            <div>
              <p className="text-gray-400">High</p>
              <p className="text-white font-semibold">${quote.high}</p>
            </div>
            <div>
              <p className="text-gray-400">Low</p>
              <p className="text-white font-semibold">${quote.low}</p>
            </div>
            <div>
              <p className="text-gray-400">Volume</p>
              <p className="text-white font-semibold">{(quote.volume / 1000000).toFixed(2)}M</p>
            </div>
            <div>
              <p className="text-gray-400">Open</p>
              <p className="text-white font-semibold">${quote.open}</p>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="text-center text-gray-400">Loading...</div>}
      {error && <div className="text-center text-red-400">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === tab.id
                ? 'text-emerald-400 border-emerald-400'
                : 'text-gray-400 border-transparent hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'chart' && history.length > 0 && (
          <StockChart data={history} symbol={symbol} />
        )}
        {activeTab === 'indicators' && indicators && (
          <TechnicalIndicators indicators={indicators} price={quote?.price} />
        )}
        {activeTab === 'ai' && aiSignal && (
          <AISignals signal={aiSignal} symbol={symbol} price={quote?.price} onTrade={() => {}} />
        )}
        {activeTab === 'portfolio' && (
          <Portfolio onTrade={() => loadData(symbol)} />
        )}
      </div>
    </div>
  );
}
