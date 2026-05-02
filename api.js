const API_BASE = '/api';

export const api = {
  async getQuote(symbol) {
    const res = await fetch(`${API_BASE}/quote/${symbol}`);
    if (!res.ok) throw new Error('Failed to fetch quote');
    return res.json();
  },

  async getHistory(symbol, period = '6mo') {
    const res = await fetch(`${API_BASE}/history/${symbol}?period=${period}`);
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },

  async getIndicators(symbol) {
    const res = await fetch(`${API_BASE}/indicators/${symbol}`);
    if (!res.ok) throw new Error('Failed to fetch indicators');
    return res.json();
  },

  async getAISignal(symbol) {
    const res = await fetch(`${API_BASE}/ai-signal/${symbol}`);
    if (!res.ok) throw new Error('Failed to fetch AI signal');
    return res.json();
  },

  async searchSymbols(query) {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  },

  async getPortfolio() {
    const res = await fetch(`${API_BASE}/portfolio`);
    if (!res.ok) throw new Error('Failed to fetch portfolio');
    return res.json();
  },

  async executeTrade(symbol, action, shares) {
    const res = await fetch(
      `${API_BASE}/trade?symbol=${symbol}&action=${action}&shares=${shares}`,
      { method: 'POST' }
    );
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Trade failed');
    }
    return res.json();
  }
};
