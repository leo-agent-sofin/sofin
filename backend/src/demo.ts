// Demo/Mock data for testing without database connection
// Enable with DEMO_MODE=true environment variable

export const DEMO_MODE = process.env.DEMO_MODE === 'true';

export const DEMO_USER = {
  id: 'demo-user-123',
  email: 'demo@sofin.app',
  strava_id: 99999999,
  strava_ytd_km: 1250.50,
  qr_code_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  social_links: [
    { platform: 'instagram', url: 'https://instagram.com/demo' },
    { platform: 'twitter', url: 'https://twitter.com/demo' },
  ],
};

export function getDemoUser() {
  return { ...DEMO_USER };
}

export function generateDemoQRCode(): string {
  // Return a simple 1x1 transparent PNG as placeholder
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
}
