import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Sofin</h1>
            <p className="text-gray-600">Share your cycling stats via QR code</p>
          </div>

          <div className="space-y-4">
            <Link href="/auth/signup">
              <button className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-3 rounded-lg transition">
                Sign Up
              </button>
            </Link>

            <Link href="/auth/login">
              <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-lg transition">
                Log In
              </button>
            </Link>
          </div>

          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>How it works:</strong> Create an account, connect your Strava profile, and share your cycling stats with a unique QR code!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
