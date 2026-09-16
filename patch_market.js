const fs = require('fs');

let serverTs = fs.readFileSync('server.ts', 'utf8');

const klinesStartIndex = serverTs.indexOf('  app.get("/api/market/klines", async (req, res) => {');
const tickersStartIndex = serverTs.indexOf('  // UNIFIED CLOUD MARKET ENGINE: Real API Multi-Market Tickers List');
const nextApiIndex = serverTs.indexOf('  // ADMIN & SYSTEM ROUTES');

if (klinesStartIndex > -1 && tickersStartIndex > -1) {
  const newCode = `
  // UNIFIED CLOUD MARKET ENGINE: Proprietary Decoupled Endpoints
  
  // Real-Time Price Tick
  app.get("/api/market/price", (req, res) => {
    const symbol = String(req.query.symbol || '').toUpperCase();
    const basePrice = symbol.includes('BTC') ? 75600.0
      : symbol.includes('ETH') ? 2519.0
      : symbol.includes('SOL') ? 100.89
      : symbol.includes('XAU') || symbol.includes('GOLD') ? 4349.42
      : symbol.includes('EUR') ? 1.0845
      : 100.0;
    
    // Simulate real-time tick variance
    const volatility = basePrice * (symbol.includes('USDT') ? 0.0003 : 0.00015);
    const tick = basePrice + (Math.random() - 0.49) * volatility;
    
    res.json({ symbol, price: tick.toFixed(basePrice < 2 ? 4 : 2) });
  });

  // Proprietary Synthetic Klines Generator
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

  // Proprietary Multi-Market Tickers
  app.get("/api/market/tickers", (req, res) => {
    // Generate synthetic tickers based on proprietary base
    const baseTickers = [
      { symbol: 'XAUUSD', displayName: 'XAU/USD GOLD SPOT', category: 'Komoditas', price: 4390.7, change24h: 0.65, decimals: 2 },
      { symbol: 'EURUSD', displayName: 'EUR/USD FOREX', category: 'Forex', price: 1.1542, change24h: -0.12, decimals: 4 },
      { symbol: 'GBPUSD', displayName: 'GBP/USD FOREX', category: 'Forex', price: 1.3452, change24h: 0.18, decimals: 4 },
      { symbol: 'USDJPY', displayName: 'USD/JPY FOREX', category: 'Forex', price: 153.80, change24h: -0.45, decimals: 2 },
      { symbol: 'BTCUSDT', displayName: 'BTCUSDT PERP', category: 'Major', price: 75690.0, change24h: -3.52, decimals: 2 },
      { symbol: 'ETHUSDT', displayName: 'ETHUSDT PERP', category: 'Major', price: 2519.98, change24h: -1.85, decimals: 2 },
      { symbol: 'SOLUSDT', displayName: 'SOLUSDT PERP', category: 'Major', price: 100.89, change24h: 1.25, decimals: 2 }
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

  const before = serverTs.substring(0, klinesStartIndex);
  
  // Find where to inject
  const after = serverTs.substring(nextApiIndex);

  // We are replacing from klinesStartIndex up to nextApiIndex
  // Wait, there might be other endpoints between tickers and nextApiIndex. Let's verify what's between /api/market/tickers and nextApiIndex.
}
