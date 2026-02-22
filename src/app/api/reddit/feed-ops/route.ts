import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const REDDIT_API_BASE = 'https://oauth.reddit.com';

// Generic proxy for feed operations
export async function POST(request: NextRequest) {
  return handleFeedOperation(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return handleFeedOperation(request, 'PUT');
}

export async function DELETE(request: NextRequest) {
  return handleFeedOperation(request, 'DELETE');
}

async function handleFeedOperation(request: NextRequest, method: string) {
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
    
    // Get the Reddit endpoint from the request headers or body
    const endpoint = request.headers.get('X-Reddit-Endpoint');
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Missing Reddit endpoint' },
        { status: 400 }
      );
    }
    
    let body = undefined;
    if (method !== 'DELETE') {
      try {
        body = await request.json();
      } catch {
        // No body is okay for some operations
      }
    }
    
    // Determine if we need form-encoded or JSON
    let requestBody = undefined;
    let contentType = undefined;
    
    if (body && method !== 'DELETE') {
      // For adding subreddits to feeds, Reddit expects form-encoded data
      if (endpoint.includes('/r/') && method === 'PUT') {
        const formData = new URLSearchParams();
        if (body.model) {
          formData.append('model', JSON.stringify(body.model));
        }
        requestBody = formData.toString();
        contentType = 'application/x-www-form-urlencoded';
      } else {
        requestBody = JSON.stringify(body);
        contentType = 'application/json';
      }
    }
    
    // Make the request to Reddit API from the server
    const response = await fetch(`${REDDIT_API_BASE}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'User-Agent': process.env.REDDIT_USER_AGENT || 'CustomFeedManager/1.0',
        ...(contentType && { 'Content-Type': contentType }),
      },
      ...(requestBody && { body: requestBody }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Reddit API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Feed operation failed', details: errorText },
        { status: response.status }
      );
    }

    // Some operations return empty response
    const text = await response.text();
    if (!text) {
      return NextResponse.json({ success: true });
    }
    
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({ success: true, message: text });
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}