const fs = require('fs');
let code = fs.readFileSync('src/services/EngineRegistry.ts', 'utf8');

const tStart = code.indexOf('export class TradingViewService');
if (tStart > -1) {
  const exportsCode = code.substring(tStart);
  fs.writeFileSync('debug_exports.ts', exportsCode);
}
