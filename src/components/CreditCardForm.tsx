import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Lock, Check, AlertCircle } from 'lucide-react';

export interface CardData {
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  brand: 'visa' | 'mastercard' | 'jcb' | 'amex';
}

interface CreditCardFormProps {
  cardData: CardData;
  setCardData: React.Dispatch<React.SetStateAction<CardData>>;
  errors: Record<string, string>;
}

export const CreditCardForm: React.FC<CreditCardFormProps> = ({
  cardData,
  setCardData,
  errors,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Detect card brand from first numbers
  const detectBrand = (num: string): 'visa' | 'mastercard' | 'jcb' | 'amex' => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(clean)) return 'mastercard';
    if (/^3[47]/.test(clean)) return 'amex';
    if (/^(?:2131|1800|35\d{3})/.test(clean)) return 'jcb';
    return 'visa';
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    const brand = detectBrand(raw);
    setCardData((prev) => ({ ...prev, cardNumber: formatted, brand }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    const parts = val.split('/');
    setCardData((prev) => ({
      ...prev,
      expiryMonth: parts[0] || '',
      expiryYear: parts[1] || '',
    }));
  };

  return (
    <div className="space-y-4">
      {/* Visual Credit Card Preview */}
      <div 
        id="credit-card-preview"
        className="relative w-full max-w-sm mx-auto h-48 rounded-2xl p-5 text-white shadow-xl transition-transform duration-300 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 border border-slate-700/50 overflow-hidden select-none"
      >
        {/* Glow overlay */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-amber-500/20 blur-2xl pointer-events-none"></div>
        <div className="absolute -left-8 -top-8 w-40 h-40 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none"></div>

        {!isFlipped ? (
          /* Card Front */
          <div className="relative h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              {/* EMV Chip & Contactless */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-7 rounded bg-gradient-to-br from-amber-200 to-amber-400 border border-amber-500/40 flex items-center justify-center shadow-inner">
                  <div className="w-6 h-4 border border-amber-600/30 rounded-xs"></div>
                </div>
                <svg className="w-5 h-5 text-amber-300 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.5 16.5a5 5 0 0 1 0-7m3.5 9a9 9 0 0 0 0-11m3.5 13a13 13 0 0 0 0-15" />
                </svg>
              </div>

              {/* Card Brand Badge */}
              <div className="text-right">
                <span className="font-extrabold tracking-wider text-base uppercase text-amber-400 font-['Plus_Jakarta_Sans',sans-serif]">
                  {cardData.brand}
                </span>
                <span className="block text-[9px] text-slate-400 tracking-widest">PREMIUM DEBIT/CREDIT</span>
              </div>
            </div>

            {/* Card Number */}
            <div className="my-auto py-2">
              <p className="font-mono text-lg sm:text-xl tracking-widest text-slate-100 font-semibold drop-shadow-sm">
                {cardData.cardNumber || '•••• •••• •••• ••••'}
              </p>
            </div>

            {/* Cardholder & Expiry */}
            <div className="flex items-end justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Cardholder Name</span>
                <p className="font-medium tracking-wide text-slate-200 uppercase truncate max-w-[170px]">
                  {cardData.cardHolder || 'FULL NAME'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Expires</span>
                <p className="font-mono font-medium text-slate-200">
                  {cardData.expiryMonth ? `${cardData.expiryMonth}/${cardData.expiryYear || 'YY'}` : 'MM/YY'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Card Back */
          <div className="relative h-full flex flex-col justify-between py-2">
            <div className="w-full h-8 bg-slate-950 -mx-5 mt-1"></div>
            <div className="bg-slate-300 text-slate-900 px-3 py-1.5 rounded text-right font-mono text-xs font-bold tracking-widest">
              CVV: {cardData.cvv ? '•••' : '---'}
            </div>
            <p className="text-[9px] text-slate-400 text-center">
              รหัสความปลอดภัย 3 หลักด้านหลังบัตรเครดิตของคุณ (CVV / CVC)
            </p>
          </div>
        )}
      </div>

      {/* Credit Card Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            หมายเลขบัตรเครดิต / เดบิต <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="input-card-number"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardData.cardNumber}
              onChange={handleNumberChange}
              maxLength={19}
              className={`w-full px-3.5 py-2.5 pl-10 rounded-xl border text-sm font-mono tracking-wider focus:outline-none focus:ring-2 ${
                errors.cardNumber ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 focus:ring-amber-400 focus:border-amber-500'
              }`}
            />
            <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <div className="absolute right-3.5 top-2.5 flex items-center gap-1.5">
              <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-bold uppercase">
                {cardData.brand}
              </span>
            </div>
          </div>
          {errors.cardNumber && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.cardNumber}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ชื่อผู้ถือบัตร (ภาษาอังกฤษตามหน้าบัตร) <span className="text-red-500">*</span>
          </label>
          <input
            id="input-card-holder"
            type="text"
            placeholder="SOMCHAI SAILOM"
            value={cardData.cardHolder}
            onChange={(e) => setCardData({ ...cardData, cardHolder: e.target.value.toUpperCase() })}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm uppercase focus:outline-none focus:ring-2 ${
              errors.cardHolder ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 focus:ring-amber-400 focus:border-amber-500'
            }`}
          />
          {errors.cardHolder && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.cardHolder}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            วันหมดอายุ (MM/YY) <span className="text-red-500">*</span>
          </label>
          <input
            id="input-card-expiry"
            type="text"
            placeholder="12/28"
            maxLength={5}
            value={cardData.expiryMonth ? `${cardData.expiryMonth}${cardData.expiryYear ? '/' + cardData.expiryYear : ''}` : ''}
            onChange={handleExpiryChange}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 ${
              errors.expiry ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 focus:ring-amber-400 focus:border-amber-500'
            }`}
          />
          {errors.expiry && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.expiry}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
            <span>รหัส CVV / CVC <span className="text-red-500">*</span></span>
            <button
              type="button"
              onClick={() => setIsFlipped(!isFlipped)}
              className="text-[11px] text-amber-600 hover:underline"
            >
              {isFlipped ? 'ดูหน้าบัตร' : 'ดูหลังบัตร'}
            </button>
          </label>
          <div className="relative">
            <input
              id="input-card-cvv"
              type="password"
              placeholder="•••"
              maxLength={4}
              value={cardData.cvv}
              onFocus={() => setIsFlipped(true)}
              onBlur={() => setIsFlipped(false)}
              onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
              className={`w-full px-3.5 py-2.5 pl-9 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 ${
                errors.cvv ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 focus:ring-amber-400 focus:border-amber-500'
              }`}
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
          {errors.cvv && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.cvv}
            </p>
          )}
        </div>
      </div>

      {/* Security Assurance */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>เข้ารหัสความปลอดภัย 256-bit SSL มาตรฐาน PCI-DSS</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500">VISA</span>
          <span className="font-semibold text-slate-500">Mastercard</span>
          <span className="font-semibold text-slate-500">JCB</span>
        </div>
      </div>
    </div>
  );
};
