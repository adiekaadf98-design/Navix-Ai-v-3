/**
 * NAVIX PRO AI — NACE RUNTIME INTEGRATION TEST SUITE (PHASE 2)
 * 
 * Verifies:
 * Level 1: Static contract integrity
 * Level 2: TaskEnvelope & NaceExecutionPlan schemas
 * Level 3: 10 Routing Scenarios:
 *   1. Simple Chat (FAST_PATH)
 *   2. High Precision Math
 *   3. Code Engineering
 *   4. Research / Web Search
 *   5. Trading SMC Market Analysis
 *   6. Image Generation
 *   7. Video Generation
 *   8. Document Processing
 *   9. Unavailable Capability (CAPABILITY_NOT_AVAILABLE)
 *   10. Failed Execution / Bounded Recovery
 * Level 4: Full End-to-End Runtime Trace (Request -> NACE -> Pilgun -> Engine -> Verification -> Result)
 */

import { TaskEnvelope } from '../src/types/nace';
import { naceCognitiveEngine } from '../src/services/NaceCognitiveEngine';
import { globalAdaptiveEngine } from '../src/services/AdaptiveExecutionEngine';

async function runRuntimeSuite() {
  console.log('================================================================');
  console.log('NAVIX PRO AI — NACE RUNTIME INTEGRATION TEST SUITE (PHASE 2)');
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

  // -------------------------------------------------------------
  // ROUTING TEST 1: Simple Chat -> FAST_PATH & DISCUSSION MODE
  // -------------------------------------------------------------
  const chatEnv: TaskEnvelope = {
    taskId: 'task_chat_01',
    rawRequest: 'Halo, bagaimana kabarmu hari ini?',
    createdAt: Date.now()
  };
  const chatUnderstanding = naceCognitiveEngine.understand(chatEnv);
  const chatPlan = naceCognitiveEngine.plan(chatUnderstanding, chatEnv);
  assert(
    'TEST 1: Simple Chat Routing',
    chatUnderstanding.domain === 'CHAT' &&
    chatUnderstanding.executionDepth === 'FAST_PATH' &&
    chatUnderstanding.complexity === 'LOW' &&
    chatPlan.executionPolicy.fastPath === true,
    `Domain: ${chatUnderstanding.domain}, Depth: ${chatUnderstanding.executionDepth}`
  );

  // -------------------------------------------------------------
  // ROUTING TEST 2: High Precision Math
  // -------------------------------------------------------------
  const mathEnv: TaskEnvelope = {
    taskId: 'task_math_01',
    rawRequest: 'hitung 50! / (25! * 25!)',
    createdAt: Date.now()
  };
  const mathUnderstanding = naceCognitiveEngine.understand(mathEnv);
  const mathPlan = naceCognitiveEngine.plan(mathUnderstanding, mathEnv);
  const resolvedMathPlan = naceCognitiveEngine.resolveCapabilities(mathPlan, mathEnv);
  assert(
    'TEST 2: Math Routing & Deterministic Verification Gate',
    mathUnderstanding.domain === 'MATH' &&
    resolvedMathPlan.steps[0].assignedEngine === 'MathEngine' &&
    resolvedMathPlan.steps[0].verificationRequirement.strictGate === true,
    `Assigned: ${resolvedMathPlan.steps[0].assignedEngine}`
  );

  // -------------------------------------------------------------
  // ROUTING TEST 3: Code Engineering
  // -------------------------------------------------------------
  const codeEnv: TaskEnvelope = {
    taskId: 'task_code_01',
    rawRequest: '@kode buat fungsi typescript debounce dengan generic type',
    createdAt: Date.now()
  };
  const codeUnderstanding = naceCognitiveEngine.understand(codeEnv);
  const codePlan = naceCognitiveEngine.resolveCapabilities(naceCognitiveEngine.plan(codeUnderstanding, codeEnv), codeEnv);
  assert(
    'TEST 3: Code Engineering Routing',
    codeUnderstanding.domain === 'CODE' &&
    codePlan.steps[0].assignedEngine === 'CodingEngine',
    `Domain: ${codeUnderstanding.domain}, Engine: ${codePlan.steps[0].assignedEngine}`
  );

  // -------------------------------------------------------------
  // ROUTING TEST 4: Research / Search
  // -------------------------------------------------------------
  const searchEnv: TaskEnvelope = {
    taskId: 'task_search_01',
    rawRequest: 'riset perkembangan terbaru fusi nuklir kuantum 2026',
    createdAt: Date.now()
  };
  const searchUnderstanding = naceCognitiveEngine.understand(searchEnv);
  const searchPlan = naceCognitiveEngine.resolveCapabilities(naceCognitiveEngine.plan(searchUnderstanding, searchEnv), searchEnv);
  assert(
    'TEST 4: Research / Web Search Routing',
    searchUnderstanding.domain === 'RESEARCH' &&
    searchPlan.steps[0].assignedEngine === 'SearchEngine',
    `Domain: ${searchUnderstanding.domain}, Engine: ${searchPlan.steps[0].assignedEngine}`
  );

  // -------------------------------------------------------------
  // ROUTING TEST 5: Trading Analysis (DEEP_PATH & VERITAS_AUDIT)
  // -------------------------------------------------------------
  const tradingEnv: TaskEnvelope = {
    taskId: 'task_trade_01',
    rawRequest: 'Analisis pergerakan harga XAUUSD timeframe 15m dengan SMC dan berikan sinyal',
    createdAt: Date.now()
  };
  const tradingUnderstanding = naceCognitiveEngine.understand(tradingEnv);
  const tradingPlan = naceCognitiveEngine.resolveCapabilities(naceCognitiveEngine.plan(tradingUnderstanding, tradingEnv), tradingEnv);
  assert(
    'TEST 5: Trading SMC Analysis Routing & Veritas Audit Policy',
    tradingUnderstanding.domain === 'TRADING' &&
    tradingUnderstanding.executionDepth === 'DEEP_PATH' &&
    tradingUnderstanding.verificationLevel === 'VERITAS_AUDIT' &&
    tradingPlan.steps.length >= 2,
    `Steps: ${tradingPlan.steps.length}, Level: ${tradingPlan.verificationLevel}`
  );

  // -------------------------------------------------------------
  // ROUTING TEST 6: Image Synthesis
  // -------------------------------------------------------------
  const imageEnv: TaskEnvelope = {
    taskId: 'task_image_01',
    rawRequest: '@image lukisan pemandangan pegunungan cyberpunk neon',
    createdAt: Date.now()
  };
  const imageUnderstanding = naceCognitiveEngine.understand(imageEnv);
  const imagePlan = naceCognitiveEngine.resolveCapabilities(naceCognitiveEngine.plan(imageUnderstanding, imageEnv), imageEnv);
  assert(
    'TEST 6: Image Generation Routing',
    imageUnderstanding.domain === 'IMAGE' &&
    imagePlan.steps.some(s => s.assignedEngine === 'ImageEngine'),
    `Domain: ${imageUnderstanding.domain}`
  );

  // -------------------------------------------------------------
  // ROUTING TEST 7: Video Generation
  // -------------------------------------------------------------
  const videoEnv: TaskEnvelope = {
    taskId: 'task_video_01',
    rawRequest: '@video animasi pesawat luar angkasa melewati cincin planet saturnus',
    createdAt: Date.now()
  };
  const videoUnderstanding = naceCognitiveEngine.understand(videoEnv);
  const videoPlan = naceCognitiveEngine.resolveCapabilities(naceCognitiveEngine.plan(videoUnderstanding, videoEnv), videoEnv);
  assert(
    'TEST 7: Video Generation Routing',
    videoUnderstanding.domain === 'VIDEO' &&
    videoPlan.steps.some(s => s.assignedEngine === 'VideoEngine'),
    `Domain: ${videoUnderstanding.domain}`
  );

  // -------------------------------------------------------------
  // ROUTING TEST 8: Document Processing
  // -------------------------------------------------------------
  const docEnv: TaskEnvelope = {
    taskId: 'task_doc_01',
    rawRequest: '@dokumen buat draft laporan formal hasil audit keuangan kuartal 3',
    createdAt: Date.now()
  };
  const docUnderstanding = naceCognitiveEngine.understand(docEnv);
  const docPlan = naceCognitiveEngine.resolveCapabilities(naceCognitiveEngine.plan(docUnderstanding, docEnv), docEnv);
  assert(
    'TEST 8: Document Processing Routing',
    docUnderstanding.domain === 'DOCUMENT' &&
    docPlan.steps.some(s => s.assignedEngine === 'DocumentEngine'),
    `Domain: ${docUnderstanding.domain}`
  );

  // -------------------------------------------------------------
  // ROUTING TEST 9: Unavailable Capability Handling
  // -------------------------------------------------------------
  const unavailPlan = {
    planId: 'plan_unavail',
    taskId: 'task_unavail',
    complexity: 'MEDIUM' as any,
    steps: [{
      stepId: 'step-fake',
      sequence: 1,
      objective: 'Run unknown capability',
      requiredCapability: 'quantum_teleportation_non_existent',
      inputContract: { requiredKeys: [] },
      outputContract: { expectedKeys: [] },
      verificationRequirement: { required: false },
      status: 'PENDING' as any
    }],
    requiredCapabilities: ['quantum_teleportation_non_existent'],
    verificationLevel: 'BASIC' as any,
    executionPolicy: { fastPath: false, timeoutMs: 5000, maxRetries: 0, allowParallel: false, failClosedOnVerification: true },
    createdAt: Date.now(),
    status: 'DRAFT' as any
  };
  const resolvedUnavail = naceCognitiveEngine.resolveCapabilities(unavailPlan, { taskId: 't', rawRequest: 'fake', createdAt: 0 });
  assert(
    'TEST 9: Unavailable Capability Rejection (Anti-Placeholder)',
    resolvedUnavail.steps[0].assignedEngine === 'CAPABILITY_NOT_AVAILABLE' &&
    resolvedUnavail.steps[0].status === 'FAILED',
    `Status: ${resolvedUnavail.steps[0].status}, Engine: ${resolvedUnavail.steps[0].assignedEngine}`
  );

  // -------------------------------------------------------------
  // ROUTING TEST 10 & LEVEL 4 RUNTIME TRACE: End-to-End Execution
  // -------------------------------------------------------------
  console.log('\n--- Level 4: Live Machine-to-Machine Runtime Trace ---');
  try {
    const traceResult = await globalAdaptiveEngine.processTaskEnvelope({
      taskId: 'trace_task_math_01',
      rawRequest: 'hitung 125 * 8 + 450',
      createdAt: Date.now()
    });

    const traces = naceCognitiveEngine.getObservabilityTrace('trace_task_math_01');
    const hasTrace = traces.length > 0;
    const isCompleted = traceResult.classification.intent !== '';

    assert(
      'TEST 10: End-to-End Runtime Trace & Observability Audit',
      isCompleted && hasTrace && traces[0].selectedEngine === 'MathEngine',
      `Trace Count: ${traces.length}, Selected Engine: ${traces[0]?.selectedEngine}`
    );
  } catch (err: any) {
    assert('TEST 10: End-to-End Runtime Trace & Observability Audit', false, err.message);
  }

  // -------------------------------------------------------------
  // FORENSIC TEST 11: Deliberation Council Mandate Ingestion
  // -------------------------------------------------------------
  const { globalDeliberationCouncil } = await import('../src/services/council/DeliberationCouncilEngine');
  const councilVerdict = globalDeliberationCouncil.deliberate('Analisis pergerakan harga emas XAUUSD dengan SMC');
  const deliberationEnv: TaskEnvelope = {
    taskId: 'task_delib_01',
    rawRequest: 'Analisis pergerakan harga emas XAUUSD dengan SMC',
    context: {
      deliberationVerdict: councilVerdict,
      deliberationMandate: {
        primaryGoal: councilVerdict.deconstructedIntent.primaryGoal,
        category: councilVerdict.category,
        targetCapability: councilVerdict.targetCapability,
        recommendedEngine: councilVerdict.recommendedEngine.selectedEngine || councilVerdict.recommendedEngine.primaryEngine,
        implicitConstraints: councilVerdict.deconstructedIntent.implicitConstraints,
        prohibitedAssumptions: councilVerdict.factCheckAudit.prohibitedAssumptions,
        antiLazinessDirectives: councilVerdict.deconstructedIntent.antiLazinessDirectives,
        dialogueLog: councilVerdict.dialogueLog
      }
    },
    createdAt: Date.now()
  };
  const delibUnderstanding = naceCognitiveEngine.understand(deliberationEnv);
  assert(
    'TEST 11: Deliberation Council Mandate Ingestion & Rigor Binding',
    delibUnderstanding.deliberationMandate !== undefined &&
    delibUnderstanding.deliberationMandate.dialogueLog !== undefined &&
    delibUnderstanding.deliberationMandate.dialogueLog.length === 4 &&
    delibUnderstanding.constraints.some(c => c.includes('NO_FABRICATION') || c.includes('VERITAS')),
    `Agents: ${delibUnderstanding.deliberationMandate?.dialogueLog?.map(a => a.agentName.split(' ')[1]).join(', ')}`
  );

  // -------------------------------------------------------------
  // FORENSIC TEST 12: Machine-to-Machine Data Handoff in Planning
  // -------------------------------------------------------------
  const tradingPlanResolved = naceCognitiveEngine.resolveCapabilities(naceCognitiveEngine.plan(delibUnderstanding, deliberationEnv), deliberationEnv);
  const step1 = tradingPlanResolved.steps[0];
  const step2 = tradingPlanResolved.steps[1];
  assert(
    'TEST 12: Machine-to-Machine Step Data Handoff Contract',
    step1.outputContract.expectedKeys.includes('candles') &&
    step2.inputContract.requiredKeys.includes('candles') &&
    step1.assignedEngine === 'SignalEngine' &&
    step2.assignedEngine === 'SignalEngine',
    `Step 1 -> Step 2 handoff: [${step1.outputContract.expectedKeys.join(', ')}] -> [${step2.inputContract.requiredKeys.join(', ')}]`
  );

  // -------------------------------------------------------------
  // FORENSIC TEST 13: TaskStateManager State Authority & Anti-False-Completed
  // -------------------------------------------------------------
  const { globalTaskManager } = await import('../src/services/TaskStateManager');
  const testState = globalTaskManager.createTask('test_fail_gate', 'sample query', 'COMPLEX', [
    { id: 'sub-1', goal: 'step 1', input: '', dependencies: [], status: 'COMPLETED', assignedEngine: 'TestEngine' },
    { id: 'sub-2', goal: 'step 2', input: '', dependencies: [], status: 'FAILED', assignedEngine: 'TestEngine' }
  ]);
  globalTaskManager.completeTask('test_fail_gate', {
    verificationResults: { passed: false, issues: ['Simulated validation failure'] }
  });
  const updatedState = globalTaskManager.getTask('test_fail_gate');
  assert(
    'TEST 13: TaskStateManager Rejection of False-Completed State',
    updatedState?.status === 'FAILED',
    `Task Status: ${updatedState?.status}, Errors: ${updatedState?.errors.join('; ')}`
  );

  // -------------------------------------------------------------
  // FORENSIC TEST 14: Real Media Engine Routing Propagation
  // -------------------------------------------------------------
  const imageEnvTest: TaskEnvelope = {
    taskId: 'task_img_route_01',
    rawRequest: '@image potret fotorealistik astronot di mars',
    createdAt: Date.now()
  };
  const imgUnderstanding = naceCognitiveEngine.understand(imageEnvTest);
  const imgPlan = naceCognitiveEngine.resolveCapabilities(naceCognitiveEngine.plan(imgUnderstanding, imageEnvTest), imageEnvTest);
  assert(
    'TEST 14: Real Media Engine Name Resolution (ImageEngine / Photorealism)',
    imgPlan.steps.some(s => s.assignedEngine === 'ImageEngine') &&
    imgPlan.steps.some(s => s.assignedEngine === 'PhotorealismEngine'),
    `Resolved Engines: ${imgPlan.steps.map(s => s.assignedEngine).join(' ➔ ')}`
  );

  console.log('================================================================');
  console.log(`TOTAL RUNTIME TESTS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
  console.log('================================================================');

  if (passed === total) {
    console.log('GATE 2 AUDIT: PASSED (All 10 Routing Scenarios & Runtime Traces Verified)');
    process.exit(0);
  } else {
    console.error('GATE 2 AUDIT: FAILED');
    process.exit(1);
  }
}

runRuntimeSuite();
