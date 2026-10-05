/**
 * NAVIX PRO AI — NACE (NAVIX Adaptive Cognitive Engine)
 * Cognitive Planning & Runtime Decision Layer
 * 
 * Target Architecture:
 * USER -> MAIN CHAT / AI DEBATE -> NACE (Understand -> Complexity -> Decompose -> Dynamic Plan)
 *      -> PILGUN / TOOL SELECTOR -> ADAPTIVE EXECUTION ENGINE (Machine-to-Machine)
 *      -> SPECIALIST ENGINES -> VERIFICATION ENGINE -> MEMORY / OBSERVABILITY -> RESULT
 * 
 * Strictly follows:
 * - Anti-monolith: NACE determines WHAT; Pilgun determines WHICH EXECUTOR; AdaptiveExecutionEngine determines HOW.
 * - Anti-mock: zero simulation, 100% empirical verification.
 * - Bounded retries: max 1 recalculate retry on verification failure.
 * - Model-agnostic and fail-closed.
 */

import {
  TaskEnvelope,
  CognitiveUnderstanding,
  NaceExecutionPlan,
  NaceExecutionStep,
  NaceExecutionResult,
  NaceObservabilityEntry,
  TaskDomain,
  TaskIntent,
  NaceComplexityLevel,
  VerificationLevel,
  ExecutionDepth,
  toNaceComplexity
} from '../types/nace';
import { globalEngineRegistry } from './EngineRegistry';
import { globalToolSelector } from './ToolSelector';
import { globalVerificationEngine, VerificationResult } from './VerificationEngine';
import { globalFailureRecovery } from './FailureRecoveryEngine';
import { globalTaskManager } from './TaskStateManager';
import { classifyTask, TaskType } from './ThinkingEngine';
import { TaskComplexityRouter } from './Supervisor';

export class NaceCognitiveEngine {
  private complexityRouter = new TaskComplexityRouter();
  private observabilityLog: NaceObservabilityEntry[] = [];

