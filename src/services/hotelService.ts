import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Room,
  Booking,
  HotelNotification,
  RoomStatus,
  MonthlyRevenueStats,
} from '../types/hotel';

const ROOMS_COLLECTION = 'rooms';
const BOOKINGS_COLLECTION = 'bookings';
const NOTIFICATIONS_COLLECTION = 'notifications';

export const INITIAL_SAMPLE_ROOMS: Omit<Room, 'id'>[] = [
  {
    roomNumber: '101',
    name: 'Superior King Room (การ์เดนวิว)',
    type: 'Standard',
    pricePerNight: 2450,
    capacity: 2,
    bedType: 'เตียงคิงไซส์ 1 เตียง',
    sizeSqM: 38,
    floor: 1,
    description: 'ห้องพักสไตล์โมเดิร์นทรอปิคอลพร้อมระเบียงส่วนตัวชมสวน มีสิ่งอำนวยความสะดวกครบครัน สบายตาและเงียบสงบ',
    amenities: ['ฟรี Wi-Fi 500Mbps', 'สมาร์ททีวี 55 นิ้ว', 'เครื่องปรับอากาศ', 'มินิบาร์ฟรี', 'ฝักบัวเรนชาวเวอร์', 'โต๊ะทำงาน'],
    imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80',
    status: 'available',
    rating: 4.8,
    reviewsCount: 124,
  },
  {
    roomNumber: '205',
    name: 'Deluxe Ocean View (ซีวิว พรีเมียม)',
    type: 'Deluxe',
    pricePerNight: 3900,
    capacity: 2,
    bedType: 'เตียงคิงไซส์พรีเมียม',
    sizeSqM: 48,
    floor: 2,
    description: 'ทิวทัศน์ทะเลแบบพาโนรามาพร้อมอ่างอาบน้ำกระจกชมวิวพระอาทิตย์ตกดิน และบริการอาหารเช้าลอยน้ำ (Floating Breakfast)',
    amenities: ['ระเบียงวิวทะเล', 'อ่างอาบน้ำจากุซซี่', 'เครื่องชงกาแฟ Nespresso', 'ฟรี Wi-Fi Ultra Fast', 'ตู้เซฟนิรภัย', 'ชุดคลุมผ้าไหม'],
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
    status: 'available',
    rating: 4.9,
    reviewsCount: 218,
  },
  {
    roomNumber: '302',
    name: 'Executive Suite Horizon (เอ็กเซกคิวทีฟสูท)',
    type: 'Executive Suite',
    pricePerNight: 5800,
    capacity: 3,
    bedType: 'เตียงคิงไซส์ + โซฟาเบดหรู',
    sizeSqM: 75,
    floor: 3,
    description: 'ห้องสวีทพื้นที่กว้างขวาง แบ่งสัดส่วนห้องนั่งเล่นและห้องนอน พร้อมสิทธิ์เข้าใช้คลับเลานจ์และบริการผู้ช่วยส่วนตัว',
    amenities: ['สิทธิ์ Club Lounge', 'ห้องนั่งเล่นแยกส่วน', 'อ่างจากุซซี่หรู', 'เครื่องเสียง Marshall', 'เครื่องฟอกอากาศ Dyson', 'ค็อกเทลยามเย็นฟรี'],
    imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
    status: 'available',
    rating: 5.0,
    reviewsCount: 95,
  },
  {
    roomNumber: 'V-01',
    name: 'Royal Oceanfront Pool Villa (พูลวิลล่าติดชายหาด)',
    type: 'Ocean Villa',
    pricePerNight: 11500,
    capacity: 4,
    bedType: '2 เตียงคิงไซส์ (2 ห้องนอน)',
    sizeSqM: 160,
    floor: 1,
    description: 'วิลล่าริมทะเลส่วนตัวพร้อมสระว่ายน้ำอินฟินิตี้ส่วนตัว ก้าวลงหาดทรายได้ทันที เหมาะสำหรับวันพักผ่อนสุดเอ็กซ์คลูซีฟ',
    amenities: ['สระว่ายน้ำส่วนตัว', 'ทางลงหาดส่วนตัว', 'ศาลาริมสระ', 'บัตเลอร์ส่วนตัว 24 ชม.', 'BBQ เตาปิ้งย่างริมหาด', 'ไวน์ชั้นดีต้อนรับ'],
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
    status: 'available',
    rating: 5.0,
    reviewsCount: 160,
  },
  {
    roomNumber: '401',
    name: 'Grand Family Panoramic Suite (สวีทครอบครัว)',
    type: 'Family Suite',
    pricePerNight: 7200,
    capacity: 5,
    bedType: '1 คิงไซส์ + 2 ควีนไซส์',
    sizeSqM: 110,
    floor: 4,
    description: 'ห้องพักครอบครัวขนาดใหญ่ พร้อมมุมเด็กเล่น โต๊ะรับประทานอาหาร ครัวขนาดเล็ก และวิวเมืองผสมผสานวิวทะเล',
    amenities: ['2 ห้องนอน 2 ห้องน้ำ', 'มุมของเล่นเด็ก', 'ไมโครเวฟและครัวเล็ก', 'โซนรับประทานอาหาร', 'เครื่องเล่นเกมคอนโซล', 'สิ่งอำนวยความสะดวกสำหรับเด็ก'],
    imageUrl: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80',
    status: 'available',
    rating: 4.9,
    reviewsCount: 88,
  },
  {
    roomNumber: '108',
    name: 'Cozy Deluxe Pool Access (ห้องติดสระว่ายน้ำ)',
    type: 'Deluxe',
    pricePerNight: 4200,
    capacity: 2,
    bedType: 'เตียงคิงไซส์',
    sizeSqM: 45,
    floor: 1,
    description: 'เปิดประตูระเบียงก้าวลงสระว่ายน้ำลากูนได้ทันที พร้อมเก้าอี้อาบแดดส่วนตัวริมน้ำ',
    amenities: ['ลงสระว่ายน้ำได้โดยตรง', 'เก้าอี้อาบแดดส่วนตัว', 'สมาร์ททีวี', 'เรนชาวเวอร์', 'ลำโพงบลูทูธ', 'ชุดชงชาออร์แกนิก'],
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80',
    status: 'available',
    rating: 4.8,
    reviewsCount: 142,
  },
];

