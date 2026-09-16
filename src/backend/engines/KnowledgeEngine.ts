import { pineconeClient } from '../database/pinecone-client';
import { logger } from '../utils/logger';
import { GoogleGenAI } from '@google/genai';

/**
 * NAVIX Knowledge Engine (RAG System)
 * Handles ingestion of documents, vectorization, and knowledge retrieval.
 */
export class KnowledgeEngine {
  private aiClient: GoogleGenAI | null = null;

  constructor() {
    if (process.env.GEMINI_API_KEY) {
      const apiKey = process.env.GEMINI_API_KEY.trim();
      this.aiClient = new GoogleGenAI({
        httpOptions: {
          headers: {
            "x-goog-api-key": apiKey,
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }

  async ingestDocument(docId: string, text: string, metadata: any = {}) {
    logger.info(`Ingesting document to Knowledge Engine: ${docId}`);
    try {
      if (!this.aiClient) throw new Error("Gemini API Client not initialized for embeddings.");
      
      // Get embeddings for the document chunk using text-embedding-004
      const response = await this.aiClient.models.embedContent({
        model: 'text-embedding-004',
        contents: text,
      });

      const vector = response.embeddings?.[0]?.values;
      
      if (vector && vector.length > 0) {
        await pineconeClient.upsert(docId, vector, { ...metadata, text_snippet: text.substring(0, 200) });
        logger.info(`Document ${docId} successfully vectorized and stored.`);
        return { success: true };
      }
      throw new Error("Failed to generate vector embeddings.");
    } catch (err: any) {
      logger.error(`Failed to ingest document ${docId}:`, err);
      return { success: false, error: err.message };
    }
  }

  async searchKnowledge(query: string, topK: number = 3) {
    logger.info(`Searching Knowledge Engine for: ${query}`);
    try {
      if (!this.aiClient) {
         throw new Error('Knowledge Engine is not configured: GEMINI_API_KEY is required for embeddings.');
      }

      // 1. Embed the search query
      const response = await this.aiClient.models.embedContent({
        model: 'text-embedding-004',
        contents: query,
      });

      const queryVector = response.embeddings?.[0]?.values;
      if (!queryVector) throw new Error("Could not vectorize query.");

      // 2. Search Pinecone Vector DB
      const matches = await pineconeClient.query(queryVector, topK);
      
      return matches.map(match => ({
        score: match.score,
        metadata: match.metadata
      }));

    } catch (err: any) {
      logger.error('Knowledge search failed:', err);
      return [];
    }
  }
}

export const knowledgeEngine = new KnowledgeEngine();
