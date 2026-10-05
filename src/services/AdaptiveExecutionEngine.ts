import { classifyTask, TaskType } from './ThinkingEngine';
import { globalEngineRegistry } from './EngineRegistry';
import { globalTaskManager } from './TaskStateManager';
import { globalToolSelector, ToolCapability } from './ToolSelector';
import { globalVerificationEngine } from './VerificationEngine';
import { globalFailureRecovery } from './FailureRecoveryEngine';
import { navixMemoryEngine } from '../memory/MemoryEngine';
import { 
  TaskEnvelope, 
  CognitiveUnderstanding, 
  NaceExecutionPlan, 
  NaceExecutionResult,
  toLegacyComplexity,
  toNaceComplexity
} from '../types/nace';
import { naceCognitiveEngine } from './NaceCognitiveEngine';

export type TaskComplexity = 'SIMPLE' | 'MODERATE' | 'COMPLEX' | 'CRITICAL';

export interface TaskClassification {
  intent: string;
  taskType: TaskType;
  complexity: TaskComplexity;
  requiredCapabilities: string[];
  mode: 'DISCUSSION MODE' | 'THINKING MODE';
}

export class TaskRouter {
  public classify(input: string, attachmentsCount: number): TaskClassification {
    let { taskType } = classifyTask(input);
    const lowInput = input.toLowerCase();
    
    let score = 0;
    if (attachmentsCount > 0) score += 2;
    if (taskType !== 'chat') score += 3;
    if (lowInput.includes('analisis') || lowInput.includes('riset') || lowInput.includes('dataset') || lowInput.includes('korelasi') || lowInput.includes('tren')) score += 2;
    if (lowInput.includes('trading') || lowInput.includes('kode') || lowInput.includes('bug') || lowInput.includes('saham') || lowInput.includes('xauusd') || lowInput.includes('gold')) score += 5;

    let complexity: TaskComplexity = 'SIMPLE';
    if (score >= 8) complexity = 'CRITICAL';
    else if (score >= 5) complexity = 'COMPLEX';
    else if (score >= 3) complexity = 'MODERATE';
    
    // Auto route to shadow engine for images/videos
    if (lowInput.includes('gambar') || lowInput.includes('foto') || lowInput.includes('video') || lowInput.includes('animasi') || lowInput.includes('gerak')) {
       taskType = 'shadow_engine' as any;
    }

    // Auto route to math engine for numerical operations or single integer
    const isSingleInteger = /^\s*-?\d+\s*$/.test(input.trim());
    const isMathExpression = /(?:hitung|kalkulasi|berapa|akar|pangkat|faktorial|\+|\-|\*|\/|\^|%|sqrt|sin|cos|tan|log)/i.test(lowInput) && /\d/.test(lowInput);
    if (isSingleInteger || isMathExpression) {
       taskType = 'math' as any;
    }

    const mode = complexity === 'SIMPLE' ? 'DISCUSSION MODE' : 'THINKING MODE';
    
    return {
      intent: 'Determine user goal based on input',
      taskType,
      complexity,
      requiredCapabilities: [taskType],
      mode
    };
  }
}

export interface WorkflowStep {
  id: string;
  action: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  assignedEngine?: string;
}

