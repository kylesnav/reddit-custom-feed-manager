import { NextResponse } from 'next/server';
import { RedditAuth } from '@/lib/auth/reddit-auth';

export async function POST() {
  try {
    const auth = RedditAuth.getInstance();
    const tokens = auth.getStoredTokens();

    if (tokens?.access_token) {
      await auth.revokeToken(tokens.access_token);
    }

    auth.clearTokens();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}