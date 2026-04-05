import { NextResponse } from 'next/server';
import { getServerTokens } from '@/lib/auth/server-auth';

const REDDIT_API_BASE = 'https://oauth.reddit.com';

export async function GET() {
  try {
    const tokens = await getServerTokens();

    if (!tokens) {
      return NextResponse.json({ authenticated: false });
    }

    // Fetch user info to return with the session
    const response = await fetch(`${REDDIT_API_BASE}/api/v1/me`, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        'User-Agent': process.env.REDDIT_USER_AGENT || 'CustomFeedManager/1.0',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ authenticated: false });
    }

    const user = await response.json();

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        icon_img: user.icon_img,
        created_utc: user.created_utc,
        link_karma: user.link_karma,
        comment_karma: user.comment_karma,
      },
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}
