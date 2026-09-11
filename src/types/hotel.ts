export type RoomType = 'Standard' | 'Deluxe' | 'Executive Suite' | 'Ocean Villa' | 'Family Suite';

export type RoomStatus = 'available' | 'booked' | 'maintenance';

export interface Room {
  id: string;
  roomNumber: string;
  name: string;
  type: RoomType;
  pricePerNight: number;
  capacity: number;
  bedType: string;
  sizeSqM: number;
  floor: number;
  description: string;
  amenities: string[];
  imageUrl: string;
  status: RoomStatus;
  rating: number;
  reviewsCount: number;
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'checked_in' | 'completed';

export interface Booking {
  id: string;
  bookingNumber: string;
  roomId: string;
  roomNumber: string;
  roomName: string;
  roomType: RoomType;
  roomImageUrl: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  nights: number;
  guests: number;
  pricePerNight: number;
  subtotal: number;
  tax: number;
  totalPrice: number;
  paymentStatus: 'paid' | 'refunded';
  paymentMethod: 'credit_card';
  cardLast4: string;
  cardBrand: 'visa' | 'mastercard' | 'jcb' | 'amex';
  cardHolder: string;
  status: BookingStatus;
  createdAt: string; // ISO
  cancellationDate?: string;
  cancellationReason?: string;
  refundAmount?: number;
  refundPercent?: number;
  emailNotificationSent: boolean;
  mobileNotificationSent: boolean;
  specialRequests?: string;
}

export interface HotelNotification {
  id: string;
  type: 'email' | 'mobile_push';
  bookingId: string;
  bookingNumber: string;
  title: string;
  body: string;
  recipientEmail?: string;
  timestamp: string;
  read: boolean;
}

export interface MonthlyRevenueStats {
  month: string; // "2026-01", "2026-02", etc.
  monthLabel: string; // "มกราคม 2569"
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  grossRevenue: number;
  refundedRevenue: number;
  netRevenue: number;
  averageBookingValue: number;
  occupancyRate: number;
}

export interface CancellationPolicyInfo {
  hoursBeforeCheckIn: number;
  refundPercentage: number;
  descriptionThai: string;
}
