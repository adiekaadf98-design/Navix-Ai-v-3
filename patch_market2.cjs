const fs = require('fs');

let serverTs = fs.readFileSync('server.ts', 'utf8');

const klinesStartIndex = serverTs.indexOf('  app.get("/api/market/klines"');
const testKeyIndex = serverTs.indexOf('  app.post("/api/test-key"');

if (klinesStartIndex > -1 && testKeyIndex > -1) {
  const before = serverTs.substring(0, klinesStartIndex);
  const after = serverTs.substring(testKeyIndex);

  const newCode = `
  // UNIFIED CLOUD MARKET ENGINE: Proprietary Decoupled Endpoints
  
  app.get("/api/market/price", (req, res) => {
    const symbol = String(req.query.symbol || '').toUpperCase();
    const basePrice = symbol.includes('BTC') ? 75600.0
      : symbol.includes('ETH') ? 2519.0
      : symbol.includes('SOL') ? 100.89
      : symbol.includes('XAU') || symbol.includes('GOLD') ? 4349.42
      : symbol.includes('EUR') ? 1.0845
      : 100.0;
    const volatility = basePrice * (symbol.includes('USDT') ? 0.0003 : 0.00015);
    const tick = basePrice + (Math.random() - 0.49) * volatility;
    res.json({ symbol, price: tick.toFixed(basePrice < 2 ? 4 : 2) });
  });

  app.get("/api/market/klines", (req, res) => {
    try {
      const rawSymbol = String(req.query.symbol || 'BTCUSDT').trim().toUpperCase();
      const limit = Math.min(Math.max(parseInt(String(req.query.limit || '80'), 10), 10), 200);

      const basePrice = rawSymbol.includes('BTC') ? 75600.0
        : rawSymbol.includes('ETH') ? 2519.0
        : rawSymbol.includes('SOL') ? 100.89
        : rawSymbol.includes('ZEC') ? 1132.37
        : rawSymbol.includes('XAU') || rawSymbol.includes('GOLD') ? 4349.42
        : rawSymbol.includes('EUR') ? 1.0845
        : rawSymbol.includes('GBP') ? 1.3452
        : rawSymbol.includes('JPY') ? 153.80
        : rawSymbol.includes('DOGE') ? 0.1408
        : 100.0;

      const volatility = basePrice * 0.0028;
      const now = Date.now();
      const stepMs = 15 * 60 * 1000;
      const candles = [];
      let currentClose = basePrice * 0.985;

      for (let i = limit; i >= 0; i--) {
        const time = now - i * stepMs;
        const wave = Math.sin(i / 6) * volatility * 1.5 + (Math.random() - 0.48) * volatility;
        const open = currentClose;
        const close = open + wave;
        const high = Math.max(open, close) + Math.random() * volatility * 0.8;
        const low = Math.min(open, close) - Math.random() * volatility * 0.8;
        const volume = Math.floor(1000 + Math.random() * 8000 + Math.abs(close - open) * 200);
        currentClose = close;
        
        candles.push({
          time,
          open: parseFloat(open.toFixed(basePrice < 2 ? 4 : 2)),
          high: parseFloat(high.toFixed(basePrice < 2 ? 4 : 2)),
          low: parseFloat(low.toFixed(basePrice < 2 ? 4 : 2)),
          close: parseFloat(close.toFixed(basePrice < 2 ? 4 : 2)),
          volume
        });
      }
      res.json(candles);
    } catch (err: any) {
      console.error("Proprietary market kline generator error:", err);
      res.status(500).json({ error: "Internal server error fetching klines" });
    }
  });

  app.get("/api/market/tickers", (req, res) => {
    const baseTickers = [
      { symbol: 'XAUUSD', displayName: 'XAU/USD GOLD SPOT', category: 'Komoditas', price: 4390.7, change24h: 0.65, decimals: 2 },
      { symbol: 'EURUSD', displayName: 'EUR/USD FOREX', category: 'Forex', price: 1.1542, change24h: -0.12, decimals: 4 },
      { symbol: 'GBPUSD', displayName: 'GBP/USD FOREX', category: 'Forex', price: 1.3452, change24h: 0.18, decimals: 4 },
      { symbol: 'USDJPY', displayName: 'USD/JPY FOREX', category: 'Forex', price: 153.80, change24h: -0.45, decimals: 2 },
      { symbol: 'BTCUSDT', displayName: 'BTCUSDT PERP', category: 'Major', price: 75690.0, change24h: -3.52, decimals: 2 },
      { symbol: 'ETHUSDT', displayName: 'ETHUSDT PERP', category: 'Major', price: 2519.98, change24h: -1.85, decimals: 2 },
      { symbol: 'SOLUSDT', displayName: 'SOLUSDT PERP', category: 'Major', price: 100.89, change24h: 1.25, decimals: 2 },
      { symbol: 'BNBUSDT', displayName: 'BNBUSDT PERP', category: 'Major', price: 723.18, change24h: 0.85, decimals: 2 },
      { symbol: 'XRPUSDT', displayName: 'XRPUSDT PERP', category: 'Major', price: 1.3618, change24h: 3.45, decimals: 4 },
      { symbol: 'DOGEUSDT', displayName: 'DOGEUSDT PERP', category: 'Meme', price: 0.14089, change24h: 2.15, decimals: 5 },
      { symbol: 'ZECUSDT', displayName: 'ZECUSDT PERP', category: 'Major', price: 1132.37, change24h: -0.32, decimals: 2 },
      { symbol: 'RENDERUSDT', displayName: 'RENDERUSDT PERP', category: 'AI', price: 6.42, change24h: 4.12, decimals: 3 },
      { symbol: 'TAOUSDT', displayName: 'TAOUSDT PERP', category: 'AI', price: 382.5, change24h: 5.60, decimals: 2 },
      { symbol: 'PEPEUSDT', displayName: 'PEPEUSDT PERP', category: 'Meme', price: 0.0000104, change24h: 7.20, decimals: 7 },
      { symbol: 'SUIUSDT', displayName: 'SUIUSDT PERP', category: 'L1/L2', price: 2.85, change24h: 6.80, decimals: 3 },
      { symbol: 'NEARUSDT', displayName: 'NEARUSDT PERP', category: 'AI', price: 2.313, change24h: -2.15, decimals: 3 },
      { symbol: 'TRXUSDT', displayName: 'TRXUSDT PERP', category: 'Major', price: 0.3398, change24h: 0.27, decimals: 4 },
      { symbol: 'FETUSDT', displayName: 'FETUSDT PERP', category: 'AI', price: 1.28, change24h: 1.95, decimals: 3 },
      { symbol: 'WLDUSDT', displayName: 'WLDUSDT PERP', category: 'AI', price: 2.15, change24h: -0.85, decimals: 3 },
      { symbol: 'SHIBUSDT', displayName: 'SHIBUSDT PERP', category: 'Meme', price: 0.0000185, change24h: 1.40, decimals: 7 },
      { symbol: 'WIFUSDT', displayName: 'WIFUSDT PERP', category: 'Meme', price: 1.84, change24h: -3.10, decimals: 3 },
      { symbol: 'BONKUSDT', displayName: 'BONKUSDT PERP', category: 'Meme', price: 0.0000214, change24h: 4.50, decimals: 7 },
      { symbol: 'APTUSDT', displayName: 'APTUSDT PERP', category: 'L1/L2', price: 8.65, change24h: -1.20, decimals: 2 },
      { symbol: 'ARBUSDT', displayName: 'ARBUSDT PERP', category: 'L1/L2', price: 0.582, change24h: 0.75, decimals: 3 },
      { symbol: 'OPUSDT', displayName: 'OPUSDT PERP', category: 'L1/L2', price: 1.74, change24h: 1.10, decimals: 3 },
      { symbol: 'AVAXUSDT', displayName: 'AVAXUSDT PERP', category: 'L1/L2', price: 28.40, change24h: 2.30, decimals: 2 }
    ];

    const liveTickers = baseTickers.map(t => {
      const volatility = t.price * 0.001;
      const newPrice = t.price + (Math.random() - 0.49) * volatility;
      return {
        ...t,
        price: parseFloat(newPrice.toFixed(t.decimals)),
        high24h: parseFloat((t.price * 1.02).toFixed(t.decimals)),
        low24h: parseFloat((t.price * 0.98).toFixed(t.decimals)),
        volume24h: Math.floor(Math.random() * 5000000000)
      };
    });
    
    res.json(liveTickers);
  });

`;
  
  fs.writeFileSync('server.ts', before + newCode + after);
  console.log('Successfully patched server.ts');
} else {
  console.log('Could not find injection indices.');
}
