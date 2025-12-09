/**
 * EmbeddingService - Handles text embeddings for RAG
 *
 * Uses OpenAI embeddings to convert text into vector representations
 * for semantic search and similarity matching.
 */

import { OpenAIEmbeddings } from '@langchain/openai';
import Log from '../utils/Log';

export interface EmbeddingConfig {
  apiKey?: string;
  model?: string;
  batchSize?: number;
}

export interface EmbeddedDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: Record<string, unknown>;
}

export class EmbeddingService {
  private embeddings: OpenAIEmbeddings;
  private model: string;

  constructor(config: EmbeddingConfig = {}) {
    const apiKey = config.apiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        'OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass it in config.'
      );
    }

    this.model = config.model || 'text-embedding-3-small';

    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: apiKey,
      modelName: this.model,
      batchSize: config.batchSize || 512,
    });

    Log.info(`EmbeddingService initialized with model: ${this.model}`);
  }

  /**
   * Generate embedding for a single text
   */
  async embedText(text: string): Promise<number[]> {
    try {
      const embedding = await this.embeddings.embedQuery(text);
      return embedding;
    } catch (error) {
      Log.error(`Failed to embed text: ${error}`);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts
   */
  async embedTexts(texts: string[]): Promise<number[][]> {
    try {
      Log.info(`Embedding ${texts.length} texts...`);
      const embeddings = await this.embeddings.embedDocuments(texts);
      Log.info(`Successfully embedded ${embeddings.length} texts`);
      return embeddings;
    } catch (error) {
      Log.error(`Failed to embed texts: ${error}`);
      throw error;
    }
  }

  /**
   * Embed a document with metadata
   */
  async embedDocument(
    id: string,
    content: string,
    metadata: Record<string, unknown> = {}
  ): Promise<EmbeddedDocument> {
    const embedding = await this.embedText(content);
    return {
      id,
      content,
      embedding,
      metadata,
    };
  }

  /**
   * Embed multiple documents
   */
  async embedDocuments(
    documents: { id: string; content: string; metadata?: Record<string, unknown> }[]
  ): Promise<EmbeddedDocument[]> {
    const contents = documents.map(d => d.content);
    const embeddings = await this.embedTexts(contents);

    return documents.map((doc, index) => ({
      id: doc.id,
      content: doc.content,
      embedding: embeddings[index],
      metadata: doc.metadata || {},
    }));
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embeddings must have the same dimension');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

export default EmbeddingService;
