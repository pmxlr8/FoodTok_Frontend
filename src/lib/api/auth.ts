/**
 * Authentication API stubs
 * TODO: Implement these when backend is ready
 */

import { User, UserPreferences } from '@/types';

// Simulated delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function loginUser(email: string, password: string): Promise<{ success: boolean; data?: User; error?: string }> {
  await delay(500);
  
  // Mock login - accepts any email with password "password123"
  if (password === 'password123') {
    return {
      success: true,
      data: {
        id: 'user_001',
        email,
        firstName: 'Demo',
        lastName: 'User',
        preferences: {
          cuisines: [],
          dietaryRestrictions: [],
          priceRange: '$$' as const,
          maxDistance: 10,
          favoriteRestaurants: []
        },
        createdAt: new Date(),
        updatedAt: new Date()
      } as User
    };
  }
  
  return {
    success: false,
    error: 'Invalid credentials'
  };
}

export async function signupUser(userData: any): Promise<{ success: boolean; data?: User; error?: string }> {
  await delay(500);
  
  return {
    success: true,
    data: {
      id: 'user_' + Date.now(),
      ...userData,
      preferences: {
        cuisines: [],
        dietaryRestrictions: [],
        priceRange: '$$' as const,
        maxDistance: 10,
        favoriteRestaurants: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    } as User
  };
}

export async function updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<{ success: boolean; data?: User; error?: string }> {
  await delay(300);
  
  return {
    success: true,
    data: {} as User // Will be updated by the store
  };
}

export async function getUserProfile(userId: string): Promise<{ success: boolean; data?: User; error?: string }> {
  await delay(300);
  
  return {
    success: true,
    data: {} as User
  };
}
