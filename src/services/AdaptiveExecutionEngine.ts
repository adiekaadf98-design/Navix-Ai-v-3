import { classifyTask, TaskType } from './ThinkingEngine';
import { globalEngineRegistry } from './EngineRegistry';
import { globalTaskManager } from './TaskStateManager';
import { globalToolSelector, ToolCapability } from './ToolSelector';
import { globalVerificationEngine } from './VerificationEngine';
import { globalFailureRecovery } from './FailureRecoveryEngine';
import { navixMemoryEngine } from '../memory/MemoryEngine';

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
    if (lowInput.includes('analisis') || lowInput.includes('riset')) score += 2;
    if (lowInput.includes('trading') || lowInput.includes('kode') || lowInput.includes('bug')) score += 5;

    let complexity: TaskComplexity = 'SIMPLE';
    if (score >= 8) complexity = 'CRITICAL';
    else if (score >= 5) complexity = 'COMPLEX';
    else if (score >= 3) complexity = 'MODERATE';
    
    // Auto route to shadow engine for images/videos
    if (lowInput.includes('gambar') || lowInput.includes('foto') || lowInput.includes('video') || lowInput.includes('animasi') || lowInput.includes('gerak')) {
       taskType = 'shadow_engine' as any;
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
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
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
          ['Reading Market', 'Analyzing Structure', 'Analyzing Zone', 'Validating', 'Preparing Signal'],
          ['TradingViewService', 'TradingViewService', 'TradingViewService', 'VerificationEngine', 'SignalEngine']
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
      default:
        return createSteps(['Understand', 'Execute', 'Verify', 'Result'], [undefined, 'DefaultEngine', 'VerificationEngine', undefined]);
    }
  }
}

export class EngineSelector {
  public selectEngine(capability: string): string {
    // Maps generic capability to specific engine names
    const engineMap: Record<string, string> = {
      'trading': 'TradingViewService',
      'signal': 'SignalEngine',
      'shadow_engine': 'shadow-engine',
      'image': 'ImageEngine',
      'video': 'VideoEngine',
      'audio': 'AudioEngine',
      'document': 'DocumentEngine',
      'file_analysis': 'DocumentEngine',
      'code': 'CodingEngine',
      'security': 'NavixShield',
      'research': 'SearchEngine',
      'knowledge_lab': 'AutonomousScientificLab',
      'scientific_lab': 'AutonomousScientificLab',
      'data_analysis': 'DataAnalysisEngine',
      'chat': 'DefaultEngine',
      'app_builder': 'AIStudioAppBuilderEngine',
      'retail_trader': 'RetailTraderGitHubEngine',
      'github': 'GitHubOpenSourceEngine',
      'project_map': 'ProjectMapEngine',
      'volatility': 'VolatilitySentinel'
    };
    return engineMap[capability] || 'DefaultEngine';
  }
}

export class ModelSelector {
  public selectModel(taskType: TaskType, complexity: TaskComplexity): { primary: string; fallback: string } {
    if (taskType === 'trading' || complexity === 'CRITICAL') {
      return { primary: 'gemini-3.1-pro-preview', fallback: 'gemini-3.6-flash' };
    }
    return { primary: 'gemini-3.6-flash', fallback: 'gemini-3.1-flash-lite' };
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

  public async processRequest(input: string, attachmentsCount: number, config?: {
    onStateChange: (state: ExecutionState, details?: string) => void,
    onProgress: (step: string) => void
  }) {
    const updateState = (state: ExecutionState, details?: string) => {
       config?.onStateChange(state, details);
       if (typeof window !== 'undefined') {
         window.dispatchEvent(new CustomEvent('navix_supervisor_state', { detail: { state, details } }));
       }
    };

    updateState('CREATED', 'Initializing execution');
    
    updateState('UNDERSTANDING', 'Classifying intent and complexity');
    const classification = this.router.classify(input, attachmentsCount);

    if (classification.mode === 'DISCUSSION MODE') {
       updateState('COMPLETED', 'Simple chat task');
       return { classification, workflow: [] };
    }

    updateState('PLANNING', 'Selecting adaptive workflow');
    const workflow = this.workflowSelector.selectWorkflow(classification.taskType);
    
    // Tools & Context
    updateState('WAITING_TOOL', 'Gathering context and tools');
    const tools = globalToolSelector.selectToolsForTask(classification.taskType, classification.complexity);
    const models = this.modelSelector.selectModel(classification.taskType, classification.complexity);
    const context = await this.contextSelector.selectContext('task_temp', input);

    // Save initial state
    const taskId = 'task_' + Date.now();
    const taskState = globalTaskManager.createTask(taskId, input, classification.complexity, []); // Use simplified task manager integration

    // Execution loop
    updateState('EXECUTING', 'Executing workflow steps');
    let finalEngineResult: any = null;

    for (const step of workflow) {
       config?.onProgress(step.action);
       step.status = 'IN_PROGRESS';

       if (step.assignedEngine && step.assignedEngine !== 'CAPABILITY_NOT_AVAILABLE') {
          const engine = globalEngineRegistry.getEngine(step.assignedEngine);
          if (engine) {
            try {
              const res = await engine.execute({ 
                query: input, 
                prompt: input, 
                input, 
                message: input, 
                context,
                attachmentsCount 
              });
              if (res) finalEngineResult = res;
            } catch (err: any) {
               updateState('RETRYING', 'Engine failed, attempting recovery');
               const recovery = globalFailureRecovery.analyzeFailure(taskId, err.message || 'Error', classification.taskType);
               if (recovery.action === 'ABORT') {
                  step.status = 'FAILED';
                  updateState('FAILED', 'Task execution aborted: ' + recovery.reason);
                  throw new Error('Task Failed: ' + recovery.reason);
               }
            }
          }
       }
       step.status = 'COMPLETED';
    }

    // Verification
    updateState('VERIFYING', 'Verifying final output');
    const verification = globalVerificationEngine.verify(classification.taskType, finalEngineResult);
    if (!verification.passed) {
       updateState('FAILED', 'Verification failed');
       // In a real scenario we'd do recovery here
    } else {
       updateState('COMPLETED', 'Task completed successfully');
       globalTaskManager.completeTask(taskId);
    }

    return { classification, workflow, tools, models, finalEngineResult, verification };
  }
}

export const globalAdaptiveEngine = new AdaptiveExecutionEngine();
