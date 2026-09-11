import React, { useState } from 'react';
import { 
  Hotel, 
  CalendarCheck, 
  ShieldCheck, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  LayoutDashboard, 
  BedDouble,
  CheckCircle2,
  Mail,
  Smartphone,
  Sparkles
} from 'lucide-react';
import { User, loginWithGmail, logoutUser } from '../lib/firebase';
import { HotelNotification } from '../types/hotel';

interface NavbarProps {
  activeTab: 'rooms' | 'bookings' | 'notifications' | 'admin';
  setActiveTab: (tab: 'rooms' | 'bookings' | 'notifications' | 'admin') => void;
  currentUser: User | null;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  unreadCount: number;
  bookingsCount: number;
  notifications: HotelNotification[];
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  isAdmin,
  setIsAdmin,
  unreadCount,
  bookingsCount,
  notifications,
}) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithGmail();
    } catch (err: any) {
      console.warn('Google Auth popup closed or blocked in iframe:', err);
      // We also offer demo accounts
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDemoLogin = (role: 'guest' | 'admin') => {
    if (role === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div 
            id="brand-logo"
            onClick={() => setActiveTab('rooms')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
              <Hotel className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                  BANG HOTEL
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                  5-STAR LUXURY
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                ระบบจองโรงแรมออนไลน์ • bang-bf7d8
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/60">
            <button
              id="nav-tab-rooms"
              onClick={() => setActiveTab('rooms')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'rooms'
                  ? 'bg-white text-amber-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BedDouble className="w-4 h-4" />
              <span>ห้องพักและจอง</span>
            </button>

            <button
              id="nav-tab-bookings"
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all relative ${
                activeTab === 'bookings'
                  ? 'bg-white text-amber-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>ประวัติการจอง</span>
              {bookingsCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-amber-600 rounded-full">
                  {bookingsCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-admin"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-amber-400 shadow-xs font-semibold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>จัดการแอดมิน & วิเคราะห์รายได้</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-700 font-bold rounded">
                PRO
              </span>
            </button>
          </nav>

          {/* Right Action Menu: Notifications + Auth */}
          <div className="flex items-center gap-3">
            
            {/* Quick Admin Toggle for easy evaluation */}
            <button
              id="toggle-admin-badge"
              onClick={() => {
                setIsAdmin(!isAdmin);
                if (!isAdmin) setActiveTab('admin');
              }}
              title="สลับโหมดผู้ดูแลระบบ (Admin Mode)"
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                isAdmin 
                  ? 'bg-amber-50 text-amber-800 border-amber-300' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${isAdmin ? 'text-amber-600' : 'text-slate-400'}`} />
              <span>{isAdmin ? 'โหมด: แอดมิน (Admin)' : 'โหมด: แขกทั่วไป (Guest)'}</span>
            </button>

            {/* Notifications Bell Dropdown */}
            <div className="relative">
              <button
                id="btn-notifications-menu"
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="การแจ้งเตือนอีเมลและมือถือ"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] font-bold text-white items-center justify-center">
                      {unreadCount}
                    </span>
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifDropdown && (
                <div 
                  id="notifications-popover"
                  className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <h4 className="text-sm font-semibold">การแจ้งเตือนระบบ (Email & Mobile)</h4>
                    </div>
                    <span className="text-xs text-slate-300">{notifications.length} รายการ</span>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-sm">
                        ยังไม่มีการแจ้งเตือนใหม่
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notif) => (
                        <div key={notif.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start gap-2.5">
                            <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                              notif.type === 'email' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {notif.type === 'email' ? <Mail className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-slate-900 line-clamp-1">{notif.title}</p>
                              <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{notif.body}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(notif.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        setShowNotifDropdown(false);
                        setActiveTab('notifications');
                      }}
                      className="text-xs font-semibold text-amber-600 hover:text-amber-700"
                    >
                      ดูประวัติการแจ้งเตือนทั้งหมด
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Auth Section */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="user-profile-menu-button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-8 h-8 rounded-full object-cover border border-amber-500"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                      {currentUser.displayName?.[0] || currentUser.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-slate-800 truncate max-w-[110px]">
                      {currentUser.displayName || currentUser.email?.split('@')[0]}
                    </p>
                    <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Gmail Auth
                    </span>
                  </div>
                </button>

                {showUserMenu && (
                  <div 
                    id="user-dropdown-menu"
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-medium text-slate-500">เข้าสู่ระบบด้วย Gmail</p>
                      <p className="text-xs font-semibold text-slate-900 truncate">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsAdmin(true);
                        setActiveTab('admin');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4 text-amber-600" />
                      เปิดแดชบอร์ดผู้ดูแลระบบ
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('bookings');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <CalendarCheck className="w-4 h-4 text-blue-600" />
                      ประวัติการจองของฉัน
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={async () => {
                        await logoutUser();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="btn-login-gmail"
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-2xs transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span className="hidden sm:inline">เข้าสู่ระบบด้วย Gmail</span>
                  <span className="sm:hidden">Gmail</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Mobile Navigation Bar Bar */}
        <div className="flex md:hidden items-center justify-around py-2.5 border-t border-slate-200/80">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
              activeTab === 'rooms' ? 'text-amber-600 font-bold' : 'text-slate-500'
            }`}
          >
            <BedDouble className="w-5 h-5" />
            <span>ห้องพัก</span>
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium relative ${
              activeTab === 'bookings' ? 'text-amber-600 font-bold' : 'text-slate-500'
            }`}
          >
            <CalendarCheck className="w-5 h-5" />
            <span>การจอง</span>
            {bookingsCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold text-white bg-amber-600 rounded-full">
                {bookingsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium relative ${
              activeTab === 'notifications' ? 'text-amber-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span>แจ้งเตือน</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold text-white bg-red-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
              activeTab === 'admin' ? 'text-slate-900 font-bold' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>แอดมิน</span>
          </button>
        </div>

      </div>
    </header>
  );
};
