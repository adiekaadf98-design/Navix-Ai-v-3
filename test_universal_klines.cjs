const fetch = globalThis.fetch;

async function getKlines(rawSymbol, interval = '15m', limit = 80) {
  let sym = rawSymbol.toUpperCase().replace(/[\/\-_]/g, '').trim();
  
  // Check if crypto
  const isForex = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'NZDUSD', 'USDCAD', 'USDCHF', 'EURJPY', 'GBPJPY'].includes(sym);
  const isCommodity = ['XAUUSD', 'GOLD', 'XAU', 'XAGUSD', 'SILVER', 'USOIL', 'WTI', 'UKOIL', 'BRENT'].includes(sym);
  const isIndex = ['US30', 'DJI', 'NAS100', 'NDX', 'SPX500', 'SPX', 'GER40', 'DAX'].includes(sym);
  
  if (!isForex && !isCommodity && !isIndex && (sym.endsWith('USDT') || sym.endsWith('BTC') || sym.endsWith('ETH') || ['BTC','ETH','SOL','BNB','XRP','DOGE','ADA','AVAX','NEAR','SUI','PEPE','SHIB'].includes(sym))) {
    let binanceSym = sym.endsWith('USDT') || sym.endsWith('BTC') || sym.endsWith('ETH') ? sym : sym + 'USDT';
    try {
      const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(binanceSym)}&interval=${interval}&limit=${limit}`, {
        headers: { 'User-Agent': 'NavixMarketEngine/3.0' }
      });
      if (res.ok) {
        const raw = await res.json();
        if (Array.isArray(raw) && raw.length > 0) {
          return { source: 'Binance', count: raw.length, firstClose: raw[0][4], lastClose: raw[raw.length-1][4] };
        }
      }
    } catch(e) {}
  }

  // Yahoo Chart fallback for Forex, Commodities, Indices, Stocks
  let yahooSymbol = sym;
  if (sym === 'XAUUSD' || sym === 'GOLD' || sym === 'XAU') yahooSymbol = 'GC=F';
  else if (sym === 'XAGUSD' || sym === 'SILVER') yahooSymbol = 'SI=F';
  else if (sym === 'USOIL' || sym === 'WTI') yahooSymbol = 'CL=F';
  else if (sym === 'UKOIL' || sym === 'BRENT') yahooSymbol = 'BZ=F';
  else if (sym === 'US30' || sym === 'DJI') yahooSymbol = '^DJI';
  else if (sym === 'NAS100' || sym === 'NDX') yahooSymbol = '^IXIC';
  else if (sym === 'SPX500' || sym === 'SPX') yahooSymbol = '^GSPC';
  else if (sym === 'GER40' || sym === 'DAX') yahooSymbol = '^GDAXI';
  else if (isForex) yahooSymbol = sym + '=X';

  const rangeMap = { '1m': '1d', '5m': '2d', '15m': '5d', '30m': '5d', '1h': '1mo', '4h': '1mo', '1d': '3mo' };
  const yIntervalMap = { '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m', '1h': '60m', '4h': '60m', '1d': '1d' };
  const yRange = rangeMap[interval] || '5d';
  const yInt = yIntervalMap[interval] || '15m';

  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=${yInt}&range=${yRange}`);
    if (res.ok) {
      const data = await res.json();
      const result = data?.chart?.result?.[0];
      const timestamps = result?.timestamp || [];
      const quote = result?.indicators?.quote?.[0];
      if (quote && Array.isArray(quote.open) && timestamps.length > 0) {
        const candles = [];
        for (let i = 0; i < timestamps.length; i++) {
          if (quote.open[i] && quote.close[i]) {
            candles.push({
              time: timestamps[i] * 1000,
              open: quote.open[i],
              high: quote.high[i],
              low: quote.low[i],
              close: quote.close[i],
              volume: quote.volume?.[i] || 0
            });
          }
        }
        if (candles.length > 0) {
          const sliced = candles.slice(-limit);
          return { source: 'Yahoo Finance (' + yahooSymbol + ')', count: sliced.length, firstClose: sliced[0].close, lastClose: sliced[sliced.length-1].close };
        }
      }
    }
  } catch(e) {}

  return null;
}

async function run() {
  const syms = ['XAUUSD', 'EURUSD', 'USDJPY', 'BTCUSDT', 'SOLUSDT', 'US30', 'NAS100', 'NVDA', 'AAPL'];
  for (const s of syms) {
    const res = await getKlines(s, '15m', 80);
    console.log(s.padEnd(10), '->', res ? `${res.count} candles from ${res.source}, Last: ${res.lastClose}` : 'FAILED');
  }
}
run();
