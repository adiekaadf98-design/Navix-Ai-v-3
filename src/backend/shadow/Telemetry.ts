import { JobStatusResponse, TelemetryResponse } from './APIContract';

export class TelemetryService {
    private successfulJobs = 0;
    private failedJobs = 0;
    private activeJobs = 0;
    private totalLatencyMs = 0;

    public logJobStart() {
        this.activeJobs++;
    }

    public logJobCompletion(latencyMs: number, success: boolean) {
        this.activeJobs = Math.max(0, this.activeJobs - 1);
        if (success) {
            this.successfulJobs++;
            this.totalLatencyMs += latencyMs;
        } else {
            this.failedJobs++;
        }
    }

    public getTelemetry(): TelemetryResponse {
        const avgLatency = this.successfulJobs > 0 ? Math.floor(this.totalLatencyMs / this.successfulJobs) : 'N/A';
        
        return {
            gpu_utilization: 'NOT_REQUIRED_FOR_CURRENT_PROVIDER',
            vram_usage_mb: 'NOT_REQUIRED_FOR_CURRENT_PROVIDER',
            avg_latency_ms: avgLatency,
            active_jobs: this.activeJobs,
            failed_jobs: this.failedJobs,
            successful_jobs: this.successfulJobs
        };
    }
}

export const globalTelemetry = new TelemetryService();
