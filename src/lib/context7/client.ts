/**
 * Context7 MCP Client
 * 
 * This client provides integration with the Context7 MCP server
 * for enhanced code understanding and AI-assisted development.
 */

import { context7Config } from '../../../context7.config';

export interface Context7SearchResult {
  file: string;
  line: number;
  content: string;
  relevance: number;
  context?: string;
}

export interface Context7Analysis {
  complexity: number;
  dependencies: string[];
  suggestions: string[];
  relatedFiles: string[];
}

export class Context7Client {
  private baseUrl: string;
  private cache: Map<string, any> = new Map();

  constructor() {
    this.baseUrl = `http://${context7Config.server.host}:${context7Config.server.port}`;
  }

  /**
   * Search for code patterns or concepts
   */
  async search(query: string, options?: {
    limit?: number;
    filePattern?: string;
    contextOnly?: boolean;
  }): Promise<Context7SearchResult[]> {
    const cacheKey = `search:${query}:${JSON.stringify(options)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          ...options,
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const results = await response.json();
      this.cache.set(cacheKey, results);
      
      // Clear cache after timeout
      setTimeout(() => this.cache.delete(cacheKey), context7Config.server.cacheTimeout * 1000);
      
      return results;
    } catch (error) {
      console.error('Context7 search error:', error);
      return [];
    }
  }

  /**
   * Get context for a specific file or code section
   */
  async getContext(filePath: string, lineNumber?: number): Promise<{
    context: string;
    relatedFiles: string[];
    tags: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath,
          lineNumber,
        }),
      });

      if (!response.ok) {
        throw new Error(`Context retrieval failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Context7 context error:', error);
      return {
        context: '',
        relatedFiles: [],
        tags: [],
      };
    }
  }

  /**
   * Analyze code complexity and provide suggestions
   */
  async analyzeCode(filePath: string): Promise<Context7Analysis> {
    try {
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath }),
      });

      if (!response.ok) {
        throw new Error(`Code analysis failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Context7 analysis error:', error);
      return {
        complexity: 0,
        dependencies: [],
        suggestions: [],
        relatedFiles: [],
      };
    }
  }

  /**
   * Get semantic understanding of a code concept
   */
  async understand(concept: string, context?: string): Promise<{
    explanation: string;
    examples: Array<{ file: string; content: string }>;
    relatedConcepts: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/understand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error(`Understanding failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Context7 understanding error:', error);
      return {
        explanation: '',
        examples: [],
        relatedConcepts: [],
      };
    }
  }

  /**
   * Get test coverage information for a file
   */
  async getTestCoverage(filePath: string): Promise<{
    covered: boolean;
    testFiles: string[];
    coverage: number;
    suggestions: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/test-coverage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath }),
      });

      if (!response.ok) {
        throw new Error(`Test coverage retrieval failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Context7 test coverage error:', error);
      return {
        covered: false,
        testFiles: [],
        coverage: 0,
        suggestions: [],
      };
    }
  }

  /**
   * Clear the client cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const context7Client = new Context7Client();