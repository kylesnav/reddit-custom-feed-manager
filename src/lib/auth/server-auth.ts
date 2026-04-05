import { cookies } from 'next/headers';
import { AuthTokens } from '@/types/auth';

const REDDIT_TOKEN_URL = 'https://www.reddit.com/api/v1/access_token';

/**
 * Reads the httpOnly reddit_tokens cookie and returns parsed tokens,
 * refreshing if expired. Returns null if no valid session.
 */
export async function getServerTokens(): Promise<AuthTokens | null> {
  const cookieStore = cookies();
  const tokensCookie = cookieStore.get('reddit_tokens');

  if (!tokensCookie) return null;

  let tokens: AuthTokens;
  try {
    tokens = JSON.parse(tokensCookie.value);
  } catch {
    return null;
  }

  // Token still valid (with 60s buffer)
  if (Date.now() < tokens.expires_at - 60000) {
    return tokens;
  }

  // Try refresh
  if (!tokens.refresh_token) return null;

  try {
    const clientId = process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID || '';
    const clientSecret = process.env.REDDIT_CLIENT_SECRET || '';
    const authString = clientSecret
      ? `${clientId}:${clientSecret}`
      : `${clientId}:`;

    const response = await fetch(REDDIT_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(authString).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokens.refresh_token,
      }).toString(),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const refreshed: AuthTokens = {
      access_token: data.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000,
      scope: data.scope,
    };

    // Update the cookie with refreshed tokens
    cookieStore.set('reddit_tokens', JSON.stringify(refreshed), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return refreshed;
  } catch {
    return null;
  }
}

/** Clears the httpOnly token cookie. */
export function clearServerTokens(): void {
  const cookieStore = cookies();
  cookieStore.delete('reddit_tokens');
}
