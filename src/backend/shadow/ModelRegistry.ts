export interface ModelInfo {
    id: string;
    name: string;
    capabilities: string[];
    status: 'AVAILABLE_FREE' | 'AVAILABLE_PAID' | 'NOT_AVAILABLE' | 'NOT_INSTALLED';
    provider: string;
}

export class ModelRegistryService {
    private models: Map<string, ModelInfo> = new Map();

    constructor() {
        // FREE FIRST - Gemini models
        this.registerModel({ id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', capabilities: ['TEXT_TO_TEXT', 'DOCUMENT_PROCESSING', 'IMAGE_UNDERSTANDING'], status: 'AVAILABLE_FREE', provider: 'google' });
        this.registerModel({ id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', capabilities: ['TEXT_TO_TEXT', 'DOCUMENT_PROCESSING', 'IMAGE_UNDERSTANDING'], status: 'AVAILABLE_FREE', provider: 'google' });
        this.registerModel({ id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', capabilities: ['TEXT_TO_TEXT', 'IMAGE_UNDERSTANDING', 'VIDEO_UNDERSTANDING'], status: 'AVAILABLE_FREE', provider: 'google' });
        
        // These might be available via Vertex or Gemini APIs
        this.registerModel({ id: 'gemini-3.1-flash-image', name: 'Imagen 3.0 via Flash', capabilities: ['TEXT_TO_IMAGE'], status: 'AVAILABLE_FREE', provider: 'google' });
        this.registerModel({ id: 'veo-2.0-generate-001', name: 'Veo Video Generation', capabilities: ['TEXT_TO_VIDEO'], status: 'AVAILABLE_FREE', provider: 'google' });
        
        // PAID / NOT AVAILABLE
        this.registerModel({ id: 'flux-1-dev', name: 'Flux.1 Dev', capabilities: ['TEXT_TO_IMAGE'], status: 'NOT_INSTALLED', provider: 'external-gpu' });
        this.registerModel({ id: 'sdxl-refiner', name: 'SDXL Refiner', capabilities: ['IMAGE_TO_IMAGE'], status: 'NOT_INSTALLED', provider: 'external-gpu' });
        this.registerModel({ id: 'wan2-1', name: 'Wan2.1 (1.3B)', capabilities: ['TEXT_TO_VIDEO'], status: 'NOT_INSTALLED', provider: 'external-gpu' });
        this.registerModel({ id: 'mimic-motion', name: 'MimicMotion', capabilities: ['IMAGE_TO_VIDEO', 'MOTION_TRANSFER'], status: 'NOT_INSTALLED', provider: 'external-gpu' });
    }

    public registerModel(model: ModelInfo) {
        this.models.set(model.id, model);
    }

    public getModelForPipeline(pipeline: string, requireFree: boolean = true): ModelInfo | null {
        for (const model of this.models.values()) {
            if (model.capabilities.includes(pipeline)) {
                if (requireFree && model.status !== 'AVAILABLE_FREE') continue;
                return model;
            }
        }
        return null;
    }

    public getAllModels(): ModelInfo[] {
        return Array.from(this.models.values());
    }
}

export const globalModelRegistry = new ModelRegistryService();
