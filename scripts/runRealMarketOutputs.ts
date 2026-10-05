import { executeInstitutionalMarketAnalysis } from '../src/services/EngineRegistry';

async function runRealVerification() {
  console.log('=== REAL RUNTIME ANALYSIS FOR XAUUSD ===');
  const xauRes = await executeInstitutionalMarketAnalysis({ symbol: 'XAUUSD', timeframe: '15m' }, 'RealVerificationRunner');
  console.log(xauRes.output.formattedSignal || JSON.stringify(xauRes.output, null, 2));

  console.log('\n=== REAL RUNTIME ANALYSIS FOR BTCUSDT ===');
  const btcRes = await executeInstitutionalMarketAnalysis({ symbol: 'BTCUSDT', timeframe: '15m' }, 'RealVerificationRunner');
  console.log(btcRes.output.formattedSignal || JSON.stringify(btcRes.output, null, 2));
}

runRealVerification().catch(console.error);
