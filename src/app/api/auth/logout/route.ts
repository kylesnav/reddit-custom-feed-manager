import { NextResponse } from 'next/server';
import { getServerTokens, clearServerTokens } from '@/lib/auth/server-auth';

export async function POST() {
  try {
    const tokens = await getServerTokens();

    if (tokens?.access_token) {
      const clientId = process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID || '';

      await fetch('https://www.reddit.com/api/v1/revoke_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${clientId}:`).toString('base64')}`,
        },
        body: new URLSearchParams({
          token: tokens.access_token,
          token_type_hint: 'access_token',
        }).toString(),
      });
    }

    clearServerTokens();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    clearServerTokens();
    return NextResponse.json({ success: true });
  }
}
