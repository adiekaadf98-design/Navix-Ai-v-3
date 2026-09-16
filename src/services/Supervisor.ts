import { classifyTask, TaskType } from './ThinkingEngine';
import { globalEngineRegistry } from './EngineRegistry';
import { navixMemoryEngine } from '../memory/MemoryEngine';
import { globalTaskManager } from './TaskStateManager';
import { globalToolSelector } from './ToolSelector';
import { globalProjectMapEngine } from './ProjectMapEngine';

export type TaskComplexity = 'SIMPLE' | 'MODERATE' | 'COMPLEX' | 'CRITICAL';

export interface TaskComplexityRouterResult {
  complexity: TaskComplexity;
  mode: 'DISCUSSION MODE' | 'THINKING MODE';
  reasoning: string[];
}

export class TaskComplexityRouter {
  public evaluate(input: string, attachmentsCount: number): TaskComplexityRouterResult {
    let score = 0;
    const reasoning: string[] = [];
    const lowInput = input.toLowerCase();

    // 1. Jumlah langkah / kompleksitas instruksi
    if (lowInput.includes('pertama') || lowInput.includes('lalu') || lowInput.includes('kemudian') || lowInput.includes('akhirnya')) {
      score += 2;
      reasoning.push("Multiple steps detected.");
    }

    // 2. Kebutuhan engine
    const { taskType } = classifyTask(input);
    if (taskType !== 'chat') {
      score += 3;
      reasoning.push(`Requires specific engine: ${taskType}.`);
    }
    
    // 3. Attachments
    if (attachmentsCount > 0) {
      score += 2;
      reasoning.push(`${attachmentsCount} attachments detected.`);
    }

    // 4. Kebutuhan analisis / riset
    if (lowInput.includes('analisis') || lowInput.includes('riset') || lowInput.includes('cari')) {
      score += 2;
      reasoning.push("Analysis/Research required.");
    }

    // 5. Risiko kesalahan / verifikasi
    if (lowInput.includes('trading') || lowInput.includes('saham') || lowInput.includes('crypto')) {
      score += 5;
      reasoning.push("High risk domain (Trading) detected.");
    }
    
    if (lowInput.includes('kode') || lowInput.includes('bug') || lowInput.includes('error') || lowInput.includes('perbaiki')) {
      score += 4;
      reasoning.push("Coding/Debugging task detected.");
    }

    let complexity: TaskComplexity = 'SIMPLE';
    if (score >= 8) complexity = 'CRITICAL';
    else if (score >= 5) complexity = 'COMPLEX';
    else if (score >= 3) complexity = 'MODERATE';

    const mode = complexity === 'SIMPLE' ? 'DISCUSSION MODE' : 'THINKING MODE';

    return { complexity, mode, reasoning };
  }
}

export type ThinkingStateStatus = 
  | 'TASK_RECEIVED'
  | 'UNDERSTANDING'
  | 'PLANNING'
  | 'ANALYZING'
  | 'EXECUTING'
  | 'VERIFYING'
  | 'CORRECTING'
  | 'FINALIZING'
  | 'COMPLETED'
  | 'FAILED';

export interface Subtask {
  id: string;
  goal: string;
  input: string;
  dependencies: string[];
  assignedEngine: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  output?: any;
  verificationStatus?: 'UNVERIFIED' | 'PASS' | 'FAIL';
}

