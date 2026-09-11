import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  Send, 
  CalendarCheck, 
  Search, 
  ExternalLink 
} from 'lucide-react';
import { HotelNotification } from '../types/hotel';

interface NotificationsCenterProps {
  notifications: HotelNotification[];
  onViewBookingById?: (bookingId: string) => void;
}

export const NotificationsCenter: React.FC<NotificationsCenterProps> = ({
  notifications,
  onViewBookingById,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'email' | 'mobile_push'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = notifications.filter((n) => {
    const matchesType = filterType === 'all' || n.type === filterType;
    const matchesSearch = 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.recipientEmail || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              ศูนย์บันทึกการแจ้งเตือน (Notifications Center)
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
              Email & Mobile App
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            บันทึกการส่งอีเมลยืนยันการจองและการส่งการแจ้งเตือนแบบพุชผ่านแอปพลิเคชันมือถือ
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterType === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            ทั้งหมด ({notifications.length})
          </button>
          <button
            onClick={() => setFilterType('email')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterType === 'email' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>อีเมล</span>
          </button>
          <button
            onClick={() => setFilterType('mobile_push')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterType === 'mobile_push' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>มือถือ</span>
          </button>
        </div>
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Bell className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-700 text-base">ยังไม่มีประวัติการแจ้งเตือน</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            เมื่อมีการจองห้องพักหรือยกเลิกการจอง ระบบจะส่งข้อความแจ้งเตือนผ่านอีเมลและสมาร์ทโฟนแบบเรียลไทม์
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notif) => (
            <div
              key={notif.id}
              className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex items-start gap-3.5"
            >
              {/* Type Icon */}
              <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                notif.type === 'email'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {notif.type === 'email' ? <Mail className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
              </div>

              {/* Body Details */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      notif.type === 'email' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {notif.type === 'email' ? 'EMAIL NOTIFICATION' : 'MOBILE APP PUSH'}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{notif.title}</span>
                  </div>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(notif.timestamp).toLocaleString('th-TH')}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {notif.body}
                </p>

                {notif.recipientEmail && (
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    ส่งไปยัง: <span className="text-slate-600 font-medium">{notif.recipientEmail}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
