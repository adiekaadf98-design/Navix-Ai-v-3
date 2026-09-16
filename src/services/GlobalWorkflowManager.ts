export type WorkflowPriority = 'HIGH' | 'NORMAL' | 'LOW';

export interface WorkflowTask<T = any> {
  id: string;
  name: string;
  priority: WorkflowPriority;
  execute: () => Promise<T>;
  resolve?: (value: T) => void;
  reject?: (reason?: any) => void;
}

export type WorkflowState = 'IDLE' | 'PROCESSING' | 'LOCKED';

/**
 * GlobalWorkflowManager acts as a centralized observer and arbiter
 * to prevent race conditions during complex agent executions, MCP skill 
 * resolutions, and UI state commits.
 */
class GlobalWorkflowManager {
  private queue: WorkflowTask[] = [];
  private state: WorkflowState = 'IDLE';
  private uiLockTime: number = 0;

  private emitStateChange() {
    // In a real robust environment, we might dispatch a CustomEvent or use a subscriber pattern
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('navix_workflow_state', {
        detail: { state: this.state, queueLength: this.queue.length }
      }));
    }
  }

  /**
   * Submit a new asynchronous workflow task to be executed safely
   * without colliding with other tasks.
   */
  public enqueue<T>(name: string, execute: () => Promise<T>, priority: WorkflowPriority = 'NORMAL'): Promise<T> {
    return new Promise((resolve, reject) => {
      const task: WorkflowTask<T> = {
        id: crypto.randomUUID(),
        name,
        priority,
        execute,
        resolve,
        reject
      };

      if (priority === 'HIGH') {
        this.queue.unshift(task); // High priority goes to front
      } else {
        this.queue.push(task);
      }

      this.processNext();
    });
  }

  /**
   * Acquire a UI lock to prevent the UI from updating while a critical
   * internal memory or engine shift is occurring.
   */
  public acquireUILock(timeoutMs: number = 5000): boolean {
    const now = Date.now();
    if (this.state === 'LOCKED' && now < this.uiLockTime) {
      console.warn("[WorkflowManager] Cannot acquire lock, UI is currently locked.");
      return false;
    }
    
    this.state = 'LOCKED';
    this.uiLockTime = now + timeoutMs;
    this.emitStateChange();
    console.log(`[WorkflowManager] UI Lock acquired until ${new Date(this.uiLockTime).toISOString()}`);
    return true;
  }

  /**
   * Release the UI lock manually before the timeout expires.
   */
  public releaseUILock() {
    this.state = 'IDLE';
    this.uiLockTime = 0;
    this.emitStateChange();
    console.log("[WorkflowManager] UI Lock released.");
    this.processNext();
  }

  private async processNext() {
    // Prevent processing if locked or already processing
    if (this.state === 'PROCESSING' || this.state === 'LOCKED') {
      return;
    }

    if (this.queue.length === 0) {
      this.state = 'IDLE';
      this.emitStateChange();
      return;
    }

    const task = this.queue.shift();
    if (!task) return;

    this.state = 'PROCESSING';
    this.emitStateChange();
    console.log(`[WorkflowManager] Executing workflow step: ${task.name} (${task.id})`);

    try {
      const result = await task.execute();
      if (task.resolve) task.resolve(result);
    } catch (error) {
      console.error(`[WorkflowManager] Workflow step failed: ${task.name}`, error);
      if (task.reject) task.reject(error);
    } finally {
      this.state = 'IDLE';
      this.emitStateChange();
      // Yield to event loop to allow UI to render intermediate states before next task
      setTimeout(() => this.processNext(), 50); 
    }
  }

  /**
   * Wait for all current workflows to settle.
   */
  public async waitForIdle(): Promise<void> {
    while (this.state !== 'IDLE' || this.queue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

export const workflowManager = new GlobalWorkflowManager();