export class TaskDecomposer {
  public decompose(input: string, taskType: TaskType, complexity: TaskComplexity): Subtask[] {
    const subtasks: Subtask[] = [];
    
    // Default initial step
    subtasks.push({
      id: 'subtask-1',
      goal: 'Understand and analyze user request constraints',
      input: input,
      dependencies: [],
      assignedEngine: 'NavixSupervisor',
      status: 'PENDING'
    });

    if (taskType === 'trading') {
      subtasks.push({
        id: 'subtask-2',
        goal: 'Analyze Market Structure & Technicals',
        input: 'Fetch market data and structure',
        dependencies: ['subtask-1'],
        assignedEngine: 'TradingViewService',
        status: 'PENDING'
      });
      subtasks.push({
        id: 'subtask-3',
        goal: 'Validate Signals & Constraints (Non-Repaint)',
        input: 'Verify generated signals against constraints',
        dependencies: ['subtask-2'],
        assignedEngine: 'SignalEngine',
        status: 'PENDING'
      });
      subtasks.push({
        id: 'subtask-4',
        goal: 'Verify Risk Management Levels',
        input: 'Validate SL/TP ratios',
        dependencies: ['subtask-3'],
        assignedEngine: 'VerificationEngine',
        status: 'PENDING'
      });
    } else if (taskType === 'code' || input.toLowerCase().includes('kode') || input.toLowerCase().includes('code')) {
      subtasks.push({
        id: 'subtask-2',
        goal: 'Analyze dependencies and architectural impacts',
        input: input,
        dependencies: ['subtask-1'],
        assignedEngine: 'CodingEngine',
        status: 'PENDING'
      });
      subtasks.push({
        id: 'subtask-3',
        goal: 'Implement modular production-ready code',
        input: 'Code implementation',
        dependencies: ['subtask-2'],
        assignedEngine: 'CodingEngine',
        status: 'PENDING'
      });
      subtasks.push({
        id: 'subtask-4',
        goal: 'Test and Syntax Verification',
        input: 'Code verification',
        dependencies: ['subtask-3'],
        assignedEngine: 'VerificationEngine',
        status: 'PENDING'
      });
    } else if (taskType === 'image') {
      subtasks.push({
        id: 'subtask-2',
        goal: 'Visual Prompt Engineering & Parameter Synthesis',
        input: input,
        dependencies: ['subtask-1'],
        assignedEngine: 'ImageEngine',
        status: 'PENDING'
      });
      subtasks.push({
        id: 'subtask-3',
        goal: 'Verify Resolution & Visual Quality',
        input: 'Image verification',
        dependencies: ['subtask-2'],
        assignedEngine: 'VerificationEngine',
        status: 'PENDING'
      });
    } else if (taskType === 'video') {
      subtasks.push({
        id: 'subtask-2',
        goal: 'Storyboard & Temporal Motion Synthesis',
        input: input,
        dependencies: ['subtask-1'],
        assignedEngine: 'VideoEngine',
        status: 'PENDING'
      });
      subtasks.push({
        id: 'subtask-3',
        goal: 'Verify Scene Transition & Frame Integrity',
        input: 'Video verification',
        dependencies: ['subtask-2'],
        assignedEngine: 'VerificationEngine',
        status: 'PENDING'
      });
    } else if (taskType === 'audio') {
      subtasks.push({
        id: 'subtask-2',
        goal: 'Acoustic Processing & Audio Synthesis',
        input: input,
        dependencies: ['subtask-1'],
        assignedEngine: 'AudioEngine',
        status: 'PENDING'
      });
      subtasks.push({
        id: 'subtask-3',
        goal: 'Verify Audio Sampling & Clarity',
        input: 'Audio verification',
        dependencies: ['subtask-2'],
        assignedEngine: 'VerificationEngine',
        status: 'PENDING'
      });
    } else if (taskType === 'document' || taskType === 'file_analysis') {
      subtasks.push({
        id: 'subtask-2',
        goal: 'Extract Document Semantics & Key Claims',
        input: input,
        dependencies: ['subtask-1'],
        assignedEngine: 'DocumentEngine',
        status: 'PENDING'
      });
      subtasks.push({
        id: 'subtask-3',
        goal: 'Verify Extracted Information Integrity',
        input: 'Document verification',
        dependencies: ['subtask-2'],
        assignedEngine: 'VerificationEngine',
        status: 'PENDING'
      });
    } else if (taskType === 'security') {
      subtasks.push({
        id: 'subtask-2',
        goal: 'Security Audit & Vulnerability Assessment',
        input: input,
        dependencies: ['subtask-1'],
        assignedEngine: 'NavixShield',
        status: 'PENDING'
      });
      subtasks.push({
        id: 'subtask-3',
        goal: 'Verify Zero-Trust Posture',
        input: 'Security verification',
        dependencies: ['subtask-2'],
        assignedEngine: 'VerificationEngine',
        status: 'PENDING'
      });
    } else if (taskType === 'research' || taskType === 'data_analysis') {
      const assigned = taskType === 'data_analysis' ? 'DataAnalysisEngine' : 'SearchEngine';
      subtasks.push({
        id: 'subtask-2',
        goal: 'Synthesize Multi-Source Intelligence & Data',
        input: input,
        dependencies: ['subtask-1'],
        assignedEngine: assigned,
        status: 'PENDING'
      });
      subtasks.push({
        id: 'subtask-3',
        goal: 'Verify Factual Grounding & Confidence',
        input: 'Research verification',
        dependencies: ['subtask-2'],
        assignedEngine: 'VerificationEngine',
        status: 'PENDING'
      });
    } else {
      subtasks.push({
        id: 'subtask-2',
        goal: 'Execute Adaptive Multi-Domain Reasoning',
        input: input,
        dependencies: ['subtask-1'],
        assignedEngine: 'DefaultEngine',
        status: 'PENDING'
      });
      subtasks.push({
        id: 'subtask-3',
        goal: 'Verify Response Quality',
        input: 'Verification',
        dependencies: ['subtask-2'],
        assignedEngine: 'VerificationEngine',
        status: 'PENDING'
      });
    }

    // Final step
    subtasks.push({
      id: `subtask-${subtasks.length + 1}`,
      goal: 'Finalize output and format response',
      input: 'Aggregate outputs',
      dependencies: [`subtask-${subtasks.length}`],
      assignedEngine: 'NavixSupervisor',
      status: 'PENDING'
    });

    return subtasks;
  }
}

