import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const REDDIT_API_BASE = 'https://oauth.reddit.com';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const tokensCookie = cookieStore.get('reddit_tokens');
    
    if (!tokensCookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const tokens = JSON.parse(tokensCookie.value);
    
    // Make the request to Reddit API from the server
    const response = await fetch(`${REDDIT_API_BASE}/api/v1/me`, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'User-Agent': process.env.REDDIT_USER_AGENT || 'CustomFeedManager/1.0',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Reddit API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to fetch user data', details: errorText },
        { status: response.status }
      );
    }

    const userData = await response.json();
    return NextResponse.json(userData);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}