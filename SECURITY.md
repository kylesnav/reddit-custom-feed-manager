# Security Configuration

## Environment Variables

This application requires several environment variables to function. These should be stored in a `.env.local` file which is **NEVER** committed to version control.

### Required Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual values:

- `NEXT_PUBLIC_REDDIT_CLIENT_ID`: Your Reddit app's client ID
- `REDDIT_CLIENT_SECRET`: Your Reddit app's client secret (keep this SECRET!)
- `NEXT_PUBLIC_REDIRECT_URI`: Must match exactly what's configured in your Reddit app
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`

## Important Security Notes

### Never Commit Secrets

- `.env.local` is gitignored and should NEVER be committed
- Never hardcode API keys or secrets in your code
- Review all commits before pushing to ensure no secrets are included

### Reddit App Configuration

1. Create a Reddit app at https://www.reddit.com/prefs/apps
2. Choose "web app" as the type
3. Set redirect URI to match your environment (e.g., `http://localhost:3000/api/auth/callback`)
4. Keep your client secret confidential

### OAuth Scopes

This app requests minimal Reddit permissions:
- `identity`: Get user info
- `mysubreddits`: Get user's subscribed subreddits
- `read`: Read custom feeds and subreddit info
- `subscribe`: Manage custom feeds

### Cookie Security

- Authentication tokens are stored in secure, httpOnly cookies
- Cookies use SameSite=strict to prevent CSRF attacks
- Tokens are automatically refreshed when expired

### Production Deployment

Before deploying to production:

1. Use HTTPS for all URLs
2. Update redirect URIs to production domain
3. Use strong, unique values for all secrets
4. Enable rate limiting
5. Implement proper logging and monitoring
6. Review and update CORS settings
7. Use environment-specific `.env` files

### Reporting Security Issues

If you discover a security vulnerability, please report it privately to the maintainers.

## Pre-commit Checklist

Before committing code:

- [ ] No API keys or secrets in code
- [ ] `.env.local` is not staged for commit  
- [ ] No debug code with sensitive data
- [ ] No hardcoded URLs with credentials
- [ ] Test files don't contain real credentials