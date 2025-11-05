/**
 * FoodTok API Client
 * 
 * Central API entry point - Switch between mock and real backend here
 * 
 * DEVELOPMENT MODE (Current):
 * - Uses mock-*.ts files with simulated data
 * - Includes network delays and race condition handling
 * - Perfect for frontend development
 * 
 * PRODUCTION MODE (When backend ready):
 * - Uncomment the real API imports
 * - Set NEXT_PUBLIC_API_URL in .env.local
 * - All components will automatically use real backend
 */

// ============================================================================
// CURRENT: MOCK APIs (Development)
// ============================================================================
import * as MockReservations from './mock-reservations';
import * as MockRestaurants from './mock-restaurants';
import * as Auth from './auth';

// Re-export auth APIs
export const loginUser = Auth.loginUser;
export const signupUser = Auth.signupUser;
export const updateUserPreferences = Auth.updateUserPreferences;
export const getUserProfile = Auth.getUserProfile;

// Re-export reservation APIs
export const checkAvailability = MockReservations.checkAvailability;
export const createHold = MockReservations.createHold;
export const getUserActiveHold = MockReservations.getUserActiveHold;
export const confirmReservation = MockReservations.confirmReservation;
export const getUserReservations = MockReservations.getUserReservations;
export const getReservationById = MockReservations.getReservationById;
export const modifyReservation = MockReservations.modifyReservation;
export const cancelReservation = MockReservations.cancelReservation;

// Re-export restaurant APIs
export const getDiscoveryRestaurants = MockRestaurants.getDiscoveryRestaurants;
export const getRestaurantById = MockRestaurants.getRestaurantById;
export const searchRestaurants = MockRestaurants.searchRestaurants;

// ============================================================================
// FUTURE: REAL APIs (Production)
// ============================================================================
// When backend is ready, uncomment these and comment out the mock imports above:
/*
export {
  checkAvailability,
  createHold,
  getUserActiveHold,
  confirmReservation,
  getUserReservations,
  getReservationById,
  modifyReservation,
  cancelReservation,
} from './reservations';

export {
  getDiscoveryRestaurants,
  getRestaurantById,
  searchRestaurants,
} from './restaurants';
*/

// ============================================================================
// API Configuration
// ============================================================================
export const API_CONFIG = {
  // Set in .env.local: NEXT_PUBLIC_API_URL=http://localhost:8080/api
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Helper function for API calls (when you build real APIs)
 * 
 * Usage:
 * const data = await apiRequest('/reservations/hold', {
 *   method: 'POST',
 *   body: { userId, restaurantId, date, time }
 * });
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.baseURL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...options.headers,
    },
  };

  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}
