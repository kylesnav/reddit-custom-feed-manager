import { NextRequest, NextResponse } from 'next/server';
import { RedditAuth } from '@/lib/auth/reddit-auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?error=${error}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?error=no_code`
      );
    }

    const cookieStore = cookies();
    const storedState = cookieStore.get('auth_state')?.value;
    const codeVerifier = cookieStore.get('pkce_verifier')?.value;

    if (!codeVerifier) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?error=no_verifier`
      );
    }

    if (state !== storedState) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?error=state_mismatch`
      );
    }

    const auth = RedditAuth.getInstance();
    const tokens = await auth.exchangeCodeForTokens(code, codeVerifier);

    cookieStore.delete('auth_state');
    cookieStore.delete('pkce_verifier');

    // Set the tokens cookie properly on the server side
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
    response.cookies.set('reddit_tokens', JSON.stringify(tokens), {
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?error=auth_failed`
    );
  }
}