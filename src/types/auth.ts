export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  tokens: AuthTokens | null;
  loading: boolean;
  error: string | null;
}

export interface AuthUser {
  id: string;
  name: string;
  icon_img?: string;
  snoovatar_img?: string;
  created_utc?: number;
  link_karma?: number;
  comment_karma?: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  scope: string;
}

export interface AuthCodeExchangeParams {
  code: string;
  state?: string;
}

export interface PKCECodeChallenge {
  code_verifier: string;
  code_challenge: string;
  code_challenge_method: 'S256';
}