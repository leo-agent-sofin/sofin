import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { userApi } from '../../lib/api';

interface User {
  id: string;
  email: string;
  qr_code_url?: string;
}

export default function QRCodePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userApi.getProfile();
        setUser(response.data);
      } catch (err: any) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleDownload = () => {
    if (!user?.qr_code_url) return;
    
    const link = document.createElement('a');
    link.href = user.qr_code_url;
    link.download = `sofin-qr-${user.id}.png`;
    link.click();
  };

  const handlePrint = () => {
    if (!user?.qr_code_url) return;
    
    const printWindow = window.open();
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Sofin QR Code</title>
            <style>
              body { display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
              img { max-width: 500px; }
            </style>
          </head>
          <body>
            <img src="${user.qr_code_url}" alt="Sofin QR Code" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user?.qr_code_url) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">QR Code Not Available</h1>
          <p className="text-gray-600 mb-4">{error || 'Connect your Strava account first'}</p>
          <Link href="/dashboard">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Your Sofin QR Code</h1>
          <p className="text-gray-600 text-center mb-6">
            Share this QR code to display your cycling stats
          </p>

          {/* QR Code Display */}
          <div className="flex justify-center mb-8 p-4 bg-gray-50 rounded-lg">
            <img
              src={user.qr_code_url}
              alt="Sofin QR Code"
              className="max-w-xs"
            />
          </div>

          {/* Stats Preview */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>QR Points to:</strong> {window.location.origin}/stats/{user.id}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleDownload}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
            >
              Download QR Code
            </button>
            
            <button
              onClick={handlePrint}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition"
            >
              Print QR Code
            </button>
          </div>

          <Link href="/dashboard">
            <button className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded transition">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
