const fs = require('fs');
let code = fs.readFileSync('src/services/EngineRegistry.ts', 'utf8');

const ffClass = `export class ForexFactoryService implements IEngine {
  name = 'ForexFactoryService';
  description = 'Mesin Analisis Fundamental menggunakan Jadwal Berita Makro (Forex Factory)';

  async execute(payload: any): Promise<EngineResult> {
    try {
      const res = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json');
      if (res.ok) {
        const data = await res.json();
        return { status: 'success', source: this.name, data, message: 'Berita Makro Terkini' };
      }
      return { status: 'error', source: this.name, message: 'Gagal mengambil berita' };
    } catch(e:any) {
      return { status: 'error', source: this.name, message: e.message };
    }
  }
}
`;

if (!code.includes('export class ForexFactoryService')) {
  const insertIdx = code.indexOf('export class CodingEngine');
  code = code.substring(0, insertIdx) + ffClass + '\n' + code.substring(insertIdx);
  fs.writeFileSync('src/services/EngineRegistry.ts', code);
}
