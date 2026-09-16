const fs = require('fs');

let engines = fs.readFileSync('src/services/EngineRegistry.ts', 'utf8');

engines = engines.replace(/\/api\/binance\/price\?/g, '/api/market/price?');

fs.writeFileSync('src/services/EngineRegistry.ts', engines);
console.log('Patched engines!');