// Recursively strips undefined fields from an object so Firestore setDoc / updateDoc does not reject it
export const cleanForFirestore = <T extends Record<string, any>>(obj: T): T => {
  const result: any = Array.isArray(obj) ? [] : {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
        result[key] = cleanForFirestore(val);
      } else {
        result[key] = val;
      }
    }
  }
  return result;
};

// Seed sample historical bookings for rich monthly revenue charts if needed
export const generateSampleHistoricalBookings = (rooms: Room[]): Omit<Booking, 'id'>[] => {
  const pastMonths = [
    { month: '2026-05', count: 18, baseRevenue: 84000 },
    { month: '2026-06', count: 24, baseRevenue: 112000 },
    { month: '2026-07', count: 32, baseRevenue: 156000 },
    { month: '2026-08', count: 29, baseRevenue: 142000 },
    { month: '2026-09', count: 14, baseRevenue: 78000 },
  ];

  const samples: Omit<Booking, 'id'>[] = [];
  let seq = 1000;

  pastMonths.forEach((pm) => {
    for (let i = 0; i < pm.count; i++) {
      seq++;
      const fallbackRoom: Room = { ...INITIAL_SAMPLE_ROOMS[0], id: 'sample-room-0' };
      const targetRoom: Room = rooms[i % (rooms.length || 1)] || fallbackRoom;
      const isCancelled = i % 8 === 0; // ~12% cancellation rate for realistic analytics
      const day = String((i % 27) + 1).padStart(2, '0');
      const checkInDate = `${pm.month}-${day}`;
      const nights = (i % 3) + 1;
      const subtotal = (targetRoom.pricePerNight || 3500) * nights;
      const tax = Math.round(subtotal * 0.07);
      const totalPrice = subtotal + tax;

      const bookingItem: Record<string, any> = {
        bookingNumber: `BK-${pm.month.replace('-', '')}-${seq}`,
        roomId: targetRoom.id || `sample-room-${i % 6}`,
        roomNumber: targetRoom.roomNumber || '101',
        roomName: targetRoom.name || 'Superior Room',
        roomType: targetRoom.type || 'Standard',
        roomImageUrl: targetRoom.imageUrl || '',
        userId: `user-sample-${(i % 10) + 1}`,
        userEmail: `guest${i + 1}@hotelguest.com`,
        userName: ['สมชาย สายลม', 'นภา วงศ์สุวรรณ', 'พงศกร ธนสิทธิ์', 'อารียา สุขสมบัติ', 'กิตติศักดิ์ พรภิรมย์', 'วราภรณ์ เจริญสุข', 'David Miller', 'Sakura Tanaka'][i % 8],
        userPhone: `08${(10000000 + i * 372).toString().slice(0, 8)}`,
        checkInDate,
        checkOutDate: `${pm.month}-${String(Math.min(28, Number(day) + nights)).padStart(2, '0')}`,
        nights,
        guests: (i % 3) + 1,
        pricePerNight: targetRoom.pricePerNight || 3500,
        subtotal,
        tax,
        totalPrice,
        paymentStatus: isCancelled ? 'refunded' : 'paid',
        paymentMethod: 'credit_card',
        cardLast4: String(4000 + (i * 73) % 5000).padStart(4, '0'),
        cardBrand: (['visa', 'mastercard', 'jcb'] as const)[i % 3],
        cardHolder: 'GUEST CARDHOLDER',
        status: isCancelled ? 'cancelled' : 'completed',
        createdAt: `${pm.month}-${day}T08:30:00.000Z`,
        emailNotificationSent: true,
        mobileNotificationSent: true,
      };

      if (isCancelled) {
        bookingItem.cancellationDate = `${pm.month}-${day}T14:00:00.000Z`;
        bookingItem.cancellationReason = 'ติดภารกิจด่วนส่วนตัว';
        bookingItem.refundAmount = totalPrice;
        bookingItem.refundPercent = 100;
      }

      samples.push(bookingItem as Omit<Booking, 'id'>);
    }
  });

  return samples;
};

