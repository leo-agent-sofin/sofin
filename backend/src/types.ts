export interface User {
  id: string;
  email: string;
  password_hash?: string;
  name?: string;
  strava_id?: number;
  strava_access_token?: string;
  strava_refresh_token?: string;
  strava_ytd_km?: number;
  qr_code_url?: string;
  primary_slug?: string;
  social_links?: SocialLink[];
  synced_sources?: any;
  last_sync_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface StravaTokenResponse {
  token_type: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete: StravaAthlete;
}

export interface StravaAthlete {
  id: number;
  firstname: string;
  lastname: string;
  profile: string;
}

export interface StravaStats {
  all_ride_totals: {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
  };
}

export interface QRCodeData {
  user_id: string;
  username: string;
  stats_url: string;
}
