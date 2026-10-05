import { Subtask, TaskComplexity } from './Supervisor';

export interface TaskState {
  taskId: string;
  originalRequest: string;
  complexity: TaskComplexity;
  status: 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  subtasks: Subtask[];
  decisions: string[];
  errors: string[];
  completedSteps: string[];
  pendingSteps: string[];
  toolResults: Record<string, any>;
  engineResults: Record<string, any>;
  verificationResults: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export class TaskStateManager {
  private activeTasks: Map<string, TaskState> = new Map();
  private abortControllers: Map<string, AbortController> = new Map();

  public getOrCreateAbortController(taskId: string): AbortController {
    let controller = this.abortControllers.get(taskId);
    if (!controller) {
      controller = new AbortController();
      this.abortControllers.set(taskId, controller);
    }
    return controller;
  }

  public getAbortSignal(taskId: string): AbortSignal | undefined {
    return this.abortControllers.get(taskId)?.signal;
  }

  public registerAbortController(taskId: string, controller: AbortController) {
    this.abortControllers.set(taskId, controller);
  }

  public createTask(id: string, request: string, complexity: TaskComplexity, subtasks: Subtask[]): TaskState {
    this.getOrCreateAbortController(id);
    const task: TaskState = {
      taskId: id,
      originalRequest: request,
      complexity,
      status: 'IN_PROGRESS',
      subtasks,
      decisions: [],
      errors: [],
      completedSteps: [],
      pendingSteps: subtasks.map(s => s.id),
      toolResults: {},
      engineResults: {},
      verificationResults: {},
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.activeTasks.set(id, task);
    this.saveToStorage();
    return task;
  }

  public getTask(id: string): TaskState | undefined {
    return this.activeTasks.get(id);
  }

  public updateSubtask(taskId: string, subtaskId: string, updates: Partial<Subtask>) {
    const task = this.activeTasks.get(taskId);
    if (!task) return;
    
    const subtask = task.subtasks.find(s => s.id === subtaskId);
    if (subtask) {
      Object.assign(subtask, updates);
      task.updatedAt = Date.now();
      this.saveToStorage();
    }
  }

  public recordDecision(taskId: string, decision: string) {
    const task = this.activeTasks.get(taskId);
    if (task) {
      task.decisions.push(decision);
      task.updatedAt = Date.now();
      this.saveToStorage();
    }
  }

  public completeTask(taskId: string, resultDetails?: { engineResults?: any; verificationResults?: any; toolResults?: any }) {
    const task = this.activeTasks.get(taskId);
    if (task) {
      // Execution State Integrity: If already FAILED or CANCELLED, reject transition to COMPLETED
      if (task.status === 'FAILED' || task.status === 'CANCELLED') {
        console.warn(`[TaskStateManager] Blocked attempt to mark ${task.status} task [${taskId}] as COMPLETED.`);
        return;
      }

      const hasFailedSubtask = task.subtasks.some(s => s.status === 'FAILED');
      const hasUnfinishedSubtask = task.subtasks.length > 0 && task.subtasks.some(s => s.status === 'PENDING' || s.status === 'IN_PROGRESS');
      const verificationFailed = resultDetails?.verificationResults && resultDetails.verificationResults.passed === false;

      if (hasFailedSubtask || verificationFailed || hasUnfinishedSubtask) {
        task.status = 'FAILED';
        const reason = verificationFailed
          ? `Verification Gate Rejected: ${resultDetails?.verificationResults?.issues?.join('; ') || 'Failed rules'}`
          : hasFailedSubtask
            ? 'One or more subtasks failed during execution.'
            : 'Execution attempted completion while subtasks were still unfinished.';
        task.errors.push(reason);
      } else {
        task.status = 'COMPLETED';
        task.completedSteps = task.subtasks.map(s => s.id);
        task.pendingSteps = [];
      }

      if (resultDetails?.engineResults) {
        task.engineResults = { ...task.engineResults, ...resultDetails.engineResults };
      }
      if (resultDetails?.verificationResults) {
        task.verificationResults = { ...task.verificationResults, ...resultDetails.verificationResults };
      }
      if (resultDetails?.toolResults) {
        task.toolResults = { ...task.toolResults, ...resultDetails.toolResults };
      }

      task.updatedAt = Date.now();
      this.saveToStorage();
    }
  }

  public failTask(taskId: string, error?: string) {
    const task = this.activeTasks.get(taskId);
    if (task) {
      if (task.status === 'COMPLETED') return; // Preserve terminal COMPLETED
      if (task.status === 'CANCELLED') return; // Preserve explicit CANCELLED state
      task.status = 'FAILED';
      if (error) task.errors.push(error);
      const controller = this.abortControllers.get(taskId);
      if (controller && !controller.signal.aborted) {
        try { controller.abort(error || 'Task failed'); } catch {}
      }
      task.updatedAt = Date.now();
      this.saveToStorage();
    }
  }

  public cancelTask(taskId: string, reason?: string) {
    const task = this.activeTasks.get(taskId);
    if (task) {
      if (task.status === 'COMPLETED') {
        console.warn(`[TaskStateManager] Blocked attempt to cancel already COMPLETED task [${taskId}].`);
        return;
      }
      if (task.status === 'CANCELLED') return;
      task.status = 'CANCELLED';
      const cancelMsg = reason || 'Task cancelled by supervisor / cancellation request.';
      task.errors.push(cancelMsg);
      // Mark all pending or in-progress subtasks as FAILED
      task.subtasks.forEach(s => {
        if (s.status === 'PENDING' || s.status === 'IN_PROGRESS') {
          s.status = 'FAILED'; // Subtask reflects cancelled/unfulfilled state
        }
      });
      task.pendingSteps = [];

      // Propagate cancellation signal to underlying running execution
      const controller = this.abortControllers.get(taskId);
      if (controller && !controller.signal.aborted) {
        try { controller.abort(cancelMsg); } catch {}
      }

      task.updatedAt = Date.now();
      this.saveToStorage();
    }
  }

  public timeoutTask(taskId: string, timeoutMs: number) {
    const task = this.activeTasks.get(taskId);
    if (task) {
      if (task.status === 'COMPLETED') {
        console.warn(`[TaskStateManager] Blocked attempt to timeout already COMPLETED task [${taskId}].`);
        return;
      }
      if (task.status === 'CANCELLED') return;
      task.status = 'FAILED';
      const timeoutMsg = `EXECUTION_TIMEOUT: Task exceeded ${timeoutMs}ms limit.`;
      task.errors.push(timeoutMsg);
      task.subtasks.forEach(s => {
        if (s.status === 'PENDING' || s.status === 'IN_PROGRESS') {
          s.status = 'FAILED';
        }
      });
      task.pendingSteps = [];

      // Propagate timeout abort signal to underlying running execution
      const controller = this.abortControllers.get(taskId);
      if (controller && !controller.signal.aborted) {
        try { controller.abort(timeoutMsg); } catch {}
      }

      task.updatedAt = Date.now();
      this.saveToStorage();
    }
  }

  public getResumableTask(): TaskState | undefined {
    // Find the most recent paused or incomplete task
    let resumable: TaskState | undefined;
    for (const task of this.activeTasks.values()) {
      if (task.status === 'IN_PROGRESS' || task.status === 'PAUSED') {
        if (!resumable || task.updatedAt > resumable.updatedAt) {
          resumable = task;
        }
      }
    }
    return resumable;
  }

  private saveToStorage() {
    if (typeof localStorage !== 'undefined') {
       try {
         // APK Memory & LocalStorage Protection: prune older finished tasks beyond 25 items
         if (this.activeTasks.size > 25) {
           const finished = Array.from(this.activeTasks.entries())
             .filter(([_, t]) => t.status === 'COMPLETED' || t.status === 'FAILED')
             .sort((a, b) => a[1].updatedAt - b[1].updatedAt);
           for (let i = 0; i < finished.length && this.activeTasks.size > 25; i++) {
             this.activeTasks.delete(finished[i][0]);
           }
         }

         const tasksArray = Array.from(this.activeTasks.entries());
         localStorage.setItem('navix_task_state', JSON.stringify(tasksArray));
       } catch (e) {
         console.warn("Notice: LocalStorage bounded task save handled:", e);
       }
    }
  }

  public loadFromStorage() {
    if (typeof localStorage !== 'undefined') {
       try {
         const stored = localStorage.getItem('navix_task_state');
         if (stored) {
           const parsed = JSON.parse(stored);
           this.activeTasks = new Map(parsed);
         }
       } catch (e) {
         console.error("Failed to load task state", e);
       }
    }
  }
}

export const globalTaskManager = new TaskStateManager();
