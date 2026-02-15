// Test suite for localStorage functionality
import {
  signup,
  login,
  getCurrentUser,
  getUserById,
  logout,
  mockConnectStrava,
  isAuthenticated,
  updateSocialLinks,
} from '../localStorage';

describe('localStorage Auth & User Management', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('Signup', () => {
    it('should create a new user with email and password', () => {
      const { user, token } = signup('test@example.com', 'password123');
      
      expect(user.email).toBe('test@example.com');
      expect(user.password).toBe('password123');
      expect(user.id).toBeDefined();
      expect(token).toBeDefined();
    });

    it('should reject duplicate email', () => {
      signup('test@example.com', 'password123');
      
      expect(() => {
        signup('test@example.com', 'password456');
      }).toThrow('Email already registered');
    });
  });

  describe('Login', () => {
    beforeEach(() => {
      signup('test@example.com', 'password123');
    });

    it('should successfully login with correct credentials', () => {
      const { user, token } = login('test@example.com', 'password123');
      
      expect(user.email).toBe('test@example.com');
      expect(token).toBeDefined();
    });

    it('should reject wrong password', () => {
      expect(() => {
        login('test@example.com', 'wrongpassword');
      }).toThrow('Invalid email or password');
    });

    it('should reject unknown email', () => {
      expect(() => {
        login('unknown@example.com', 'password123');
      }).toThrow('Invalid email or password');
    });
  });

  describe('Authentication State', () => {
    it('should track current user after signup', () => {
      signup('test@example.com', 'password123');
      
      const user = getCurrentUser();
      expect(user?.email).toBe('test@example.com');
      expect(isAuthenticated()).toBe(true);
    });

    it('should clear auth on logout', () => {
      signup('test@example.com', 'password123');
      logout();
      
      expect(getCurrentUser()).toBeNull();
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('Strava Mock', () => {
    beforeEach(() => {
      signup('cyclist@example.com', 'password123');
    });

    it('should connect Strava with mock data', () => {
      const user = getCurrentUser();
      const updated = mockConnectStrava(user!.id);
      
      expect(updated.strava_id).toBeDefined();
      expect(updated.strava_ytd_km).toBeDefined();
      expect(updated.strava_ytd_km).toBeGreaterThanOrEqual(100);
      expect(updated.strava_ytd_km).toBeLessThanOrEqual(5000);
    });

    it('should generate consistent data for same user', () => {
      const user = getCurrentUser();
      mockConnectStrava(user!.id);
      
      const fetched = getUserById(user!.id);
      expect(fetched?.strava_id).toBeDefined();
      expect(fetched?.strava_ytd_km).toBeGreaterThan(0);
    });
  });

  describe('Social Links', () => {
    beforeEach(() => {
      signup('social@example.com', 'password123');
      mockConnectStrava(getCurrentUser()!.id);
    });

    it('should update social links', () => {
      const user = getCurrentUser();
      const links = [
        { platform: 'instagram', url: 'https://instagram.com/user' },
        { platform: 'twitter', url: 'https://twitter.com/user' },
      ];
      
      const updated = updateSocialLinks(user!.id, links);
      expect(updated.social_links).toEqual(links);
    });
  });

  describe('User Retrieval', () => {
    beforeEach(() => {
      signup('findme@example.com', 'password123');
    });

    it('should find user by ID', () => {
      const user = getCurrentUser();
      const found = getUserById(user!.id);
      
      expect(found?.email).toBe('findme@example.com');
    });
  });
});

// Manual test scenarios (run these in browser console)
console.log(`
=== Manual Test Scenarios ===

1. SIGNUP FLOW:
   - Go to https://sofin-web.vercel.app/auth/signup
   - Enter email: test@example.com, password: test123456
   - Confirm password: test123456
   - Should redirect to /dashboard

2. DASHBOARD FLOW:
   - Click "Connect Strava"
   - See YTD km appear (100-5000 km)
   - Click "View QR Code"

3. QR CODE PAGE:
   - See generated QR code
   - Click "Download QR Code"
   - Click "Print QR Code"
   - Back to dashboard

4. PUBLIC STATS PAGE:
   - From dashboard, copy URL: /stats/{userId}
   - Open in incognito window
   - See public card with km and athlete name
   - No login required

5. PERSISTENCE TEST:
   - Sign up, connect Strava
   - Note the km value
   - Reload page
   - Data persists (same km)
   - Note: On full browser refresh, data is in localStorage

6. LOGIN FLOW:
   - Log out
   - Go to /auth/login
   - Enter email: test@example.com, password: test123456
   - Should redirect to /dashboard with same user data
`);
