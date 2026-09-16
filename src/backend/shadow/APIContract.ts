export interface GenerateRequest {
    type: 'TEXT_TO_IMAGE' | 'IMAGE_TO_IMAGE' | 'TEXT_TO_VIDEO' | 'IMAGE_TO_VIDEO' | 'MOTION_TRANSFER' | 'DOCUMENT_PROCESSING' | 'TEXT_TO_TEXT';
    prompt?: string;
    image_url?: string;
    video_url?: string;
    parameters?: Record<string, any>;
}

export interface JobStatusResponse {
    job_id: string;
    pipeline: string;
    status: 'QUEUED' | 'PROCESSING' | 'VALIDATING' | 'UPLOADING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'TIMEOUT' | 'QUOTA_EXCEEDED' | 'PAID_SERVICE_REQUIRED' | 'MODEL_NOT_AVAILABLE';
    progress: number;
    current_stage: string;
    model: string;
    created_at: number;
    completed_at?: number;
    output?: string | null;
    output_url?: string | null;
    metadata?: {
        provider: string;
        model: string;
        job_id: string;
        output_type: string;
        mime_type: string;
        byte_size: number;
        storage_path: string;
        created_at: number;
    } | null;
    error?: {
        code: string;
        message: string;
    } | null;
}

export interface TelemetryResponse {
    gpu_utilization: number | 'NOT_REQUIRED_FOR_CURRENT_PROVIDER' | 'NOT_AVAILABLE';
    vram_usage_mb: number | 'NOT_REQUIRED_FOR_CURRENT_PROVIDER' | 'NOT_AVAILABLE';
    avg_latency_ms: number | 'N/A';
    active_jobs: number;
    failed_jobs: number;
    successful_jobs: number;
}
