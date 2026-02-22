/**
 * React hook for Context7 MCP integration
 * 
 * Provides easy access to Context7 features within React components
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { context7Client, Context7SearchResult, Context7Analysis } from '@/lib/context7/client';

export function useContext7Search(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [options, setOptions] = useState<{
    limit?: number;
    filePattern?: string;
    contextOnly?: boolean;
  }>({});

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['context7', 'search', query, options],
    queryFn: () => context7Client.search(query, options),
    enabled: query.length > 2,
    staleTime: 60 * 1000, // 1 minute
  });

  const search = useCallback((newQuery: string, newOptions = {}) => {
    setQuery(newQuery);
    setOptions(newOptions);
  }, []);

  return {
    results: data || [],
    isSearching: isLoading,
    error,
    search,
    refetch,
  };
}

export function useContext7Analysis() {
  const analysisMutation = useMutation({
    mutationFn: (filePath: string) => context7Client.analyzeCode(filePath),
  });

  return {
    analyze: analysisMutation.mutate,
    analysis: analysisMutation.data,
    isAnalyzing: analysisMutation.isPending,
    error: analysisMutation.error,
  };
}

export function useContext7Context(filePath?: string, lineNumber?: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['context7', 'context', filePath, lineNumber],
    queryFn: () => context7Client.getContext(filePath!, lineNumber),
    enabled: !!filePath,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    context: data?.context || '',
    relatedFiles: data?.relatedFiles || [],
    tags: data?.tags || [],
    isLoading,
    error,
  };
}

export function useContext7Understanding() {
  const [concept, setConcept] = useState('');
  const [context, setContext] = useState<string | undefined>();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['context7', 'understand', concept, context],
    queryFn: () => context7Client.understand(concept, context),
    enabled: concept.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const understand = useCallback((newConcept: string, newContext?: string) => {
    setConcept(newConcept);
    setContext(newContext);
  }, []);

  return {
    explanation: data?.explanation || '',
    examples: data?.examples || [],
    relatedConcepts: data?.relatedConcepts || [],
    isLoading,
    error,
    understand,
    refetch,
  };
}

export function useContext7TestCoverage(filePath?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['context7', 'test-coverage', filePath],
    queryFn: () => context7Client.getTestCoverage(filePath!),
    enabled: !!filePath,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    covered: data?.covered || false,
    testFiles: data?.testFiles || [],
    coverage: data?.coverage || 0,
    suggestions: data?.suggestions || [],
    isLoading,
    error,
  };
}

/**
 * Hook for development assistance with Context7
 */
export function useContext7DevAssist() {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Only enable in development
    setIsEnabled(process.env.NODE_ENV === 'development');
  }, []);

  const searchCode = useContext7Search();
  const analysis = useContext7Analysis();
  const understanding = useContext7Understanding();

  const getHelp = useCallback(async (topic: string) => {
    // Search for relevant code
    await searchCode.search(topic, { limit: 5 });
    
    // Get understanding of the concept
    await understanding.understand(topic);
  }, [searchCode, understanding]);

  const analyzeCurrentFile = useCallback(async (filePath: string) => {
    await analysis.analyze(filePath);
  }, [analysis]);

  return {
    isEnabled,
    searchResults: searchCode.results,
    currentAnalysis: analysis.analysis,
    conceptExplanation: understanding.explanation,
    getHelp,
    analyzeCurrentFile,
    isLoading: searchCode.isSearching || analysis.isAnalyzing || understanding.isLoading,
  };
}