export interface SupervisorConfig {
  onStateChange?: (state: ThinkingStateStatus, details?: any) => void;
  onSubtaskUpdate?: (subtasks: Subtask[]) => void;
}

export class NavixSupervisor {
  private router = new TaskComplexityRouter();
  private decomposer = new TaskDecomposer();

  public async processRequest(input: string, attachmentsCount: number, config?: SupervisorConfig) {
    const updateState = (state: ThinkingStateStatus, details?: any) => {
       config?.onStateChange?.(state, details);
       if (typeof window !== 'undefined') {
         window.dispatchEvent(new CustomEvent('navix_supervisor_state', { detail: { state, details } }));
       }
    };

    updateState('TASK_RECEIVED', 'Menerima instruksi');
    
    // 1. Determine Complexity
    updateState('UNDERSTANDING', 'Menilai kompleksitas & route');
    const route = this.router.evaluate(input, attachmentsCount);
    
    if (route.mode === 'DISCUSSION MODE') {
      updateState('COMPLETED', 'DISCUSSION MODE');
      return { route, subtasks: [] };
    }

    // 2. Planning & Decomposing (THINKING MODE)
    updateState('PLANNING', 'Memecah task menjadi subtasks');
    const { taskType } = classifyTask(input);
    const subtasks = this.decomposer.decompose(input, taskType, route.complexity);
    
    // Select Tools
    const tools = globalToolSelector.selectToolsForTask(taskType, route.complexity);
    
    // Create persistent task state
    const taskId = 'task_' + Date.now();
    const taskState = globalTaskManager.createTask(taskId, input, route.complexity, subtasks);
    
    if (config?.onSubtaskUpdate) {
      config.onSubtaskUpdate(subtasks);
    }
    
    return { route, subtasks, taskState, tools };
  }

  public async executeSubtasks(taskId: string, subtasks: Subtask[], config?: SupervisorConfig) {
    const task = globalTaskManager.getTask(taskId);
    if (!task) return;

    // Separate dependent and independent subtasks
    const independent = subtasks.filter(s => s.dependencies.length === 0);
    const dependent = subtasks.filter(s => s.dependencies.length > 0);

    config?.onStateChange?.('EXECUTING', 'Running parallel subtasks');
    
    // Run independent tasks in parallel
    await Promise.all(independent.map(async (sub) => {
       globalTaskManager.updateSubtask(taskId, sub.id, { status: 'IN_PROGRESS' });
       // Here we would call the respective engine
       const engine = globalEngineRegistry.getEngine(sub.assignedEngine);
       if (engine) {
          sub.output = await engine.execute({ query: sub.input });
       }
       globalTaskManager.updateSubtask(taskId, sub.id, { status: 'COMPLETED' });
    }));

    // Run dependent tasks sequentially
    for (const sub of dependent) {
       globalTaskManager.updateSubtask(taskId, sub.id, { status: 'IN_PROGRESS' });
       const engine = globalEngineRegistry.getEngine(sub.assignedEngine);
       if (engine) {
          sub.output = await engine.execute({ query: sub.input, context: task.toolResults });
       }
       globalTaskManager.updateSubtask(taskId, sub.id, { status: 'COMPLETED' });
    }
  }
}

export const globalSupervisor = new NavixSupervisor();
