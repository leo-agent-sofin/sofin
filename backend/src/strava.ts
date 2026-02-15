import axios from 'axios';
import { StravaTokenResponse, StravaStats } from './types';

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';
const STRAVA_OAUTH_BASE = 'https://www.strava.com/oauth/authorize';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';

const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const REDIRECT_URI = process.env.STRAVA_REDIRECT_URI;

export function getStravaAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID!,
    response_type: 'code',
    redirect_uri: REDIRECT_URI!,
    scope: 'activity:read_all',
    state: state || 'state-token',
  });
  return `${STRAVA_OAUTH_BASE}?${params.toString()}`;
}

export async function exchangeAuthCode(code: string): Promise<StravaTokenResponse> {
  const response = await axios.post(STRAVA_TOKEN_URL, {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    grant_type: 'authorization_code',
  });
  return response.data;
}

export async function refreshAccessToken(refreshToken: string): Promise<StravaTokenResponse> {
  const response = await axios.post(STRAVA_TOKEN_URL, {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });
  return response.data;
}

export async function getAthleteStats(accessToken: string, athleteId: number): Promise<StravaStats> {
  const response = await axios.get(`${STRAVA_API_BASE}/athletes/${athleteId}/stats`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
}

export async function getAthleteProfile(accessToken: string): Promise<any> {
  const response = await axios.get(`${STRAVA_API_BASE}/athlete`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
}

export async function getYTDCyclingKm(accessToken: string, athleteId: number): Promise<number> {
  try {
    const stats = await getAthleteStats(accessToken, athleteId);
    // Distance is in meters, convert to km
    const kmValue = stats.all_ride_totals.distance / 1000;
    return Math.round(kmValue * 100) / 100; // Round to 2 decimals
  } catch (error) {
    console.error('Error fetching YTD cycling KM:', error);
    return 0;
  }
}

export async function refreshAndGetYTDKm(
  refreshToken: string,
  athleteId: number
): Promise<{ accessToken: string; ytdKm: number }> {
  const tokenData = await refreshAccessToken(refreshToken);
  const ytdKm = await getYTDCyclingKm(tokenData.access_token, athleteId);
  return { accessToken: tokenData.access_token, ytdKm };
}
