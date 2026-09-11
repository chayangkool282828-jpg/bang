import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Mail, 
  Smartphone, 
  Receipt, 
  Calendar, 
  CreditCard, 
  ArrowRight, 
  Copy, 
  Check, 
  Download, 
  Building,
  RotateCcw
} from 'lucide-react';
import { Booking } from '../types/hotel';

interface BookingSuccessModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onViewHistory: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  booking,
  isOpen,
  onClose,
  onViewHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'voucher' | 'email' | 'mobile'>('voucher');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(booking.bookingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="booking-success-modal"
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white p-6 text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-xs rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-white/40 shadow-inner">
            <CheckCircle2 className="w-9 h-9 text-white" />
          </div>
          <h3 className="text-xl font-bold font-['Plus_Jakarta_Sans',sans-serif]">การจองห้องพักเสร็จสมบูรณ์!</h3>
          <p className="text-xs text-emerald-100 mt-1">
            ชำระเงินผ่านบัตรเครดิตเรียบร้อยแล้ว • รหัสการจอง: <span className="font-mono font-bold tracking-wider">{booking.bookingNumber}</span>
          </p>

          {/* Subtabs for viewing Confirmation Deliverables */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setActiveTab('voucher')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'voucher'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'bg-emerald-800/60 text-white hover:bg-emerald-800'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>ใบยืนยันการจอง</span>
            </button>

            <button
              onClick={() => setActiveTab('email')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'email'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'bg-emerald-800/60 text-white hover:bg-emerald-800'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>อีเมลแจ้งเตือน (ส่งแล้ว)</span>
            </button>

            <button
              onClick={() => setActiveTab('mobile')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'mobile'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'bg-emerald-800/60 text-white hover:bg-emerald-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>แจ้งเตือนบนมือถือ</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          
          {/* TAB 1: Voucher & Summary */}
          {activeTab === 'voucher' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 relative">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hotel Voucher</span>
                    <h4 className="font-extrabold text-base text-slate-900">{booking.roomName}</h4>
                    <p className="text-xs text-slate-500">{booking.roomType} • ห้องพักหมายเลข #{booking.roomNumber}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">รหัสการจอง</span>
                      <span className="font-mono text-sm font-bold text-amber-700">{booking.bookingNumber}</span>
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-xs"
                      title="คัดลอกรหัสการจอง"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">เช็คอิน</span>
                    <span className="font-bold text-slate-800">{booking.checkInDate}</span>
                    <span className="text-[10px] text-slate-400 block">ตั้งแต่ 14:00 น.</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">เช็คเอาท์</span>
                    <span className="font-bold text-slate-800">{booking.checkOutDate}</span>
                    <span className="text-[10px] text-slate-400 block">ก่อน 12:00 น.</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">ระยะเวลา</span>
                    <span className="font-bold text-slate-800">{booking.nights} คืน ({booking.guests} ท่าน)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">สถานะการชำระ</span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                      <CheckCircle2 className="w-3 h-3" /> ชำระแล้ว
                    </span>
                  </div>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    <CreditCard className="w-4 h-4 text-slate-500" />
                    <span>ชำระผ่าน {booking.cardBrand.toUpperCase()} •••• {booking.cardLast4} (คุณ {booking.userName})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 mr-2">ยอดรวมสุทธิ:</span>
                    <span className="text-lg font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                      ฿{booking.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

              </div>

              {/* Flexible cancellation note */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-900">
                <RotateCcw className="w-4 h-4 text-amber-700 shrink-0" />
                <p>
                  <strong>อุ่นใจด้วยนโยบายยกเลิกยืดหยุ่น:</strong> คุณสามารถกดยกเลิกและรับเงินคืนผ่านหน้า <strong>ประวัติการจอง</strong> ได้ตลอดเวลาตามเงื่อนไขที่กำหนด
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Email Confirmation Simulation */}
          {activeTab === 'email' && (
            <div className="space-y-3">
              <div className="bg-slate-100 p-3 rounded-xl text-xs space-y-1 text-slate-600 border border-slate-200">
                <p><strong>จาก:</strong> Bang Hotel Reservations &lt;reservation@banghotel.com&gt;</p>
                <p><strong>ถึง:</strong> {booking.userEmail} (Gmail)</p>
                <p><strong>หัวข้อ:</strong> [ยืนยันการจองห้องพัก] {booking.roomName} (รหัส: {booking.bookingNumber})</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 text-xs">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
                      B
                    </div>
                    <span className="font-bold text-slate-900 text-sm">BANG HOTEL & RESORTS</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    ✓ ยืนยันเรียบร้อยแล้ว
                  </span>
                </div>

                <div>
                  <p className="font-bold text-slate-800 text-sm">เรียน คุณ {booking.userName},</p>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    ขอขอบพระคุณที่เลือกพักกับ Bang Hotel การจองห้องพักของคุณได้รับการยืนยันและชำระเงินเรียบร้อยแล้ว รายละเอียดการจองของคุณมีดังนี้:
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl space-y-1.5 text-slate-700">
                  <p>• <strong>ห้องพัก:</strong> {booking.roomName} (#{booking.roomNumber})</p>
                  <p>• <strong>วันเช็คอิน:</strong> {booking.checkInDate} (14:00 น.)</p>
                  <p>• <strong>วันเช็คเอาท์:</strong> {booking.checkOutDate} (12:00 น.)</p>
                  <p>• <strong>จำนวนผู้เข้าพัก:</strong> {booking.guests} ท่าน ({booking.nights} คืน)</p>
                  <p>• <strong>ยอดเงินที่ชำระ:</strong> ฿{booking.totalPrice.toLocaleString()} (บัตร {booking.cardBrand.toUpperCase()} •••• {booking.cardLast4})</p>
                  {booking.specialRequests && (
                    <p>• <strong>คำขอพิเศษ:</strong> {booking.specialRequests}</p>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 border-t pt-3 space-y-1">
                  <p>• กรุณาแสดงบัตรประจำตัวประชาชนหรือพาสปอร์ตพร้อมอีเมลนี้เมื่อทำการเช็คอินที่ล็อบบี้</p>
                  <p>• หากต้องการยกเลิกหรือเปลี่ยนแปลงการจอง สามารถทำได้ผ่านระบบออนไลน์ทันที</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Mobile Push Notification Simulation */}
          {activeTab === 'mobile' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 text-center">
                ตัวอย่างการแจ้งเตือนแบบพุชบนหน้าจอสมาร์ทโฟนของแขก (Mobile App Push Notification)
              </p>

              <div className="max-w-xs mx-auto p-4 rounded-3xl bg-slate-900 text-white shadow-2xl border-4 border-slate-700 relative">
                {/* Phone Notch */}
                <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-3"></div>

                {/* Simulated Push Toast */}
                <div className="p-3.5 rounded-2xl bg-slate-800/90 backdrop-blur-md border border-slate-700 shadow-lg animate-bounce duration-1000">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-amber-500 flex items-center justify-center text-[9px] font-bold text-slate-950">
                        B
                      </div>
                      <span className="font-semibold text-slate-200">BANG HOTEL APP</span>
                    </div>
                    <span>เมื่อสักครู่</span>
                  </div>
                  <p className="text-xs font-bold text-amber-400">🏨 ยืนยันการจองห้องพักสำเร็จ!</p>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                    การจองรหัส {booking.bookingNumber} ({booking.roomName}) ได้รับการชำระเงินแล้ว ฿{booking.totalPrice.toLocaleString()} ขอให้เพลิดเพลินกับการพักผ่อน
                  </p>
                </div>

                <div className="mt-8 text-center text-[10px] text-slate-500">
                  แตะเพื่อเปิดดูใบยืนยันในแอป
                </div>
                <div className="w-20 h-1 bg-slate-600 rounded-full mx-auto mt-4"></div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            ปิดหน้าต่าง
          </button>

          <button
            id="btn-view-booking-history-now"
            onClick={() => {
              onClose();
              onViewHistory();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-colors"
          >
            <span>ดูประวัติการจองทันที</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
