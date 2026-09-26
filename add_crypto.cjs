const fs = require('fs');
let code = fs.readFileSync('src/services/EngineRegistry.ts', 'utf8');

const cryptoClass = `export class CryptoEngine implements IEngine {
  name = 'CryptoEngine';
  description = 'Mesin Analisis Crypto';

  async execute(payload: any): Promise<EngineResult> {
    return { status: 'success', source: this.name, message: 'Berhasil' };
  }
}
`;

if (!code.includes('export class CryptoEngine')) {
  const insertIdx = code.indexOf('export class CodingEngine');
  code = code.substring(0, insertIdx) + cryptoClass + '\n' + code.substring(insertIdx);
  fs.writeFileSync('src/services/EngineRegistry.ts', code);
}
