import { logger } from '../utils/logger';
import { taskEngine } from './TaskEngine';

export class BackendCreativeEngine {
  async generateImage(prompt: string, aspectRatio: string = '1:1') {
    logger.info(`CreativeEngine: Generating image`, { prompt, aspectRatio });
    // This is a placeholder for the actual model integration which currently lives in server.ts
    // In a full migration, Vertex AI/Imagen logic would move here.
    return { status: 'queued', taskId: await taskEngine.submitTask('image_generation', { prompt, aspectRatio }) };
  }

  async generateVideo(prompt: string) {
    logger.info(`CreativeEngine: Generating video`, { prompt });
    return { status: 'queued', taskId: await taskEngine.submitTask('video_generation', { prompt }) };
  }

  async generateAudio(text: string) {
    logger.info(`CreativeEngine: Generating audio`, { text });
    return { status: 'queued', taskId: await taskEngine.submitTask('audio_generation', { text }) };
  }
}

export const creativeEngine = new BackendCreativeEngine();
