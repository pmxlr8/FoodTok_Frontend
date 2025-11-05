'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Calendar, Clock, Users, CreditCard, Check, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import HoldTimer from '@/components/reservation/HoldTimer';
import { confirmReservation, getUserActiveHold } from '@/lib/api';
import type { Hold, Reservation } from '@/types/reservation';

export default function CheckoutPage() {
  const router = useRouter();
  const [hold, setHold] = useState<Hold | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [reservation, setReservation] = useState<Reservation | null>(null);
  
  // Payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    loadActiveHold();
  }, []);

  const loadActiveHold = async () => {
    try {
      const activeHold = await getUserActiveHold('current_user');
      if (!activeHold) {
        router.push('/');
        return;
      }
      setHold(activeHold);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExpired = () => {
    router.push('/');
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19);
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const validatePayment = (): boolean => {
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Invalid card number');
      return false;
    }
    if (expiry.length !== 5) {
      setError('Invalid expiry date');
      return false;
    }
    if (cvv.length !== 3) {
      setError('Invalid CVV');
      return false;
    }
    if (!name.trim()) {
      setError('Name is required');
      return false;
    }
    return true;
  };

  const handleConfirmReservation = async () => {
    if (!hold) return;
    
    setError('');
    
    if (!validatePayment()) {
      return;
    }

    setProcessing(true);

    try {
      const result = await confirmReservation({
        holdId: hold.holdId,
        userId: 'current_user',
        paymentMethod: {
          type: 'credit-card',
          last4: cardNumber.replace(/\s/g, '').slice(-4),
        },
        specialRequests: specialRequests || undefined,
      });

      setReservation(result.reservation);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hold) {
    return null;
  }

  if (reservation) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center"
            >
              <Check className="h-10 w-10 text-white" />
            </motion.div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold">
                Reservation Confirmed!
              </h1>
              <p className="text-lg text-muted-foreground">
                Your table is reserved at {reservation.restaurantName}
              </p>
            </div>

            <Card className="border-2 border-green-500/20 bg-green-500/10">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-2">Confirmation Code</p>
                <p className="text-3xl font-bold text-green-500 tracking-wider">
                  {reservation.confirmationCode}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Show this code when you arrive
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-semibold">
                      {new Date(reservation.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-semibold">{reservation.time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Party Size</p>
                    <p className="font-semibold">{reservation.partySize} guests</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Deposit Paid</p>
                    <p className="font-semibold">${reservation.depositAmount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">$25 per person</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => router.push('/')} className="flex-1">
                Back to Home
              </Button>
              <Button onClick={() => router.push('/reservations')} className="flex-1">
                View All Reservations
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const depositPerPerson = 25;
  const totalDeposit = depositPerPerson * hold.partySize;

  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <HoldTimer
            hold={hold}
            onExpired={handleExpired}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-8">
        <h1 className="text-3xl font-bold mb-8">Complete Your Reservation</h1>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Reservation Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Restaurant</p>
                    <p className="font-semibold text-lg">{hold.restaurantName}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {new Date(hold.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">{hold.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Party Size</p>
                      <p className="font-medium">{hold.partySize} guests</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Deposit (${depositPerPerson} × {hold.partySize})</span>
                      <span className="font-medium">${totalDeposit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Deposit</span>
                      <span>${totalDeposit.toFixed(2)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    💡 This deposit secures your table. Refund policy: 100% refund 24+ hours before, 50% refund 4-24 hours before, no refund within 4 hours.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <label className="block text-sm font-medium mb-2">
                  Special Requests (Optional)
                </label>
                <Textarea
                  value={specialRequests}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSpecialRequests(e.target.value)}
                  placeholder="Allergies, seating preferences, celebrations, etc."
                  rows={4}
                  className="w-full"
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Information</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Card Number
                    </label>
                    <Input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Test card: 4242 4242 4242 4242
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Expiry Date
                      </label>
                      <Input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        CVV
                      </label>
                      <Input
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                        placeholder="123"
                        maxLength={3}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Cardholder Name
                    </label>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleConfirmReservation}
                  disabled={processing}
                  className="w-full mt-6"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Pay ${totalDeposit.toFixed(2)} & Confirm
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  🔒 Secure payment processing
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
