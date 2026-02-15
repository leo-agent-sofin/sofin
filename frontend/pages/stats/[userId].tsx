import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getUserById } from '../../lib/localStorage';

interface Stats {
  id: string;
  email: string;
  strava_ytd_km?: number;
  social_links?: Array<{ platform: string; url: string }>;
}

const SOCIAL_ICONS: { [key: string]: string } = {
  instagram: '📷',
  facebook: 'f️',
  twitter: '𝕏',
  linkedin: 'in',
  tiktok: '♪',
  youtube: '▶',
  strava: '🏃',
  website: '🌐',
};

export default function StatsPage() {
  const router = useRouter();
  const { userId } = router.query;
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;

    try {
      const user = getUserById(userId as string);
      if (user && user.strava_id) {
        setStats({
          id: user.id,
          email: user.email,
          strava_ytd_km: user.strava_ytd_km || 0,
          social_links: user.social_links || [],
        });
      } else {
        setError('User not found or Strava not connected');
      }
    } catch (err: any) {
      setError('User not found');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 p-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-700 to-black h-20"></div>

          {/* Content */}
          <div className="p-8 text-center -mt-10 relative z-10">
            {/* Avatar placeholder */}
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-600 to-black rounded-full flex items-center justify-center text-white text-3xl font-bold">
              🚴
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">Sofin Athlete</h1>
            <p className="text-gray-600 mb-6">{stats.email.split('@')[0]}'s Cycling Stats</p>

            {/* Stats */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="text-4xl font-bold text-green-600 mb-1">
                {stats?.strava_ytd_km || 0}
              </div>
              <p className="text-gray-600 text-sm">Kilometers YTD</p>
            </div>

            {/* Social Links */}
            {stats?.social_links && stats.social_links.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3 font-semibold">Follow</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {stats.social_links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full text-xl transition"
                      title={link.platform}
                    >
                      {SOCIAL_ICONS[link.platform.toLowerCase()] || '🔗'}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <p className="text-xs text-gray-400">Powered by Sofin</p>
          </div>
        </div>

        {/* About Section */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">About Sofin</h2>
          <p className="text-gray-600 text-sm">
            Sofin lets athletes share their cycling statistics with a scannable QR code. 
            Connect your Strava account and share your progress!
          </p>
          <a
            href="/"
            className="mt-4 inline-block text-black hover:text-gray-700 font-semibold text-sm"
          >
            Learn more →
          </a>
        </div>
      </div>
    </div>
  );
}
