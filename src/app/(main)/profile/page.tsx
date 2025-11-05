/**
 * Profile Page
 * User profile with settings and order history
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore, useAppStore } from '@/lib/stores';
import { 
  User, 
  Settings, 
  Heart, 
  Clock, 
  LogOut,
  Edit3,
  MapPin,
  DollarSign,
  Utensils
} from 'lucide-react';
import { capitalizeWords } from '@/lib/utils';
import Image from 'next/image';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { addNotification } = useAppStore();

  const handleLogout = () => {
    logout();
    addNotification({
      type: 'success',
      title: 'Logged out successfully',
      message: 'See you next time!'
    });
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Restaurants Liked', value: '12', icon: Heart },
    { label: 'Total Reservations', value: '5', icon: Utensils },
    { label: 'Days Active', value: '14', icon: Clock },
  ];

  return (
    <div className="min-h-screen pb-20">
      <div className="p-6 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {user.profileImage ? (
                  <Image
                    src={user.profileImage}
                    alt={user.firstName}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <User className="h-10 w-10 text-primary" />
                )}
              </div>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-muted-foreground">{user.email}</p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4 text-center">
                  <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Food Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Your Food Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Favorite Cuisines</h4>
              <div className="flex flex-wrap gap-2">
                {user.preferences.cuisines.length > 0 ? (
                  user.preferences.cuisines.map((cuisine) => (
                    <span
                      key={cuisine}
                      className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                    >
                      {capitalizeWords(cuisine)}
                    </span>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No cuisines selected</p>
                )}
              </div>
            </div>

            {user.preferences.dietaryRestrictions.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Dietary Restrictions</h4>
                <div className="flex flex-wrap gap-2">
                  {user.preferences.dietaryRestrictions.map((restriction) => (
                    <span
                      key={restriction}
                      className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-full"
                    >
                      {capitalizeWords(restriction)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Budget
                </h4>
                <p className="text-muted-foreground">{user.preferences.priceRange}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Max Distance
                </h4>
                <p className="text-muted-foreground">{user.preferences.maxDistance} miles</p>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Update Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => router.push('/history')}
            >
              <Clock className="h-4 w-4 mr-3" />
              Order History
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => router.push('/favorites')}
            >
              <Heart className="h-4 w-4 mr-3" />
              Favorite Restaurants
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => router.push('/settings')}
            >
              <Settings className="h-4 w-4 mr-3" />
              Settings & Privacy
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Heart className="h-4 w-4 text-destructive fill-current" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Liked Sakura Sushi</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Utensils className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Ordered from Mama's Trattoria</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Updated food preferences</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="border-destructive/20">
          <CardContent className="p-4">
            <Button
              variant="outline"
              className="w-full text-destructive border-destructive/20 hover:bg-destructive hover:text-destructive-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}