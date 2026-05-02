const https = require('https');
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
    }).on('error', reject);
  });
}

function httpsPost(urlStr, body, headers) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const u = new URL(urlStr);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyStr), ...headers }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

// ─── Stock Data ───────────────────────────────────────────────────────────────

async function getQuote(symbol) {
  const data = await httpsGet(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`
  );
  const meta = data.chart.result[0].meta;
  const price = meta.regularMarketPrice;
  const prev = meta.previousClose || meta.chartPreviousClose;
  const change = price - prev;
  return {
    symbol: meta.symbol,
    name: meta.longName || meta.shortName || symbol,
    price: +price.toFixed(2),
    change: +change.toFixed(2),
    change_percent: +((change / prev) * 100).toFixed(2),
    volume: meta.regularMarketVolume || 0,
    market_cap: meta.marketCap || 0,
    high: meta.regularMarketDayHigh || price,
    low: meta.regularMarketDayLow || price,
    open: meta.regularMarketOpen || price,
    previous_close: prev,
  };
}

async function getHistory(symbol, period = '6mo') {
  const data = await httpsGet(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=${period}`
  );
  const result = data.chart.result[0];
  const q = result.indicators.quote[0];
  return result.timestamp.map((ts, i) => ({
    date: new Date(ts * 1000).toISOString().split('T')[0],
    open:   +(q.open[i]   || 0).toFixed(2),
    high:   +(q.high[i]   || 0).toFixed(2),
    low:    +(q.low[i]    || 0).toFixed(2),
    close:  +(q.close[i]  || 0).toFixed(2),
    volume: q.volume[i] || 0,
  })).filter(d => d.close > 0);
}

async function searchSymbols(query) {
  const data = await httpsGet(
    `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=6&newsCount=0`
  );
  return (data.quotes || [])
    .filter(q => q.quoteType === 'EQUITY')
    .map(q => ({ symbol: q.symbol, name: q.shortname || q.longname || q.symbol, exchange: q.exchDisp || '' }));
}

// ─── Technical Indicators ─────────────────────────────────────────────────────

function sma(data, p) {
  return data.map((_, i) =>
    i < p - 1 ? null : data.slice(i - p + 1, i + 1).reduce((a, b) => a + b, 0) / p
  );
}

function ema(data, p) {
  const k = 2 / (p + 1);
  const res = [];
  let prev = null;
  for (let i = 0; i < data.length; i++) {
    if (prev === null) {
      if (i < p - 1) { res.push(null); continue; }
      prev = data.slice(0, p).reduce((a, b) => a + b, 0) / p;
      res.push(prev);
    } else {
      prev = data[i] * k + prev * (1 - k);
      res.push(prev);
    }
  }
  return res;
}

function rsi(data, p = 14) {
  const res = new Array(p).fill(null);
  let g = 0, l = 0;
  for (let i = 1; i <= p; i++) {
    const d = data[i] - data[i-1];
    if (d > 0) g += d; else l -= d;
  }
  let ag = g / p, al = l / p;
  res.push(al === 0 ? 100 : 100 - 100 / (1 + ag / al));
  for (let i = p + 1; i < data.length; i++) {
    const d = data[i] - data[i-1];
    ag = (ag * (p-1) + Math.max(d, 0)) / p;
    al = (al * (p-1) + Math.max(-d, 0)) / p;
    res.push(al === 0 ? 100 : 100 - 100 / (1 + ag / al));
  }
  return res;
}

function macdCalc(data) {
  const e12 = ema(data, 12), e26 = ema(data, 26);
  const line = e12.map((v, i) => v != null && e26[i] != null ? v - e26[i] : null);
  const valid = line.filter(v => v != null);
  const sig9 = ema(valid, 9);
  const nulls = line.filter(v => v == null).length;
  const sig = new Array(nulls + 9 - 1).fill(null).concat(sig9.filter(v => v != null));
  return {
    macd: line,
    signal: sig,
    histogram: line.map((v, i) => v != null && sig[i] != null ? v - sig[i] : null)
  };
}

function bb(data, p = 20) {
  const mid = sma(data, p);
  return mid.map((m, i) => {
    if (m == null) return { upper: null, middle: null, lower: null };
    const sl = data.slice(i - p + 1, i + 1);
    const std = Math.sqrt(sl.reduce((a, b) => a + Math.pow(b - m, 2), 0) / p) * 2;
    return { upper: m + std, middle: m, lower: m - std };
  });
}

function last(arr) { return arr.filter(v => v != null).slice(-1)[0]; }

