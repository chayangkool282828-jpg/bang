import React, { useState } from 'react';
import { 
  Calendar, 
  CalendarCheck, 
  CreditCard, 
  RotateCcw, 
  Receipt, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Search,
  Mail,
  Smartphone,
  Check,
  Building,
  Info
} from 'lucide-react';
import { Booking } from '../types/hotel';
import { calculateFlexibleRefund, cancelBooking } from '../services/hotelService';

interface BookingHistoryProps {
  bookings: Booking[];
  currentUserId?: string;
  isAdmin?: boolean;
}

export const BookingHistory: React.FC<BookingHistoryProps> = ({
  bookings,
  currentUserId,
  isAdmin = false,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [selectedBookingForSlip, setSelectedBookingForSlip] = useState<Booking | null>(null);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('เปลี่ยนแปลงแผนการเดินทาง');
  const [customReason, setCustomReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    // If not admin, show all bookings or user's bookings (we allow seeing all or guest's)
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchesSearch = 
      b.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.userName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleConfirmCancellation = async () => {
    if (!selectedBookingForCancel) return;
    setIsCancelling(true);

    try {
      const finalReason = cancelReason === 'อื่นๆ' ? customReason : cancelReason;
      await cancelBooking(
        selectedBookingForCancel.id,
        selectedBookingForCancel.roomId,
        finalReason,
        selectedBookingForCancel.checkInDate,
        selectedBookingForCancel.totalPrice
      );
      setIsCancelling(false);
      setSelectedBookingForCancel(null);
    } catch (err) {
      console.error('Cancellation failed:', err);
      alert('เกิดข้อผิดพลาดในการยกเลิก กรุณาลองใหม่อีกครั้ง');
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
            ประวัติการจองห้องพัก (Booking History)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ตรวจสอบข้อมูลการจอง ใบเสร็จ และจัดการยกเลิกการจองที่ยืดหยุ่นได้ทันที
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <input
              id="search-booking-input"
              type="text"
              placeholder="ค้นหารหัสจอง หรือชื่อห้อง..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs w-48 sm:w-56 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          {/* Status Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterStatus === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              ทั้งหมด ({bookings.length})
            </button>
            <button
              onClick={() => setFilterStatus('confirmed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterStatus === 'confirmed' ? 'bg-white text-emerald-700 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              ยืนยันแล้ว
            </button>
            <button
              onClick={() => setFilterStatus('cancelled')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterStatus === 'cancelled' ? 'bg-white text-red-700 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              ยกเลิกแล้ว
            </button>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
            <CalendarCheck className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-700 text-base">ไม่พบประวัติการจองตามเงื่อนไขที่เลือก</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            คุณสามารถเลือกดูห้องพักและทำการจองเพื่อดูประวัติการจองและใบเสร็จได้ทันทีที่นี่
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const isCancelled = booking.status === 'cancelled';
            const refundInfo = calculateFlexibleRefund(booking.checkInDate, booking.totalPrice);

            return (
              <div
                key={booking.id}
                id={`booking-card-${booking.bookingNumber}`}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all ${
                  isCancelled 
                    ? 'border-slate-200/80 bg-slate-50/50 opacity-90' 
                    : 'border-slate-200 shadow-xs hover:border-amber-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left: Thumbnail & Room Details */}
                  <div className="flex items-start sm:items-center gap-4">
                    {booking.roomImageUrl ? (
                      <img
                        src={booking.roomImageUrl}
                        alt={booking.roomName}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shrink-0 border border-slate-200"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                        HOTEL
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                          {booking.bookingNumber}
                        </span>

                        {/* Status Badge */}
                        {isCancelled ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                            <XCircle className="w-3 h-3" /> ยกเลิกแล้ว (คืนเงิน ฿{booking.refundAmount?.toLocaleString() || '0'})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3" /> ยืนยันการจองแล้ว
                          </span>
                        )}

                        <span className="text-xs text-slate-500">ห้อง #{booking.roomNumber} ({booking.roomType})</span>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 leading-snug">
                        {booking.roomName}
                      </h3>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-600 mt-2">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          เช็คอิน: <strong className="text-slate-800">{booking.checkInDate}</strong>
                        </span>
                        <span>•</span>
                        <span className="font-medium">
                          เช็คเอาท์: <strong className="text-slate-800">{booking.checkOutDate}</strong>
                        </span>
                        <span>•</span>
                        <span>{booking.nights} คืน ({booking.guests} ท่าน)</span>
                      </div>

                      <p className="text-xs text-slate-500 mt-1">
                        ผู้จอง: <strong>{booking.userName}</strong> ({booking.userEmail}) • ชำระผ่านบัตร {booking.cardBrand?.toUpperCase()} •••• {booking.cardLast4}
                      </p>
                    </div>
                  </div>

                  {/* Right: Price & Actions */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 gap-3">
                    <div className="text-left lg:text-right">
                      <span className="text-[11px] text-slate-400 block">ยอดชำระสุทธิ</span>
                      <span className="text-lg sm:text-xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                        ฿{booking.totalPrice.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block">รวมภาษี VAT 7% แล้ว</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* View Receipt / Voucher Button */}
                      <button
                        onClick={() => setSelectedBookingForSlip(booking)}
                        className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5 text-slate-500" />
                        <span>ใบเสร็จ</span>
                      </button>

                      {/* Cancel Booking (Flexible) */}
                      {!isCancelled ? (
                        <button
                          id={`btn-cancel-${booking.bookingNumber}`}
                          onClick={() => setSelectedBookingForCancel(booking)}
                          className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>ยกเลิกการจอง</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          คืนเงินสำเร็จแล้ว
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: View Receipt & Voucher Details */}
      {selectedBookingForSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">ใบเสร็จรับเงิน & เอกสารยืนยันการจอง</h3>
              </div>
              <button
                onClick={() => setSelectedBookingForSlip(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-800 text-sm">BANG HOTEL & RESORTS</p>
                <p className="text-slate-500">ฐานข้อมูล: bang-bf7d8 (Firestore Cloud Storage)</p>
                <p className="text-slate-600">รหัสการจอง: <strong>{selectedBookingForSlip.bookingNumber}</strong></p>
                <p className="text-slate-600">วันที่ทำรายการ: {new Date(selectedBookingForSlip.createdAt).toLocaleString('th-TH')}</p>
              </div>

              <div className="space-y-2 border-b pb-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">ห้องพัก:</span>
                  <span className="font-bold text-slate-800">{selectedBookingForSlip.roomName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">ประเภทห้อง:</span>
                  <span className="text-slate-800">{selectedBookingForSlip.roomType} (ห้อง #{selectedBookingForSlip.roomNumber})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">เช็คอิน - เช็คเอาท์:</span>
                  <span className="text-slate-800">{selectedBookingForSlip.checkInDate} ถึง {selectedBookingForSlip.checkOutDate} ({selectedBookingForSlip.nights} คืน)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">ชื่อผู้เข้าพัก:</span>
                  <span className="text-slate-800">{selectedBookingForSlip.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">ช่องทางชำระเงิน:</span>
                  <span className="text-slate-800">บัตรเครดิต {selectedBookingForSlip.cardBrand?.toUpperCase()} (•••• {selectedBookingForSlip.cardLast4})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">สถานะการชำระ:</span>
                  <span className={selectedBookingForSlip.status === 'cancelled' ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {selectedBookingForSlip.status === 'cancelled' ? 'ยกเลิกแล้ว (คืนเงินแล้ว)' : 'ชำระเงินเรียบร้อยแล้ว'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-slate-600">
                  <span>ราคาห้องพัก ({selectedBookingForSlip.nights} คืน):</span>
                  <span>฿{selectedBookingForSlip.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
                  <span>฿{selectedBookingForSlip.tax?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t">
                  <span>ยอดสุทธิที่เรียกเก็บ:</span>
                  <span className="text-amber-700">฿{selectedBookingForSlip.totalPrice.toLocaleString()}</span>
                </div>

                {selectedBookingForSlip.status === 'cancelled' && (
                  <div className="flex justify-between font-bold text-xs text-red-600 pt-2">
                    <span>ยอดคืนเงินเข้าบัตร (Refunded):</span>
                    <span>- ฿{selectedBookingForSlip.refundAmount?.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end gap-2">
              <button
                onClick={() => setSelectedBookingForSlip(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                ปิด
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
              >
                พิมพ์ใบเสร็จ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Flexible Cancellation Modal */}
      {selectedBookingForCancel && (() => {
        const refundCalc = calculateFlexibleRefund(
          selectedBookingForCancel.checkInDate,
          selectedBookingForCancel.totalPrice
        );

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div 
              id="cancellation-modal"
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-100 text-red-700 rounded-xl">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">ยกเลิกการจองห้องพัก (Flexible Cancellation)</h3>
                    <p className="text-xs text-slate-500">รหัสการจอง: {selectedBookingForCancel.bookingNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBookingForCancel(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
                >
                  ✕
                </button>
              </div>

              <div className="py-4 space-y-4">
                {/* Real-time Refund Calculation Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/90 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-900 font-bold">เงื่อนไขการคืนเงินของคุณ:</span>
                    <span className="px-2 py-0.5 rounded font-bold bg-amber-200 text-amber-900">
                      คืนเงิน {refundCalc.refundPercent}%
                    </span>
                  </div>
                  <p className="text-slate-700">{refundCalc.tierText}</p>
                  <p className="text-slate-500 text-[11px]">
                    เหลือเวลาอีกประมาณ <strong>{refundCalc.hoursRemaining} ชั่วโมง</strong> ก่อนถึงกำหนดเวลาเช็คอิน ({selectedBookingForCancel.checkInDate} 14:00 น.)
                  </p>
                  
                  <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">จำนวนเงินที่จะได้รับคืนทันที:</span>
                    <span className="text-base font-extrabold text-emerald-700 font-['Plus_Jakarta_Sans',sans-serif]">
                      ฿{refundCalc.refundAmount.toLocaleString()} THB
                    </span>
                  </div>
                </div>

                {/* Reason for cancellation */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    เหตุผลในการขอยกเลิกห้องพัก <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="cancel-reason-select"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="เปลี่ยนแปลงแผนการเดินทาง">เปลี่ยนแปลงแผนการเดินทาง / เลื่อนวันพัก</option>
                    <option value="ติดภารกิจด่วนส่วนตัว">ติดภารกิจด่วนส่วนตัว</option>
                    <option value="ปัญหาสุขภาพ / ป่วย">ปัญหาสุขภาพ / ป่วยกะทันหัน</option>
                    <option value="สภาพอากาศหรือการเดินทางไม่สะดวก">สภาพอากาศหรือการเดินทางไม่สะดวก</option>
                    <option value="จองผิดพลาด / เลือกวันผิด">จองผิดพลาด / เลือกวันผิด</option>
                    <option value="อื่นๆ">อื่นๆ (โปรดระบุเพิ่มเติม)</option>
                  </select>
                </div>

                {cancelReason === 'อื่นๆ' && (
                  <div>
                    <input
                      type="text"
                      placeholder="ระบุเหตุผลในการยกเลิก..."
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                )}

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
                  <p>• เงินจะถูกคืนเข้าบัตรเครดิต <strong>{selectedBookingForCancel.cardBrand?.toUpperCase()} (•••• {selectedBookingForCancel.cardLast4})</strong></p>
                  <p>• ระบบจะส่งอีเมลยืนยันการคืนเงินและแจ้งเตือนเข้าแอปพลิเคชันมือถือทันที</p>
                  <p>• ห้องพักหมายเลข #{selectedBookingForCancel.roomNumber} จะกลับมาเปิดให้จองใหม่แบบเรียลไทม์</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForCancel(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  ไม่ยกเลิก
                </button>
                <button
                  id="btn-confirm-cancel-now"
                  type="button"
                  onClick={handleConfirmCancellation}
                  disabled={isCancelling}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/20 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isCancelling ? (
                    <span>กำลังดำเนินการคืนเงิน...</span>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>ยืนยันยกเลิกและรับเงินคืน ฿{refundCalc.refundAmount.toLocaleString()}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
