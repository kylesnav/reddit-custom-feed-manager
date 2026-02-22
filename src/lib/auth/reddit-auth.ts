import { AuthTokens } from '@/types/auth';
import { RedditUser } from '@/types/reddit';
import Cookies from 'js-cookie';

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

    this.storeTokens(tokens);
    return tokens;
  }

  public async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const response = await fetch(REDDIT_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${this.clientId}:`).toString('base64')}`,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const data = await response.json();
    const expiresAt = Date.now() + data.expires_in * 1000;

    const tokens: AuthTokens = {
      access_token: data.access_token,
      refresh_token: refreshToken,
      expires_at: expiresAt,
      scope: data.scope,
    };

    this.storeTokens(tokens);
    return tokens;
  }

  public async getCurrentUser(accessToken: string): Promise<RedditUser> {
    // Use our API proxy when running in the browser
    if (typeof window !== 'undefined') {
      const response = await fetch('/api/reddit/me');

      if (!response.ok) {
        throw new Error('Failed to fetch user information');
      }

      return response.json();
    } else {
      // Server-side direct call
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

  public storeTokens(tokens: AuthTokens): void {
    if (typeof window !== 'undefined') {
      Cookies.set('reddit_tokens', JSON.stringify(tokens), {
        expires: 7,
        secure: true,
        sameSite: 'strict',
      });
    }
  }

  public getStoredTokens(): AuthTokens | null {
    if (typeof window !== 'undefined') {
      const tokensStr = Cookies.get('reddit_tokens');
      if (tokensStr) {
        try {
          return JSON.parse(tokensStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  public clearTokens(): void {
    if (typeof window !== 'undefined') {
      Cookies.remove('reddit_tokens');
    }
  }

  public async ensureValidToken(): Promise<string | null> {
    const tokens = this.getStoredTokens();
    if (!tokens) return null;

    if (Date.now() < tokens.expires_at - 60000) {
      return tokens.access_token;
    }

    if (tokens.refresh_token) {
      try {
        const newTokens = await this.refreshAccessToken(tokens.refresh_token);
        return newTokens.access_token;
      } catch {
        this.clearTokens();
        return null;
      }
    }

    return null;
  }

  public async revokeToken(token: string, tokenType: 'access_token' | 'refresh_token' = 'access_token'): Promise<void> {
    const params = new URLSearchParams({
      token,
      token_type_hint: tokenType,
    });

    await fetch('https://www.reddit.com/api/v1/revoke_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${this.clientId}:`).toString('base64')}`,
      },
      body: params.toString(),
    });

    this.clearTokens();
  }
}