export class PipelineClassifierService {
    public classify(prompt: string, hasImage: boolean, hasVideo: boolean): string {
        const p = prompt.toLowerCase();
        
        if (hasImage && hasVideo) return 'MOTION_TRANSFER';
        if (hasImage && (p.includes('video') || p.includes('gerak') || p.includes('animasi'))) return 'IMAGE_TO_VIDEO';
        if (hasImage) return 'IMAGE_TO_IMAGE';
        
        if (p.includes('video') || p.includes('animasi')) return 'TEXT_TO_VIDEO';
        if (p.includes('gambar') || p.includes('foto') || p.includes('lukisan') || p.includes('image')) return 'TEXT_TO_IMAGE';
        
        return 'TEXT_TO_TEXT'; // Base LLM behavior
    }
}

export const globalPipelineClassifier = new PipelineClassifierService();
