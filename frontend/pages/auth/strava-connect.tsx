import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { authApi } from '../../lib/api';

export default function StravaConnect() {
  const router = useRouter();
  const [status, setStatus] = useState('Connecting to Strava...');
  const [error, setError] = useState('');

  useEffect(() => {
    const initiateStrava = async () => {
      try {
        // Get user ID from token
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Not authenticated. Please log in first.');
          setTimeout(() => router.push('/auth/login'), 2000);
          return;
        }

        // Decode JWT to get user ID (simple approach)
        // In production, this should be fetched from /api/user/profile
        setStatus('Getting authorization URL...');
        const authRes = await authApi.getStravaAuthUrl();
        const { authUrl } = authRes.data;

        // We'll extract user ID from profile first
        const profileRes = await fetch('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!profileRes.ok) {
          setError('Failed to get user profile');
          return;
        }

        const profile = await profileRes.json();
        const userId = profile.id;

        // Store user ID for callback
        localStorage.setItem('strava_user_id', userId);

        setStatus('Redirecting to Strava...');
        
        // Redirect to Strava OAuth
        setTimeout(() => {
          window.location.href = authUrl;
        }, 500);
      } catch (err: any) {
        console.error('Strava connection error:', err);
        setError(err.message || 'Failed to connect to Strava');
      }
    };

    initiateStrava();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connecting to Strava</h1>
          
          {status && (
            <div className="py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p className="mt-4 text-gray-600">{status}</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <p className="font-semibold mb-2">Error</p>
              <p className="text-sm mb-4">{error}</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
