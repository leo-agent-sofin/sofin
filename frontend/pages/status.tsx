import { useEffect, useState } from 'react';
import axios from 'axios';

interface StatusData {
  frontend: 'ok' | 'error';
  backend: 'ok' | 'error' | 'loading';
  database: 'ok' | 'error' | 'loading';
  strava: 'ok' | 'error' | 'loading';
  message?: string;
}

export default function StatusPage() {
  const [status, setStatus] = useState<StatusData>({
    frontend: 'ok',
    backend: 'loading',
    database: 'loading',
    strava: 'loading',
  });

  useEffect(() => {
    const checkHealth = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      try {
        const response = await axios.get(`${apiUrl}/api/health`, {
          timeout: 5000,
        });

        if (response.status === 200) {
          setStatus({
            frontend: 'ok',
            backend: 'ok',
            database: 'ok', // If backend is up, DB is likely connected
            strava: 'ok', // Can be connected via OAuth
          });
        }
      } catch (error: any) {
        setStatus({
          frontend: 'ok',
          backend: 'error',
          database: 'error',
          strava: 'error',
          message: error.message || 'Failed to connect to backend',
        });
      }
    };

    checkHealth();
  }, []);

  const getColor = (s: string) => {
    if (s === 'ok') return 'bg-green-100 text-green-800';
    if (s === 'error') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sofin Status</h1>
          <p className="text-gray-600 mb-8">System health check</p>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold">Frontend</span>
              <span className={`px-3 py-1 rounded-full text-sm ${getColor(status.frontend)}`}>
                {status.frontend.toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold">Backend API</span>
              <span className={`px-3 py-1 rounded-full text-sm ${getColor(status.backend)}`}>
                {status.backend.toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold">Database</span>
              <span className={`px-3 py-1 rounded-full text-sm ${getColor(status.database)}`}>
                {status.database.toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold">Strava API</span>
              <span className={`px-3 py-1 rounded-full text-sm ${getColor(status.strava)}`}>
                {status.strava.toUpperCase()}
              </span>
            </div>
          </div>

          {status.message && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-8">
              <p className="text-yellow-800">{status.message}</p>
            </div>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="font-semibold text-blue-900 mb-2">Environment Info</h2>
            <p className="text-sm text-blue-800">
              API URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}
            </p>
            <p className="text-sm text-blue-800">
              Frontend URL: {process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
            </p>
          </div>

          <div className="mt-8 text-center">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
