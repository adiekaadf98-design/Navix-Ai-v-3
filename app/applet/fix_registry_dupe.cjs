const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/services/EngineRegistry.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Find the index of "export function renderMarkdownFromSchema"
const startIndex = content.indexOf("export function renderMarkdownFromSchema(");
if (startIndex === -1) {
  console.error("Could not find start index of renderMarkdownFromSchema");
  process.exit(1);
}

// Find the second index of "export async function executeInstitutionalMarketAnalysis"
const firstExecIndex = content.indexOf("export async function executeInstitutionalMarketAnalysis(");
const secondExecIndex = content.indexOf("export async function executeInstitutionalMarketAnalysis(", firstExecIndex + 1);

if (secondExecIndex === -1) {
  console.error("Could not find second copy of executeInstitutionalMarketAnalysis");
  process.exit(1);
}

// The correct renderMarkdownFromSchema implementation
const correctRenderFn = `export function renderMarkdownFromSchema(
  schema: StandardizedTradingSignalSchema,
  displayName?: string,
  activeResult?: any,
  selection?: any,
  allEngines?: any,
  isIdr: boolean = false
): string {
  const currPrefix = isIdr ? 'Rp ' : '$';
  const name = displayName || schema.symbol;
  const decimals = schema.symbol.endsWith('.JK') ? 0 : (schema.symbol.includes('JPY') ? 3 : 2);

  if (schema.validationStatus === 'NO_SIGNAL') {
    return \`🏛️ **NAVIX CLOUD MARKET — ANALISIS INSTITUSIONAL REAL-TIME**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 **Aset**: \${name} (\${schema.symbol}) | Timeframe: \${schema.timeframe}
💰 **Harga Berjalan**: \${currPrefix}\${isIdr ? schema.livePrice.toLocaleString('id-ID') : schema.livePrice.toLocaleString()} (\${schema.source})
🌐 **Status Validasi**: \\\`NO_SIGNAL\\\` (Ditolak Gate Keamanan)
⚠️ **Kode Alasan (Reason Code)**: \\\`\${schema.reasonCode || 'SIGNAL_REJECTED'}\\\`
📌 **Catatan Kegagalan**: \${schema.reasonNote || 'Sinyal tidak memenuhi kriteria keamanan atau geometri.'}
⏰ **Waktu Fetch**: \${schema.fetched_at}

💡 **TINDAKAN REKOMENDASI:**
Sistem menolak menerbitkan order demi keamanan modal. Menunggu pergerakan struktur pasar berikutnya hingga terbentuk pembentukan harga yang valid.\`;
  }

  const rules = schema.ruleChecklist || activeResult?.rules || [];
  const passedCount = rules.filter((r: any) => r.passed).length;
  const totalCount = rules.length;
  const checklistText = rules.map((r: any) => \`\${r.passed ? '✅' : '⏳'} \${r.label}\`).join('\\n');

  const execState = activeResult?.executionState || schema.validationStatus;
  const isSetupTriggered = execState === 'ENTRY_READY' || execState === 'TRIGGERED';
  let statusText = '**WAIT / PANTAU**';
  if (isSetupTriggered && passedCount >= (schema.selectedMethod === 'SNR' ? 6 : schema.selectedMethod === 'SMC' ? 5 : 4)) {
    statusText = \`**SETUP VALID** (\${schema.direction})\`;
  } else {
    statusText = \`**PENDING PLAN – BELUM TRIGGER (WAIT / PANTAU)** (\${schema.direction})\`;
  }

  const atrVal = activeResult?.atrVal || 1.0;
  const entryToLiveDist = Math.abs(schema.entryPrice - schema.livePrice);
  const distRatio = entryToLiveDist / atrVal;

  return \`🏛️ **NAVIX CLOUD MARKET — ANALISIS INSTITUSIONAL REAL-TIME**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 **Aset**: \${name} (\${schema.symbol}) | Timeframe: \${schema.timeframe}
💰 **Harga Berjalan**: \${currPrefix}\${isIdr ? schema.livePrice.toLocaleString('id-ID') : schema.livePrice.toLocaleString()} (\${schema.source})
⚡ **Active Method (Tunggal)**: \${activeResult?.name || schema.selectedMethod} (\${schema.selectedMethod})
🌐 **Event Pasar Terklasifikasi**: \\\`\${selection?.marketEvent || activeResult?.methodEvent || 'NO_EVENT'}\\\` (Kondisi: \\\`\${schema.structure}\\\`)
🔄 **State Metode Aktif**: \\\`\${activeResult?.methodState || 'WATCH'}\\\` | **State Eksekusi**: \\\`\${activeResult?.executionState || 'WAITING_FOR_TRIGGER'}\\\`
📌 **Alasan Pemilihan Metode**: \${selection?.selectionReason || 'Struktur paling dominan'}
🎯 **Status Analisis**: \${statusText}
⏰ **Waktu Fetch**: \${schema.fetched_at}

📊 **RENCANA EKSEKUSI TRADING (NATIVE \${schema.selectedMethod}):**
• **Tipe Order**: \\\`\${schema.orderType}\\\`
• **Entry Area**: \\\`\${currPrefix}\${schema.entryPrice}\\\`
• **Stop Loss (SL)**: \\\`\${currPrefix}\${schema.slPrice}\\\` (Invalidasi Level)
• **Take Profit (TP)**: \\\`\${currPrefix}\${schema.tpPrice}\\\`
• **Risk-Reward (RR)**: \\\`\${schema.riskRewardRatio}\\\`
• **Jarak Entry ke Live (ATR)**: \\\`\${currPrefix}\${entryToLiveDist.toFixed(decimals)}\\\` (Nilai ATR: \\\`\${atrVal.toFixed(decimals)}\\\` | Rasio Jarak/ATR: \\\`\${distRatio.toFixed(2)}x ATR\\\`)
• **Alokasi Risiko**: \\\`1.0% - 2.0% per trade berbasis jarak SL\\\`
• **Sumber Setup / Entry**: \\\`\${schema.selectedMethod}.Native\\\` → \\\`\${activeResult?.entrySource || 'Level Terkunci'}\\\`
• **Aturan Entry Digunakan**: \\\`\${activeResult?.entryRuleUsed || 'Native Rule'}\\\`
• **Invalidasi Sinyal**: \\\`\${schema.invalidation}\\\`
• **Isolasi Lintas Metode**: \\\`TERKUNCI (crossMethodContamination: false)\\\`

📋 **CHECKLIST ATURAN LOLOS (\${passedCount}/\${totalCount}):**
\${checklistText || '✅ Limit Order & Invalidation Verified'}

💡 **CARA MASUK & STRATEGI EKSEKUSI:**
\${schema.executionHowTo || activeResult?.caraMasuk || \`Pasang \${schema.orderType} di \${currPrefix}\${schema.entryPrice} (di atas/bawah running \${currPrefix}\${schema.livePrice}). SL: \${currPrefix}\${schema.slPrice}, TP: \${currPrefix}\${schema.tpPrice}.\`}

🌐 **RUNTIME OBSERVABILITY 5 METODE NAVIX AI (ISOLASI MANDIRI):**
• **SMC**: \${selection?.observerStates?.SMC || 'WATCH'} [State: \${allEngines?.SMC?.methodState || 'INACTIVE'}] (\${allEngines?.SMC?.direction?.toUpperCase() || 'BUY'}) • Entry \${allEngines?.SMC?.entryPrice || schema.entryPrice}
• **SNR**: \${selection?.observerStates?.SNR || 'WATCH'} [State: \${allEngines?.SNR?.methodState || 'INACTIVE'}] (\${allEngines?.SNR?.direction?.toUpperCase() || 'BUY'}) • Entry \${allEngines?.SNR?.entryPrice || schema.entryPrice}
• **RBS**: \${selection?.observerStates?.RBS || 'WATCH'} [State: \${allEngines?.RBS?.methodState || 'INACTIVE'}] (\${allEngines?.RBS?.direction?.toUpperCase() || 'BUY'}) • Entry \${allEngines?.RBS?.entryPrice || schema.entryPrice}
• **FIBONACCI**: \${selection?.observerStates?.FIBONACCI || 'WATCH'} [State: \${allEngines?.FIBONACCI?.methodState || 'INACTIVE'}] (\${allEngines?.FIBONACCI?.direction?.toUpperCase() || 'BUY'}) • Entry \${allEngines?.FIBONACCI?.entryPrice || schema.entryPrice}
• **CRT**: \${selection?.observerStates?.CRT || 'WATCH'} [State: \${allEngines?.CRT?.methodState || 'INACTIVE'}] (\${allEngines?.CRT?.direction?.toUpperCase() || 'BUY'}) • Entry \${allEngines?.CRT?.entryPrice || schema.entryPrice}\`;
}

`;

// Replace everything from startIndex to secondExecIndex
let newContent = content.substring(0, startIndex) + correctRenderFn + content.substring(secondExecIndex);

// Define atr inside executeInstitutionalMarketAnalysis right before if (activeResult)
const targetAtrAssign = `if (activeResult) {
      activeResult.atrVal = atr;
    }`;

// Check if we already have const atr defined. If not, define it
if (newContent.indexOf("const atr = candles && candles.length >= 14") === -1) {
  newContent = newContent.replace(
    "if (activeResult) {\n      activeResult.atrVal = atr;\n    }",
    `const atr = candles && candles.length >= 14 ? CloudMarketEngine.calculateATR(candles) : 1.0;
    if (activeResult) {
      activeResult.atrVal = atr;
    }`
  );
}

fs.writeFileSync(filePath, newContent, 'utf8');
console.log("Registry duplication resolved and renderMarkdownFromSchema restored successfully!");
