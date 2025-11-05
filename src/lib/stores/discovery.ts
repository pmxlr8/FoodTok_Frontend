/**
 * Discovery Store
 * Manages the discovery queue and swipe interactions
 */

import { create } from 'zustand';
import { DiscoveryCard, SwipeAction, Restaurant } from '@/types';
import { getDiscoveryRestaurants } from '@/lib/api';

interface DiscoveryState {
  queue: DiscoveryCard[];
  currentIndex: number;
  isLoading: boolean;
  error: string | null;
  swipeHistory: SwipeAction[];
  likedRestaurants: string[];
  passedRestaurants: string[];
}

interface DiscoveryActions {
  loadQueue: (userId?: string) => Promise<void>;
  swipeCard: (direction: 'left' | 'right', restaurantId: string) => void;
  resetQueue: () => void;
  undoSwipe: () => void;
  getCurrentCard: () => DiscoveryCard | null;
  hasMoreCards: () => boolean;
  refillQueue: () => Promise<void>;
}

type DiscoveryStore = DiscoveryState & DiscoveryActions;

export const useDiscoveryStore = create<DiscoveryStore>((set, get) => ({
  // Initial state
  queue: [],
  currentIndex: 0,
  isLoading: false,
  error: null,
  swipeHistory: [],
  likedRestaurants: [],
  passedRestaurants: [],

  // Actions
  loadQueue: async (userId?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await getDiscoveryRestaurants(userId || 'default', 10);
      
      set({
        queue: response as any,
        currentIndex: 0,
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({
        error: 'Network error. Please try again.',
        isLoading: false
      });
    }
  },

  swipeCard: (direction: 'left' | 'right', restaurantId: string) => {
    const { currentIndex, queue, swipeHistory, likedRestaurants, passedRestaurants } = get();
    
    // Record the swipe action
    const swipeAction: SwipeAction = {
      direction,
      restaurantId,
      timestamp: new Date()
    };
    
    // Update lists based on swipe direction
    const newLikedRestaurants = direction === 'right' 
      ? [...likedRestaurants, restaurantId]
      : likedRestaurants;
    
    const newPassedRestaurants = direction === 'left'
      ? [...passedRestaurants, restaurantId]
      : passedRestaurants;
    
    set({
      currentIndex: currentIndex + 1,
      swipeHistory: [...swipeHistory, swipeAction],
      likedRestaurants: newLikedRestaurants,
      passedRestaurants: newPassedRestaurants
    });
    
    // If we're running low on cards, try to refill
    if (currentIndex + 2 >= queue.length) {
      get().refillQueue();
    }
  },

  resetQueue: () => {
    set({
      queue: [],
      currentIndex: 0,
      swipeHistory: [],
      likedRestaurants: [],
      passedRestaurants: [],
      error: null
    });
  },

  undoSwipe: () => {
    const { currentIndex, swipeHistory } = get();
    
    if (currentIndex > 0 && swipeHistory.length > 0) {
      const lastSwipe = swipeHistory[swipeHistory.length - 1];
      const newSwipeHistory = swipeHistory.slice(0, -1);
      
      // Remove from respective lists
      set(state => ({
        currentIndex: currentIndex - 1,
        swipeHistory: newSwipeHistory,
        likedRestaurants: state.likedRestaurants.filter(id => id !== lastSwipe.restaurantId),
        passedRestaurants: state.passedRestaurants.filter(id => id !== lastSwipe.restaurantId)
      }));
    }
  },

  getCurrentCard: () => {
    const { queue, currentIndex } = get();
    return queue[currentIndex] || null;
  },

  hasMoreCards: () => {
    const { queue, currentIndex } = get();
    return currentIndex < queue.length;
  },

  refillQueue: async () => {
    const { queue } = get();
    
    try {
      const response = await getDiscoveryRestaurants('default', 5);
      
      set({
        queue: [...queue, ...response] as any
      });
    } catch (error) {
      console.error('Failed to refill queue:', error);
    }
  }
}));