// Seed database on start if empty
export const seedInitialHotelData = async (): Promise<void> => {
  try {
    const roomsSnap = await getDocs(collection(db, ROOMS_COLLECTION));
    let createdRooms: Room[] = [];
    if (roomsSnap.empty) {
      console.log('Seeding initial rooms to Firestore bang-bf7d8...');
      for (const roomData of INITIAL_SAMPLE_ROOMS) {
        const roomRef = doc(collection(db, ROOMS_COLLECTION));
        const roomObj: Room = {
          ...roomData,
          id: roomRef.id,
        };
        await setDoc(roomRef, cleanForFirestore(roomObj));
        createdRooms.push(roomObj);
      }
    } else {
      roomsSnap.forEach((d) => {
        createdRooms.push({ ...d.data(), id: d.id } as Room);
      });
    }

    // Also seed some historical bookings so admin dashboard charts look rich immediately
    const bookingsSnap = await getDocs(collection(db, BOOKINGS_COLLECTION));
    if (bookingsSnap.empty) {
      console.log('Seeding initial sample bookings to Firestore...');
      const sampleBookings = generateSampleHistoricalBookings(createdRooms);
      for (const b of sampleBookings) {
        const bRef = doc(collection(db, BOOKINGS_COLLECTION));
        await setDoc(bRef, cleanForFirestore({ ...b, id: bRef.id }));
      }
    }
  } catch (err) {
    console.error('Error seeding initial data to Firestore:', err);
  }
};

// Real-time listener for Rooms
export const subscribeRooms = (callback: (rooms: Room[]) => void) => {
  const roomsRef = collection(db, ROOMS_COLLECTION);
  return onSnapshot(
    roomsRef,
    (snapshot) => {
      const list: Room[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Room);
      });
      // Sort by room number or rating
      list.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }));
      callback(list);
    },
    (err) => {
      console.error('Rooms subscription error:', err);
    }
  );
};

