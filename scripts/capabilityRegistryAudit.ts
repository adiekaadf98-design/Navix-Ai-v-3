import { globalEngineRegistry, ServiceRegistry } from '../src/services/EngineRegistry';
import { globalToolSelector } from '../src/services/ToolSelector';
import { CapabilityRegistry } from '../src/services/multimedia/CapabilityRegistry';

interface CapabilityAuditEntry {
  capability: string;
  category: string;
  mappedEngine: string;
  registryResolved: boolean;
  liveExecutable: boolean;
  status: 'VERIFIED ACTIVE' | 'DISCONNECTED' | 'NOT VERIFIED' | 'FAILED';
  evidence: string;
}

async function runCapabilityRegistryAudit() {
  console.log('================================================================');
  console.log('NAVIX AI — ACTIVE CAPABILITY REGISTRY FORENSIC AUDIT');
  console.log('================================================================\n');

  const capabilitiesToAudit = [
    // Core Domain Capabilities
    { capability: 'math', category: 'Numerical & Mathematical', samplePayload: { query: '100 / 3', expression: '100 / 3' } },
    { capability: 'arithmetic', category: 'Numerical & Mathematical', samplePayload: { query: '50 * 2', expression: '50 * 2' } },
    { capability: 'single_integer', category: 'Numerical & Mathematical', samplePayload: { query: '7023', integer: '7023' } },
    { capability: 'trading', category: 'Financial Markets', samplePayload: { query: 'XAUUSD SMC', symbol: 'XAUUSD' } },
    { capability: 'market', category: 'Financial Markets', samplePayload: { query: 'BTCUSDT', symbol: 'BTCUSDT' } },
    { capability: 'crypto', category: 'Financial Markets', samplePayload: { query: 'SOLUSDT', symbol: 'SOLUSDT' } },
    { capability: 'stock', category: 'Financial Markets', samplePayload: { query: 'BBCA', symbol: 'BBCA.JK' } },
    { capability: 'macro', category: 'Financial Fundamental', samplePayload: { query: 'Forex Factory macro calendar' } },
    { capability: 'code', category: 'Software Engineering', samplePayload: { query: 'function test() { return 1; }', code: 'function test() { return 1; }' } },
    { capability: 'coding', category: 'Software Engineering', samplePayload: { query: 'TypeScript binary search' } },
    { capability: 'github_opensource', category: 'Open-Source Ecosystem', samplePayload: { query: 'ccxt trading library' } },
    { capability: 'document', category: 'Document Intelligence', samplePayload: { title: 'Audit Test', content: 'Semantic document content' } },
    { capability: 'pdf', category: 'Document Intelligence', samplePayload: { title: 'PDF Test', content: 'PDF semantic document' } },
    { capability: 'data_analysis', category: 'Data & Statistics', samplePayload: { data: [10, 20, 30, 40] } },
    { capability: 'web_research', category: 'Web & Deep Search', samplePayload: { query: 'Navix AI architecture' } },
    { capability: 'search', category: 'Web & Deep Search', samplePayload: { query: 'Teknologi AI' } },
    { capability: 'vision', category: 'Multimodal Vision', samplePayload: { prompt: 'Chart analysis', image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' } },
    { capability: 'ocr', category: 'Multimodal Vision', samplePayload: { prompt: 'Extract text', image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' } },
    { capability: 'image', category: 'Media Synthesis', samplePayload: { prompt: 'Cinematic landscape' } },
    { capability: 'image_generation', category: 'Media Synthesis', samplePayload: { prompt: 'Studio portrait' } },
    { capability: 'video', category: 'Media Synthesis', samplePayload: { prompt: 'Camera zoom in scene' } },
    { capability: 'audio', category: 'Audio Synthesis', samplePayload: { prompt: 'Acoustic piano melody' } },
    { capability: 'security', category: 'Cybersecurity Shield', samplePayload: { payload: 'https://navix.ai' } },
    { capability: 'agent', category: 'Autonomous Agents', samplePayload: { goal: 'Audit task sequence', steps: [{ engine: 'MathEngine', payload: { expression: '2+2' } }] } },
    { capability: 'reasoning', category: 'Adaptive Reasoning', samplePayload: { query: 'Analisis kompleks' } },
    { capability: 'memory', category: 'Cognitive Memory', samplePayload: { query: 'Preferensi trading' } },
    { capability: 'rag', category: 'Vector Search', samplePayload: { query: 'Arsitektur Navix' } },
    { capability: 'mcp', category: 'MCP Tool Router', samplePayload: { toolName: 'echo', arguments: { msg: 'ping' } } },
    { capability: 'pilgun', category: 'Interactive Learning', samplePayload: { query: 'Buat kuis pilihan ganda trading' } },
    { capability: 'scientific_research', category: 'Science & Lab', samplePayload: { query: 'Hipotesis partikel', topic: 'Fisika' } }
  ];

  const auditResults: CapabilityAuditEntry[] = [];

  for (const item of capabilitiesToAudit) {
    const pilgun = globalToolSelector.selectOptimalEngine(item.capability, { query: 'audit query' });
    const directLookup = globalEngineRegistry.getEngine(item.capability);
    const targetEngineName = pilgun.selectedEngine || directLookup?.name || 'DefaultEngine';
    const engine = globalEngineRegistry.getEngine(targetEngineName);

    let liveExecutable = false;
    let evidence = '';
    let status: 'VERIFIED ACTIVE' | 'DISCONNECTED' | 'NOT VERIFIED' | 'FAILED' = 'NOT VERIFIED';

    if (engine) {
      try {
        const res = await engine.execute(item.samplePayload);
        const isSuccess = (res.status || '').toUpperCase() === 'SUCCESS' || res.status === 'success' || Boolean(res.data) || Boolean(res.output);
        if (isSuccess) {
          liveExecutable = true;
          status = 'VERIFIED ACTIVE';
          evidence = `Engine [${targetEngineName}] executed successfully. Output status: ${res.status || 'SUCCESS'}`;
        } else {
          status = 'FAILED';
          evidence = `Engine returned error: ${res.error || res.message}`;
        }
      } catch (err: any) {
        status = 'FAILED';
        evidence = `Execution exception: ${err.message}`;
      }
    } else {
      status = 'DISCONNECTED';
      evidence = `Engine [${targetEngineName}] could not be resolved from registry.`;
    }

    auditResults.push({
      capability: item.capability,
      category: item.category,
      mappedEngine: targetEngineName,
      registryResolved: Boolean(engine),
      liveExecutable,
      status,
      evidence
    });
  }

  console.log('----------------------------------------------------------------');
  console.log('CAPABILITY REGISTRY AUDIT MATRIX:');
  console.log('----------------------------------------------------------------');
  let activeCount = 0;
  let disconnectedCount = 0;
  let failedCount = 0;

  for (const a of auditResults) {
    const symbol = a.status === 'VERIFIED ACTIVE' ? '✔ [VERIFIED ACTIVE]' : `✖ [${a.status}]`;
    console.log(`${symbol} ${a.capability.padEnd(22)} [${a.category.padEnd(24)}] ➔ ${a.mappedEngine}`);
    console.log(`   Evidence: ${a.evidence}`);
    if (a.status === 'VERIFIED ACTIVE') activeCount++;
    if (a.status === 'DISCONNECTED') disconnectedCount++;
    if (a.status === 'FAILED') failedCount++;
  }

  console.log('\n================================================================');
  console.log(`TOTAL CAPABILITIES AUDITED: ${auditResults.length}`);
  console.log(`VERIFIED ACTIVE:           ${activeCount}`);
  console.log(`DISCONNECTED:              ${disconnectedCount}`);
  console.log(`FAILED:                    ${failedCount}`);
  console.log('================================================================\n');

  if (activeCount !== auditResults.length) {
    process.exit(1);
  }
}

runCapabilityRegistryAudit().catch(e => {
  console.error('Audit crashed:', e);
  process.exit(1);
});
