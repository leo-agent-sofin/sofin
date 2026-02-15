import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getCurrentUser, logout, mockConnectStrava, isAuthenticated } from '../../lib/localStorage';

interface User {
  id: string;
  email: string;
  strava_id?: string;
  strava_ytd_km?: number;
  qr_code_url?: string;
  social_links?: any[];
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      router.push('/auth/login');
    }
    setLoading(false);
  }, [router]);

  const handleConnectStrava = async () => {
    try {
      if (!user) return;
      // Mock Strava connection - just update user with fake data
      const updated = mockConnectStrava(user.id);
      setUser(updated);
    } catch (err: any) {
      setError('Failed to connect Strava');
    }
  };

  const handleLogout = () => {
    logout();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded"
            >
              Log Out
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* User Info */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Account</h2>
            <p className="text-gray-700">{user.email}</p>
          </div>

          {/* Strava Section */}
          <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Strava Connection</h2>
            
            {user.strava_id ? (
              <div>
                <p className="text-green-600 font-semibold mb-2">✓ Connected to Strava</p>
                <p className="text-gray-700 mb-4">
                  YTD Cycling: <strong>{user.strava_ytd_km || 0} km</strong>
                </p>
                <Link href="/dashboard/qrcode">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">
                    View QR Code
                  </button>
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">
                  Connect your Strava account to display your cycling statistics
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

          {/* Social Links Section */}
          {user.strava_id && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Social Links</h2>
              <p className="text-gray-600 mb-4">
                Coming soon: Customize which social media profiles appear on your stats page
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
