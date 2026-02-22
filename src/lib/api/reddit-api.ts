import {
  CustomFeed,
  CreateCustomFeedInput,
  UpdateCustomFeedInput,
  Subreddit,
  RedditListing,
  RateLimitInfo,
} from '@/types/reddit';
import { RedditAuth } from '@/lib/auth/reddit-auth';

const REDDIT_API_BASE = 'https://oauth.reddit.com';
const RATE_LIMIT_PER_MINUTE = 60;

export class RedditAPI {
  private static instance: RedditAPI;
  private auth: RedditAuth;
  private rateLimitInfo: RateLimitInfo = {
    remaining: RATE_LIMIT_PER_MINUTE,
    reset: Date.now() + 60000,
    used: 0,
  };
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;

  private constructor() {
    this.auth = RedditAuth.getInstance();
  }

  public static getInstance(): RedditAPI {
    if (!RedditAPI.instance) {
      RedditAPI.instance = new RedditAPI();
    }
    return RedditAPI.instance;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const executeRequest = async () => {
        try {
          await this.checkRateLimit();
          
          // Check if we're in the browser and need to use proxy
          if (typeof window !== 'undefined') {
            // Use our proxy API routes for browser requests
            let proxyUrl = '';
            
            // Map Reddit endpoints to our proxy routes
            if (endpoint.includes('/subreddits/mine/subscriber')) {
              const params = endpoint.split('?')[1] || '';
              proxyUrl = `/api/reddit/subreddits${params ? '?' + params : ''}`;
            } else if (endpoint === '/api/multi/mine') {
              proxyUrl = '/api/reddit/feeds';
            } else if (endpoint === '/api/multi') {
              proxyUrl = '/api/reddit/feeds';
            } else if (endpoint === '/api/v1/me') {
              proxyUrl = '/api/reddit/me';
            } else if (endpoint.startsWith('/api/multi/')) {
              // For feed operations like update, delete, add/remove subreddits
              // We'll create a generic feed operations proxy
              proxyUrl = `/api/reddit/feed-ops`;
              // Add the actual Reddit endpoint as a header
              options.headers = {
                ...options.headers,
                'X-Reddit-Endpoint': endpoint,
              };
            } else if (endpoint.includes('/r/') && endpoint.includes('/api/multi/')) {
              // For subreddit operations on feeds
              proxyUrl = `/api/reddit/feed-ops`;
              options.headers = {
                ...options.headers,
                'X-Reddit-Endpoint': endpoint,
              };
            } else if (endpoint.includes('/user/') && endpoint.includes('/m/') && endpoint.includes('/r/')) {
              // For adding/removing subreddits to/from custom feeds
              proxyUrl = `/api/reddit/feed-ops`;
              options.headers = {
                ...options.headers,
                'X-Reddit-Endpoint': endpoint,
              };
            } else if (endpoint.startsWith('/api/multi/user/') && endpoint.includes('/r/')) {
              // For adding/removing subreddits with full path
              proxyUrl = `/api/reddit/feed-ops`;
              options.headers = {
                ...options.headers,
                'X-Reddit-Endpoint': endpoint,
              };
            } else {
              // For other endpoints, we'll need to create more proxy routes
              console.warn('No proxy route for endpoint:', endpoint);
              throw new Error(`No proxy route configured for ${endpoint}`);
            }
            
            const response = await fetch(proxyUrl, options);
            
            if (!response.ok) {
              const error = await response.json().catch(() => ({ error: 'Unknown error' }));
              throw new Error(error.message || error.error || `Request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            resolve(data);
          } else {
            // Server-side direct request
            const accessToken = await this.auth.ensureValidToken();
            if (!accessToken) {
              throw new Error('No valid access token available');
            }

            const response = await fetch(`${REDDIT_API_BASE}${endpoint}`, {
              ...options,
              headers: {
                ...options.headers,
                Authorization: `Bearer ${accessToken}`,
                'User-Agent': 'CustomFeedManager/1.0.0',
              },
            });

            this.updateRateLimitInfo(response);

            if (!response.ok) {
              const error = await response.json().catch(() => ({ error: 'Unknown error' }));
              throw new Error(error.message || error.error || `Request failed with status ${response.status}`);
            }

            const data = await response.json();
            resolve(data);
          }
        } catch (error) {
          reject(error);
        }
      };

      this.requestQueue.push(executeRequest);
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        await request();
        await this.delay(1000);
      }
    }

    this.isProcessingQueue = false;
  }

  private async checkRateLimit(): Promise<void> {
    if (this.rateLimitInfo.remaining <= 0) {
      const waitTime = this.rateLimitInfo.reset - Date.now();
      if (waitTime > 0) {
        await this.delay(waitTime);
      }
      this.rateLimitInfo.remaining = RATE_LIMIT_PER_MINUTE;
      this.rateLimitInfo.used = 0;
    }
  }

  private updateRateLimitInfo(response: Response): void {
    const remaining = response.headers.get('x-ratelimit-remaining');
    const reset = response.headers.get('x-ratelimit-reset');
    const used = response.headers.get('x-ratelimit-used');

    if (remaining) this.rateLimitInfo.remaining = parseInt(remaining);
    if (reset) this.rateLimitInfo.reset = parseInt(reset) * 1000;
    if (used) this.rateLimitInfo.used = parseInt(used);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async getUserSubreddits(
    limit = 100,
    after?: string
  ): Promise<RedditListing<Subreddit>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(after && { after }),
    });

    return this.makeRequest<RedditListing<Subreddit>>(
      `/subreddits/mine/subscriber?${params}`
    );
  }

  public async getAllUserSubreddits(): Promise<Subreddit[]> {
    const subreddits: Subreddit[] = [];
    let after: string | null = null;

    do {
      const listing = await this.getUserSubreddits(100, after || undefined);
      subreddits.push(...listing.data.children.map(child => child.data));
      after = listing.data.after ?? null;
    } while (after);

    return subreddits;
  }

  public async getCustomFeeds(): Promise<CustomFeed[]> {
    const response = await this.makeRequest<any[]>('/api/multi/mine');
    return response.map(item => item.data);
  }

  public async getCustomFeed(username: string, feedName: string): Promise<CustomFeed> {
    const response = await this.makeRequest<{ data: CustomFeed }>(
      `/api/multi/user/${username}/m/${feedName}`
    );
    return response.data;
  }

  public async createCustomFeed(input: CreateCustomFeedInput): Promise<CustomFeed> {
    const model = {
      display_name: input.display_name,
      description_md: input.description_md || '',
      icon_url: input.icon_url || '',
      visibility: input.visibility || 'private',
      over_18: input.over_18 || false,
      subreddits: input.subreddits?.map(name => ({ name })) || [],
    };

    const response = await this.makeRequest<{ data: CustomFeed }>('/api/multi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model }),
    });

    return response.data;
  }

  public async updateCustomFeed(
    feedPath: string,
    input: UpdateCustomFeedInput
  ): Promise<CustomFeed> {
    const model = {
      ...(input.display_name && { display_name: input.display_name }),
      ...(input.description_md !== undefined && { description_md: input.description_md }),
      ...(input.icon_url !== undefined && { icon_url: input.icon_url }),
      ...(input.visibility && { visibility: input.visibility }),
      ...(input.over_18 !== undefined && { over_18: input.over_18 }),
    };

    const response = await this.makeRequest<{ data: CustomFeed }>(feedPath, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model }),
    });

    return response.data;
  }

  public async deleteCustomFeed(feedPath: string): Promise<void> {
    await this.makeRequest(feedPath, {
      method: 'DELETE',
    });
  }

  public async addSubredditToFeed(
    feedPath: string,
    subredditName: string
  ): Promise<void> {
    // Ensure feedPath starts with /api/multi/ if it doesn't already
    const fullPath = feedPath.startsWith('/api/multi/') 
      ? feedPath 
      : `/api/multi${feedPath}`;
    
    await this.makeRequest(`${fullPath}/r/${subredditName}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: { name: subredditName } }),
    });
  }

  public async removeSubredditFromFeed(
    feedPath: string,
    subredditName: string
  ): Promise<void> {
    // Ensure feedPath starts with /api/multi/ if it doesn't already
    const fullPath = feedPath.startsWith('/api/multi/') 
      ? feedPath 
      : `/api/multi${feedPath}`;
    
    await this.makeRequest(`${fullPath}/r/${subredditName}`, {
      method: 'DELETE',
    });
  }

  public async bulkAddSubredditsToFeed(
    feedPath: string,
    subredditNames: string[]
  ): Promise<void> {
    for (const name of subredditNames) {
      await this.addSubredditToFeed(feedPath, name);
    }
  }

  public async bulkRemoveSubredditsFromFeed(
    feedPath: string,
    subredditNames: string[]
  ): Promise<void> {
    for (const name of subredditNames) {
      await this.removeSubredditFromFeed(feedPath, name);
    }
  }

  public async copyCustomFeed(
    sourceFeedPath: string,
    newDisplayName: string
  ): Promise<CustomFeed> {
    const sourceFeed = await this.makeRequest<{ data: CustomFeed }>(sourceFeedPath);
    
    return this.createCustomFeed({
      display_name: newDisplayName,
      description_md: sourceFeed.data.description_md,
      icon_url: sourceFeed.data.icon_url,
      visibility: sourceFeed.data.visibility,
      over_18: sourceFeed.data.over_18,
      subreddits: sourceFeed.data.subreddits.map(s => s.name),
    });
  }

  public async searchSubreddits(query: string, limit = 25): Promise<Subreddit[]> {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      type: 'sr',
    });

    const response = await this.makeRequest<RedditListing<Subreddit>>(
      `/subreddits/search?${params}`
    );

    return response.data.children.map(child => child.data);
  }

  public async getSubredditInfo(subredditName: string): Promise<Subreddit> {
    const response = await this.makeRequest<{ data: Subreddit }>(
      `/r/${subredditName}/about`
    );
    return response.data;
  }

  public getRateLimitInfo(): RateLimitInfo {
    return { ...this.rateLimitInfo };
  }
}