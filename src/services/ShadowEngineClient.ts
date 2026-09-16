export class ShadowEngineClient {
    public static async generate(request: any): Promise<any> {
        const res = await fetch('/api/v1/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    }

    public static async pollJobStatus(jobId: string, onProgress?: (status: any) => void): Promise<any> {
        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/v1/job-status/${jobId}`);
                    if (!res.ok) throw new Error('Failed to fetch job status');
                    const data = await res.json();
                    
                    if (onProgress) onProgress(data);

                    if (data.status === 'COMPLETED') {
                        clearInterval(interval);
                        resolve(data);
                    } else if (data.status === 'FAILED' || data.status === 'TIMEOUT' || data.status === 'CANCELLED' || data.status === 'QUOTA_EXCEEDED' || data.status === 'PAID_SERVICE_REQUIRED' || data.status === 'MODEL_NOT_AVAILABLE') {
                        clearInterval(interval);
                        let errorMsg = 'Job failed';
                        if (data.error && data.error.message) errorMsg = data.error.message;
                        else if (typeof data.error === 'string') errorMsg = data.error;
                        reject(new Error(errorMsg));
                    }
                } catch (e) {
                    clearInterval(interval);
                    reject(e);
                }
            }, 1000);
        });
    }
}
