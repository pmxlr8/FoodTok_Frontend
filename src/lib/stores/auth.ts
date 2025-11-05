/**
 * Authentication Store
 * Manages user authentication state and related actions
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserPreferences } from '@/types';
import { loginUser, signupUser, updateUserPreferences, getUserProfile } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<boolean>;
  logout: () => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await loginUser(email, password);
          
          if (response.success && response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            return true;
          } else {
            set({
              error: response.error || 'Login failed',
              isLoading: false
            });
            return false;
          }
        } catch (error) {
          set({
            error: 'Network error. Please try again.',
            isLoading: false
          });
          return false;
        }
      },

      signup: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await signupUser(userData);
          
          if (response.success && response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            return true;
          } else {
            set({
              error: response.error || 'Signup failed',
              isLoading: false
            });
            return false;
          }
        } catch (error) {
          set({
            error: 'Network error. Please try again.',
            isLoading: false
          });
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null
        });
      },

      updatePreferences: async (preferences: Partial<UserPreferences>) => {
        const { user } = get();
        if (!user) return false;

        set({ isLoading: true, error: null });
        
        try {
          const response = await updateUserPreferences(user.id, preferences);
          
          if (response.success && response.data) {
            set({
              user: response.data,
              isLoading: false,
              error: null
            });
            return true;
          } else {
            set({
              error: response.error || 'Failed to update preferences',
              isLoading: false
            });
            return false;
          }
        } catch (error) {
          set({
            error: 'Network error. Please try again.',
            isLoading: false
          });
          return false;
        }
      },

      refreshUser: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const response = await getUserProfile(user.id);
          if (response.success && response.data) {
            set({ user: response.data });
          }
        } catch (error) {
          console.error('Failed to refresh user:', error);
        }
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'foodtok-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);