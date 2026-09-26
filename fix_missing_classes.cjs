const fs = require('fs');

// We have an issue where ForexFactoryService is not defined in server.ts
// Wait, is ForexFactoryService in EngineRegistry.ts but server.ts can't import it?
let serverCode = fs.readFileSync('server.ts', 'utf8');

// The error was: globalEngineRegistry.registerEngine(new ForexFactoryService()); ReferenceError: ForexFactoryService is not defined
// That means server.ts doesn't import ForexFactoryService from EngineRegistry.
const hasForexImport = serverCode.includes('ForexFactoryService');
console.log('hasForexImport:', hasForexImport);
