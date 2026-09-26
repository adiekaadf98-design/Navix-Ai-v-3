const fs = require('fs');
let code = fs.readFileSync('src/services/EngineRegistry.ts', 'utf8');

if (!code.includes('export class CryptoEngine')) {
  const cryptoCode = `export class CryptoEngine implements IEngine {
    name = 'CryptoEngine';
    description = 'Mesin Analisis Crypto';

    async execute(payload: any): Promise<EngineResult> {
      return { status: 'success', source: this.name, message: 'Berhasil' };
    }
  }
  `;
  const insertIndex = code.indexOf('export class CodingEngine');
  code = code.substring(0, insertIndex) + cryptoCode + '\n' + code.substring(insertIndex);
  fs.writeFileSync('src/services/EngineRegistry.ts', code);
}