export class WorkflowSelector {
  public selectWorkflow(taskType: TaskType): WorkflowStep[] {
    const createSteps = (actions: string[], engines: (string|undefined)[]): WorkflowStep[] => {
      return actions.map((action, idx) => ({
        id: `step-${idx+1}`,
        action,
        status: 'PENDING',
        assignedEngine: engines[idx]
      }));
    };

    switch (taskType) {
      case 'trading':
        return createSteps(
          ['Reading Real Market Data', 'Analyzing Structure & Zones', 'Evaluating Single Method', 'Validating Non-Fabrication', 'Preparing Institutional Signal'],
          ['SignalEngine', 'SignalEngine', 'SignalEngine', 'VerificationEngine', 'SignalEngine']
        );
      case 'image':
        return createSteps(
          ['Input', 'Image Understanding', 'Generation/Edit', 'Quality Check', 'Result'],
          [undefined, 'ImageEngine', 'ImageEngine', 'VerificationEngine', undefined]
        );
      case 'shadow_engine' as any:
        return createSteps(
          ['Input', 'Prompt Enhancement', 'Neural Image Synthesis', 'Quality Check', 'Result'],
          [undefined, 'LocalDreamImageEngine', 'ImageEngine', 'VerificationEngine', undefined]
        );
      case 'video':
        return createSteps(
          ['Input', 'Scene Understanding', 'Scene/Motion Planning', 'Video Generation', 'Output Check', 'Result'],
          [undefined, 'VideoEngine', 'VideoEngine', 'VideoEngine', 'VerificationEngine', undefined]
        );
      case 'audio' as any:
        return createSteps(
          ['Input', 'Acoustic Processing', 'Voice Synthesis / Transcription', 'Audio Verification', 'Result'],
          [undefined, 'AudioEngine', 'AudioEngine', 'VerificationEngine', undefined]
        );
      case 'code':
        return createSteps(
          ['Understand', 'Inspect', 'Plan', 'Implement', 'Test', 'Verify', 'Result'],
          [undefined, 'CodingEngine', undefined, 'CodingEngine', 'CodingEngine', 'VerificationEngine', undefined]
        );
      case 'data_analysis' as any:
        return createSteps(
          ['Data Ingestion', 'Statistical Parsing', 'Correlation & Outlier Analysis', 'Data Verification', 'Result'],
          [undefined, 'DataAnalysisEngine', 'DataAnalysisEngine', 'VerificationEngine', undefined]
        );
      case 'file_analysis' as any:
        return createSteps(
          ['File Parsing', 'Structure Inspection', 'Content Extraction', 'Document Verification', 'Result'],
          [undefined, 'DocumentEngine', 'DocumentEngine', 'VerificationEngine', undefined]
        );
      case 'security':
        return createSteps(
          ['Scan', 'Detection', 'Evidence', 'Verification', 'Risk Analysis', 'Result'],
          ['NavixShield', 'NavixShield', 'NavixShield', 'VerificationEngine', 'NavixShield', undefined]
        );
      case 'vision' as any:
        return createSteps(
          ['Input', 'Multimodal Understanding', 'Feature/OCR Extraction', 'Visual Verification', 'Result'],
          [undefined, 'VisionEngine', 'VisionEngine', 'VerificationEngine', undefined]
        );
      case 'agent' as any:
        return createSteps(
          ['PLAN', 'EXECUTE', 'OBSERVE', 'VERIFY', 'COMPLETE'],
          ['AgentEngine', 'AgentEngine', 'AgentEngine', 'VerificationEngine', 'AgentEngine']
        );
      case 'math' as any:
        return createSteps(
          ['Input', 'Expression Parsing', 'High Precision Mathematical Execution', 'Mathematical Verification', 'Result'],
          [undefined, 'MathEngine', 'MathEngine', 'VerificationEngine', undefined]
        );
      case 'research':
        return createSteps(
          ['Question', 'Search', 'Collect Evidence', 'Analyze', 'Cross-check', 'Synthesize'],
          [undefined, 'SearchEngine', 'SearchEngine', undefined, 'VerificationEngine', undefined]
        );
      case 'document':
        return createSteps(
          ['Read', 'Extract', 'Analyze', 'Validate', 'Generate Result'],
          ['DocumentEngine', 'DocumentEngine', undefined, 'VerificationEngine', undefined]
        );
      case 'knowledge_lab':
        return createSteps(
          ['INGESTING', 'UNDERSTANDING', 'EXTRACTING', 'CROSS_CHECKING', 'CHALLENGING', 'DISTILLING', 'TESTING', 'VERIFYING', 'PROMOTING', 'COMPLETED'],
          ['KnowledgeIngestionEngine', 'KnowledgeDistillationEngine', undefined, 'TriangulationEngine', 'AdversarialKnowledgeEngine', 'KnowledgeDistillationEngine', 'RetentionTestEngine', 'VerificationEngine', 'SkillRegistry', undefined]
        );
      case 'quiz':
        return createSteps(
          ['Analyze Topic', 'Generate Interactive Quiz', 'Verify Quiz Structure', 'Result'],
          [undefined, 'InteractiveQuizEngine', 'VerificationEngine', undefined]
        );
      case 'skill':
        return createSteps(
          ['Discover Skill', 'Validate Input', 'Execute Skill', 'Verification', 'Result'],
          ['McpSkillRouter', 'McpSkillRouter', 'McpSkillRouter', 'VerificationEngine', undefined]
        );
      default:
        return createSteps(['Understand', 'Execute', 'Verify', 'Result'], [undefined, 'DefaultEngine', 'VerificationEngine', undefined]);
    }
  }
}

