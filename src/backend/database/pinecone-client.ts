import { Pinecone } from '@pinecone-database/pinecone';
import { logger } from '../utils/logger';

export class VectorDatabase {
  private client: Pinecone | null = null;
  private indexName = process.env.PINECONE_INDEX || 'navix-memory';

  constructor() {
    this.init();
  }

  private init() {
    if (process.env.PINECONE_API_KEY) {
      try {
        this.client = new Pinecone({
          apiKey: process.env.PINECONE_API_KEY
        });
        logger.info('Connected to Pinecone (Vector DB Layer)');
      } catch (err) {
        logger.error('Pinecone Connection Error:', err);
      }
    } else {
      logger.warn('PINECONE_API_KEY not set. Vector DB is unavailable; knowledge retrieval will return no matches.');
    }
  }

  async upsert(id: string, vector: number[], metadata?: any) {
    if (this.client) {
      try {
        const index = this.client.index(this.indexName);
        await index.upsert([{ id, values: vector, metadata }] as any);
      } catch (err) {
        logger.error('Pinecone Upsert Error:', err);
      }
    } else {
      throw new Error('Pinecone is not configured. Set PINECONE_API_KEY and PINECONE_INDEX before ingesting vectors.');
    }
  }

  async query(vector: number[], topK: number = 5) {
    if (this.client) {
      try {
        const index = this.client.index(this.indexName);
        const results = await index.query({ topK, vector, includeMetadata: true });
        return results.matches;
      } catch (err) {
        logger.error('Pinecone Query Error:', err);
        return [];
      }
    } else {
      return []; // Not configured: return empty (honest "no matches"), never fabricated results.
    }
  }
}

export const pineconeClient = new VectorDatabase();
