// Local storage utilities for Sofin (localStorage only, no database)
// Data is stored locally and lost on refresh

interface User {
  id: string;
  email: string;
  password: string;
  strava_id?: string;
  strava_ytd_km?: number;
  social_links?: Array<{ platform: string; url: string }>;
  qr_code_url?: string;
  created_at: string;
}

const USERS_STORAGE_KEY = 'sofin_users';
const CURRENT_USER_KEY = 'sofin_current_user';
const TOKEN_KEY = 'token';

export const generateId = () => {
  return 'user_' + Math.random().toString(36).substr(2, 9);
};

export const generateToken = () => {
  return 'token_' + Math.random().toString(36).substr(2, 20) + Math.random().toString(36).substr(2, 20);
};

// Get all users from localStorage
export const getAllUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  const users = localStorage.getItem(USERS_STORAGE_KEY);
  return users ? JSON.parse(users) : [];
};

// Get user by email
export const getUserByEmail = (email: string): User | null => {
  const users = getAllUsers();
  return users.find(u => u.email === email) || null;
};

// Get user by ID
export const getUserById = (id: string): User | null => {
  const users = getAllUsers();
  return users.find(u => u.id === id) || null;
};

// Signup - create new user
export const signup = (email: string, password: string): { user: User; token: string } => {
  const existing = getUserByEmail(email);
  if (existing) {
    throw new Error('Email already registered');
  }

  const user: User = {
    id: generateId(),
    email,
    password, // In real app, would be hashed!
    created_at: new Date().toISOString(),
  };

  const users = getAllUsers();
  users.push(user);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  const token = generateToken();
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

  return { user, token };
};

// Login - check credentials
export const login = (email: string, password: string): { user: User; token: string } => {
  const user = getUserByEmail(email);
  if (!user || user.password !== password) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken();
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

  return { user, token };
};

// Get current user
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(CURRENT_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

// Logout
export const logout = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
};

// Update user (e.g., connect Strava)
export const updateUser = (userId: string, updates: Partial<User>): User => {
  const users = getAllUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  const updated = { ...user, ...updates };
  const index = users.indexOf(user);
  users[index] = updated;
  
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
  
  return updated;
};

// Get token
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken() && !!getCurrentUser();
};

// Mock Strava connection
export const mockConnectStrava = (userId: string): User => {
  const user = getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Mock data: random YTD KM between 100-5000
  const ytd_km = Math.floor(Math.random() * 4900) + 100;
  
  return updateUser(userId, {
    strava_id: 'strava_' + Math.random().toString(36).substr(2, 8),
    strava_ytd_km: ytd_km,
  });
};

// Mock disconnect Strava
export const mockDisconnectStrava = (userId: string): User => {
  return updateUser(userId, {
    strava_id: undefined,
    strava_ytd_km: undefined,
  });
};

// Update social links
export const updateSocialLinks = (userId: string, links: Array<{ platform: string; url: string }>): User => {
  return updateUser(userId, { social_links: links });
};
