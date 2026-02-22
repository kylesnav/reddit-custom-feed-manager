import { NextResponse } from 'next/server';
import { generatePKCEChallenge } from '@/lib/auth/pkce';
import { RedditAuth } from '@/lib/auth/reddit-auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const pkce = await generatePKCEChallenge();
    const state = Math.random().toString(36).substring(7);
    const auth = RedditAuth.getInstance();

    cookies().set('pkce_verifier', pkce.code_verifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
    });

    cookies().set('auth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
    });

    const authUrl = auth.getAuthorizationUrl(state, pkce.code_challenge);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?error=login_failed`
    );
  }
}