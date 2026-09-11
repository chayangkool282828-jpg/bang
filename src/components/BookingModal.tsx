import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  RotateCcw,
  Building,
  Info
} from 'lucide-react';
import { Room, Booking } from '../types/hotel';
import { CreditCardForm, CardData } from './CreditCardForm';
import { createBooking } from '../services/hotelService';
import { User } from '../lib/firebase';
import confetti from 'canvas-confetti';

interface BookingModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onBookingSuccess: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  room,
  isOpen,
  onClose,
  currentUser,
  onBookingSuccess,
}) => {
  // Dates: default check-in tomorrow, check-out in 2 days
  const today = new Date();
  const defaultCheckIn = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)
    .toISOString()
    .split('T')[0];
  const defaultCheckOut = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4)
    .toISOString()
    .split('T')[0];

  const [checkInDate, setCheckInDate] = useState(defaultCheckIn);
  const [checkOutDate, setCheckOutDate] = useState(defaultCheckOut);
  const [guests, setGuests] = useState(2);
  const [userName, setUserName] = useState(currentUser?.displayName || 'ชยางกูร สุวรรณโชติ');
  const [userEmail, setUserEmail] = useState(currentUser?.email || 'chayangkool28.28.28@gmail.com');
  const [userPhone, setUserPhone] = useState('089-123-4567');
  const [specialRequests, setSpecialRequests] = useState('ขอห้องพักชั้นสูง เตียงเสริมหมอนนุ่ม');

  const [cardData, setCardData] = useState<CardData>({
    cardNumber: '4532 8812 3456 7890',
    cardHolder: (currentUser?.displayName || 'CHAYANGKOOL S.').toUpperCase(),
    expiryMonth: '12',
    expiryYear: '28',
    cvv: '889',
    brand: 'visa',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // Calculate nights
  const d1 = new Date(checkInDate);
  const d2 = new Date(checkOutDate);
  const diffTime = d2.getTime() - d1.getTime();
  const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

  const subtotal = room.pricePerNight * nights;
  const tax = Math.round(subtotal * 0.07);
  const totalPrice = subtotal + tax;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!userName.trim()) errs.userName = 'กรุณากรอกชื่อ-นามสกุล';
    if (!userEmail.trim() || !userEmail.includes('@')) errs.userEmail = 'กรุณากรอกอีเมลที่ถูกต้อง';
    if (!userPhone.trim()) errs.userPhone = 'กรุณากรอกเบอร์โทรศัพท์';

    const cleanCard = cardData.cardNumber.replace(/\s+/g, '');
    if (cleanCard.length < 15) errs.cardNumber = 'หมายเลขบัตรเครดิตต้องมีอย่างน้อย 15-16 หลัก';
    if (!cardData.cardHolder.trim()) errs.cardHolder = 'กรุณาระบุชื่อบนบัตร';
    if (!cardData.expiryMonth || !cardData.expiryYear) errs.expiry = 'ระบุวันหมดอายุ';
    if (cardData.cvv.length < 3) errs.cvv = 'CVV 3-4 หลัก';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePayAndBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsProcessing(true);

    try {
      // Simulate real-time credit card gateway authorization
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const cleanCard = cardData.cardNumber.replace(/\s+/g, '');
      const cardLast4 = cleanCard.slice(-4);

      const booking = await createBooking({
        roomId: room.id,
        roomNumber: room.roomNumber,
        roomName: room.name,
        roomType: room.type,
        roomImageUrl: room.imageUrl,
        userId: currentUser?.uid || `guest-${Date.now()}`,
        userEmail,
        userName,
        userPhone,
        checkInDate,
        checkOutDate,
        nights,
        guests,
        pricePerNight: room.pricePerNight,
        subtotal,
        tax,
        totalPrice,
        paymentStatus: 'paid',
        paymentMethod: 'credit_card',
        cardLast4,
        cardBrand: cardData.brand,
        cardHolder: cardData.cardHolder,
        specialRequests,
      });

      // Confetti celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setIsProcessing(false);
      onBookingSuccess(booking);
    } catch (err) {
      console.error('Booking failed:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="booking-modal-card"
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">จองห้องพักและชำระเงินผ่านบัตรเครดิต</h3>
              <p className="text-xs text-slate-300">ยืนยันการจองทันที พร้อมรับอีเมลและแจ้งเตือนบนมือถือ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handlePayAndBook} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Room Summary & Guest Info */}
            <div className="lg:col-span-6 space-y-5">
              
              {/* Selected Room Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex gap-4">
                <img
                  src={room.imageUrl}
                  alt={room.name}
                  className="w-28 h-24 object-cover rounded-xl shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      ห้อง #{room.roomNumber}
                    </span>
                    <span className="text-xs text-slate-500">{room.type}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1 mt-1">{room.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {room.bedType} • รองรับ {room.capacity} ท่าน • {room.sizeSqM} ตร.ม.
                  </p>
                  <p className="text-xs font-bold text-amber-700 mt-1.5">
                    ฿{room.pricePerNight.toLocaleString()} <span className="font-normal text-slate-500 text-[11px]">/ คืน</span>
                  </p>
                </div>
              </div>

              {/* Dates & Guests */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วันที่เช็คอิน
                  </label>
                  <input
                    id="booking-checkin"
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วันที่เช็คเอาท์
                  </label>
                  <input
                    id="booking-checkout"
                    type="date"
                    value={checkOutDate}
                    min={checkInDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    จำนวนผู้เข้าพัก
                  </label>
                  <select
                    id="booking-guests"
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {[...Array(room.capacity)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} ท่าน
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Guest Details */}
              <div className="space-y-3 pt-1">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  ข้อมูลผู้เข้าพักหลัก
                </h4>
                
                <div>
                  <input
                    id="guest-name"
                    type="text"
                    placeholder="ชื่อ - นามสกุลผู้เข้าพัก *"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  {errors.userName && <p className="text-[11px] text-red-500 mt-0.5">{errors.userName}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      id="guest-email"
                      type="email"
                      placeholder="อีเมลรับใบยืนยัน (Gmail) *"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    {errors.userEmail && <p className="text-[11px] text-red-500 mt-0.5">{errors.userEmail}</p>}
                  </div>
                  <div>
                    <input
                      id="guest-phone"
                      type="tel"
                      placeholder="เบอร์โทรศัพท์มือถือ *"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    {errors.userPhone && <p className="text-[11px] text-red-500 mt-0.5">{errors.userPhone}</p>}
                  </div>
                </div>

                <div>
                  <textarea
                    id="guest-special-requests"
                    rows={2}
                    placeholder="คำขอพิเศษ (เช่น เวลาเช็คอินที่ต้องการ, เตียงเสริม)"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Flexible Cancellation Policy Guarantee Card */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80">
                <div className="flex items-start gap-2.5">
                  <RotateCcw className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-emerald-900">นโยบายการยกเลิกที่ยืดหยุ่น (Flexible Cancellation)</p>
                    <ul className="text-emerald-800 space-y-1 mt-1 text-[11px]">
                      <li>• <strong>คืนเงิน 100%</strong> เมื่อยกเลิกก่อนเวลาเช็คอิน 48 ชั่วโมงขึ้นไป</li>
                      <li>• <strong>คืนเงิน 75%</strong> เมื่อยกเลิกล่วงหน้า 24 - 48 ชั่วโมง</li>
                      <li>• คืนเงินกลับเข้าบัตรเครดิตทันทีโดยไม่มีค่าธรรมเนียมแอบแฝง</li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Credit Card & Total Price */}
            <div className="lg:col-span-6 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                ชำระเงินผ่านบัตรเครดิตที่ปลอดภัย
              </h4>

              {/* Credit Card Interactive Form */}
              <CreditCardForm
                cardData={cardData}
                setCardData={setCardData}
                errors={errors}
              />

              {/* Price Breakdown */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>฿{room.pricePerNight.toLocaleString()} × {nights} คืน</span>
                  <span>฿{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>ภาษีและค่าบริการ 7% (VAT)</span>
                  <span>฿{tax.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-200 my-1 pt-2 flex justify-between items-baseline">
                  <span className="font-bold text-sm text-slate-900">ยอดชำระสุทธิ (THB)</span>
                  <span className="font-extrabold text-xl text-amber-700 font-['Plus_Jakarta_Sans',sans-serif]">
                    ฿{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="btn-confirm-payment"
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-sm shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>กำลังประมวลผลการชำระเงินผ่านบัตรเครดิต...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>ยืนยันการชำระเงิน ฿{totalPrice.toLocaleString()}</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-400 text-center">
                ระบบจะส่งอีเมลยืนยันการจองและแจ้งเตือนเข้าแอปพลิเคชันมือถือของคุณทันที
              </p>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};
