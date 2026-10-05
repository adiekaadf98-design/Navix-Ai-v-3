import { CloudMarketEngine } from '../src/services/trading/cloudMarketEngine';
import { globalVerificationEngine } from '../src/services/VerificationEngine';
import { executeInstitutionalMarketAnalysis, renderMarkdownFromSchema } from '../src/services/EngineRegistry';
import { StandardizedTradingSignalSchema } from '../src/types/cloudMarket';

async function runTestSuite() {
  console.log('================================================================');
  console.log('NAVIX PRO AI — MANDATORY HARDENED TEST SUITE (PERBAIKAN 1-12)');
  console.log('================================================================\n');

  const originalGlobalFetch = global.fetch;
  global.fetch = async (url: string, init?: any) => {
    const urlStr = String(url);
    if (urlStr.includes('/api/market/price') || urlStr.includes('/api/market/klines')) {
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          price: "4150.0",
          marketSource: "OANDA Spot Feed",
          results: []
        })
      } as any;
    }
    return originalGlobalFetch(url, init);
  };

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail: string) {
    if (condition) {
      passed++;
      console.log(`✔ [PASS] ${testName} -> ${detail}`);
    } else {
      failed++;
      console.error(`❌ [FAIL] ${testName} -> ${detail}`);
    }
  }

  // ---------------------------------------------------------------------------
  // TEST 1: BUY_LIMIT with Entry >= Live -> REJECTED
  // ---------------------------------------------------------------------------
  const gateBuyFail = CloudMarketEngine.validateConstraintLogicGate('BUY', 'BUY_LIMIT', 4200.0, 4150.0);
  assert(
    gateBuyFail.valid === false && gateBuyFail.reasonCode === 'ENTRY_NOT_BELOW_LIVE',
    'TEST 1: BUY_LIMIT Entry >= Live Price Gate Check',
    `Result: valid=${gateBuyFail.valid}, reasonCode=${gateBuyFail.reasonCode}`
  );

  // ---------------------------------------------------------------------------
  // TEST 2: SELL_LIMIT with Entry <= Live -> REJECTED
  // ---------------------------------------------------------------------------
  const gateSellFail = CloudMarketEngine.validateConstraintLogicGate('SELL', 'SELL_LIMIT', 4100.0, 4150.0);
  assert(
    gateSellFail.valid === false && gateSellFail.reasonCode === 'ENTRY_NOT_ABOVE_LIVE',
    'TEST 2: SELL_LIMIT Entry <= Live Price Gate Check',
    `Result: valid=${gateSellFail.valid}, reasonCode=${gateSellFail.reasonCode}`
  );

  // ---------------------------------------------------------------------------
  // TEST 3: BUY_STOP / SELL_STOP -> REJECTED
  // ---------------------------------------------------------------------------
  const gateBuyStop = CloudMarketEngine.validateConstraintLogicGate('BUY', 'BUY_STOP', 4100.0, 4150.0);
  const gateSellStop = CloudMarketEngine.validateConstraintLogicGate('SELL', 'SELL_STOP', 4200.0, 4150.0);
  assert(
    gateBuyStop.valid === false && gateBuyStop.reasonCode === 'STOP_ORDER_FORBIDDEN' &&
    gateSellStop.valid === false && gateSellStop.reasonCode === 'STOP_ORDER_FORBIDDEN',
    'TEST 3: BUY_STOP / SELL_STOP Prohibition Check',
    `BUY_STOP: ${gateBuyStop.reasonCode}, SELL_STOP: ${gateSellStop.reasonCode}`
  );

  // ---------------------------------------------------------------------------
  // TEST 4: Invalid SL Geometry
  // ---------------------------------------------------------------------------
  const veritasBuyBadSL = globalVerificationEngine.verify('trading', {
    direction: 'BUY',
    entryPrice: 4100.0,
    slPrice: 4120.0, // Bad SL > Entry
    tpPrice: 4200.0,
    livePrice: 4150.0,
    orderType: 'BUY_LIMIT'
  });
  const veritasSellBadSL = globalVerificationEngine.verify('trading', {
    direction: 'SELL',
    entryPrice: 4200.0,
    slPrice: 4180.0, // Bad SL < Entry
    tpPrice: 4100.0,
    livePrice: 4150.0,
    orderType: 'SELL_LIMIT'
  });
  assert(
    veritasBuyBadSL.passed === false && veritasSellBadSL.passed === false,
    'TEST 4: Veritas-Check Invalid SL Geometry Check',
    `BUY bad SL passed=${veritasBuyBadSL.passed}, SELL bad SL passed=${veritasSellBadSL.passed}`
  );

  // ---------------------------------------------------------------------------
  // TEST 5: TP on Wrong Side -> REJECTED
  // ---------------------------------------------------------------------------
  const veritasBuyBadTP = globalVerificationEngine.verify('trading', {
    direction: 'BUY',
    entryPrice: 4100.0,
    slPrice: 4080.0,
    tpPrice: 4050.0, // Bad TP < Entry
    livePrice: 4150.0,
    orderType: 'BUY_LIMIT'
  });
  assert(
    veritasBuyBadTP.passed === false,
    'TEST 5: Veritas-Check Wrong Side TP Check',
    `Buy bad TP passed=${veritasBuyBadTP.passed}, issue=${veritasBuyBadTP.issues[0]}`
  );

  // ---------------------------------------------------------------------------
  // TEST 6: LLM Narrative Data-Binding & Dollar Sign Number Validator Check
  // ---------------------------------------------------------------------------
  const mockSchema: StandardizedTradingSignalSchema = {
    symbol: 'XAUUSD',
    timeframe: '15M',
    timestamp: new Date().toISOString(),
    fetched_at: new Date().toISOString(),
    livePrice: 4150.0,
    direction: 'BUY',
    orderType: 'BUY_LIMIT',
    entryPrice: 4120.0,
    slPrice: 4100.0,
    tpPrice: 4200.0,
    riskRewardRatio: '1:4.0',
    structure: 'ORDER_BLOCK_DISPLACEMENT_TREND',
    selectedMethod: 'SMC',
    invalidation: 'Level SL ($4100.00)',
    source: 'OANDA Spot Feed',
    validationStatus: 'VALIDATED'
  };
  const renderedText = renderMarkdownFromSchema(mockSchema);
  // Extract all $ numbers from markdown
  const dollarNumbers = Array.from(renderedText.matchAll(/\$([0-9\.,]+)/g)).map(m => parseFloat(m[1].replace(/,/g, '')));
  const schemaNumbers = [mockSchema.livePrice, mockSchema.entryPrice, mockSchema.slPrice, mockSchema.tpPrice];
  const allDollarNumbersInSchema = dollarNumbers.every(num => schemaNumbers.includes(num));
  assert(
    renderedText.includes('4120') && renderedText.includes('4100') && renderedText.includes('4200') && renderedText.includes('BUY_LIMIT') && allDollarNumbersInSchema,
    'TEST 6: Template Renderer Data-Binding & $ Number Schema Strict Validation',
    `Dollar numbers extracted: ${dollarNumbers.join(', ')} -> All present in schema numbers: ${allDollarNumbersInSchema}`
  );

  // ---------------------------------------------------------------------------
  // TEST 7: Cache Test - Stale Price Age (> MAX_PRICE_AGE_SECONDS) Rejected
  // ---------------------------------------------------------------------------
  const staleTimestamp = new Date(Date.now() - 40000).toISOString(); // 40s ago > 30s
  const veritasStaleCheck = globalVerificationEngine.verify('trading', {
    direction: 'BUY',
    entryPrice: 4120.0,
    slPrice: 4100.0,
    tpPrice: 4200.0,
    livePrice: 4150.0,
    orderType: 'BUY_LIMIT',
    timestamp: staleTimestamp,
    maxPriceAgeSeconds: 30
  });
  assert(
    veritasStaleCheck.passed === false && veritasStaleCheck.issues.some(i => i.includes('stale')),
    'TEST 7: Cache - Price Aged > MAX_PRICE_AGE_SECONDS Rejected',
    `Stale check passed=${veritasStaleCheck.passed}, issue=${veritasStaleCheck.issues[0]}`
  );

  // ---------------------------------------------------------------------------
  // TEST 8: Cache Test - Cache Invalidation & Fetch Failure -> NO_SIGNAL
  // ---------------------------------------------------------------------------
  CloudMarketEngine.priceCacheMap.set('INVALIDSYMBOL999', { price: 4100.0, timestamp: Date.now(), fetched_at: new Date().toISOString(), source: 'Test Stub' });
  const staleFetchRes = await executeInstitutionalMarketAnalysis({ symbol: 'INVALIDSYMBOL999' }, 'TestRunner');
  assert(
    staleFetchRes.output.validationStatus === 'NO_SIGNAL' && staleFetchRes.output.reasonCode === 'STALE_OR_UNAVAILABLE_PRICE',
    'TEST 8: Cache Invalidation & Fail-Closed Price Check',
    `New request deleted cache & output NO_SIGNAL without using old cache price.`
  );

  // ---------------------------------------------------------------------------
  // TEST 9: Complete Edge Cases - Entry==Live, Future/Bad TS, Non-finite, Low RR, Dir Mismatch
  // ---------------------------------------------------------------------------
  const gateEntryEqualLive = CloudMarketEngine.validateConstraintLogicGate('BUY', 'BUY_LIMIT', 4150.0, 4150.0);
  const veritasFutureTs = globalVerificationEngine.verify('trading', {
    direction: 'BUY', entryPrice: 4120.0, slPrice: 4100.0, tpPrice: 4200.0, livePrice: 4150.0, orderType: 'BUY_LIMIT', timestamp: new Date(Date.now() + 60000).toISOString()
  });
  const veritasBadTs = globalVerificationEngine.verify('trading', {
    direction: 'BUY', entryPrice: 4120.0, slPrice: 4100.0, tpPrice: 4200.0, livePrice: 4150.0, orderType: 'BUY_LIMIT', timestamp: 'invalid-date-string'
  });
  const veritasNonFinite = globalVerificationEngine.verify('trading', {
    direction: 'BUY', entryPrice: NaN, slPrice: 4100.0, tpPrice: 4200.0, livePrice: 4150.0, orderType: 'BUY_LIMIT'
  });
  const veritasLowRR = globalVerificationEngine.verify('trading', {
    direction: 'BUY', entryPrice: 4140.0, slPrice: 4100.0, tpPrice: 4150.0, livePrice: 4150.0, orderType: 'BUY_LIMIT' // Risk=40, Reward=10 -> RR 0.25 < 1.5
  });
  const veritasDirMismatch = globalVerificationEngine.verify('trading', {
    direction: 'BUY', entryPrice: 4120.0, slPrice: 4100.0, tpPrice: 4200.0, livePrice: 4150.0, orderType: 'SELL_LIMIT'
  });
  assert(
    gateEntryEqualLive.valid === false && gateEntryEqualLive.reasonCode === 'ENTRY_EQUAL_TO_LIVE' &&
    veritasFutureTs.passed === false && veritasBadTs.passed === false &&
    veritasNonFinite.passed === false && veritasLowRR.passed === false && veritasDirMismatch.passed === false,
    'TEST 9: Complete Edge Cases (Entry==Live, Future/Bad TS, Non-finite, Low RR, Dir Mismatch)',
    `Entry==Live reason=${gateEntryEqualLive.reasonCode}, Future TS=${veritasFutureTs.passed}, Bad TS=${veritasBadTs.passed}, NaN=${veritasNonFinite.passed}, Low RR=${veritasLowRR.passed}, Dir Mismatch=${veritasDirMismatch.passed}`
  );

  // ---------------------------------------------------------------------------
  // TEST 10: Valid BUY and SELL inputs -> PASS
  // ---------------------------------------------------------------------------
  const veritasValidBuy = globalVerificationEngine.verify('trading', {
    direction: 'BUY',
    entryPrice: 4120.0,
    slPrice: 4100.0,
    tpPrice: 4200.0,
    livePrice: 4150.0,
    orderType: 'BUY_LIMIT',
    timestamp: new Date().toISOString()
  });
  const veritasValidSell = globalVerificationEngine.verify('trading', {
    direction: 'SELL',
    entryPrice: 4200.0,
    slPrice: 4220.0,
    tpPrice: 4100.0,
    livePrice: 4150.0,
    orderType: 'SELL_LIMIT',
    timestamp: new Date().toISOString()
  });
  assert(
    veritasValidBuy.passed === true && veritasValidSell.passed === true,
    'TEST 10: Valid BUY and SELL Inputs Veritas Verification',
    `BUY passed=${veritasValidBuy.passed}, SELL passed=${veritasValidSell.passed}`
  );

  // ---------------------------------------------------------------------------
  // TEST 11: Veritas-Check & Logic Gate In Execution Path
  // ---------------------------------------------------------------------------
  const liveAnalysis = await executeInstitutionalMarketAnalysis({ symbol: 'XAUUSD', timeframe: '15m' }, 'TestRunner');
  assert(
    liveAnalysis.output && liveAnalysis.output.veritasResult !== undefined && liveAnalysis.output.gateResult !== undefined,
    'TEST 11: Veritas-Check & Logic Gate Proven In Execution Path',
    `VeritasResult present: ${Boolean(liveAnalysis.output?.veritasResult)}, GateResult present: ${Boolean(liveAnalysis.output?.gateResult)}`
  );

  // ---------------------------------------------------------------------------
  // TEST 12: Recalculate Loop Stub Verification (Max 1 retry with fresh price)
  // ---------------------------------------------------------------------------
  let stubCallCount = 0;
  const originalFetchObj = CloudMarketEngine.fetchLivePriceObj;
  CloudMarketEngine.fetchLivePriceObj = async (symbol: string, forceFresh?: boolean) => {
    stubCallCount++;
    return { price: 4150.0 + stubCallCount * 10, fetched_at: new Date().toISOString(), timestamp: Date.now(), source: 'Stub Provider' };
  };
  const stubRes = await executeInstitutionalMarketAnalysis({ symbol: 'XAUUSD', timeframe: '15m' }, 'RecalcStubTest');
  assert(
    stubCallCount <= 2 && stubRes.output !== undefined,
    'TEST 12: Recalculate Loop Maximum 1 Retry Verification',
    `Total fetch calls made=${stubCallCount} (initial + max 1 recalculate retry).`
  );
  CloudMarketEngine.fetchLivePriceObj = originalFetchObj;

  // ---------------------------------------------------------------------------
  // TEST 13: Parallel Requests Coalescing Verification (E.9)
  // ---------------------------------------------------------------------------
  const p1 = CloudMarketEngine.fetchLivePriceObj('XAUUSD', true);
  const p2 = CloudMarketEngine.fetchLivePriceObj('XAUUSD', true);
  const [r1, r2] = await Promise.all([p1, p2]);
  assert(
    r1 !== null && r2 !== null && r1.timestamp === r2.timestamp && r1.price === r2.price,
    'TEST 13: Parallel Requests Coalescing (Lock/Promise Reuse)',
    `Request 1 timestamp=${r1?.timestamp}, Request 2 timestamp=${r2?.timestamp} (Coalesced properly: ${r1?.timestamp === r2?.timestamp})`
  );

  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('================================================================');

  global.fetch = originalGlobalFetch;

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