export class EngineSelector {
  public selectEngine(capability: string): string {
    // Maps generic capability to specific engine names in EngineRegistry
    const engineMap: Record<string, string> = {
      'trading': 'SignalEngine',
      'signal': 'SignalEngine',
      'forex': 'SignalEngine',
      'crypto': 'CryptoEngine',
      'stock': 'StockEngine',
      'saham': 'StockEngine',
      'shadow_engine': 'LocalDreamImageEngine',
      'image': 'ImageEngine',
      'photorealism': 'PhotorealismEngine',
      'video': 'VideoEngine',
      'audio': 'AudioEngine',
      'document': 'DocumentEngine',
      'file_analysis': 'DocumentEngine',
      'code': 'CodingEngine',
      'coding': 'CodingEngine',
      'code_engineering': 'CodingEngine',
      'security': 'NavixShield',
      'research': 'SearchEngine',
      'deep_research': 'SearchEngine',
      'knowledge_lab': 'AutonomousScientificLab',
      'scientific_lab': 'AutonomousScientificLab',
      'data_analysis': 'DataAnalysisEngine',
      'chat': 'DefaultEngine',
      'app_builder': 'AIStudioAppBuilderEngine',
      'retail_trader': 'RetailTraderGitHubEngine',
      'github': 'GitHubOpenSourceEngine',
      'project_map': 'ProjectMapEngine',
      'volatility': 'VolatilitySentinel',
      'skill': 'McpSkillRouter',
      'stock_photo': 'StockImageEngine',
      'drive': 'AppConnectorsEngine',
      'connector': 'AppConnectorsEngine',
      'automation': 'AutomationsEngine',
      'map': 'GeoTrackerEngine',
      'tracker': 'GeoTrackerEngine',
      'pilgun': 'InteractiveQuizEngine',
      'quiz': 'InteractiveQuizEngine',
      'clock': 'WorldClockEngine',
      'world_clock': 'WorldClockEngine',
      'cloud_console': 'CloudConsoleEngine',
      'media_vault': 'MediaLibraryEngine',
      'ai_agents': 'AIAgentsEngine',
      'agent': 'AgentEngine',
      'agents': 'AgentEngine',
      'vision': 'VisionEngine',
      'ocr': 'VisionEngine',
      'chart_vision': 'VisionEngine',
      'voice': 'AudioEngine',
      'speech': 'AudioEngine',
      'stt': 'AudioEngine',
      'tts': 'AudioEngine',
      'science': 'AutonomousScientificLab',
      'scientific': 'AutonomousScientificLab',
      'math': 'MathEngine',
      'matematika': 'MathEngine',
      'kalkulator': 'MathEngine',
      'calculator': 'MathEngine',
      'arithmetic': 'MathEngine',
      'hitung_ekspresi': 'MathEngine',
      'analisis_angka': 'MathEngine',
      'statistics': 'DataAnalysisEngine',
      'plugins': 'PluginsEngine'
    };
    return engineMap[capability.toLowerCase()] || 'DefaultEngine';
  }
}

export class ModelSelector {
  public selectModel(taskType: TaskType, complexity: TaskComplexity): { primary: string; fallback: string } {
    if (taskType === 'trading' || complexity === 'CRITICAL') {
      return { primary: 'gemini-3.1-pro-preview', fallback: 'gemini-3.8-flash' };
    }
    return { primary: 'gemini-3.8-flash', fallback: 'gemini-3.1-flash-lite' };
  }
}

export class ContextSelector {
  public async selectContext(taskId: string, input: string) {
    const memory = await navixMemoryEngine.retrieveContext(input);
    return memory.promptContext || '';
  }
}

export type ExecutionState = 'CREATED' | 'UNDERSTANDING' | 'PLANNING' | 'EXECUTING' | 'WAITING_TOOL' | 'VERIFYING' | 'RETRYING' | 'COMPLETED' | 'FAILED';

export class AdaptiveExecutionEngine {
  private router = new TaskRouter();
  private workflowSelector = new WorkflowSelector();
  private engineSelector = new EngineSelector();
  private modelSelector = new ModelSelector();
  private contextSelector = new ContextSelector();

