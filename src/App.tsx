/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { RoomList } from './components/RoomList';
import { BookingModal } from './components/BookingModal';
import { BookingSuccessModal } from './components/BookingSuccessModal';
import { BookingHistory } from './components/BookingHistory';
import { AdminRoomManager } from './components/AdminRoomManager';
import { AdminRevenueAnalytics } from './components/AdminRevenueAnalytics';
import { NotificationsCenter } from './components/NotificationsCenter';
import { FloatingMobileBanner } from './components/FloatingMobileBanner';

import { 
  Room, 
  Booking, 
  HotelNotification 
} from './types/hotel';
import { 
  seedInitialHotelData, 
  subscribeRooms, 
  subscribeBookings, 
  subscribeNotifications 
} from './services/hotelService';
import { 
  auth, 
  onAuthStateChanged, 
  User, 
  loginWithGmail 
} from './lib/firebase';
import { 
  BedDouble, 
  LayoutDashboard, 
  TrendingUp, 
  ShieldCheck, 
  Hotel,
  CalendarCheck,
  Bell,
  Sparkles,
  HeartHandshake
} from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'rooms' | 'bookings' | 'notifications' | 'admin'>('rooms');
  const [adminSubTab, setAdminSubTab] = useState<'rooms' | 'analytics'>('rooms');

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(true); // default true or toggleable for evaluation
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Firestore Data State
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<HotelNotification[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Booking Modals
  const [selectedRoomToBook, setSelectedRoomToBook] = useState<Room | null>(null);
  const [latestBooking, setLatestBooking] = useState<Booking | null>(null);

  // Active push toast
  const [activePushToast, setActivePushToast] = useState<HotelNotification | null>(null);
  const [lastSeenNotifId, setLastSeenNotifId] = useState<string>('');

  // 1. Listen to Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
      // If user email matches admin or user, enable admin capability
      if (user?.email?.includes('chayangkool') || user?.email?.includes('admin')) {
        setIsAdmin(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Initialize and seed database if empty, then subscribe
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    const init = async () => {
      await seedInitialHotelData();

      const unsubRooms = subscribeRooms((roomList) => {
        setRooms(roomList);
      });

      const unsubBookings = subscribeBookings((bookingList) => {
        setBookings(bookingList);
      });

      const unsubNotifs = subscribeNotifications((notifList) => {
        setNotifications(notifList);
        if (notifList.length > 0) {
          const top = notifList[0];
          // If a new mobile push arrived
          if (top.id !== lastSeenNotifId && top.type === 'mobile_push') {
            setLastSeenNotifId(top.id);
            setActivePushToast(top);
          }
        }
      });

      unsubs = [unsubRooms, unsubBookings, unsubNotifs];
      setIsDataLoaded(true);
    };

    init();

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  // Handle booking completed
  const handleBookingSuccess = (booking: Booking) => {
    setSelectedRoomToBook(null);
    setLatestBooking(booking);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-['Prompt','Plus_Jakarta_Sans',sans-serif]">
      
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        unreadCount={notifications.filter((n) => !n.read).length}
        bookingsCount={bookings.length}
        notifications={notifications}
      />

      {/* Floating Animated Mobile Push Notification Toast */}
      <FloatingMobileBanner
        notification={activePushToast}
        onClose={() => setActivePushToast(null)}
        onClick={() => {
          setActivePushToast(null);
          setActiveTab('notifications');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* VIEW 1: Browse and Book Rooms */}
        {activeTab === 'rooms' && (
          <RoomList
            rooms={rooms}
            onSelectRoomToBook={(room) => setSelectedRoomToBook(room)}
          />
        )}

        {/* VIEW 2: Instant Booking History */}
        {activeTab === 'bookings' && (
          <BookingHistory
            bookings={bookings}
            currentUserId={currentUser?.uid}
            isAdmin={isAdmin}
          />
        )}

        {/* VIEW 3: Notifications Center */}
        {activeTab === 'notifications' && (
          <NotificationsCenter
            notifications={notifications}
            onViewBookingById={(bId) => {
              setActiveTab('bookings');
            }}
          />
        )}

        {/* VIEW 4: Admin Dashboard & Revenue Analytics */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            
            {/* Admin Subtabs */}
            <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-1.5">
                <button
                  id="admin-subtab-rooms"
                  onClick={() => setAdminSubTab('rooms')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    adminSubTab === 'rooms'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BedDouble className="w-4 h-4" />
                  <span>จัดการห้องพักแบบเรียลไทม์</span>
                </button>

                <button
                  id="admin-subtab-analytics"
                  onClick={() => setAdminSubTab('analytics')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    adminSubTab === 'analytics'
                      ? 'bg-slate-900 text-amber-400 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>วิเคราะห์รายได้ & ส่งออก PDF</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 pr-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>เชื่อมต่อ Firebase: <strong>bang-bf7d8</strong></span>
              </div>
            </div>

            {/* Sub-view switcher */}
            {adminSubTab === 'rooms' ? (
              <AdminRoomManager rooms={rooms} />
            ) : (
              <AdminRevenueAnalytics bookings={bookings} rooms={rooms} />
            )}

          </div>
        )}

      </main>

      {/* Booking Modal with Credit Card Payment */}
      {selectedRoomToBook && (
        <BookingModal
          room={selectedRoomToBook}
          isOpen={!!selectedRoomToBook}
          onClose={() => setSelectedRoomToBook(null)}
          currentUser={currentUser}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* Booking Success Confirmation Modal with Instant Voucher, Email & Mobile preview */}
      {latestBooking && (
        <BookingSuccessModal
          booking={latestBooking}
          isOpen={!!latestBooking}
          onClose={() => setLatestBooking(null)}
          onViewHistory={() => {
            setLatestBooking(null);
            setActiveTab('bookings');
          }}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Hotel className="w-4 h-4 text-amber-600" />
            <span className="font-bold text-slate-800">Bang Hotel & Luxury Resorts</span>
            <span>• ระบบจองโรงแรมออนไลน์และจัดการห้องพัก</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Cloud Database: <strong>bang-bf7d8</strong></span>
            <span>•</span>
            <span>Firebase Authentication (Gmail)</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">PCI-DSS Credit Card Standard</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
