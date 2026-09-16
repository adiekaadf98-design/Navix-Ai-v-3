export class TaskEngine {
  private tasks: Map<string, any> = new Map();

  async submitTask(type: string, data: any): Promise<string> {
    const taskId = 'task_' + Math.random().toString(36).substr(2, 9);
    this.tasks.set(taskId, { id: taskId, type, data, status: 'processing', progress: 0 });
    
    // Process task in background
    // Tasks should be handled by JobManager now. We just return error if TaskEngine is invoked.
    const task = this.tasks.get(taskId);
    if (task) {
        task.status = 'failed';
        task.error = 'NO_FREE_MEDIA_BACKEND_FEASIBLE';
    }

    return taskId;
  }

  getTaskStatus(taskId: string) {
    return this.tasks.get(taskId);
  }
}
export const taskEngine = new TaskEngine();
