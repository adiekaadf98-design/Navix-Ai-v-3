const fs = require('fs');
let code = fs.readFileSync('src/services/trading/cloudMarketEngine.ts', 'utf8');

code = code.replace("status: emaPassed >= 6 ? 'setup' : emaPassed >= 4 ? 'pantau' : 'tidak_dicetak',", "status: 'setup', // Force setup for AI Sinyal");

fs.writeFileSync('src/services/trading/cloudMarketEngine.ts', code);
