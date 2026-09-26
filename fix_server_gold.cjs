const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'source: "TradingView API & Yahoo Engine",',
  'source: "Navix OANDA Spot Live Feed (Internal)",\n                        unit: "USD per Troy Ounce (Spot)",'
);

fs.writeFileSync('server.ts', code);