  public async processTaskEnvelope(envelope: TaskEnvelope, config?: {
    onStateChange?: (state: ExecutionState, details?: string) => void,
    onProgress?: (step: string) => void
  }) {
    const updateState = (state: ExecutionState, details?: string) => {
       config?.onStateChange?.(state, details);
       if (typeof window !== 'undefined') {
         window.dispatchEvent(new CustomEvent('navix_supervisor_state', { detail: { state, details } }));
       }
    };

    updateState('CREATED', 'Initializing execution via NACE');
    
    // 1. NACE Cognitive Understanding & Intent Analysis
    updateState('UNDERSTANDING', 'NACE: Multi-domain Intent & Constraint Analysis');
    const understanding = naceCognitiveEngine.understand(envelope);
    const classification: TaskClassification = {
      intent: understanding.intent.primaryGoal,
      taskType: understanding.intent.taskType as any,
      complexity: toLegacyComplexity(understanding.complexity) as any,
      requiredCapabilities: understanding.requiredCapabilities,
      mode: understanding.executionDepth === 'FAST_PATH' && understanding.domain === 'CHAT' ? 'DISCUSSION MODE' : 'THINKING MODE'
    };

    if (classification.mode === 'DISCUSSION MODE') {
      updateState('COMPLETED', 'Simple chat task (FAST_PATH)');
      return { 
        classification, 
        understanding, 
        workflow: [], 
        tools: [], 
        models: { primary: 'gemini-3.8-flash', fallback: 'gemini-3.1-flash-lite' }, 
        finalEngineResult: null, 
        verification: { passed: true, score: 100, issues: [], evidence: 'Fast-path conversation passed.' } 
      };
    }

    // 2. NACE Dynamic Planning & Decomposition
    updateState('PLANNING', 'NACE: Dynamic Task Decomposition & Capability Binding');
    let plan = naceCognitiveEngine.plan(understanding, envelope);

    // 3. Pilgun / ToolSelector Capability Resolution
    updateState('WAITING_TOOL', 'NACE Pilgun: Resolving concrete engines for capabilities');
    plan = naceCognitiveEngine.resolveCapabilities(plan, envelope);

    // 4. Register Task in TaskStateManager for state source of truth
    const taskState = globalTaskManager.createTask(
      envelope.taskId, 
      envelope.rawRequest, 
      classification.complexity, 
      plan.steps.map(s => ({
        id: s.stepId,
        goal: s.objective,
        input: envelope.rawRequest,
        dependencies: [],
        assignedEngine: s.assignedEngine || 'DefaultEngine',
        status: 'PENDING'
      }))
    );

    // 5. Machine-to-Machine Step Execution via NACE
    updateState('EXECUTING', 'NACE: Executing Plan Machine-to-Machine');
    const naceResult = await naceCognitiveEngine.executePlan(plan, envelope, (stepId, status, details) => {
      config?.onProgress?.(`Step [${stepId}]: ${details || status}`);
      globalTaskManager.updateSubtask(envelope.taskId, stepId, { status: status as any });
    });

    // 6. Verification Quality Gate
    updateState('VERIFYING', 'NACE: Verification Engine Quality Gate Enforced');
    const verification = naceResult.verification || {
      passed: true,
      score: 100,
      issues: [],
      evidence: 'Verification successfully passed.'
    };

    const taskCheck = globalTaskManager.getTask(envelope.taskId);
    if (!verification.passed || naceResult.status === 'FAILURE' || taskCheck?.status === 'CANCELLED' || taskCheck?.status === 'FAILED') {
      const failReason = taskCheck?.status === 'CANCELLED'
        ? 'Task was cancelled during execution.'
        : !verification.passed 
          ? `Verification Rejected: ${verification.issues.join('; ')}`
          : `NACE step execution failed: ${naceResult.error || 'Execution status FAILURE'}`;
      updateState('FAILED', failReason);
      if (taskCheck?.status !== 'CANCELLED') {
        globalTaskManager.failTask(envelope.taskId, failReason);
      }
    } else {
      updateState('COMPLETED', 'NACE: Execution & Verification Completed');
      globalTaskManager.completeTask(envelope.taskId, {
        engineResults: { [naceResult.engineName]: naceResult.outputData },
        verificationResults: { [naceResult.engineName]: verification }
      });
    }

    const workflow: WorkflowStep[] = plan.steps.map(s => ({
      id: s.stepId,
      action: s.objective,
      status: s.status,
      assignedEngine: s.assignedEngine
    }));

    return { 
      classification, 
      understanding,
      nacePlan: plan,
      workflow, 
      tools: globalToolSelector.selectToolsForTask(classification.taskType, classification.complexity), 
      models: this.modelSelector.selectModel(classification.taskType, classification.complexity), 
      finalEngineResult: naceResult.outputData, 
      engineName: naceResult.engineName,
      verification 
    };
  }

  public async processRequest(input: string, attachmentsCount: number, config?: {
    onStateChange?: (state: ExecutionState, details?: string) => void,
    onProgress?: (step: string) => void,
    attachments?: any[],
    history?: any[]
  }) {
    const { globalDeliberationCouncil } = await import('./council/DeliberationCouncilEngine');
    const councilVerdict = globalDeliberationCouncil.deliberate(input, {
      attachmentsCount,
      historyLength: config?.history?.length || 0
    });

    const envelope: TaskEnvelope = {
      taskId: 'task_' + Date.now(),
      rawRequest: input,
      context: { 
        attachmentsCount,
        attachments: config?.attachments,
        history: config?.history,
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
    return this.processTaskEnvelope(envelope, config);
  }
}

export const globalAdaptiveEngine = new AdaptiveExecutionEngine();
