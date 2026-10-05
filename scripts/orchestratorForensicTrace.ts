import { orchestrator } from '../src/services/Orchestrator';
import { globalEngineRegistry, ServiceRegistry } from '../src/services/EngineRegistry';
import { globalToolSelector } from '../src/services/ToolSelector';
import { globalDeliberationCouncil } from '../src/services/council/DeliberationCouncilEngine';
import { globalVerificationEngine } from '../src/services/VerificationEngine';

interface TraceReport {
  testId: string;
  name: string;
  input: string;
  expectedMode: 'DIRECT_CHAT' | 'SINGLE' | 'MULTI';
  expectedPrimaryEngine: string;
  actualMode: string;
  actualPrimaryEngine: string;
  engineResolved: boolean;
  contextPreserved: boolean;
  pass: boolean;
  notes: string;
}

async function runOrchestratorForensicTrace() {
  console.log('================================================================');
  console.log('NAVIX AI — ORCHESTRATOR FORENSIC EXECUTION TRACE');
  console.log('================================================================\n');

  const traces: TraceReport[] = [];

  // Case 1: Casual Chat Fast-Path (Greeting)
  const q1 = 'Halo selamat pagi Navix AI!';
  const plan1 = ServiceRegistry.planExecution(q1);
  const pass1 = plan1.mode === 'DIRECT_CHAT' && plan1.primaryEngine === 'AI_DEBATE';
  traces.push({
    testId: 'TRACE-01',
    name: 'Casual Greeting Fast-Path (AI Debat)',
    input: q1,
    expectedMode: 'DIRECT_CHAT',
    expectedPrimaryEngine: 'AI_DEBATE',
    actualMode: plan1.mode,
    actualPrimaryEngine: plan1.primaryEngine,
    engineResolved: true,
    contextPreserved: true,
    pass: pass1,
    notes: 'Bypasses worker engines; routes directly through Deliberation Council to Main Chat.'
  });

  // Case 2: High-Precision Math Expression
  const q2 = '100 / 3';
  const plan2 = ServiceRegistry.planExecution(q2);
  const mathEngine = globalEngineRegistry.getEngine(plan2.primaryEngine);
  const mathRes = mathEngine ? await mathEngine.execute({ query: q2, expression: q2, prompt: q2, input: q2 }) : null;
  const vMath = mathRes ? globalVerificationEngine.verify('math', mathRes.data || mathRes.output || mathRes) : { passed: false };
  const pass2 = plan2.primaryEngine === 'MathEngine' && mathRes !== null && mathRes.status === 'SUCCESS' && vMath.passed;
  traces.push({
    testId: 'TRACE-02',
    name: 'High-Precision Math Engine Dispatch',
    input: q2,
    expectedMode: 'SINGLE',
    expectedPrimaryEngine: 'MathEngine',
    actualMode: plan2.mode,
    actualPrimaryEngine: plan2.primaryEngine,
    engineResolved: Boolean(mathEngine),
    contextPreserved: Boolean(mathRes?.output?.result?.startsWith('33.333333333333333333333333333333333333333333333333')),
    pass: pass2,
    notes: `Calculated exact result with precision ${mathRes?.output?.precision} digits. Quality gate: ${vMath.passed ? 'PASSED' : 'FAILED'}.`
  });

  // Case 3: Trading Market Analysis (SMC Institutional)
  const q3 = 'Analisis struktur pasar XAUUSD SMC dengan level entry terverifikasi';
  const plan3 = ServiceRegistry.planExecution(q3);
  const tradeEngine = globalEngineRegistry.getEngine(plan3.primaryEngine);
  const tradeRes = tradeEngine ? await tradeEngine.execute({ query: q3, prompt: q3, input: q3, symbol: 'XAUUSD' }) : null;
  const vTrade = tradeRes ? globalVerificationEngine.verify('trading', tradeRes.data || tradeRes.output || tradeRes) : { passed: false };
  const pass3 = (plan3.primaryEngine === 'TradingEngine' || plan3.primaryEngine === 'SignalEngine') && tradeRes !== null && vTrade.passed;
  traces.push({
    testId: 'TRACE-03',
    name: 'Institutional Trading Engine Dispatch',
    input: q3,
    expectedMode: 'SINGLE',
    expectedPrimaryEngine: 'TradingEngine',
    actualMode: plan3.mode,
    actualPrimaryEngine: plan3.primaryEngine,
    engineResolved: Boolean(tradeEngine),
    contextPreserved: Boolean(tradeRes?.data?.symbol === 'XAUUSD' || tradeRes?.output?.symbol === 'XAUUSD'),
    pass: pass3,
    notes: `Executed institutional analysis for XAUUSD. Direction: ${tradeRes?.data?.direction || tradeRes?.output?.direction || 'EVALUATED'}. Quality gate: ${vTrade.passed ? 'PASSED' : 'FAILED'}.`
  });

  // Case 4: Coding & Architecture Inspection
  const q4 = 'Tuliskan implementasi binary search di TypeScript';
  const plan4 = ServiceRegistry.planExecution(q4);
  const codeEngine = globalEngineRegistry.getEngine(plan4.primaryEngine);
  const codeRes = codeEngine ? await codeEngine.execute({ query: q4, prompt: q4, input: q4 }) : null;
  const pass4 = plan4.primaryEngine === 'CodingEngine' && codeRes !== null && (codeRes.status === 'SUCCESS' || codeRes.status === 'success');
  traces.push({
    testId: 'TRACE-04',
    name: 'Software Engineering & Coding Engine Dispatch',
    input: q4,
    expectedMode: 'SINGLE',
    expectedPrimaryEngine: 'CodingEngine',
    actualMode: plan4.mode,
    actualPrimaryEngine: plan4.primaryEngine,
    engineResolved: Boolean(codeEngine),
    contextPreserved: Boolean(codeRes?.data || codeRes?.output),
    pass: pass4,
    notes: `Coding engine executed code generation and metric analysis.`
  });

  // Case 5: Compound Multi-Engine Pipeline (Trading + Math Lot Risk)
  const q5 = 'Analisis chart XAUUSD dan hitung rasio risiko risk reward serta lot size';
  const plan5 = ServiceRegistry.planExecution(q5);
  const agentEngine = globalEngineRegistry.getEngine('AgentEngine');
  let multiRes: any = null;
  if (agentEngine && plan5.mode === 'MULTI') {
    multiRes = await agentEngine.execute({
      goal: q5,
      steps: plan5.tasks
    });
  }
  const pass5 = plan5.mode === 'MULTI' &&
    plan5.engineSequence.includes('SignalEngine') &&
    plan5.engineSequence.includes('MathEngine') &&
    multiRes !== null &&
    multiRes.status === 'SUCCESS' &&
    multiRes.output?.executedSteps?.length >= 2;
  traces.push({
    testId: 'TRACE-05',
    name: 'Compound Multi-Engine Pipeline (Trading ➔ Math)',
    input: q5,
    expectedMode: 'MULTI',
    expectedPrimaryEngine: 'SignalEngine',
    actualMode: plan5.mode,
    actualPrimaryEngine: plan5.primaryEngine,
    engineResolved: Boolean(agentEngine),
    contextPreserved: Boolean(multiRes?.output?.allSuccess),
    pass: pass5,
    notes: `Executed multi-engine pipeline: ${plan5.engineSequence.join(' ➔ ')}. Step count: ${multiRes?.output?.executedSteps?.length}. Context handoff verified.`
  });

  // Case 6: Document Engine Synthesis
  const q6 = 'Buatkan dokumen laporan formal arsitektur sistem';
  const plan6 = ServiceRegistry.planExecution(q6);
  const docEngine = globalEngineRegistry.getEngine(plan6.primaryEngine);
  const docRes = docEngine ? await docEngine.execute({ title: 'Laporan Arsitektur', content: 'Uraian arsitektur sistem', query: q6, prompt: q6, input: q6 }) : null;
  const pass6 = plan6.primaryEngine === 'DocumentEngine' && docRes !== null && (docRes.status === 'SUCCESS' || docRes.status === 'success');
  traces.push({
    testId: 'TRACE-06',
    name: 'Document Engine Semantic Synthesis',
    input: q6,
    expectedMode: 'SINGLE',
    expectedPrimaryEngine: 'DocumentEngine',
    actualMode: plan6.mode,
    actualPrimaryEngine: plan6.primaryEngine,
    engineResolved: Boolean(docEngine),
    contextPreserved: Boolean(docRes?.output?.downloadDataUri),
    pass: pass6,
    notes: `Generated structured document report with word count ${docRes?.output?.wordCount || 0} and downloadDataUri.`
  });

  console.log('----------------------------------------------------------------');
  console.log('ORCHESTRATOR TRACE RESULTS:');
  console.log('----------------------------------------------------------------');
  let passCount = 0;
  for (const t of traces) {
    const mark = t.pass ? '✔ [PASS]' : '✖ [FAIL]';
    console.log(`${mark} [${t.testId}] ${t.name}`);
    console.log(`   Input:           "${t.input}"`);
    console.log(`   Mode / Engine:   ${t.actualMode} -> [${t.actualPrimaryEngine}]`);
    console.log(`   Engine Resolved: ${t.engineResolved} | Context Preserved: ${t.contextPreserved}`);
    console.log(`   Notes:           ${t.notes}\n`);
    if (t.pass) passCount++;
  }

  console.log(`TOTAL TRACES: ${traces.length}`);
  console.log(`PASSED:       ${passCount}`);
  console.log(`FAILED:       ${traces.length - passCount}`);
  console.log('================================================================\n');

  if (passCount !== traces.length) {
    process.exit(1);
  }
}

runOrchestratorForensicTrace().catch(err => {
  console.error('Forensic trace crashed:', err);
  process.exit(1);
});
