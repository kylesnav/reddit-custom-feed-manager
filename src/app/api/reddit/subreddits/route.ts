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
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '100';
    const after = searchParams.get('after') || '';
    
    // Build URL with parameters
    const url = new URL(`${REDDIT_API_BASE}/subreddits/mine/subscriber`);
    url.searchParams.set('limit', limit);
    if (after) url.searchParams.set('after', after);
    
    // Make the request to Reddit API from the server
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'User-Agent': process.env.REDDIT_USER_AGENT || 'CustomFeedManager/1.0',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Reddit API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to fetch subreddits', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}