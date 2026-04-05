import { AuthTokens } from '@/types/auth';
import { RedditUser } from '@/types/reddit';

const REDDIT_AUTH_URL = 'https://www.reddit.com/api/v1/authorize';
const REDDIT_TOKEN_URL = 'https://www.reddit.com/api/v1/access_token';
const REDDIT_API_BASE = 'https://oauth.reddit.com';

export class RedditAuth {
  private static instance: RedditAuth;
  private clientId: string;
  private redirectUri: string;
  private scope: string;

  private constructor() {
    this.clientId = process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID || '';
    this.redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI || '';
    this.scope = [
      'identity',      // Required: Get user info
      'mysubreddits',  // Required: Get user's subscribed subreddits
      'read',          // Required: Read custom feeds and subreddit info
      'subscribe'      // Required: Manage custom feeds (create, update, delete)
    ].join(' ');
  }

  public static getInstance(): RedditAuth {
    if (!RedditAuth.instance) {
      RedditAuth.instance = new RedditAuth();
    }
    return RedditAuth.instance;
  }

  public getAuthorizationUrl(state: string, codeChallenge: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      state,
      redirect_uri: this.redirectUri,
      duration: 'permanent',
      scope: this.scope,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return `${REDDIT_AUTH_URL}?${params.toString()}`;
  }

  public async exchangeCodeForTokens(
    code: string,
    codeVerifier: string
  ): Promise<AuthTokens> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      code_verifier: codeVerifier,
    });

    // For web apps, we need to include the client secret
    const clientSecret = process.env.REDDIT_CLIENT_SECRET || '';
    const authString = clientSecret
      ? `${this.clientId}:${clientSecret}`
      : `${this.clientId}:`;

    const response = await fetch(REDDIT_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(authString).toString('base64')}`,
        'User-Agent': 'CustomFeedManager/1.0',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to exchange code for tokens');
    }

    const data = await response.json();
    const expiresAt = Date.now() + data.expires_in * 1000;

    const tokens: AuthTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: expiresAt,
      scope: data.scope,
    };

    return tokens;
  }

  public async getCurrentUser(accessToken: string): Promise<RedditUser> {
    const response = await fetch(`${REDDIT_API_BASE}/api/v1/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': process.env.REDDIT_USER_AGENT || 'CustomFeedManager/1.0',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user information');
    }

    return response.json();
  }
}
