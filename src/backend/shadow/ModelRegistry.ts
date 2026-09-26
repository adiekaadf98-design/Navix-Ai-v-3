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
        // FREE FIRST - Google AI Studio Newest Models
        this.registerModel({ id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (Flagship Terbaru)', capabilities: ['TEXT_TO_TEXT', 'DOCUMENT_PROCESSING', 'IMAGE_UNDERSTANDING'], status: 'AVAILABLE_FREE', provider: 'google' });
        this.registerModel({ id: 'gemini-flash-latest', name: 'Gemini Flash Latest', capabilities: ['TEXT_TO_TEXT', 'DOCUMENT_PROCESSING', 'IMAGE_UNDERSTANDING'], status: 'AVAILABLE_FREE', provider: 'google' });
        this.registerModel({ id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview (Deep Reasoning)', capabilities: ['TEXT_TO_TEXT', 'DOCUMENT_PROCESSING', 'IMAGE_UNDERSTANDING', 'CODE_GENERATION'], status: 'AVAILABLE_FREE', provider: 'google' });
        this.registerModel({ id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite (Ultra Fast)', capabilities: ['TEXT_TO_TEXT', 'IMAGE_UNDERSTANDING', 'VIDEO_UNDERSTANDING'], status: 'AVAILABLE_FREE', provider: 'google' });
        
        // Multimodal Models (Image & Video)
        this.registerModel({ id: 'gemini-3.1-flash-image', name: 'Gemini 3.1 Flash Image', capabilities: ['TEXT_TO_IMAGE'], status: 'AVAILABLE_FREE', provider: 'google' });
        this.registerModel({ id: 'veo-3.1-lite-generate-preview', name: 'Veo 3.1 Lite Video Generation', capabilities: ['TEXT_TO_VIDEO'], status: 'AVAILABLE_FREE', provider: 'google' });
        
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
