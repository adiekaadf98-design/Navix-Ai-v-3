const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace('globalEngineRegistry.registerEngine(new ForexFactoryService());\n', '');
code = code.replace('globalEngineRegistry.registerEngine(new CryptoEngine());\n', '');
code = code.replace('globalEngineRegistry.registerEngine(new TradingViewService());\n', '');
code = code.replace('globalEngineRegistry.registerEngine(new SignalEngine());', '');

fs.writeFileSync('server.ts', code);