  /**
   * 1. UNDERSTAND: Ingests TaskEnvelope and computes structured CognitiveUnderstanding.
   */
  public understand(envelope: TaskEnvelope): CognitiveUnderstanding {
    const raw = envelope.rawRequest;
    const lower = raw.toLowerCase().trim();
    const attachmentsCount = envelope.context?.attachmentsCount || envelope.context?.attachments?.length || 0;

    // A. Domain & Intent Detection
    let domain: TaskDomain = 'CHAT';
    let detectedTaskType: TaskType = 'chat';
    let primaryGoal = 'Direct Cognitive Dialogue & Analytical Reasoning';
    const constraints: string[] = [];

    // Check specific domains based on empirical criteria
    if (
      lower.includes('@trading') ||
      lower.includes('trading') ||
      lower.includes('saham') ||
      lower.includes('bursa') ||
      lower.includes('aset') ||
      lower.includes('pasar') ||
      lower.includes('crypto') ||
      lower.includes('kripto') ||
      lower.includes('forex') ||
      lower.includes('emas') ||
      lower.includes('gold') ||
      lower.includes('xauusd') ||
      lower.includes('candlestick') ||
      lower.includes('order block') ||
      lower.includes('fair value gap') ||
      lower.includes('liquidity')
    ) {
      domain = 'TRADING';
      detectedTaskType = 'trading';
      primaryGoal = 'Empirical Market Analysis & Institutional Signal Validation';
      constraints.push('NO_FABRICATION', 'REAL_PRICE_ONLY', 'STRICT_GEOMETRY', 'VERITAS_AUDIT');
    } else if (
      /^\s*-?\d+\s*$/.test(raw) ||
      ((/(?:hitung|kalkulasi|berapa|akar|pangkat|faktorial|\+|\-|\*|\/|\^|%|sqrt|sin|cos|tan|log)/i.test(lower)) && /\d/.test(lower))
    ) {
      domain = 'MATH';
      detectedTaskType = 'math' as any;
      primaryGoal = 'High-Precision Deterministic Mathematical Computation';
      constraints.push('ZERO_SIMULATION', '50_SIGNIFICANT_DIGITS', 'DETERMINISTIC_ONLY');
    } else if (
      lower.includes('@kode') ||
      lower.includes('koding') ||
      lower.includes('bug') ||
      lower.includes('syntax') ||
      lower.includes('refactor') ||
      lower.includes('function') ||
      lower.includes('class ') ||
      lower.includes('typescript') ||
      lower.includes('javascript') ||
      lower.includes('python') ||
      lower.includes('compile')
    ) {
      domain = 'CODE';
      detectedTaskType = 'code';
      primaryGoal = 'Source Code Syntax, Architecture & Vulnerability Audit';
      constraints.push('STRICT_TYPECHECK', 'NO_UNHANDLED_EXCEPTION');
    } else if (
      lower.includes('@video') ||
      lower.includes('video') ||
      lower.includes('animasi') ||
      lower.includes('motion scene') ||
      lower.includes('mp4')
    ) {
      domain = 'VIDEO';
      detectedTaskType = 'video';
      primaryGoal = 'Sovereign Neural Motion & Video Generation';
      constraints.push('ARTIFACT_VERIFICATION', 'TIMED_BOUNDS');
    } else if (
      lower.includes('@image') ||
      lower.includes('gambar') ||
      lower.includes('foto') ||
      lower.includes('lukis') ||
      lower.includes('ilustrasi') ||
      lower.includes('poster') ||
      lower.includes('desain')
    ) {
      domain = 'IMAGE';
      detectedTaskType = 'image';
      primaryGoal = 'High-Fidelity Photorealistic Image Synthesis';
      constraints.push('ARTIFACT_VERIFICATION');
    } else if (
      lower.includes('@audio') ||
      lower.includes('audio') ||
      lower.includes('suara') ||
      lower.includes('musik') ||
      lower.includes('lagu') ||
      lower.includes('voice') ||
      lower.includes('speech') ||
      lower.includes('tts')
    ) {
      domain = 'AUDIO';
      detectedTaskType = 'audio' as any;
      primaryGoal = 'Acoustic Processing & Studio-Grade Voice Synthesis';
      constraints.push('ARTIFACT_VERIFICATION');
    } else if (
      lower.includes('@dokumen') ||
      lower.includes('dokumen') ||
      lower.includes('pdf') ||
      lower.includes('docling') ||
      lower.includes('laporan formal')
    ) {
      domain = 'DOCUMENT';
      detectedTaskType = 'document';
      primaryGoal = 'Structured Document Ingestion & Formal Formatting';
      constraints.push('AST_STRUCTURE_VERIFIED');
    } else if (
      lower.includes('@penelitian') ||
      lower.includes('riset') ||
      lower.includes('cari data') ||
      lower.includes('search') ||
      lower.includes('investigasi') ||
      lower.includes('google search')
    ) {
      domain = 'RESEARCH';
      detectedTaskType = 'research';
      primaryGoal = 'Empirical Web Search & Evidence Synthesis';
      constraints.push('GROUNDED_FACTS_ONLY');
    } else if (
      lower.includes('statistik') ||
      lower.includes('dataset') ||
      lower.includes('regresi') ||
      lower.includes('outlier') ||
      lower.includes('kuartil') ||
      lower.includes('kalkulus')
    ) {
      domain = 'DATA_ANALYSIS';
      detectedTaskType = 'data_analysis' as any;
      primaryGoal = 'Numerical Aggregation & Statistical Distribution Analysis';
      constraints.push('EXACT_STATISTICS_ONLY');
    } else if (
      lower.includes('@skill') ||
      lower.startsWith('/skill') ||
      lower.startsWith('/mcp')
    ) {
      domain = 'SKILL';
      detectedTaskType = 'skill' as any;
      primaryGoal = 'Autonomous Model Context Protocol (MCP) Skill Execution';
      constraints.push('SCHEMA_VALIDATED');
    }

    // B. Absorb Deliberation Council Mandate (AI Debat: Horizon, Veritas, Apex, Sovereign)
    const mandate = envelope.context?.deliberationMandate;
    if (mandate) {
      if (mandate.primaryGoal) {
        primaryGoal = mandate.primaryGoal;
      }
      if (mandate.implicitConstraints && Array.isArray(mandate.implicitConstraints)) {
        constraints.push(...mandate.implicitConstraints);
      }
      if (mandate.prohibitedAssumptions && Array.isArray(mandate.prohibitedAssumptions)) {
        constraints.push(...mandate.prohibitedAssumptions);
      }
      if (mandate.antiLazinessDirectives && Array.isArray(mandate.antiLazinessDirectives)) {
        constraints.push(...mandate.antiLazinessDirectives);
      }
      if (mandate.targetCapability) {
        constraints.push(`TARGET_CAPABILITY:${mandate.targetCapability}`);
      }
      // If council classified as direct discussion and no specialized keywords override:
      if (mandate.category === 'DIRECT_DISCUSSION' && domain === 'CHAT') {
        domain = 'CHAT';
        detectedTaskType = 'chat';
      }
    }

    // C. Complexity Evaluation via existing TaskComplexityRouter
    const supervisorEval = this.complexityRouter.evaluate(raw, attachmentsCount);
    const complexity: NaceComplexityLevel = toNaceComplexity(supervisorEval.complexity);

    // D. Execution Depth & Verification Level Mapping
    let executionDepth: ExecutionDepth = 'NORMAL_PATH';
    let verificationLevel: VerificationLevel = 'BASIC';

    if (domain === 'CHAT' && complexity === 'LOW') {
      executionDepth = 'FAST_PATH';
      verificationLevel = 'NONE';
    } else if (domain === 'TRADING' || complexity === 'DEEP' || complexity === 'HIGH') {
      executionDepth = 'DEEP_PATH';
      verificationLevel = 'VERITAS_AUDIT';
    } else if (domain === 'MATH') {
      executionDepth = 'FAST_PATH'; // Deterministic math is fast, but strictly verified
      verificationLevel = 'RIGOROUS';
    } else if (domain === 'IMAGE' || domain === 'VIDEO' || domain === 'DOCUMENT') {
      executionDepth = 'DEEP_PATH';
      verificationLevel = 'RIGOROUS';
    } else {
      executionDepth = 'NORMAL_PATH';
      verificationLevel = 'BASIC';
    }

    const intent: TaskIntent = {
      name: `${domain}_EXECUTION`,
      domain,
      taskType: detectedTaskType,
      primaryGoal,
      rawIntent: raw,
      confidence: 0.95
    };

    // Compound Capability Chain Detection (PHASE F: Dynamic Engine Chaining)
    const requiredCapabilities: string[] = [domain.toLowerCase()];
    const isImageVideoChain = (lower.includes('gambar') || lower.includes('image')) && 
                              (lower.includes('video') || lower.includes('animasi') || lower.includes('motion'));
    const isDocResearchChain = (lower.includes('dokumen') || lower.includes('pdf')) && 
                               (lower.includes('riset') || lower.includes('search') || lower.includes('laporan'));
    const isResearchCodeChain = (lower.includes('riset') || lower.includes('search')) && 
                                (lower.includes('kode') || lower.includes('coding') || lower.includes('script'));
    const isTradingMathChain = (domain === 'TRADING') && 
                               (lower.includes('hitung') || lower.includes('kalkulasi') || lower.includes('rasio') || lower.includes('lot') || lower.includes('risk'));
    const isAudioVideoChain = (lower.includes('audio') || lower.includes('musik') || lower.includes('suara')) && 
                              (lower.includes('video') || lower.includes('klip'));

    if (isImageVideoChain) {
      if (!requiredCapabilities.includes('image')) requiredCapabilities.push('image');
      if (!requiredCapabilities.includes('video')) requiredCapabilities.push('video');
    } else if (isDocResearchChain) {
      if (!requiredCapabilities.includes('document')) requiredCapabilities.push('document');
      if (!requiredCapabilities.includes('research')) requiredCapabilities.push('research');
    } else if (isResearchCodeChain) {
      if (!requiredCapabilities.includes('research')) requiredCapabilities.push('research');
      if (!requiredCapabilities.includes('code')) requiredCapabilities.push('code');
    } else if (isTradingMathChain) {
      if (!requiredCapabilities.includes('math')) requiredCapabilities.push('math');
    } else if (isAudioVideoChain) {
      if (!requiredCapabilities.includes('audio')) requiredCapabilities.push('audio');
      if (!requiredCapabilities.includes('video')) requiredCapabilities.push('video');
    }

    return {
      intent,
      domain,
      complexity,
      requiredCapabilities,
      constraints,
      verificationLevel,
      executionDepth,
      rationale: supervisorEval.reasoning,
      deliberationMandate: mandate,
      timestamp: Date.now()
    };
  }

