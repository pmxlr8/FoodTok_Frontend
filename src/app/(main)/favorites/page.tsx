/**
 * Favorites Page
 * Display user's liked restaurants
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore, useDiscoveryStore } from '@/lib/stores';
import { Restaurant } from '@/types';
import { getRestaurantById } from '@/lib/api';
import { Star, MapPin, Heart, ArrowRight } from 'lucide-react';
import { formatCurrency, capitalizeWords } from '@/lib/utils';
import Image from 'next/image';

export default function FavoritesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { likedRestaurants } = useDiscoveryStore();
  
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user || likedRestaurants.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const restaurants = await Promise.all(
          likedRestaurants.map(async (id) => {
            const response = await getRestaurantById(id);
            return response;
          })
        );

        setFavoriteRestaurants(restaurants as any);
      } catch (error) {
        console.error('Failed to fetch favorite restaurants:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [user, likedRestaurants]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (favoriteRestaurants.length === 0) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="text-6xl">❤️</div>
          <div>
            <h2 className="text-2xl font-bold mb-2">No favorites yet</h2>
            <p className="text-muted-foreground">
              Start discovering restaurants and like the ones you want to remember!
            </p>
          </div>
          <Button onClick={() => router.push('/')} size="lg">
            Discover Restaurants
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Your Favorites</h1>
            <p className="text-muted-foreground">
              {favoriteRestaurants.length} restaurant{favoriteRestaurants.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Heart className="h-6 w-6 text-destructive fill-current" />
        </div>

        <div className="grid gap-4">
          {favoriteRestaurants.map((restaurant, index) => (
            <motion.div
              key={`fav-${restaurant.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card 
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/restaurant/${restaurant.id}`)}
              >
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Restaurant Image */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={restaurant.images[0]}
                        alt={restaurant.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                    
                    {/* Restaurant Info */}
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg truncate">{restaurant.name}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive flex-shrink-0"
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{restaurant.rating}</span>
                          <span className="text-sm text-muted-foreground">
                            ({restaurant.reviewCount})
                          </span>
                        </div>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm font-medium">{restaurant.priceRange}</span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                        {restaurant.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {restaurant.cuisine.slice(0, 2).map((cuisine) => (
                            <span
                              key={cuisine}
                              className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded"
                            >
                              {capitalizeWords(cuisine)}
                            </span>
                          ))}
                          {restaurant.cuisine.length > 2 && (
                            <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded">
                              +{restaurant.cuisine.length - 2} more
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{restaurant.location.city}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}