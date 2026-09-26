const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetImport = 'import { globalEngineRegistry } from "./src/services/EngineRegistry";';
if (code.includes(targetImport)) {
  code = code.replace(
    targetImport, 
    'import { globalEngineRegistry, ForexFactoryService, CryptoEngine, TradingViewService, SignalEngine } from "./src/services/EngineRegistry";\n' +
    'globalEngineRegistry.registerEngine(new ForexFactoryService());\n' +
    'globalEngineRegistry.registerEngine(new CryptoEngine());\n' +
    'globalEngineRegistry.registerEngine(new TradingViewService());\n' +
    'globalEngineRegistry.registerEngine(new SignalEngine());'
  );
  fs.writeFileSync('server.ts', code);
}