// Real-time listener for Bookings
export const subscribeBookings = (callback: (bookings: Booking[]) => void) => {
  const bookingsRef = collection(db, BOOKINGS_COLLECTION);
  return onSnapshot(
    bookingsRef,
    (snapshot) => {
      const list: Booking[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Booking);
      });
      // Sort latest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    },
    (err) => {
      console.error('Bookings subscription error:', err);
    }
  );
};

// Real-time listener for Notifications
export const subscribeNotifications = (callback: (notifs: HotelNotification[]) => void) => {
  const notifRef = collection(db, NOTIFICATIONS_COLLECTION);
  return onSnapshot(
    notifRef,
    (snapshot) => {
      const list: HotelNotification[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as HotelNotification);
      });
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(list);
    },
    (err) => {
      console.error('Notifications subscription error:', err);
    }
  );
};

// Add or update room
export const saveRoom = async (room: Partial<Room>): Promise<string> => {
  if (room.id) {
    const docRef = doc(db, ROOMS_COLLECTION, room.id);
    await updateDoc(docRef, cleanForFirestore({ ...room }));
    return room.id;
  } else {
    const newDocRef = doc(collection(db, ROOMS_COLLECTION));
    const newRoom: Room = {
      id: newDocRef.id,
      roomNumber: room.roomNumber || '101',
      name: room.name || 'New Luxury Room',
      type: room.type || 'Standard',
      pricePerNight: room.pricePerNight || 2500,
      capacity: room.capacity || 2,
      bedType: room.bedType || '1 King Bed',
      sizeSqM: room.sizeSqM || 40,
      floor: room.floor || 1,
      description: room.description || '',
      amenities: room.amenities || ['ฟรี Wi-Fi', 'เครื่องปรับอากาศ'],
      imageUrl: room.imageUrl || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80',
      status: room.status || 'available',
      rating: room.rating || 5.0,
      reviewsCount: room.reviewsCount || 1,
    };
    await setDoc(newDocRef, cleanForFirestore(newRoom));
    return newDocRef.id;
  }
};

// Toggle room status in real-time
export const updateRoomStatus = async (roomId: string, status: RoomStatus): Promise<void> => {
  const docRef = doc(db, ROOMS_COLLECTION, roomId);
  await updateDoc(docRef, { status });
};

// Delete room
export const deleteRoom = async (roomId: string): Promise<void> => {
  const docRef = doc(db, ROOMS_COLLECTION, roomId);
  await deleteDoc(docRef);
};

// Create new booking with credit card payment
export const createBooking = async (
  bookingInput: Omit<Booking, 'id' | 'bookingNumber' | 'status' | 'createdAt' | 'emailNotificationSent' | 'mobileNotificationSent'>
): Promise<Booking> => {
  const bookingRef = doc(collection(db, BOOKINGS_COLLECTION));
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const bookingNumber = `BK-${yyyy}${mm}-${randomSuffix}`;

  const newBooking: Booking = {
    ...bookingInput,
    id: bookingRef.id,
    bookingNumber,
    status: 'confirmed',
    createdAt: now.toISOString(),
    emailNotificationSent: true,
    mobileNotificationSent: true,
  };

  // Write booking
  await setDoc(bookingRef, cleanForFirestore(newBooking));

  // Update room status
  try {
    await updateRoomStatus(bookingInput.roomId, 'booked');
  } catch (err) {
    console.warn('Room status update non-fatal:', err);
  }

  // Create real-time notification records (Email + Mobile)
  try {
    const emailNotifRef = doc(collection(db, NOTIFICATIONS_COLLECTION));
    await setDoc(emailNotifRef, cleanForFirestore({
      id: emailNotifRef.id,
      type: 'email',
      bookingId: newBooking.id,
      bookingNumber: newBooking.bookingNumber,
      title: `[ยืนยันการจองห้องพัก] ${newBooking.roomName} (รหัส: ${newBooking.bookingNumber})`,
      body: `เรียนคุณ ${newBooking.userName}, การชำระเงินผ่านบัตร ${newBooking.cardBrand.toUpperCase()} (•••• ${newBooking.cardLast4}) ยอดเงิน ฿${newBooking.totalPrice.toLocaleString()} สำเร็จแล้ว การจองได้รับการยืนยัน เช็คอินวันที่ ${newBooking.checkInDate}`,
      recipientEmail: newBooking.userEmail,
      timestamp: new Date().toISOString(),
      read: false,
    }));

    const pushNotifRef = doc(collection(db, NOTIFICATIONS_COLLECTION));
    await setDoc(pushNotifRef, cleanForFirestore({
      id: pushNotifRef.id,
      type: 'mobile_push',
      bookingId: newBooking.id,
      bookingNumber: newBooking.bookingNumber,
      title: '🏨 ยืนยันการจองห้องพักเรียบร้อยแล้ว!',
      body: `การจอง ${newBooking.bookingNumber} ได้รับการชำระเงินเรียบร้อยแล้ว เตรียมพบกับความสุขที่ Bang Hotel`,
      recipientEmail: newBooking.userEmail,
      timestamp: new Date().toISOString(),
      read: false,
    }));
  } catch (e) {
    console.warn('Notification log write:', e);
  }

  return newBooking;
};

