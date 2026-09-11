import React, { useEffect, useState } from 'react';
import { Smartphone, X, CheckCircle2, ChevronRight } from 'lucide-react';
import { HotelNotification } from '../types/hotel';

interface FloatingMobileBannerProps {
  notification: HotelNotification | null;
  onClose: () => void;
  onClick: () => void;
}

export const FloatingMobileBanner: React.FC<FloatingMobileBannerProps> = ({
  notification,
  onClose,
  onClick,
}) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div 
      id="floating-mobile-push-toast"
      className="fixed top-24 right-4 sm:right-6 z-50 max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-300 select-none"
    >
      <div 
        onClick={onClick}
        className="cursor-pointer bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-3xl shadow-2xl border border-slate-700 hover:border-amber-400/60 transition-all flex items-start gap-3.5 group"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow-md">
          <Smartphone className="w-5 h-5 text-white" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
            <span className="font-semibold text-amber-400 uppercase tracking-wider">BANG HOTEL MOBILE APP</span>
            <span>เมื่อสักครู่</span>
          </div>
          <h4 className="font-bold text-xs text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
            {notification.title}
          </h4>
          <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5 leading-snug">
            {notification.body}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-slate-500 hover:text-white p-1 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
