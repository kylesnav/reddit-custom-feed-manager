export interface RedditUser {
  id: string;
  name: string;
  icon_img: string;
  created_utc: number;
  link_karma: number;
  comment_karma: number;
  is_gold: boolean;
  is_mod: boolean;
  has_verified_email: boolean;
  subreddit?: {
    display_name: string;
    public_description: string;
    subscribers: number;
  };
}

export interface Subreddit {
  id: string;
  name: string;
  display_name: string;
  display_name_prefixed: string;
  title: string;
  public_description: string;
  description: string;
  subscribers: number;
  icon_img?: string;
  banner_img?: string;
  header_img?: string;
  community_icon?: string;
  over18: boolean;
  created_utc: number;
  url: string;
  user_is_subscriber?: boolean;
  user_is_moderator?: boolean;
  user_is_banned?: boolean;
}

export interface CustomFeed {
  name: string;
  display_name: string;
  description_md?: string;
  description_html?: string;
  copied_from?: string | null;
  subreddits: SubredditInFeed[];
  icon_url?: string;
  visibility: 'private' | 'public' | 'hidden';
  over_18: boolean;
  created_utc: number;
  path: string;
  owner: string;
  owner_id: string;
  can_edit: boolean;
  is_favorited?: boolean;
  num_subscribers?: number;
}

export interface SubredditInFeed {
  name: string;
  data?: Partial<Subreddit>;
}

export interface CreateCustomFeedInput {
  display_name: string;
  description_md?: string;
  icon_url?: string;
  visibility?: 'private' | 'public' | 'hidden';
  over_18?: boolean;
  subreddits?: string[];
}

export interface UpdateCustomFeedInput {
  display_name?: string;
  description_md?: string;
  icon_url?: string;
  visibility?: 'private' | 'public' | 'hidden';
  over_18?: boolean;
}

export interface RedditTokens {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  scope: string;
}

export interface RedditAPIError {
  error: string;
  error_description?: string;
  message?: string;
}

export interface RedditListing<T> {
  kind: string;
  data: {
    after?: string | null;
    before?: string | null;
    children: Array<{
      kind: string;
      data: T;
    }>;
    dist?: number | null;
    modhash?: string;
  };
}

export interface RateLimitInfo {
  remaining: number;
  reset: number;
  used: number;
}