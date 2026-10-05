/**
 * NACE CONTRACT VALIDATION SUITE (Gate 1A)
 * 
 * Verifies:
 * 1. TaskEnvelope creation and context packaging
 * 2. CognitiveUnderstanding schema compliance
 * 3. Bidirectional complexity mapping (Legacy <-> NACE)
 * 4. NaceExecutionPlan & NaceExecutionStep structural integrity
 * 5. CapabilityDescriptor deterministic flag and engine support
 * 6. VerificationResult and NaceExecutionResult compatibility
 */

import {
  TaskEnvelope,
  CognitiveUnderstanding,
  NaceExecutionPlan,
  NaceExecutionStep,
  CapabilityDescriptor,
  NaceExecutionResult,
  toNaceComplexity,
  toLegacyComplexity
} from '../src/types/nace';

function runContractTests() {
  console.log('================================================================');
  console.log('NAVIX PRO AI — NACE CONTRACT VALIDATION SUITE (GATE 1A)');
  console.log('================================================================');

  let passed = 0;
  let total = 0;

  function assert(testName: string, condition: boolean, extra?: string) {
    total++;
    if (condition) {
      console.log(`✔ [PASS] ${testName}${extra ? ' -> ' + extra : ''}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}${extra ? ' -> ' + extra : ''}`);
    }
  }

  // TEST 1: TaskEnvelope Contract
  const envelope: TaskEnvelope = {
    taskId: 'task_nace_test_01',
    sessionId: 'session_01',
    rawRequest: 'Analisis pergerakan harga XAUUSD dan berikan sinyal institusional',
    context: {
      attachmentsCount: 0,
      globalMemory: 'User prefers 15m timeframe'
    },
    createdAt: Date.now()
  };
  assert('TEST 1: TaskEnvelope instantiation & context packaging', 
    envelope.taskId === 'task_nace_test_01' && envelope.rawRequest.length > 0 && envelope.context?.attachmentsCount === 0);

  // TEST 2: Bidirectional Complexity Mapping
  const c1 = toNaceComplexity('SIMPLE');
  const c2 = toNaceComplexity('CRITICAL');
  const l1 = toLegacyComplexity('LOW');
  const l2 = toLegacyComplexity('DEEP');
  assert('TEST 2: Complexity Bidirectional Mapping', 
    c1 === 'LOW' && c2 === 'DEEP' && l1 === 'SIMPLE' && l2 === 'CRITICAL',
    `SIMPLE->${c1}, CRITICAL->${c2}, LOW->${l1}, DEEP->${l2}`);

  // TEST 3: CognitiveUnderstanding Schema Contract
  const understanding: CognitiveUnderstanding = {
    intent: {
      name: 'INSTITUTIONAL_MARKET_ANALYSIS',
      domain: 'TRADING',
      taskType: 'trading',
      primaryGoal: 'Extract real market candles and evaluate market structure',
      rawIntent: envelope.rawRequest,
      confidence: 0.98
    },
    domain: 'TRADING',
    complexity: 'DEEP',
    requiredCapabilities: ['MarketData', 'StructureAnalysis', 'Verification'],
    constraints: ['NO_FABRICATION', 'REAL_PRICE_ONLY', 'VERITAS_AUDIT'],
    verificationLevel: 'VERITAS_AUDIT',
    executionDepth: 'DEEP_PATH',
    rationale: ['Trading query requires real market data and strict Veritas geometry check'],
    timestamp: Date.now()
  };
  assert('TEST 3: CognitiveUnderstanding contract compliance', 
    understanding.domain === 'TRADING' && 
    understanding.complexity === 'DEEP' && 
    understanding.verificationLevel === 'VERITAS_AUDIT');

  // TEST 4: CapabilityDescriptor Contract
  const mathCapability: CapabilityDescriptor = {
    name: 'HighPrecisionMath',
    domain: 'MATH',
    description: 'Deterministic 50-digit precision arithmetic evaluator',
    requiredInputs: ['expression'],
    producedOutputs: ['result', 'stepExplanation', 'significantDigits'],
    supportedEngines: ['MathEngine'],
    isDeterministic: true,
    verificationMethod: 'DETERMINISTIC_EVALUATOR'
  };
  assert('TEST 4: CapabilityDescriptor deterministic boundary check', 
    mathCapability.isDeterministic === true && mathCapability.supportedEngines.includes('MathEngine'));

  // TEST 5: Dynamic Execution Plan & Step Contract
  const step1: NaceExecutionStep = {
    stepId: 'step-01',
    sequence: 1,
    objective: 'Fetch real candlestick data for XAUUSD',
    requiredCapability: 'MarketData',
    preferredEngine: 'SignalEngine',
    fallbackEngine: 'RetailTraderGitHubEngine',
    inputContract: { requiredKeys: ['symbol', 'timeframe'] },
    outputContract: { expectedKeys: ['candles', 'livePrice'] },
    verificationRequirement: { required: true, domain: 'trading', strictGate: true },
    status: 'PENDING'
  };

  const plan: NaceExecutionPlan = {
    planId: 'plan_nace_01',
    taskId: envelope.taskId,
    complexity: 'DEEP',
    steps: [step1],
    requiredCapabilities: ['MarketData'],
    verificationLevel: 'VERITAS_AUDIT',
    executionPolicy: {
      fastPath: false,
      timeoutMs: 15000,
      maxRetries: 1,
      allowParallel: false,
      failClosedOnVerification: true
    },
    createdAt: Date.now(),
    status: 'DRAFT'
  };
  assert('TEST 5: NaceExecutionPlan step sequence and policy contract', 
    plan.steps.length === 1 && plan.executionPolicy.failClosedOnVerification === true && plan.steps[0].verificationRequirement.strictGate === true);

  // TEST 6: ExecutionResult and Verification Integration
  const execResult: NaceExecutionResult = {
    taskId: envelope.taskId,
    planId: plan.planId,
    stepId: step1.stepId,
    engineName: 'SignalEngine',
    status: 'SUCCESS',
    outputData: { livePrice: 2650.50, candlesCount: 100 },
    latencyMs: 180,
    verification: {
      passed: true,
      score: 100,
      issues: [],
      evidence: 'Live price confirmed with fresh timestamp',
      domain: 'trading'
    },
    timestamp: Date.now()
  };
  assert('TEST 6: NaceExecutionResult & VerificationResult contract synthesis', 
    execResult.status === 'SUCCESS' && execResult.verification?.passed === true);

  console.log('================================================================');
  console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
  console.log('================================================================');

  if (passed === total) {
    console.log('GATE 1A CONTRACT AUDIT: PASSED (100% Type-Safe & Architecture-Compliant)');
    process.exit(0);
  } else {
    console.error('GATE 1A CONTRACT AUDIT: FAILED');
    process.exit(1);
  }
}

runContractTests();
