import React, { useState } from 'react';
import { 
  Users, 
  Bed, 
  Maximize2, 
  Star, 
  ShieldCheck, 
  Check, 
  CreditCard, 
  Calendar, 
  Search, 
  Filter, 
  RotateCcw,
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';
import { Room, RoomType } from '../types/hotel';

interface RoomListProps {
  rooms: Room[];
  onSelectRoomToBook: (room: Room) => void;
}

export const RoomList: React.FC<RoomListProps> = ({
  rooms,
  onSelectRoomToBook,
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(15000);
  const [guestCount, setGuestCount] = useState<number>(1);
  const [selectedRoomForDetail, setSelectedRoomForDetail] = useState<Room | null>(null);

  const filteredRooms = rooms.filter((r) => {
    const matchesType = selectedType === 'all' || r.type === selectedType;
    const matchesSearch = 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = r.pricePerNight <= maxPrice;
    const matchesGuests = r.capacity >= guestCount;
    return matchesType && matchesSearch && matchesPrice && matchesGuests;
  });

  return (
    <div className="space-y-8">
      
      {/* Hero Welcome & Search Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl border border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80"
          alt="Luxury Hotel"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
        />

        <div className="relative z-20 p-6 sm:p-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>นโยบายยกเลิกยืดหยุ่น คืนเงินสูงสุด 100%</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans',sans-serif] leading-tight">
            สัมผัสประสบการณ์พักผ่อนระดับเวิลด์คลาสที่ <span className="text-amber-400">Bang Hotel</span>
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            จองห้องพักออนไลน์ ชำระเงินผ่านบัตรเครดิตได้อย่างรวดเร็วและปลอดภัย พร้อมรับการแจ้งเตือนยืนยันทันทีผ่านอีเมลและสมาร์ทโฟน
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* Search text */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">ค้นหาห้องพัก</label>
            <div className="relative">
              <input
                id="filter-search-room"
                type="text"
                placeholder="ชื่อห้อง, เลขห้อง, หรือวิว..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* Room Type */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">ประเภทห้องพัก</label>
            <select
              id="filter-room-type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
            >
              <option value="all">ทุกประเภทห้องพัก (All Types)</option>
              <option value="Standard">Standard</option>
              <option value="Deluxe">Deluxe (วิวทะเล/สระว่ายน้ำ)</option>
              <option value="Executive Suite">Executive Suite</option>
              <option value="Ocean Villa">Ocean Villa (พูลวิลล่าริมหาด)</option>
              <option value="Family Suite">Family Suite (สวีทครอบครัว)</option>
            </select>
          </div>

          {/* Guests */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">จำนวนผู้เข้าพัก</label>
            <select
              id="filter-guests"
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
            >
              <option value={1}>1 ท่านขึ้นไป</option>
              <option value={2}>2 ท่านขึ้นไป</option>
              <option value={3}>3 ท่านขึ้นไป</option>
              <option value={4}>4 ท่านขึ้นไป</option>
              <option value={5}>5 ท่านขึ้นไป</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>งบประมาณสูงสุด</span>
              <span className="text-amber-700 font-bold">฿{maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={2000}
              max={15000}
              step={500}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-amber-600 mt-2"
            />
          </div>

        </div>
      </div>

      {/* Rooms Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>พบห้องพักที่พร้อมให้บริการ <strong>{filteredRooms.length}</strong> ห้อง</span>
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <ShieldCheck className="w-4 h-4" /> รับประกันราคาดีที่สุดและยกเลิกได้ยืดหยุ่น
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => {
            const isAvailable = room.status === 'available';

            return (
              <div
                key={room.id}
                id={`room-card-${room.roomNumber}`}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Photo & Badges */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                  <img
                    src={room.imageUrl}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Rating Badge */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-slate-900 text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{room.rating}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({room.reviewsCount})</span>
                  </div>

                  {/* Room Number & Floor */}
                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-xl">
                    #{room.roomNumber}
                  </div>

                  {/* Status Overlay if not available */}
                  {!isAvailable && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center text-white">
                      <span className="px-3 py-1.5 rounded-xl bg-red-600/90 text-xs font-bold uppercase tracking-wider">
                        {room.status === 'booked' ? 'มีผู้เข้าพักแล้ว (Booked)' : 'ปิดปรับปรุงชั่วคราว'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-amber-700 uppercase tracking-wider text-[10px]">
                        {room.type}
                      </span>
                      <span className="text-slate-400 text-[11px]">ชั้น {room.floor}</span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 line-clamp-1 group-hover:text-amber-700 transition-colors">
                      {room.name}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                      {room.description}
                    </p>

                    {/* Room Attributes */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {room.capacity} ท่าน
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-slate-400" />
                        {room.bedType}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                        {room.sizeSqM} ตร.ม.
                      </span>
                    </div>

                    {/* Amenities chips */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {room.amenities.slice(0, 3).map((amenity, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                        >
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px]">
                          +{room.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price & Booking Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">เริ่มต้นเพียง</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                          ฿{room.pricePerNight.toLocaleString()}
                        </span>
                        <span className="text-slate-500 text-[11px]">/ คืน</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedRoomForDetail(room)}
                        className="px-2.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors"
                        title="ดูรายละเอียดเพิ่มเติม"
                      >
                        ดูข้อมูล
                      </button>

                      <button
                        id={`btn-book-room-${room.roomNumber}`}
                        onClick={() => onSelectRoomToBook(room)}
                        disabled={!isAvailable}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:pointer-events-none"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>จองทันที</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: Room Detail Preview */}
      {selectedRoomForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="relative h-64 w-full">
              <img
                src={selectedRoomForDetail.imageUrl}
                alt={selectedRoomForDetail.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedRoomForDetail(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-slate-900"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-xs text-white px-3 py-1 rounded-xl text-xs font-bold">
                #{selectedRoomForDetail.roomNumber} • {selectedRoomForDetail.type}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedRoomForDetail.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{selectedRoomForDetail.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">ความจุผู้เข้าพัก</span>
                  <span className="font-bold text-slate-800">{selectedRoomForDetail.capacity} ท่าน</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">ขนาดห้องพัก</span>
                  <span className="font-bold text-slate-800">{selectedRoomForDetail.sizeSqM} ตร.ม.</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">ประเภทเตียง</span>
                  <span className="font-bold text-slate-800">{selectedRoomForDetail.bedType}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2">สิ่งอำนวยความสะดวกในห้องพัก</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedRoomForDetail.amenities.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                <RotateCcw className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong>เงื่อนไขการยกเลิก:</strong> ยกเลิกฟรีก่อนเข้าพัก 48 ชั่วโมง คืนเงินเข้าบัตรเครดิต 100%
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">ราคา</span>
                  <span className="text-2xl font-extrabold text-amber-700">
                    ฿{selectedRoomForDetail.pricePerNight.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500"> / คืน (รวมภาษี)</span>
                </div>

                <button
                  onClick={() => {
                    const r = selectedRoomForDetail;
                    setSelectedRoomForDetail(null);
                    onSelectRoomToBook(r);
                  }}
                  disabled={selectedRoomForDetail.status !== 'available'}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>ดำเนินการจองห้องนี้</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