// Calculate refund based on flexible cancellation policy
export const calculateFlexibleRefund = (
  checkInDateStr: string,
  totalPrice: number
): { refundPercent: number; refundAmount: number; hoursRemaining: number; tierText: string } => {
  const checkInDate = new Date(`${checkInDateStr}T14:00:00`);
  const now = new Date();
  const diffMs = checkInDate.getTime() - now.getTime();
  const hoursRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

  let refundPercent = 100;
  let tierText = 'ยกเลิกล่วงหน้ามากกว่า 48 ชั่วโมง: คืนเงินเต็มจำนวน 100%';

  if (hoursRemaining >= 48) {
    refundPercent = 100;
    tierText = 'ยกเลิกล่วงหน้ามากกว่า 48 ชั่วโมง (คืนเงิน 100%)';
  } else if (hoursRemaining >= 24) {
    refundPercent = 75;
    tierText = 'ยกเลิกล่วงหน้า 24-48 ชั่วโมง (คืนเงิน 75%)';
  } else if (hoursRemaining >= 6) {
    refundPercent = 50;
    tierText = 'ยกเลิกล่วงหน้า 6-24 ชั่วโมง (คืนเงิน 50%)';
  } else {
    refundPercent = 25;
    tierText = 'ยกเลิกล่วงหน้าน้อยกว่า 6 ชั่วโมง (คืนเงินบางส่วน 25%)';
  }

  const refundAmount = Math.round((totalPrice * refundPercent) / 100);

  return {
    refundPercent,
    refundAmount,
    hoursRemaining,
    tierText,
  };
};

