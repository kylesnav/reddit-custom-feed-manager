/**
 * Context7 MCP Configuration
 * 
 * Context7 is a Model Context Protocol server that helps manage context
 * for AI-powered applications. It provides:
 * - Semantic search across your codebase
 * - Context management for AI interactions
 * - Code understanding and navigation
 */

export const context7Config = {
  // Project metadata
  project: {
    name: 'Reddit Feed Manager',
    description: 'A Next.js application for managing Reddit custom feeds',
    version: '1.0.0',
  },

  // Context sources
  sources: [
    {
      type: 'directory',
      path: './src',
      include: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      exclude: ['**/node_modules/**', '**/.next/**'],
    },
    {
      type: 'directory',
      path: './tests',
      include: ['**/*.spec.ts', '**/*.test.ts'],
    },
  ],

  // Context rules
  rules: [
    {
      pattern: '**/api/**',
      context: 'API routes and backend logic',
      priority: 'high',
    },
    {
      pattern: '**/components/**',
      context: 'React components and UI elements',
      priority: 'medium',
    },
    {
      pattern: '**/lib/**',
      context: 'Core libraries and utilities',
      priority: 'high',
    },
    {
      pattern: '**/hooks/**',
      context: 'Custom React hooks',
      priority: 'medium',
    },
    {
      pattern: '**/store/**',
      context: 'State management with Zustand',
      priority: 'medium',
    },
  ],

  // Semantic tags for better context understanding
  tags: {
    authentication: ['auth', 'oauth', 'login', 'logout', 'token'],
    reddit: ['subreddit', 'feed', 'multireddit', 'custom feed'],
    ui: ['component', 'button', 'modal', 'card', 'input'],
    api: ['fetch', 'request', 'response', 'endpoint'],
    state: ['store', 'zustand', 'query', 'mutation'],
  },

  // MCP server settings
  server: {
    port: 3001,
    host: 'localhost',
    enableCache: true,
    cacheTimeout: 300, // 5 minutes
  },

  // Integration settings
  integrations: {
    playwright: {
      enabled: true,
      testDirectory: './tests',
    },
    nextjs: {
      enabled: true,
      appDirectory: './src/app',
    },
  },
};