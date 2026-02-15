import axios from 'axios';
import { createActivity } from './db';

const STRAVA_API = 'https://www.strava.com/api/v3';

export async function syncStravaActivities(
  accessToken: string,
  athleteId: number,
  userId: string
): Promise<number> {
  let totalActivities = 0;
  let page = 1;
  let hasMore = true;

  try {
    while (hasMore) {
      const response = await axios.get(
        `${STRAVA_API}/athlete/activities`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            per_page: 200,
            page: page,
          },
        }
      );

      if (response.data.length === 0) {
        hasMore = false;
        break;
      }

      for (const activity of response.data) {
        // Only sync rides
        if (activity.type !== 'Ride') continue;

        await createActivity({
          user_id: userId,
          source: 'strava',
          source_activity_id: activity.id.toString(),
          title: activity.name,
          date: activity.start_date.split('T')[0],
          distance_km: Math.round((activity.distance / 1000) * 100) / 100,
          elevation_m: Math.round(activity.total_elevation_gain || 0),
          avg_speed_kmh: Math.round((activity.average_speed * 3.6) * 100) / 100,
          duration_seconds: activity.moving_time,
          activity_type: 'ride',
          raw_data: activity,
        });

        totalActivities++;
      }

      page++;
    }

    console.log(`✓ Synced ${totalActivities} activities from Strava for user ${userId}`);
  } catch (error) {
    console.error('Strava sync error:', error);
    throw error;
  }

  return totalActivities;
}

export async function fetchPersonalRecordsFromActivities(userId: string, activities: any[]) {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1); // Jan 1 of current year

  const ytdActivities = activities.filter(
    a => new Date(a.date) >= yearStart && a.activity_type === 'ride'
  );

  if (ytdActivities.length === 0) {
    return {
      ytd_km: 0,
      longest_ride_km: 0,
      longest_climb_m: 0,
      avg_speed_kmh: 0,
      total_elevation_m: 0,
      activity_count: 0,
    };
  }

  const ytd_km = Math.round(
    ytdActivities.reduce((sum, a) => sum + (a.distance_km || 0), 0) * 100
  ) / 100;

  const longest_ride_km = Math.max(...ytdActivities.map(a => a.distance_km || 0));

  const longest_climb_m = Math.max(...ytdActivities.map(a => a.elevation_m || 0));

  const validSpeeds = ytdActivities.filter(a => a.avg_speed_kmh && a.avg_speed_kmh > 0);
  const avg_speed_kmh = validSpeeds.length > 0
    ? Math.round(
        (validSpeeds.reduce((sum, a) => sum + a.avg_speed_kmh, 0) / validSpeeds.length) * 100
      ) / 100
    : 0;

  const total_elevation_m = ytdActivities.reduce((sum, a) => sum + (a.elevation_m || 0), 0);

  return {
    ytd_km,
    longest_ride_km,
    longest_climb_m,
    avg_speed_kmh,
    total_elevation_m,
    activity_count: ytdActivities.length,
  };
}
