#!/usr/bin/env node

/**
 * Context7 MCP Server for Reddit Feed Manager
 * 
 * This script initializes and runs the Context7 Model Context Protocol server
 * for better AI-assisted development and code understanding.
 */

import { createServer } from '@upstash/context7-mcp';
import { context7Config } from '../context7.config';
import fs from 'fs';
import path from 'path';

async function startContext7Server() {
  console.log('🚀 Starting Context7 MCP Server...');

  try {
    // Create server instance
    const server = createServer({
      name: context7Config.project.name,
      description: context7Config.project.description,
      version: context7Config.project.version,
      capabilities: {
        search: true,
        context: true,
        codeAnalysis: true,
        semanticUnderstanding: true,
      },
    });

    // Register project sources
    for (const source of context7Config.sources) {
      console.log(`📁 Registering source: ${source.path}`);
      server.registerSource({
        type: source.type,
        path: path.resolve(process.cwd(), source.path),
        include: source.include,
        exclude: source.exclude,
      });
    }

    // Register context rules
    for (const rule of context7Config.rules) {
      server.registerRule({
        pattern: rule.pattern,
        context: rule.context,
        priority: rule.priority,
      });
    }

    // Register semantic tags
    Object.entries(context7Config.tags).forEach(([category, keywords]) => {
      server.registerTags({
        category,
        keywords,
      });
    });

    // Configure integrations
    if (context7Config.integrations.playwright.enabled) {
      server.registerIntegration({
        name: 'playwright',
        type: 'testing',
        config: {
          testDirectory: context7Config.integrations.playwright.testDirectory,
        },
      });
    }

    if (context7Config.integrations.nextjs.enabled) {
      server.registerIntegration({
        name: 'nextjs',
        type: 'framework',
        config: {
          appDirectory: context7Config.integrations.nextjs.appDirectory,
        },
      });
    }

    // Start the server
    await server.start({
      port: context7Config.server.port,
      host: context7Config.server.host,
      enableCache: context7Config.server.enableCache,
      cacheTimeout: context7Config.server.cacheTimeout,
    });

    console.log(`✅ Context7 MCP Server running on ${context7Config.server.host}:${context7Config.server.port}`);
    console.log('📝 Server capabilities:');
    console.log('   - Semantic code search');
    console.log('   - Context management for AI interactions');
    console.log('   - Code analysis and understanding');
    console.log('   - Integration with Playwright tests');
    console.log('   - Next.js framework support');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down Context7 MCP Server...');
      await server.stop();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start Context7 MCP Server:', error);
    process.exit(1);
  }
}

// Run the server
startContext7Server();