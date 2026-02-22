# Testing & Development Tools Documentation

## Playwright E2E Testing

This project includes comprehensive end-to-end testing using Playwright.

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI mode (interactive)
npm run test:ui

# Debug tests
npm run test:debug

# View test report
npm run test:report
```

### Test Structure

Tests are located in the `tests/e2e` directory:
- `homepage.spec.ts` - Landing page tests
- `dashboard.spec.ts` - Dashboard functionality tests

### Writing Tests

Example test structure:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### Configuration

Playwright is configured in `playwright.config.ts`:
- Tests run against multiple browsers (Chrome, Firefox, Safari)
- Mobile viewports are included
- Automatic server startup before tests
- Screenshots on failure
- Trace collection for debugging

## Context7 MCP Integration

Context7 Model Context Protocol provides AI-powered code understanding and navigation.

### Starting Context7 Server

```bash
# Start Context7 MCP server
npm run context7

# Start in development mode
npm run context7:dev
```

The server runs on `http://localhost:3001` by default.

### Features

#### 1. Semantic Code Search
Search across the codebase using natural language:
```typescript
import { useContext7Search } from '@/hooks/use-context7';

const { results, search } = useContext7Search();
search('authentication flow');
```

#### 2. Code Analysis
Analyze code complexity and get suggestions:
```typescript
import { useContext7Analysis } from '@/hooks/use-context7';

const { analyze, analysis } = useContext7Analysis();
analyze('/src/lib/auth/reddit-auth.ts');
```

#### 3. Context Understanding
Get contextual information about code:
```typescript
import { useContext7Context } from '@/hooks/use-context7';

const { context, relatedFiles } = useContext7Context('/src/app/page.tsx', 42);
```

#### 4. Test Coverage
Check test coverage for files:
```typescript
import { useContext7TestCoverage } from '@/hooks/use-context7';

const { covered, testFiles, coverage } = useContext7TestCoverage('/src/components/ui/button.tsx');
```

### Configuration

Context7 is configured in `context7.config.ts`:
- Project metadata
- Source directories
- Context rules and priorities
- Semantic tags
- Server settings
- Framework integrations

### Using in Development

The Context7 integration provides:
- **Code Navigation**: Quickly find related code
- **AI Assistance**: Better context for AI-powered tools
- **Test Discovery**: Find tests for components
- **Dependency Analysis**: Understand code relationships
- **Complexity Metrics**: Identify areas for refactoring

### API Endpoints

When the Context7 server is running, these endpoints are available:

- `POST /search` - Search for code patterns
- `POST /context` - Get context for a file/line
- `POST /analyze` - Analyze code complexity
- `POST /understand` - Get semantic understanding
- `POST /test-coverage` - Get test coverage info

### React Hooks

Available hooks for React components:
- `useContext7Search()` - Search functionality
- `useContext7Analysis()` - Code analysis
- `useContext7Context()` - File context
- `useContext7Understanding()` - Concept understanding
- `useContext7TestCoverage()` - Test coverage
- `useContext7DevAssist()` - Combined development assistance

## Development Workflow

### Recommended Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. In a separate terminal, start Context7:
   ```bash
   npm run context7:dev
   ```

3. Run tests in watch mode:
   ```bash
   npm run test:ui
   ```

### Best Practices

1. **Write tests first**: Use TDD approach for new features
2. **Use Context7 for navigation**: Leverage semantic search instead of manual file browsing
3. **Check test coverage**: Ensure new code has corresponding tests
4. **Analyze complexity**: Use Context7 analysis before refactoring
5. **Document with context**: Context7 helps understand code relationships

### CI/CD Integration

Both Playwright and Context7 can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
```

## Troubleshooting

### Playwright Issues

**Browser installation failed**
```bash
npx playwright install --with-deps
```

**Tests timing out**
- Increase timeout in `playwright.config.ts`
- Check if dev server is running

**Screenshots not captured**
- Check `playwright.config.ts` screenshot settings
- Ensure `test-results` directory exists

### Context7 Issues

**Server won't start**
- Check if port 3001 is available
- Verify `@upstash/context7-mcp` is installed
- Check Node.js version (18+ required)

**Search returns no results**
- Ensure server is running
- Check file patterns in config
- Verify source directories exist

**Cache issues**
- Clear cache in client: `context7Client.clearCache()`
- Restart Context7 server

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Context7 MCP Documentation](https://github.com/upstash/context7)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)