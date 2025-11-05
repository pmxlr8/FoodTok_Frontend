/**
 * Real Restaurant API Client
 * 
 * TEMPLATE FILE - Implement these functions when backend is ready
 * 
 * This file should mirror the mock-restaurants.ts interface exactly,
 * but make real HTTP requests to your backend.
 * 
 * Backend Endpoints Required:
 * - GET /api/restaurants/discovery?userId=X&limit=Y
 * - GET /api/restaurants/:id
 * - GET /api/restaurants/search?cuisine=X&price=Y...
 */

import { apiRequest } from './index';
import { RestaurantWithReservation, DiscoveryCard } from '@/types/reservation';

/**
 * Get personalized discovery feed (TikTok-style)
 * GET /api/restaurants/discovery?userId=X&limit=Y
 */
export async function getDiscoveryRestaurants(
  userId: string,
  limit: number = 20
): Promise<DiscoveryCard[]> {
  return apiRequest(`/restaurants/discovery?userId=${userId}&limit=${limit}`);
}

/**
 * Get detailed restaurant information
 * GET /api/restaurants/:id
 */
export async function getRestaurantById(
  restaurantId: string
): Promise<RestaurantWithReservation> {
  return apiRequest(`/restaurants/${restaurantId}`);
}

/**
 * Search restaurants with filters
 * GET /api/restaurants/search?cuisine=X&price=Y...
 */
export async function searchRestaurants(filters: {
  cuisine?: string[];
  priceRange?: string;
  rating?: number;
  distance?: number;
  query?: string;
}): Promise<RestaurantWithReservation[]> {
  const params = new URLSearchParams();
  
  if (filters.cuisine?.length) {
    params.append('cuisine', filters.cuisine.join(','));
  }
  if (filters.priceRange) {
    params.append('price', filters.priceRange);
  }
  if (filters.rating) {
    params.append('rating', filters.rating.toString());
  }
  if (filters.distance) {
    params.append('distance', filters.distance.toString());
  }
  if (filters.query) {
    params.append('q', filters.query);
  }

  return apiRequest(`/restaurants/search?${params.toString()}`);
}
