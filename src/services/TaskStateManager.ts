import { Subtask, TaskComplexity } from './Supervisor';

export interface TaskState {
  taskId: string;
  originalRequest: string;
  complexity: TaskComplexity;
  status: 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'FAILED';
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

  public createTask(id: string, request: string, complexity: TaskComplexity, subtasks: Subtask[]): TaskState {
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

  public completeTask(taskId: string) {
    const task = this.activeTasks.get(taskId);
    if (task) {
      task.status = 'COMPLETED';
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
         const tasksArray = Array.from(this.activeTasks.entries());
         localStorage.setItem('navix_task_state', JSON.stringify(tasksArray));
       } catch (e) {
         console.error("Failed to save task state", e);
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
