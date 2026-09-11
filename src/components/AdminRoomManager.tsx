import React, { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  Bed, 
  Users, 
  Maximize2, 
  Sparkles, 
  RefreshCw,
  Search,
  Filter,
  Eye
} from 'lucide-react';
import { Room, RoomStatus, RoomType } from '../types/hotel';
import { saveRoom, updateRoomStatus, deleteRoom } from '../services/hotelService';

interface AdminRoomManagerProps {
  rooms: Room[];
}

export const AdminRoomManager: React.FC<AdminRoomManagerProps> = ({ rooms }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Partial<Room> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<Room>>({
    roomNumber: '109',
    name: 'Deluxe Sunset Premier',
    type: 'Deluxe',
    pricePerNight: 3600,
    capacity: 2,
    bedType: 'เตียงคิงไซส์ 1 เตียง',
    sizeSqM: 42,
    floor: 2,
    description: 'ห้องพักวิวพระอาทิตย์ตกพร้อมระเบียงกว้าง และอ่างอาบน้ำหรูหรา',
    amenities: ['ฟรี Wi-Fi', 'สมาร์ททีวี', 'อ่างอาบน้ำ', 'วิวพระอาทิตย์ตก'],
    imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
    status: 'available',
    rating: 4.9,
    reviewsCount: 15,
  });

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch = 
      r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || r.type === filterType;
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setFormData({
      roomNumber: `${Math.floor(100 + Math.random() * 400)}`,
      name: '',
      type: 'Deluxe',
      pricePerNight: 3500,
      capacity: 2,
      bedType: 'เตียงคิงไซส์ 1 เตียง',
      sizeSqM: 45,
      floor: 2,
      description: '',
      amenities: ['ฟรี Wi-Fi', 'เครื่องปรับอากาศ', 'สมาร์ททีวี'],
      imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
      status: 'available',
      rating: 5.0,
      reviewsCount: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({ ...room });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveRoom({
        ...formData,
        id: editingRoom?.id,
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Save room error:', err);
      alert('บันทึกข้อมูลไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (roomId: string, newStatus: RoomStatus) => {
    try {
      await updateRoomStatus(roomId, newStatus);
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const handleDelete = async (roomId: string, roomName: string) => {
    if (confirm(`คุณต้องการลบห้องพัก "${roomName}" ใช่หรือไม่?`)) {
      try {
        await deleteRoom(roomId);
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              จัดการห้องพักแบบเรียลไทม์ (Real-time Room Manager)
            </h2>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ปรับสถานะห้องพัก เพิ่ม/แก้ไข/ลบ ข้อมูลจะอัปเดตไปยังระบบทันที (Firestore bang-bf7d8)
          </p>
        </div>

        <button
          id="btn-add-new-room"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มห้องพักใหม่</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="ค้นหาเลขห้อง หรือชื่อ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">ทุกประเภทห้อง</option>
            <option value="Standard">Standard</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Executive Suite">Executive Suite</option>
            <option value="Ocean Villa">Ocean Villa</option>
            <option value="Family Suite">Family Suite</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="available">พร้อมให้บริการ (Available)</option>
            <option value="booked">มีผู้เข้าพัก (Booked)</option>
            <option value="maintenance">ปิดปรับปรุง (Maintenance)</option>
          </select>
        </div>

        <div className="text-slate-500 font-medium text-[11px]">
          รวมห้องพักทั้งหมด <strong>{filteredRooms.length}</strong> ห้อง
        </div>
      </div>

      {/* Room Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRooms.map((room) => (
          <div
            key={room.id}
            id={`admin-room-card-${room.roomNumber}`}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
          >
            {/* Room Image & Status Toggle Header */}
            <div className="relative h-44 w-full bg-slate-100">
              <img
                src={room.imageUrl}
                alt={room.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                #{room.roomNumber} • ชั้น {room.floor}
              </div>

              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase shadow-xs ${
                  room.status === 'available'
                    ? 'bg-emerald-500 text-white'
                    : room.status === 'booked'
                    ? 'bg-blue-600 text-white'
                    : 'bg-amber-500 text-white'
                }`}>
                  {room.status === 'available' ? 'พร้อมบริการ' : room.status === 'booked' ? 'มีผู้เข้าพัก' : 'ปิดซ่อมบำรุง'}
                </span>
              </div>
            </div>

            {/* Room Info */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] font-bold text-amber-700 tracking-wider uppercase">
                  {room.type}
                </span>
                <h4 className="font-bold text-sm text-slate-900 line-clamp-1 mt-0.5">
                  {room.name}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                  {room.description || 'ห้องพักหรูหราพร้อมสิ่งอำนวยความสะดวกระดับพรีเมียม'}
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-600 mt-2">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {room.capacity} ท่าน
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                    {room.sizeSqM} ตร.ม.
                  </span>
                  <span>•</span>
                  <span className="font-bold text-amber-700">
                    ฿{room.pricePerNight.toLocaleString()}/คืน
                  </span>
                </div>
              </div>

              {/* Real-time Status Switcher & Management Actions */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-600">สถานะเรียลไทม์:</span>
                  <select
                    id={`select-status-${room.roomNumber}`}
                    value={room.status}
                    onChange={(e) => handleStatusChange(room.id, e.target.value as RoomStatus)}
                    className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="available">🟢 ว่าง (Available)</option>
                    <option value="booked">🔵 จองแล้ว (Booked)</option>
                    <option value="maintenance">🟠 ปรับปรุง (Maintenance)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleOpenEdit(room)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1"
                    title="แก้ไขห้องพัก"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>แก้ไข</span>
                  </button>
                  <button
                    onClick={() => handleDelete(room.id, room.name)}
                    className="p-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium flex items-center gap-1"
                    title="ลบห้องพัก"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ลบ</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Add / Edit Room */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 my-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="font-bold text-base text-slate-900">
                {editingRoom ? 'แก้ไขข้อมูลห้องพัก' : 'เพิ่มห้องพักใหม่ลงในระบบ'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">หมายเลขห้อง *</label>
                  <input
                    type="text"
                    required
                    value={formData.roomNumber || ''}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชั้น (Floor)</label>
                  <input
                    type="number"
                    value={formData.floor || 1}
                    onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ประเภทห้อง *</label>
                  <select
                    value={formData.type || 'Deluxe'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as RoomType })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Executive Suite">Executive Suite</option>
                    <option value="Ocean Villa">Ocean Villa</option>
                    <option value="Family Suite">Family Suite</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ชื่อห้องพัก *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น Grand Deluxe Sea View"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ราคาต่อคืน (บาท) *</label>
                  <input
                    type="number"
                    required
                    value={formData.pricePerNight || 3000}
                    onChange={(e) => setFormData({ ...formData, pricePerNight: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ความจุผู้เข้าพัก (ท่าน)</label>
                  <input
                    type="number"
                    value={formData.capacity || 2}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ขนาดห้อง (ตร.ม.)</label>
                  <input
                    type="number"
                    value={formData.sizeSqM || 45}
                    onChange={(e) => setFormData({ ...formData, sizeSqM: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ประเภทเตียง</label>
                <input
                  type="text"
                  placeholder="เช่น 1 เตียงคิงไซส์พรีเมียม"
                  value={formData.bedType || ''}
                  onChange={(e) => setFormData({ ...formData, bedType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">รูปภาพห้องพัก (URL)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">คำอธิบายห้องพัก</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md"
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