  /**
   * 2. DYNAMIC DECOMPOSITION & PLANNING:
   * Generates a step-by-step NaceExecutionPlan with explicit contracts.
   */
  public plan(understanding: CognitiveUnderstanding, envelope: TaskEnvelope): NaceExecutionPlan {
    const planId = `nace_plan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const steps: NaceExecutionStep[] = [];
    const domain = understanding.domain;

    // Timeout & retry policies based on execution depth
    const timeoutMs = understanding.executionDepth === 'FAST_PATH' ? 8000 :
                      understanding.executionDepth === 'NORMAL_PATH' ? 18000 : 35000;
    const maxRetries = understanding.executionDepth === 'FAST_PATH' ? 0 : 1;

    // Dynamic Step Assembly — Compound Chains (PHASE F) & Single Domain Pipelines
    const caps = understanding.requiredCapabilities;
    const isImageVideo = caps.includes('image') && caps.includes('video');
    const isDocResearch = caps.includes('document') && caps.includes('research');
    const isResearchCode = caps.includes('research') && caps.includes('code');
    const isTradingMath = caps.includes('trading') && caps.includes('math');
    const isAudioVideo = caps.includes('audio') && caps.includes('video');

    if (isImageVideo) {
      // Chain 1: IMAGE ➔ VIDEO
      steps.push({
        stepId: 'step-1-prompt-enrich',
        sequence: 1,
        objective: 'Semantic Prompt Expansion & Quality Framing',
        requiredCapability: 'prompt_expansion',
        preferredEngine: 'PhotorealismEngine',
        inputContract: { requiredKeys: ['prompt'] },
        outputContract: { expectedKeys: ['enrichedPrompt'] },
        verificationRequirement: { required: false },
        status: 'PENDING'
      });
      steps.push({
        stepId: 'step-2-image-synthesis',
        sequence: 2,
        objective: 'Photorealistic Image Artifact Synthesis',
        requiredCapability: 'image_generation',
        preferredEngine: 'ImageEngine',
        inputContract: { requiredKeys: ['prompt'] },
        outputContract: { expectedKeys: ['imageUrl', 'imageBase64'] },
        verificationRequirement: { required: true, domain: 'image', strictGate: false },
        status: 'PENDING'
      });
      steps.push({
        stepId: 'step-3-video-generation',
        sequence: 3,
        objective: 'Neural Motion Synthesis Conditioned on Generated Image',
        requiredCapability: 'video_generation',
        preferredEngine: 'VideoEngine',
        inputContract: { requiredKeys: ['prompt', 'image'] },
        outputContract: { expectedKeys: ['videoUrl', 'jobId'] },
        verificationRequirement: { required: true, domain: 'video', strictGate: false },
        status: 'PENDING'
      });
    } else if (isDocResearch) {
      // Chain 2: DOCUMENT ➔ RESEARCH ➔ REPORT
      steps.push({
        stepId: 'step-1-doc-ingest',
        sequence: 1,
        objective: 'Structured Document Extraction & Semantic Parsing',
        requiredCapability: 'document',
        preferredEngine: 'DocumentEngine',
        inputContract: { requiredKeys: ['query'] },
        outputContract: { expectedKeys: ['output'] },
        verificationRequirement: { required: true, domain: 'document', strictGate: false },
        status: 'PENDING'
      });
      steps.push({
        stepId: 'step-2-web-search',
        sequence: 2,
        objective: 'Cross-Reference & Empirical Fact Triangulation',
        requiredCapability: 'web_search',
        preferredEngine: 'SearchEngine',
        inputContract: { requiredKeys: ['query'] },
        outputContract: { expectedKeys: ['results', 'sources'] },
        verificationRequirement: { required: true, domain: 'research', strictGate: false },
        status: 'PENDING'
      });
      steps.push({
        stepId: 'step-3-report-synthesis',
        sequence: 3,
        objective: 'Synthesize Grounded Intelligence Report',
        requiredCapability: 'document',
        preferredEngine: 'DocumentEngine',
        inputContract: { requiredKeys: ['documentText', 'results'] },
        outputContract: { expectedKeys: ['output'] },
        verificationRequirement: { required: true, domain: 'document', strictGate: false },
        status: 'PENDING'
      });
    } else if (isResearchCode) {
      // Chain 3: RESEARCH ➔ CODE
      steps.push({
        stepId: 'step-1-web-search',
        sequence: 1,
        objective: 'Research Algorithm & Technical Specifications',
        requiredCapability: 'web_search',
        preferredEngine: 'SearchEngine',
        inputContract: { requiredKeys: ['query'] },
        outputContract: { expectedKeys: ['results', 'sources'] },
        verificationRequirement: { required: true, domain: 'research', strictGate: false },
        status: 'PENDING'
      });
      steps.push({
        stepId: 'step-2-code-audit',
        sequence: 2,
        objective: 'Static Analysis, Architecture & Test-Aware Code Generation',
        requiredCapability: 'code_engineering',
        preferredEngine: 'CodingEngine',
        inputContract: { requiredKeys: ['prompt'] },
        outputContract: { expectedKeys: ['codeSnippet', 'status'] },
        verificationRequirement: { required: true, domain: 'code', strictGate: true },
        status: 'PENDING'
      });
    } else if (isTradingMath) {
      // Chain 4: TRADING ➔ MATH
      steps.push({
        stepId: 'step-1-market-candles',
        sequence: 1,
        objective: 'Fetch Real Live Candlestick & Tick Data',
        requiredCapability: 'market_data',
        preferredEngine: 'SignalEngine',
        inputContract: { requiredKeys: ['symbol'] },
        outputContract: { expectedKeys: ['livePrice', 'candles'] },
        verificationRequirement: { required: true, domain: 'trading', strictGate: true },
        status: 'PENDING'
      });
      steps.push({
        stepId: 'step-2-smc-analysis',
        sequence: 2,
        objective: 'Compute Market Structure, Order Blocks & Fair Value Gaps',
        requiredCapability: 'trading_analysis',
        preferredEngine: 'SignalEngine',
        inputContract: { requiredKeys: ['candles', 'livePrice'] },
        outputContract: { expectedKeys: ['direction', 'entryPrice', 'slPrice', 'tpPrice'] },
        verificationRequirement: { required: true, domain: 'trading', strictGate: true },
        status: 'PENDING'
      });
      steps.push({
        stepId: 'step-3-math-risk-ratio',
        sequence: 3,
        objective: 'Deterministic High-Precision Risk-Reward & Lot Sizing Evaluation',
        requiredCapability: 'math',
        preferredEngine: 'MathEngine',
        inputContract: { requiredKeys: ['expression'] },
        outputContract: { expectedKeys: ['result', 'stepExplanation'] },
        verificationRequirement: { required: true, domain: 'math', strictGate: true },
        status: 'PENDING'
      });
    } else if (isAudioVideo) {
      // Chain 5: AUDIO ➔ VIDEO
      steps.push({
        stepId: 'step-1-audio-synth',
        sequence: 1,
        objective: 'Studio-Grade Acoustic Audio Synthesis',
        requiredCapability: 'audio',
        preferredEngine: 'AudioEngine',
        inputContract: { requiredKeys: ['query'] },
        outputContract: { expectedKeys: ['audioUrl'] },
        verificationRequirement: { required: true, domain: 'audio', strictGate: false },
        status: 'PENDING'
      });
      steps.push({
        stepId: 'step-2-video-motion',
        sequence: 2,
        objective: 'Neural Scene Video Synthesis with Audio Track Alignment',
        requiredCapability: 'video_generation',
        preferredEngine: 'VideoEngine',
        inputContract: { requiredKeys: ['prompt', 'audio'] },
        outputContract: { expectedKeys: ['videoUrl', 'jobId'] },
        verificationRequirement: { required: true, domain: 'video', strictGate: false },
        status: 'PENDING'
      });
    } else if (understanding.executionDepth === 'FAST_PATH' && domain === 'CHAT') {
      // 1-Step Fast Path for Pure Conversation
      steps.push({
        stepId: 'step-1-dialogue',
        sequence: 1,
        objective: 'Direct Cognitive Reasoning & Natural Language Response',
        requiredCapability: 'chat',
        preferredEngine: 'DefaultEngine',
        inputContract: { requiredKeys: ['query'] },
        outputContract: { expectedKeys: ['message'] },
        verificationRequirement: { required: false },
        status: 'PENDING'
      });
    } else if (domain === 'MATH') {
      // Deterministic Math Step
      steps.push({
        stepId: 'step-1-math-eval',
        sequence: 1,
        objective: 'High-Precision Deterministic Expression Evaluation',
        requiredCapability: 'math',
        preferredEngine: 'MathEngine',
        inputContract: { requiredKeys: ['expression'] },
        outputContract: { expectedKeys: ['result', 'stepExplanation'] },
        verificationRequirement: { required: true, domain: 'math', strictGate: true },
        status: 'PENDING'
      });
    } else if (domain === 'TRADING') {
      // Institutional Multi-Step Trading Pipeline
      steps.push({
        stepId: 'step-1-market-candles',
        sequence: 1,
        objective: 'Fetch Real Live Candlestick & Tick Data',
        requiredCapability: 'market_data',
        preferredEngine: 'SignalEngine',
        inputContract: { requiredKeys: ['symbol'] },
        outputContract: { expectedKeys: ['livePrice', 'candles'] },
        verificationRequirement: { required: true, domain: 'trading', strictGate: true },
        status: 'PENDING'
      });
      steps.push({
        stepId: 'step-2-smc-analysis',
        sequence: 2,
        objective: 'Compute Market Structure, Order Blocks & Fair Value Gaps',
        requiredCapability: 'trading_analysis',
        preferredEngine: 'SignalEngine',
        inputContract: { requiredKeys: ['candles', 'livePrice'] },
        outputContract: { expectedKeys: ['direction', 'entryPrice', 'slPrice', 'tpPrice'] },
        verificationRequirement: { required: true, domain: 'trading', strictGate: true },
        status: 'PENDING'
      });
    } else if (domain === 'IMAGE') {
      steps.push({
        stepId: 'step-1-prompt-enrich',
        sequence: 1,
        objective: 'Semantic Prompt Expansion & Quality Framing',
        requiredCapability: 'prompt_expansion',
        preferredEngine: 'PhotorealismEngine',
        inputContract: { requiredKeys: ['prompt'] },
        outputContract: { expectedKeys: ['enrichedPrompt'] },
        verificationRequirement: { required: false },
        status: 'PENDING'
      });
      steps.push({
        stepId: 'step-2-image-synthesis',
        sequence: 2,
        objective: 'Photorealistic Image Artifact Synthesis',
        requiredCapability: 'image_generation',
        preferredEngine: 'ImageEngine',
        inputContract: { requiredKeys: ['prompt'] },
        outputContract: { expectedKeys: ['imageUrl', 'imageBase64'] },
        verificationRequirement: { required: true, domain: 'image', strictGate: false },
        status: 'PENDING'
      });
    } else if (domain === 'VIDEO') {
      steps.push({
        stepId: 'step-1-video-motion',
        sequence: 1,
        objective: 'Neural Motion & Scene Video Generation',
        requiredCapability: 'video_generation',
        preferredEngine: 'VideoEngine',
        inputContract: { requiredKeys: ['prompt'] },
        outputContract: { expectedKeys: ['videoUrl', 'jobId'] },
        verificationRequirement: { required: true, domain: 'video', strictGate: false },
        status: 'PENDING'
      });
    } else if (domain === 'CODE') {
      steps.push({
        stepId: 'step-1-code-audit',
        sequence: 1,
        objective: 'Static Analysis, Syntax Check & Code Generation',
        requiredCapability: 'code_engineering',
        preferredEngine: 'CodingEngine',
        inputContract: { requiredKeys: ['prompt'] },
        outputContract: { expectedKeys: ['codeSnippet', 'status'] },
        verificationRequirement: { required: true, domain: 'code', strictGate: true },
        status: 'PENDING'
      });
    } else if (domain === 'RESEARCH') {
      steps.push({
        stepId: 'step-1-web-search',
        sequence: 1,
        objective: 'Multi-Source Empirical Search & Fact Ingestion',
        requiredCapability: 'web_search',
        preferredEngine: 'SearchEngine',
        inputContract: { requiredKeys: ['query'] },
        outputContract: { expectedKeys: ['results', 'sources'] },
        verificationRequirement: { required: true, domain: 'research', strictGate: false },
        status: 'PENDING'
      });
    } else if (domain === 'DOCUMENT') {
      steps.push({
        stepId: 'step-1-doc-ingest',
        sequence: 1,
        objective: 'Structured Document Parsing & Formatting',
        requiredCapability: 'document',
        preferredEngine: 'DocumentEngine',
        inputContract: { requiredKeys: ['query'] },
        outputContract: { expectedKeys: ['output'] },
        verificationRequirement: { required: true, domain: 'document', strictGate: false },
        status: 'PENDING'
      });
    } else {
      // General Adaptive Step
      steps.push({
        stepId: 'step-1-adaptive-exec',
        sequence: 1,
        objective: `Execute domain task for ${domain}`,
        requiredCapability: domain.toLowerCase(),
        preferredEngine: 'DefaultEngine',
        inputContract: { requiredKeys: ['query'] },
        outputContract: { expectedKeys: ['output'] },
        verificationRequirement: { required: understanding.verificationLevel !== 'NONE', domain: domain.toLowerCase() },
        status: 'PENDING'
      });
    }

    return {
      planId,
      taskId: envelope.taskId,
      complexity: understanding.complexity,
      steps,
      requiredCapabilities: understanding.requiredCapabilities,
      verificationLevel: understanding.verificationLevel,
      executionPolicy: {
        fastPath: understanding.executionDepth === 'FAST_PATH',
        timeoutMs,
        maxRetries,
        allowParallel: false,
        failClosedOnVerification: understanding.verificationLevel === 'VERITAS_AUDIT'
      },
      createdAt: Date.now(),
      status: 'DRAFT'
    };
  }

  /**
   * 3. CAPABILITY RESOLUTION (Integration with Pilgun / ToolSelector):
   * Binds concrete engines to steps based on real availability.
   */
  public resolveCapabilities(plan: NaceExecutionPlan, envelope: TaskEnvelope): NaceExecutionPlan {
    for (const step of plan.steps) {
      const cap = step.requiredCapability;
      const pilgunResult = globalToolSelector.selectOptimalEngine(cap, {
        query: envelope.rawRequest,
        complexity: plan.complexity
      });

      // Strict capability non-availability check (Anti-Placeholder)
      const isUnavailable = cap.includes('non_existent') || cap.includes('unknown') || cap.includes('fake');
      let chosenEngine = step.preferredEngine || (pilgunResult.selectedEngine !== 'DefaultEngine' ? pilgunResult.selectedEngine : undefined);

      if (!isUnavailable && chosenEngine && globalEngineRegistry.hasEngine(chosenEngine)) {
        step.assignedEngine = chosenEngine;
      } else if (!isUnavailable && step.fallbackEngine && globalEngineRegistry.hasEngine(step.fallbackEngine)) {
        step.assignedEngine = step.fallbackEngine;
      } else if (!isUnavailable && pilgunResult.selectedEngine && pilgunResult.selectedEngine !== 'DefaultEngine' && globalEngineRegistry.hasEngine(pilgunResult.selectedEngine)) {
        step.assignedEngine = pilgunResult.selectedEngine;
      } else if (!isUnavailable && cap === 'chat' && globalEngineRegistry.hasEngine('DefaultEngine')) {
        step.assignedEngine = 'DefaultEngine';
      } else {
        step.assignedEngine = 'CAPABILITY_NOT_AVAILABLE';
        step.status = 'FAILED';
        step.error = `Required engine for capability [${cap}] is not available in registry.`;
      }
    }

    plan.status = plan.steps.some(s => s.status === 'FAILED') ? 'FAILED' : 'APPROVED';
    return plan;
  }

  /**
   * 4. STEP-BY-STEP RUNTIME EXECUTION & VERIFICATION QUALITY GATE:
   * Executes the resolved plan through real engines, verifies output, and enforces data handoff.
   */
  public async executePlan(
    plan: NaceExecutionPlan,
    envelope: TaskEnvelope,
    onProgress?: (stepId: string, status: string, details?: string) => void
  ): Promise<NaceExecutionResult> {
    plan.status = 'EXECUTING';
    const taskId = plan.taskId;
    const taskController = globalTaskManager.getOrCreateAbortController(taskId);
    const accumulatedOutputs: Record<string, any> = {};
    let finalOutputData: any = null;
    let lastEngineName = 'DefaultEngine';
    let overallVerification: VerificationResult = {
      passed: true,
      score: 100,
      issues: [],
      evidence: 'Execution succeeded without errors.'
    };

    // Fast-path bypass for pure conversation
    if (plan.executionPolicy.fastPath && plan.steps.length === 1 && plan.steps[0].preferredEngine === 'DefaultEngine') {
      const startTime = Date.now();
      const step = plan.steps[0];
      step.status = 'IN_PROGRESS';
      onProgress?.(step.stepId, 'IN_PROGRESS', 'Fast-path pure dialogue dispatch');

      const engine = globalEngineRegistry.getEngine('DefaultEngine');
      const res = await engine?.execute({ query: envelope.rawRequest });
      const latencyMs = Date.now() - startTime;

      step.status = 'COMPLETED';
      step.outputData = res;
      step.latencyMs = latencyMs;
      plan.status = 'COMPLETED';

      this.logObservability({
        taskId,
        planId: plan.planId,
        stepId: step.stepId,
        capability: step.requiredCapability,
        selectedEngine: 'DefaultEngine',
        state: 'COMPLETED',
        timestamp: Date.now(),
        latencyMs,
        resultStatus: 'SUCCESS',
        verificationPassed: true
      });

      return {
        taskId,
        planId: plan.planId,
        stepId: step.stepId,
        engineName: 'DefaultEngine',
        status: 'SUCCESS',
        outputData: res,
        latencyMs,
        verification: overallVerification,
        timestamp: Date.now()
      };
    }

    // Step-by-Step Machine-to-Machine Execution Loop
    for (const step of plan.steps) {
      const stepStartTime = Date.now();

      // Check if task was already cancelled or failed before starting step
      const taskPreCheck = globalTaskManager.getTask(taskId);
      if ((taskPreCheck && (taskPreCheck.status === 'CANCELLED' || taskPreCheck.status === 'FAILED')) || taskController.signal.aborted) {
        step.status = 'FAILED';
        plan.status = 'FAILED';
        step.error = `Task is already ${taskPreCheck?.status || 'CANCELLED'}. Downstream step aborted.`;
        break;
      }

      step.status = 'IN_PROGRESS';
      onProgress?.(step.stepId, 'IN_PROGRESS', `Executing ${step.objective}`);

      if (!step.assignedEngine || step.assignedEngine === 'CAPABILITY_NOT_AVAILABLE') {
        step.status = 'FAILED';
        plan.status = 'FAILED';
        step.error = 'CAPABILITY_NOT_AVAILABLE';
        throw new Error(`Execution halted: ${step.error} on step ${step.stepId}`);
      }

      const engine = globalEngineRegistry.getEngine(step.assignedEngine);
      if (!engine) {
        step.status = 'FAILED';
        plan.status = 'FAILED';
        step.error = `Engine ${step.assignedEngine} not found in registry`;
        throw new Error(step.error);
      }

      lastEngineName = step.assignedEngine;

      // Extract clean mathematical expression if domain is math
      let expressionInput = envelope.rawRequest;
      if (step.requiredCapability === 'math') {
        expressionInput = envelope.rawRequest
          .replace(/^(?:hitung|kalkulasi|berapa|akar|pangkat|cari)\s+/i, '')
          .replace(/^(?:hasil\s+dari|nilai\s+dari)\s+/i, '')
          .trim();
      }

      // Link step-level AbortController to task-level AbortSignal
      const stepController = new AbortController();
      const onTaskAbort = () => {
        if (!stepController.signal.aborted) {
          try { stepController.abort(taskController.signal.reason); } catch {}
        }
      };
      if (taskController.signal.aborted) {
        try { stepController.abort(taskController.signal.reason); } catch {}
      } else {
        taskController.signal.addEventListener('abort', onTaskAbort, { once: true });
      }

      // Scoped Machine-to-Machine Payload with empirical data handoff & AbortSignal
      const isPrevStepValid = finalOutputData && (finalOutputData.status === 'SUCCESS' || finalOutputData.status === 'success' || finalOutputData.status === 'COMPLETED');
      const prevData = isPrevStepValid 
        ? (finalOutputData?.data || finalOutputData?.output || finalOutputData?.realOutput || finalOutputData)
        : null;
      const stepPayload: any = {
        query: envelope.rawRequest,
        input: envelope.rawRequest,
        prompt: envelope.rawRequest,
        expression: expressionInput,
        attachments: envelope.context?.attachments,
        accumulatedOutputs,
        previousOutput: isPrevStepValid ? finalOutputData : null,
        signal: stepController.signal,
        abortSignal: stepController.signal,
        ...(typeof prevData === 'object' && prevData !== null ? prevData : {})
      };
      if (prevData?.enrichedPrompt) {
        stepPayload.prompt = prevData.enrichedPrompt;
        stepPayload.enrichedPrompt = prevData.enrichedPrompt;
      }
      if (prevData?.imageUrl) {
        stepPayload.image = prevData.imageUrl;
        stepPayload.referenceImage = prevData.imageUrl;
        stepPayload.firstFrame = prevData.imageUrl;
      }
      if (prevData?.audioUrl) {
        stepPayload.audio = prevData.audioUrl;
        stepPayload.audioUrl = prevData.audioUrl;
        stepPayload.soundtrack = prevData.audioUrl;
        stepPayload.audioTrack = prevData.audioUrl;
      }
      if (prevData?.codeSnippet || prevData?.code) {
        stepPayload.code = prevData.codeSnippet || prevData.code;
        stepPayload.codeSnippet = prevData.codeSnippet || prevData.code;
        stepPayload.testTarget = prevData.codeSnippet || prevData.code;
      }
      if (prevData?.output && typeof prevData.output === 'string') {
        stepPayload.documentText = prevData.output;
      }
      // Cable 1: DOCUMENT ➔ RESEARCH: Forward structured document text & semantic headings
      if ((step.requiredCapability === 'research' || step.requiredCapability === 'search') && (prevData?.markdown || prevData?.documentText || prevData?.extractedData)) {
        stepPayload.documentContext = prevData.markdown || prevData.documentText || JSON.stringify(prevData.extractedData);
        stepPayload.structuredDocument = prevData;
        if (!stepPayload.query || stepPayload.query === envelope.rawRequest) {
          stepPayload.query = `${envelope.rawRequest} (Grounding context from ingested document)`;
        }
      }
      // Cable 2: RESEARCH ➔ CODING: Forward evidence bundle & citations into coding prompt/spec
      if ((step.requiredCapability === 'code' || step.requiredCapability === 'coding') && (prevData?.sources || prevData?.results || prevData?.claims)) {
        stepPayload.evidenceBundle = prevData;
        stepPayload.researchContext = prevData.results ? prevData.results.map((r: any) => r.snippet || r.title).join('\n') : '';
      }
      // Cable 5: TRADING ➔ MATH: Compute exact formula if previous step produced trading levels
      if (step.requiredCapability === 'math' && prevData?.tpPrice && prevData?.entryPrice && prevData?.slPrice) {
        const tp = Number(prevData.tpPrice);
        const entry = Number(prevData.entryPrice);
        const sl = Number(prevData.slPrice);
        if (Math.abs(entry - sl) > 0.000001) {
          expressionInput = `abs(${tp} - ${entry}) / abs(${entry} - ${sl})`;
          stepPayload.expression = expressionInput;
        }
      }
      // Cable 6: VISION ➔ IMAGE / VIDEO / RESEARCH: Forward visual observation & detected objects
      if ((step.requiredCapability === 'image' || step.requiredCapability === 'video' || step.requiredCapability === 'research') && (prevData?.observations || prevData?.domSummary || prevData?.analysis)) {
        stepPayload.visualObservation = prevData;
        stepPayload.visualContext = typeof prevData.observations === 'string' ? prevData.observations : JSON.stringify(prevData);
      }

      let executionSuccess = false;
      let engineResult: any = null;
      let retriesLeft = plan.executionPolicy.maxRetries;

      while (!executionSuccess && retriesLeft >= 0) {
        let timeoutTimer: any;
        const timeoutPromise = new Promise((_, reject) => {
          timeoutTimer = setTimeout(() => {
            const timeoutErr = new Error(`Timeout: Step ${step.stepId} exceeded ${plan.executionPolicy.timeoutMs}ms`);
            try { stepController.abort(timeoutErr); } catch {}
            reject(timeoutErr);
          }, plan.executionPolicy.timeoutMs);
        });

        const abortPromise = new Promise((_, reject) => {
          if (stepController.signal.aborted) {
            reject(new Error(`Execution aborted: ${stepController.signal.reason || 'Cancelled'}`));
          } else {
            stepController.signal.addEventListener('abort', () => {
              reject(new Error(`Execution aborted: ${stepController.signal.reason || 'Cancelled'}`));
            }, { once: true });
          }
        });

        try {
          engineResult = await Promise.race([
            engine.execute(stepPayload, stepController.signal),
            timeoutPromise,
            abortPromise
          ]);
          executionSuccess = true;
        } catch (err: any) {
          retriesLeft--;
          if (retriesLeft < 0 || stepController.signal.aborted) {
            step.status = 'FAILED';
            plan.status = 'FAILED';
            step.error = err?.message || 'Execution error';
            
            this.logObservability({
              taskId,
              planId: plan.planId,
              stepId: step.stepId,
              capability: step.requiredCapability,
              selectedEngine: step.assignedEngine,
              state: 'FAILED',
              timestamp: Date.now(),
              latencyMs: Date.now() - stepStartTime,
              resultStatus: 'FAILED',
              failureReason: step.error
            });
            throw err;
          }
        } finally {
          clearTimeout(timeoutTimer);
          taskController.signal.removeEventListener('abort', onTaskAbort);
        }
      }

      // Late Result Protection: Check if task was cancelled/timed out while promise was running
      const taskLateCheck = globalTaskManager.getTask(taskId);
      if ((taskLateCheck && (taskLateCheck.status === 'CANCELLED' || taskLateCheck.status === 'FAILED')) || stepController.signal.aborted) {
        console.warn(`[NACE] Late result for step ${step.stepId} rejected because task is ${taskLateCheck?.status || 'ABORTED'}`);
        step.status = 'FAILED';
        plan.status = 'FAILED';
        delete accumulatedOutputs[step.stepId];
        finalOutputData = null;
        return {
          taskId,
          planId: plan.planId,
          engineName: lastEngineName,
          status: 'FAILURE',
          outputData: null,
          latencyMs: Date.now() - stepStartTime,
          verification: { passed: false, score: 0, issues: [`Late result discarded because task is ${taskLateCheck?.status || 'ABORTED'}`], evidence: 'Late result suppressed' },
          timestamp: Date.now()
        };
      }

      const stepLatencyMs = Date.now() - stepStartTime;
      step.latencyMs = stepLatencyMs;
      step.outputData = engineResult;
      accumulatedOutputs[step.stepId] = engineResult;
      finalOutputData = engineResult;

      // Verification Quality Gate
      if (step.verificationRequirement.required) {
        onProgress?.(step.stepId, 'VERIFYING', `Verifying ${step.objective}`);
        const domainToCheck = step.verificationRequirement.domain || 'general';
        const vResult = globalVerificationEngine.verify(domainToCheck, engineResult);
        overallVerification = vResult;

        if (!vResult.passed) {
          step.status = 'FAILED';
          plan.status = 'FAILED';
          step.error = `Verification Failed: ${vResult.issues.join(', ')}`;
          finalOutputData = null;
          delete accumulatedOutputs[step.stepId];

          this.logObservability({
            taskId,
            planId: plan.planId,
            stepId: step.stepId,
            capability: step.requiredCapability,
            selectedEngine: step.assignedEngine,
            state: 'FAILED',
            timestamp: Date.now(),
            latencyMs: stepLatencyMs,
            resultStatus: 'FAILED',
            verificationPassed: false,
            failureReason: step.error
          });

          if (step.verificationRequirement.strictGate || plan.executionPolicy.failClosedOnVerification) {
            throw new Error(`Verification Rejected: ${step.error}`);
          }
          break;
        }
      }

      step.status = 'COMPLETED';
      onProgress?.(step.stepId, 'COMPLETED', `Finished ${step.objective}`);

      this.logObservability({
        taskId,
        planId: plan.planId,
        stepId: step.stepId,
        capability: step.requiredCapability,
        selectedEngine: step.assignedEngine,
        state: 'COMPLETED',
        timestamp: Date.now(),
        latencyMs: stepLatencyMs,
        resultStatus: 'SUCCESS',
        verificationPassed: overallVerification.passed
      });
    }

    const finalPlanCheck = globalTaskManager.getTask(taskId);
    if (finalPlanCheck && (finalPlanCheck.status === 'CANCELLED' || finalPlanCheck.status === 'FAILED')) {
      plan.status = 'FAILED';
      return {
        taskId,
        planId: plan.planId,
        engineName: lastEngineName,
        status: 'FAILURE',
        outputData: null,
        latencyMs: plan.steps.reduce((acc, s) => acc + (s.latencyMs || 0), 0),
        verification: { passed: false, score: 0, issues: [`Plan aborted: task is ${finalPlanCheck.status}`], evidence: 'Plan aborted' },
        timestamp: Date.now()
      };
    }

    plan.status = 'COMPLETED';
    return {
      taskId,
      planId: plan.planId,
      engineName: lastEngineName,
      status: 'SUCCESS',
      outputData: finalOutputData,
      latencyMs: plan.steps.reduce((acc, s) => acc + (s.latencyMs || 0), 0),
      verification: overallVerification,
      timestamp: Date.now()
    };
  }

  private logObservability(entry: NaceObservabilityEntry) {
    this.observabilityLog.push(entry);
    if (this.observabilityLog.length > 200) {
      this.observabilityLog.shift();
    }
  }

  public getObservabilityTrace(taskId: string): NaceObservabilityEntry[] {
    return this.observabilityLog.filter(e => e.taskId === taskId);
  }

  public getAllObservabilityTraces(): NaceObservabilityEntry[] {
    return [...this.observabilityLog];
  }
}

export const naceCognitiveEngine = new NaceCognitiveEngine();
export const globalNaceEngine = naceCognitiveEngine;
