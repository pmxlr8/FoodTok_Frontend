/**
 * Real Reservation API Client
 * 
 * TEMPLATE FILE - Implement these functions when backend is ready
 * 
 * This file should mirror the mock-reservations.ts interface exactly,
 * but make real HTTP requests to your backend.
 * 
 * Backend Endpoints Required:
 * - POST   /api/reservations/availability
 * - POST   /api/reservations/hold
 * - GET    /api/reservations/hold/active?userId=X
 * - POST   /api/reservations/confirm
 * - GET    /api/reservations/user/:userId
 * - GET    /api/reservations/:id
 * - PATCH  /api/reservations/:id
 * - DELETE /api/reservations/:id
 */

import { apiRequest } from './index';
import {
  AvailabilityResponse,
  HoldResponse,
  ReservationResponse,
  CheckAvailabilityRequest,
  CreateHoldRequest,
  ConfirmReservationRequest,
  ModifyReservationRequest,
  ReservationListItem,
  Hold,
  Reservation,
} from '@/types/reservation';

/**
 * Check available time slots for a restaurant
 * GET /api/reservations/availability
 */
export async function checkAvailability(
  request: CheckAvailabilityRequest
): Promise<AvailabilityResponse> {
  return apiRequest('/reservations/availability', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Create a 10-minute hold on a table
 * POST /api/reservations/hold
 */
export async function createHold(
  request: CreateHoldRequest
): Promise<HoldResponse> {
  return apiRequest('/reservations/hold', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Get user's active hold (if any)
 * GET /api/reservations/hold/active?userId=X
 */
export async function getUserActiveHold(
  userId: string
): Promise<Hold | null> {
  return apiRequest(`/reservations/hold/active?userId=${userId}`);
}

/**
 * Pay deposit and confirm reservation
 * POST /api/reservations/confirm
 */
export async function confirmReservation(
  request: ConfirmReservationRequest
): Promise<ReservationResponse> {
  return apiRequest('/reservations/confirm', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Get user's reservations (upcoming or past)
 * GET /api/reservations/user/:userId?filter=upcoming|past
 */
export async function getUserReservations(
  userId: string,
  filter: 'upcoming' | 'past' = 'upcoming'
): Promise<ReservationListItem[]> {
  return apiRequest(`/reservations/user/${userId}?filter=${filter}`);
}

/**
 * Get specific reservation details
 * GET /api/reservations/:id
 */
export async function getReservationById(
  reservationId: string,
  userId: string
): Promise<Reservation> {
  return apiRequest(`/reservations/${reservationId}?userId=${userId}`);
}

/**
 * Modify existing reservation
 * PATCH /api/reservations/:id
 */
export async function modifyReservation(
  reservationId: string,
  userId: string,
  changes: ModifyReservationRequest
): Promise<Reservation> {
  return apiRequest(`/reservations/${reservationId}`, {
    method: 'PATCH',
    body: JSON.stringify({ userId, ...changes }),
  });
}

/**
 * Cancel reservation with refund calculation
 * DELETE /api/reservations/:id
 */
export async function cancelReservation(
  reservationId: string,
  userId: string
): Promise<{
  success: boolean;
  message: string;
  refundAmount: number;
  refundPercentage: number;
}> {
  return apiRequest(`/reservations/${reservationId}`, {
    method: 'DELETE',
    body: JSON.stringify({ userId }),
  });
}
