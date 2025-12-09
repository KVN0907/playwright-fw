/**
 * RAG (Retrieval-Augmented Generation) Module
 *
 * This module provides intelligent test generation using vector similarity search
 * and large language models to create high-quality, contextually-aware tests.
 */

export { EmbeddingService } from './helpers';
export type { EmbeddingConfig, EmbeddedDocument } from './helpers';

export { VectorStoreHelper } from './helpers';
export type { VectorStoreConfig, SearchResult, TestDocument } from './helpers';

export { RAGTestGenerator } from './RAGTestGenerator';
export type {
  RAGConfig,
  EndpointInfo,
  ParameterInfo,
  RequestBodyInfo,
  ResponseInfo,
  RAGGenerationResult,
  RAGTestScript,
  RAGTestCase,
} from './RAGTestGenerator';
