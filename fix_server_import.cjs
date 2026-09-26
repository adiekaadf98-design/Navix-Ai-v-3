const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  /globalEngineRegistry,/g, 
  'globalEngineRegistry, ForexFactoryService, CryptoEngine, TradingViewService, '
);
fs.writeFileSync('server.ts', code);
