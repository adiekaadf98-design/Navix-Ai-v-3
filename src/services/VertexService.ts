export class VertexService {
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    return headers;
  }

  async generateImage(prompt: string, aspectRatio: string = "16:9"): Promise<string | null> {
    const startTime = performance.now();
    const cleanPrompt = (prompt || '').trim();
    console.log(`[VertexService] 🚀 Initiating Image Generation Request:`, {
      promptPreview: cleanPrompt.length > 60 ? cleanPrompt.substring(0, 60) + '...' : cleanPrompt,
      aspectRatio,
      timestamp: new Date().toISOString()
    });

    try {
      const preferredEngine = localStorage.getItem('ncp_image_engine') || 'vertex';
      const requestPayload = { prompt: cleanPrompt, aspectRatio, preferredEngine };
      
      const res = await fetch('/api/vertex-generate-image', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestPayload)
      });

      const durationMs = Math.round(performance.now() - startTime);
      console.log(`[VertexService] 📥 API Response Status: ${res.status} ${res.statusText} (${durationMs}ms)`);

      const data = await res.json().catch(() => ({}));
      
      console.log(`[VertexService] 📊 API Response Metadata:`, {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        success: data?.success,
        authMode: data?.authMode || 'default',
        engine: data?.engine || preferredEngine,
        latencyMs: durationMs,
        payloadSize: data?.imageBase64 ? `${Math.round(data.imageBase64.length / 1024)} KB` : '0 KB'
      });

      if (!res.ok || !data.success) {
        const errorMsg = data?.error || `Vertex AI API returned status ${res.status}: ${res.statusText}`;
        console.error(`[VertexService] ❌ Image generation failed with status ${res.status}:`, errorMsg);
        throw new Error(errorMsg);
      }

      const finalImage = data.imageBase64 || data.imageUrl || data.mediaUrl || data.url;
      if (!finalImage) {
        throw new Error('Vertex AI returned empty image payload');
      }

      console.log(`[VertexService] ✅ Image generation completed successfully in ${durationMs}ms`);
      return finalImage;
    } catch (error: any) {
      const durationMs = Math.round(performance.now() - startTime);
      console.error(`[VertexService] 💥 Exception in generateImage (${durationMs}ms):`, {
        message: error?.message || String(error),
        stack: error?.stack
      });
      throw error;
    }
  }

  async generateVideo(prompt: string): Promise<string> {
    const startTime = performance.now();
    try {
      console.log(`[VertexService] 🚀 Initiating Video Generation Request: "${prompt.substring(0, 50)}..."`);
      const res = await fetch('/api/generate-video/start', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ prompt })
      });
      const durationMs = Math.round(performance.now() - startTime);
      console.log(`[VertexService] 📥 Video API Response Status: ${res.status} ${res.statusText} (${durationMs}ms)`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Failed to generate video via Sovereign Engine (${res.status})`);
      }
      return data.operationName || '';
    } catch (error: any) {
      console.error("[VertexService] generateVideo error:", error);
      throw error;
    }
  }
}
