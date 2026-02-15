import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { authApi } from '../../lib/api';

export default function StravaCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('Processing Strava connection...');
  const [error, setError] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      try {
        const { code } = router.query;
        const userId = localStorage.getItem('strava_user_id');

        if (!code || !userId) {
          setError('Invalid callback parameters');
          return;
        }

        setStatus('Exchanging authorization code...');
        const response = await authApi.stravaCallback(code as string, userId);
        
        setStatus('Success! Redirecting...');
        localStorage.removeItem('strava_user_id');
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to connect Strava');
        setStatus('');
      }
    };

    if (router.isReady) {
      processCallback();
    }
  }, [router.isReady, router.query]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connecting to Strava</h1>
          
          {status && (
            <div className="py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
              <p className="mt-4 text-gray-600">{status}</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded"
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
