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
    const response = await fetch(`${REDDIT_API_BASE}/api/multi/mine`, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'User-Agent': process.env.REDDIT_USER_AGENT || 'CustomFeedManager/1.0',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Reddit API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to fetch feeds', details: errorText },
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

export async function POST(request: NextRequest) {
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
    const body = await request.json();
    
    // Ensure the body is properly formatted for Reddit API
    let model: any = {};
    
    // Reddit API requires specific fields and format
    if (body.model) {
      model = body.model;
    } else {
      model.display_name = body.display_name;
      if (body.description_md) model.description_md = body.description_md;
      model.visibility = body.visibility || 'private';
      if (body.over_18) model.over_18 = body.over_18;
      
      // Handle subreddits - must be array of objects with 'name' property
      if (body.subreddits && body.subreddits.length > 0) {
        model.subreddits = body.subreddits.map((name: string) => 
          typeof name === 'string' ? { name } : name
        );
      }
    }
    
    const requestBody = { model };
    
    // Make the request to Reddit API from the server
    // Reddit API expects form-encoded data for this endpoint
    const formData = new URLSearchParams();
    formData.append('model', JSON.stringify(model));
    
    const response = await fetch(`${REDDIT_API_BASE}/api/multi`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'User-Agent': process.env.REDDIT_USER_AGENT || 'CustomFeedManager/1.0',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Reddit API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to create feed', details: errorText },
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