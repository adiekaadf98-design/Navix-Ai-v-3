import { JobStatusResponse, GenerateRequest } from './APIContract';
import { globalModelRegistry } from './ModelRegistry';
import { globalTelemetry } from './Telemetry';
import { globalGPUWorker } from './GPUWorker';

export class JobManagerService {
    private jobs: Map<string, JobStatusResponse> = new Map();

    public async createJob(request: GenerateRequest): Promise<string> {
        const jobId = 'job_' + Date.now() + '_' + Math.random().toString(16).substring(2, 8);
        const model = globalModelRegistry.getModelForPipeline(request.type);

        const job: JobStatusResponse = {
            job_id: jobId,
            pipeline: request.type,
            status: 'QUEUED',
            progress: 0,
            current_stage: 'Waiting in queue',
            model: model ? model.name : 'Unknown Model',
            created_at: Date.now()
        };

        this.jobs.set(jobId, job);
        
        // Push to GPU worker asynchronously
        globalGPUWorker.enqueue(jobId, request);
        globalTelemetry.logJobStart();

        return jobId;
    }

    public getJobStatus(jobId: string): JobStatusResponse | null {
        return this.jobs.get(jobId) || null;
    }

    public updateJobStatus(jobId: string, updates: Partial<JobStatusResponse>) {
        const job = this.jobs.get(jobId);
        if (job) {
            Object.assign(job, updates);
        }
    }
}

export const globalJobManager = new JobManagerService();
