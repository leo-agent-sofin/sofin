import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { setToken } from '../../lib/api';
import { userApi, syncApi } from '../../lib/api';

interface User {
  id: string;
  email: string;
  name?: string;
  strava_id?: number;
  strava_ytd_km?: number;
  qr_code_url?: string;
  primary_slug?: string;
  social_links?: any[];
}

interface PersonalRecords {
  ytd_km: number;
  longest_ride_km: number;
  longest_climb_m: number;
  avg_speed_kmh: number;
  total_elevation_m: number;
  activity_count: number;
}

interface Activity {
  id: string;
  title: string;
  date: string;
  distance_km: number;
  elevation_m: number;
  avg_speed_kmh: number;
  source: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<PersonalRecords | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  // Load user profile on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    setToken(token);
    fetchUserData();
  }, [router]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userRes = await userApi.getProfile();
      const user = userRes.data;
      setUser(user);

      // Fetch records if Strava is connected
      if (user.strava_id) {
        try {
          const recordsRes = await userApi.getRecords();
          setRecords(recordsRes.data);
        } catch {
          console.error('Failed to fetch records');
        }

        try {
          const activitiesRes = await userApi.getActivities(10, 0);
          setActivities(activitiesRes.data.activities || []);
        } catch {
          console.error('Failed to fetch activities');
        }
      }
    } catch (err: any) {
      setError('Failed to load profile: ' + err.message);
      if (err.response?.status === 401) {
        router.push('/auth/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConnectStrava = async () => {
    try {
      window.location.href = '/auth/strava-connect';
    } catch (err: any) {
      setError('Failed to connect Strava');
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await syncApi.syncStrava();
      // Refetch data after sync
      await fetchUserData();
    } catch (err: any) {
      setError('Sync failed: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <p className="text-red-600 mb-4">Failed to load profile</p>
          <button
            onClick={handleLogout}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {user.name || user.email}
              </h1>
              {user.primary_slug && (
                <p className="text-gray-600 text-lg mt-1">
                  🔗 sofin.me/<strong>{user.primary_slug}</strong>
                </p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded"
            >
              Log Out
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Strava Connection */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Strava Connection</h2>
          
          {user.strava_id ? (
            <div className="space-y-4">
              <p className="text-green-600 font-semibold text-lg">✓ Connected to Strava</p>
              
              <div className="flex gap-4">
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded"
                >
                  {syncing ? 'Syncing...' : 'Sync Activities'}
                </button>
                <Link href="/dashboard/qrcode">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded">
                    View QR Code
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">
                Connect your Strava account to display your cycling statistics and activity history
              </p>
              <button
                onClick={handleConnectStrava}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded"
              >
                Connect Strava
              </button>
            </div>
          )}
        </div>

        {/* Personal Records */}
        {user.strava_id && records && (
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Year-to-Date Records</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* YTD KM */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-gray-600 font-semibold">Total Distance</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {records.ytd_km.toFixed(1)}
                </p>
                <p className="text-xs text-gray-600 mt-1">km</p>
              </div>

              {/* Longest Ride */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-gray-600 font-semibold">Longest Ride</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {records.longest_ride_km?.toFixed(1) || '—'}
                </p>
                <p className="text-xs text-gray-600 mt-1">km</p>
              </div>

              {/* Longest Climb */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                <p className="text-sm text-gray-600 font-semibold">Longest Climb</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {records.longest_climb_m?.toLocaleString() || '—'}
                </p>
                <p className="text-xs text-gray-600 mt-1">m</p>
              </div>

              {/* Avg Speed */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-gray-600 font-semibold">Avg Speed</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {records.avg_speed_kmh?.toFixed(1) || '—'}
                </p>
                <p className="text-xs text-gray-600 mt-1">km/h</p>
              </div>

              {/* Total Elevation */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                <p className="text-sm text-gray-600 font-semibold">Total Elevation</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {records.total_elevation_m?.toLocaleString() || '—'}
                </p>
                <p className="text-xs text-gray-600 mt-1">m</p>
              </div>

              {/* Activity Count */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                <p className="text-sm text-gray-600 font-semibold">Activities</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">
                  {records.activity_count || 0}
                </p>
                <p className="text-xs text-gray-600 mt-1">rides</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activities */}
        {user.strava_id && activities.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🏅 Recent Activities</h2>
            
            <div className="divide-y">
              {activities.map((activity) => (
                <div key={activity.id} className="py-4 flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {activity.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(activity.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      via {activity.source === 'strava' ? 'Strava' : 'Komoot'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      {activity.distance_km.toFixed(1)} km
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      ↗ {activity.elevation_m?.toLocaleString() || 0}m
                    </p>
                    <p className="text-sm text-gray-600">
                      ∅ {activity.avg_speed_kmh?.toFixed(1) || '—'} km/h
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {user.strava_id && activities.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">
              No activities yet. Click "Sync Activities" to fetch your Strava data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
