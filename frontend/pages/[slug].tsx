import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { statsApi } from '../lib/api';

interface PublicProfile {
  id: string;
  name: string;
  slug: string;
  strava_ytd_km: number;
  personal_records?: {
    ytd_km: number;
    longest_ride_km: number;
    longest_climb_m: number;
    avg_speed_kmh: number;
    total_elevation_m: number;
    activity_count: number;
  };
  social_links?: any[];
}

export default function PublicProfile() {
  const router = useRouter();
  const { slug } = router.query;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug || typeof slug !== 'string') return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await statsApi.getPublicStats(slug);
        setProfile(response.data);
      } catch (err: any) {
        setError('Profile not found');
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">
            The cyclist profile you're looking for doesn't exist or hasn't shared their data yet.
          </p>
          <a href="/">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">
              Back to Sofin
            </button>
          </a>
        </div>
      </div>
    );
  }

  const records = profile.personal_records;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900">{profile.name}</h1>
          <p className="text-gray-600 mt-2">Cyclist on Sofin</p>
          <p className="text-sm text-gray-500 mt-4">sofin.me/{profile.slug}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto p-4 py-8">
        {/* YTD KM - Large Hero Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-8 text-white mb-8">
          <p className="text-green-100 text-lg font-semibold mb-2">Year-to-Date Total</p>
          <p className="text-6xl font-bold">{profile.strava_ytd_km.toFixed(1)}</p>
          <p className="text-green-100 text-2xl mt-2">kilometers</p>
        </div>

        {/* Personal Records Grid */}
        {records && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Longest Ride */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Longest Ride</h3>
                <span className="text-3xl">🚴</span>
              </div>
              <p className="text-4xl font-bold text-blue-600">
                {records.longest_ride_km?.toFixed(1) || '—'}
              </p>
              <p className="text-gray-600 mt-2">kilometers</p>
            </div>

            {/* Longest Climb */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Longest Climb</h3>
                <span className="text-3xl">⛰️</span>
              </div>
              <p className="text-4xl font-bold text-red-600">
                {records.longest_climb_m?.toLocaleString() || '—'}
              </p>
              <p className="text-gray-600 mt-2">meters</p>
            </div>

            {/* Average Speed */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Average Speed</h3>
                <span className="text-3xl">⚡</span>
              </div>
              <p className="text-4xl font-bold text-purple-600">
                {records.avg_speed_kmh?.toFixed(1) || '—'}
              </p>
              <p className="text-gray-600 mt-2">km/h</p>
            </div>

            {/* Total Elevation */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Elevation</h3>
                <span className="text-3xl">📈</span>
              </div>
              <p className="text-4xl font-bold text-yellow-600">
                {records.total_elevation_m?.toLocaleString() || '—'}
              </p>
              <p className="text-gray-600 mt-2">meters</p>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        {records && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-600 font-semibold">Total Activities</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">
                  {records.activity_count}
                </p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Total Distance</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {records.ytd_km.toFixed(0)}km
                </p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Total Elevation</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {(records.total_elevation_m / 1000).toFixed(1)}km
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Social Links */}
        {profile.social_links && profile.social_links.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Follow {profile.name}</h2>
            <div className="flex gap-4 flex-wrap">
              {profile.social_links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded"
                >
                  {link.platform === 'instagram' && '📷'} 
                  {link.platform === 'twitter' && '𝕏'}
                  {link.platform === 'facebook' && '👍'}
                  {link.platform === 'strava' && '🚴'}
                  {' '} {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Want your own Sofin profile?</p>
          <a href="/">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg">
              Create Your Profile
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