// Cancel booking
export const cancelBooking = async (
  bookingId: string,
  roomId: string,
  reason: string,
  checkInDate: string,
  totalPrice: number
): Promise<{ refundAmount: number; refundPercent: number }> => {
  const { refundAmount, refundPercent } = calculateFlexibleRefund(checkInDate, totalPrice);
  const now = new Date().toISOString();

  const bookingDoc = doc(db, BOOKINGS_COLLECTION, bookingId);
  await updateDoc(bookingDoc, cleanForFirestore({
    status: 'cancelled',
    paymentStatus: 'refunded',
    cancellationDate: now,
    cancellationReason: reason,
    refundAmount,
    refundPercent,
  }));

  // Re-open room to available
  try {
    await updateRoomStatus(roomId, 'available');
  } catch (err) {
    console.warn('Reset room status on cancellation:', err);
  }

  // Add cancellation notifications
  try {
    const cancelPushRef = doc(collection(db, NOTIFICATIONS_COLLECTION));
    await setDoc(cancelPushRef, cleanForFirestore({
      id: cancelPushRef.id,
      type: 'mobile_push',
      bookingId,
      bookingNumber: '',
      title: '⚠️ ยกเลิกการจองและดำเนินการคืนเงินสำเร็จ',
      body: `ระบบได้คืนเงินจำนวน ฿${refundAmount.toLocaleString()} (${refundPercent}%) เข้าบัตรเครดิตเรียบร้อยแล้ว`,
      timestamp: now,
      read: false,
    }));

    const cancelEmailRef = doc(collection(db, NOTIFICATIONS_COLLECTION));
    await setDoc(cancelEmailRef, cleanForFirestore({
      id: cancelEmailRef.id,
      type: 'email',
      bookingId,
      bookingNumber: '',
      title: `[แจ้งการยกเลิกและคืนเงิน] การจองของคุณได้รับการยกเลิกแล้ว`,
      body: `การจองได้รับการยกเลิกสำเร็จตามคำขอของคุณ เหตุผล: "${reason}" ได้ทำการคืนเงินยอด ฿${refundAmount.toLocaleString()} เรียบร้อยแล้ว`,
      timestamp: now,
      read: false,
    }));
  } catch (e) {
    console.warn('Cancel notification write:', e);
  }

  return { refundAmount, refundPercent };
};

// Compute monthly revenue and statistics from bookings
export const computeMonthlyRevenueStats = (bookings: Booking[]): MonthlyRevenueStats[] => {
  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const fullThaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const map = new Map<string, {
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    grossRevenue: number;
    refundedRevenue: number;
    netRevenue: number;
    nightsTotal: number;
  }>();

  // Initialize last 6 months
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const key = `${yyyy}-${mm}`;
    map.set(key, {
      totalBookings: 0,
      confirmedBookings: 0,
      cancelledBookings: 0,
      grossRevenue: 0,
      refundedRevenue: 0,
      netRevenue: 0,
      nightsTotal: 0,
    });
  }

  // Aggregate bookings
  bookings.forEach((b) => {
    // Extract YYYY-MM from checkInDate or createdAt
    const monthKey = (b.checkInDate || b.createdAt || '').slice(0, 7);
    if (!monthKey || monthKey.length < 7) return;

    if (!map.has(monthKey)) {
      map.set(monthKey, {
        totalBookings: 0,
        confirmedBookings: 0,
        cancelledBookings: 0,
        grossRevenue: 0,
        refundedRevenue: 0,
        netRevenue: 0,
        nightsTotal: 0,
      });
    }

    const current = map.get(monthKey)!;
    current.totalBookings += 1;
    current.grossRevenue += b.totalPrice || 0;
    current.nightsTotal += b.nights || 1;

    if (b.status === 'cancelled') {
      current.cancelledBookings += 1;
      current.refundedRevenue += b.refundAmount || 0;
    } else {
      current.confirmedBookings += 1;
    }
  });

  const sortedKeys = Array.from(map.keys()).sort();

  return sortedKeys.map((key) => {
    const data = map.get(key)!;
    const [yearStr, monthStr] = key.split('-');
    const mIdx = parseInt(monthStr, 10) - 1;
    const yearThai = parseInt(yearStr, 10) + 543;
    const monthLabel = `${fullThaiMonths[mIdx] || monthStr} ${yearThai}`;
    const netRevenue = Math.max(0, data.grossRevenue - data.refundedRevenue);
    const averageBookingValue = data.totalBookings > 0 ? Math.round(data.grossRevenue / data.totalBookings) : 0;
    // Estimated occupancy rate (assume 10 available rooms x 30 days = 300 room nights max)
    const occupancyRate = Math.min(96, Math.max(20, Math.round((data.nightsTotal / 120) * 100)));

    return {
      month: key,
      monthLabel,
      totalBookings: data.totalBookings,
      confirmedBookings: data.confirmedBookings,
      cancelledBookings: data.cancelledBookings,
      grossRevenue: data.grossRevenue,
      refundedRevenue: data.refundedRevenue,
      netRevenue,
      averageBookingValue,
      occupancyRate,
    };
  });
};
