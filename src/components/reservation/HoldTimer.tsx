'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';
import type { Hold } from '@/types/reservation';

interface HoldTimerProps {
  hold: Hold;
  onExpired: () => void;
}

export default function HoldTimer({ hold, onExpired }: HoldTimerProps) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const remaining = Math.max(0, hold.expiresAt - Date.now());
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        onExpired();
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [hold.expiresAt, onExpired]);

  const totalSeconds = Math.floor(timeLeft / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const percentage = (timeLeft / (10 * 60 * 1000)) * 100;

  const isUrgent = minutes < 2;
  const isCritical = minutes < 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`sticky top-0 z-30 p-4 shadow-lg ${
        isCritical
          ? 'bg-red-600'
          : isUrgent
          ? 'bg-orange-500'
          : 'bg-blue-600'
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            {isUrgent ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <AlertTriangle size={24} />
              </motion.div>
            ) : (
              <Clock size={24} />
            )}
            <div>
              <div className="text-sm opacity-90">
                {isCritical
                  ? '⚠️ EXPIRING SOON!'
                  : isUrgent
                  ? '⚠️ Almost out of time!'
                  : '⏰ Hold Active'}
              </div>
              <div className="text-xs opacity-75">
                Complete payment to secure your reservation
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold font-mono">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-xs opacity-75">remaining</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white"
            initial={{ width: '100%' }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Warning Messages */}
        {isUrgent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 text-xs text-white/90"
          >
            {isCritical ? (
              <span className="font-semibold">
                Your hold will expire in less than 1 minute! Complete payment now to keep your table.
              </span>
            ) : (
              <span>
                Only {minutes} minute{minutes !== 1 ? 's' : ''} left to complete your reservation.
              </span>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