async function getIndicators(symbol) {
  const hist = await getHistory(symbol, '6mo');
  const c = hist.map(h => h.close);
  const price = c[c.length - 1];
  const bbArr = bb(c);
  const lastBb = bbArr.filter(v => v.upper != null).slice(-1)[0] || {};
  const macdData = macdCalc(c);
  return {
    rsi:            +(last(rsi(c, 14)) || 50).toFixed(2),
    macd:           +(last(macdData.macd) || 0).toFixed(4),
    macd_signal:    +(last(macdData.signal) || 0).toFixed(4),
    macd_histogram: +(last(macdData.histogram) || 0).toFixed(4),
    sma_20:         +(last(sma(c, 20)) || price).toFixed(2),
    sma_50:         +(last(sma(c, 50)) || price).toFixed(2),
    ema_20:         +(last(ema(c, 20)) || price).toFixed(2),
    bb_upper:       +((lastBb.upper  || price * 1.02)).toFixed(2),
    bb_middle:      +((lastBb.middle || price)).toFixed(2),
    bb_lower:       +((lastBb.lower  || price * 0.98)).toFixed(2),
    current_price: price,
  };
}

// ─── AI Signal ────────────────────────────────────────────────────────────────

async function getAISignal(symbol) {
  if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set in Netlify environment variables');
  const [quote, ind] = await Promise.all([getQuote(symbol), getIndicators(symbol)]);

  const prompt = `You are an expert stock analyst. Analyze ${symbol} stock and give a trading signal.

Current Data:
- Price: $${quote.price} | Change: ${quote.change_percent}%
- RSI(14): ${ind.rsi}
- MACD: ${ind.macd} | Signal: ${ind.macd_signal} | Histogram: ${ind.macd_histogram}
- SMA20: $${ind.sma_20} | SMA50: $${ind.sma_50} | EMA20: $${ind.ema_20}
- Bollinger: Upper $${ind.bb_upper} | Mid $${ind.bb_middle} | Lower $${ind.bb_lower}

Reply ONLY with valid JSON, no markdown:
{
  "action": "BUY" or "SELL" or "HOLD",
  "confidence": 0.0 to 1.0,
  "risk_level": "LOW" or "MEDIUM" or "HIGH",
  "target_price": number,
  "stop_loss": number,
  "take_profit": number,
  "reasoning": ["reason1", "reason2", "reason3"]
}`;

  const res = await httpsPost(
    'https://api.anthropic.com/v1/messages',
    { model: 'claude-haiku-4-5-20251001', max_tokens: 500, messages: [{ role: 'user', content: prompt }] },
    { 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' }
  );
  return JSON.parse(res.content[0].text.replace(/```json|```/g, '').trim());
}

// ─── Portfolio (in-memory) ────────────────────────────────────────────────────

let portfolio = { cash: 100000, positions: {} };

// ─── Main Handler ─────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  const CORS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };

  const path = event.path.replace('/.netlify/functions/api', '').replace(/^\//, '');
  const parts = path.split('/');
  const qs = event.queryStringParameters || {};

  try {
    let result;

    if (parts[0] === 'quote' && parts[1])
      result = await getQuote(parts[1].toUpperCase());

    else if (parts[0] === 'history' && parts[1])
      result = await getHistory(parts[1].toUpperCase(), qs.period || '6mo');

    else if (parts[0] === 'indicators' && parts[1])
      result = await getIndicators(parts[1].toUpperCase());

    else if (parts[0] === 'ai-signal' && parts[1])
      result = await getAISignal(parts[1].toUpperCase());

    else if (parts[0] === 'search')
      result = await searchSymbols(qs.q || '');

    else if (parts[0] === 'portfolio')
      result = { cash: portfolio.cash, total_value: portfolio.cash, positions: Object.values(portfolio.positions), daily_pnl: 0, total_pnl: 0 };

    else if (parts[0] === 'trade' && event.httpMethod === 'POST') {
      const { symbol, action, shares } = qs;
      const quote = await getQuote(symbol.toUpperCase());
      const total = parseFloat(shares) * quote.price;
      if (action === 'BUY') {
        if (total > portfolio.cash) throw new Error('Insufficient funds');
        portfolio.cash -= total;
        if (!portfolio.positions[symbol]) portfolio.positions[symbol] = { symbol, shares: 0, avg_cost: quote.price, current_price: quote.price, market_value: 0, profit_loss: 0, profit_loss_percent: 0 };
        const pos = portfolio.positions[symbol];
        pos.avg_cost = (pos.shares * pos.avg_cost + total) / (pos.shares + parseFloat(shares));
        pos.shares += parseFloat(shares);
      } else {
        const pos = portfolio.positions[symbol];
        if (!pos || pos.shares < parseFloat(shares)) throw new Error('Insufficient shares');
        portfolio.cash += total;
        pos.shares -= parseFloat(shares);
        if (pos.shares === 0) delete portfolio.positions[symbol];
      }
      result = { success: true, action, symbol: symbol.toUpperCase(), shares: parseFloat(shares), price: quote.price, total };
    }

    else if (parts[0] === 'health' || path === '')
      result = { status: 'healthy' };

    else
      return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: 'Not found' }) };

    return { statusCode: 200, headers: CORS, body: JSON.stringify(result) };
  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ detail: err.message }) };
  }
};
