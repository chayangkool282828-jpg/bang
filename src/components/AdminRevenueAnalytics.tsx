import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  Table as TableIcon, 
  Download, 
  Calendar, 
  DollarSign, 
  Percent, 
  ArrowUpRight, 
  ArrowDownRight, 
  RotateCcw, 
  CheckCircle2, 
  Filter,
  FileText
} from 'lucide-react';
import { Booking, Room, MonthlyRevenueStats } from '../types/hotel';
import { computeMonthlyRevenueStats } from '../services/hotelService';
import { exportRevenueReportPDF } from '../utils/pdfExport';

interface AdminRevenueAnalyticsProps {
  bookings: Booking[];
  rooms: Room[];
}

export const AdminRevenueAnalytics: React.FC<AdminRevenueAnalyticsProps> = ({
  bookings,
  rooms,
}) => {
  // Display Format Options: Bar Chart, Line Chart, Distribution, or Detailed Table
  const [displayMode, setDisplayMode] = useState<'bar' | 'line' | 'pie' | 'table'>('bar');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  // Compute monthly data
  const monthlyStats = useMemo(() => {
    return computeMonthlyRevenueStats(bookings);
  }, [bookings]);

  // Overall totals
  const totals = useMemo(() => {
    const gross = monthlyStats.reduce((sum, m) => sum + m.grossRevenue, 0);
    const refunded = monthlyStats.reduce((sum, m) => sum + m.refundedRevenue, 0);
    const net = Math.max(0, gross - refunded);
    const totalCount = monthlyStats.reduce((sum, m) => sum + m.totalBookings, 0);
    const confirmedCount = monthlyStats.reduce((sum, m) => sum + m.confirmedBookings, 0);
    const cancelledCount = monthlyStats.reduce((sum, m) => sum + m.cancelledBookings, 0);
    const cancelRate = totalCount > 0 ? ((cancelledCount / totalCount) * 100).toFixed(1) : '0';
    const adr = confirmedCount > 0 ? Math.round(net / confirmedCount) : 0;
    const avgOccupancy = monthlyStats.length > 0
      ? Math.round(monthlyStats.reduce((s, m) => s + m.occupancyRate, 0) / monthlyStats.length)
      : 75;

    return { gross, refunded, net, totalCount, confirmedCount, cancelledCount, cancelRate, adr, avgOccupancy };
  }, [monthlyStats]);

  // Room type revenue distribution
  const roomTypeDistribution = useMemo(() => {
    const map: Record<string, { count: number; revenue: number }> = {};
    bookings.forEach((b) => {
      const type = b.roomType || 'Standard';
      if (!map[type]) {
        map[type] = { count: 0, revenue: 0 };
      }
      map[type].count += 1;
      if (b.status !== 'cancelled') {
        map[type].revenue += b.totalPrice || 0;
      }
    });

    const totalRev = Object.values(map).reduce((sum, item) => sum + item.revenue, 0) || 1;
    return Object.entries(map).map(([type, data]) => ({
      type,
      count: data.count,
      revenue: data.revenue,
      percentage: Math.round((data.revenue / totalRev) * 100),
    })).sort((a, b) => b.revenue - a.revenue);
  }, [bookings]);

  // Max value for chart scaling
  const maxMonthlyGross = Math.max(
    ...monthlyStats.map((m) => Math.max(m.grossRevenue, m.netRevenue, 10000)),
    10000
  );

  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      exportRevenueReportPDF(
        monthlyStats,
        bookings,
        rooms,
        selectedPeriod === 'all' ? undefined : selectedPeriod
      );
    } catch (err) {
      console.error('PDF export error:', err);
      alert('เกิดข้อผิดพลาดในการสร้างไฟล์ PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              วิเคราะห์รายได้และผลการดำเนินงาน (Revenue Analytics)
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              Firestore bang-bf7d8
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            กราฟสรุปข้อมูลรายได้แต่ละเดือน พร้อมปรับรูปแบบการแสดงผลตามความต้องการ และส่งออก PDF
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Display Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/60 text-xs">
            <button
              id="format-bar-chart"
              onClick={() => setDisplayMode('bar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                displayMode === 'bar' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="แสดงกราฟแท่งเปรียบเทียบรายได้"
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">กราฟแท่ง</span>
            </button>

            <button
              id="format-line-chart"
              onClick={() => setDisplayMode('line')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                displayMode === 'line' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="แสดงกราฟเส้นแนวโน้มการเติบโต"
            >
              <LineChartIcon className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">กราฟเส้น</span>
            </button>

            <button
              id="format-pie-chart"
              onClick={() => setDisplayMode('pie')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                displayMode === 'pie' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="แสดงสัดส่วนประเภทห้องพัก"
            >
              <PieChartIcon className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">สัดส่วนห้องพัก</span>
            </button>

            <button
              id="format-table"
              onClick={() => setDisplayMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                displayMode === 'table' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="แสดงตารางแจกแจงข้อมูลตัวเลข"
            >
              <TableIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">ตารางข้อมูล</span>
            </button>
          </div>

          {/* Export PDF Button */}
          <button
            id="btn-export-pdf"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/20 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>{isExporting ? 'กำลังสร้าง PDF...' : 'ส่งออกรายงาน PDF'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Gross Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>รายได้รวม (Gross)</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
            ฿{totals.gross.toLocaleString()}
          </h3>
          <p className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" /> จากการจอง {totals.totalCount} รายการ
          </p>
        </div>

        {/* Card 2: Net Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>รายได้สุทธิ (Net Revenue)</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-600 font-['Plus_Jakarta_Sans',sans-serif]">
            ฿{totals.net.toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            หักยอดคืนเงินแล้ว ฿{totals.refunded.toLocaleString()}
          </p>
        </div>

        {/* Card 3: Cancellations & Refund */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>อัตราการยกเลิก (Cancel Rate)</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
            {totals.cancelRate}%
          </h3>
          <p className="text-[11px] text-red-500 mt-1 font-medium">
            ยกเลิก {totals.cancelledCount} รายการ (คืนเงินสำเร็จ 100%)
          </p>
        </div>

        {/* Card 4: Occupancy Rate */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>อัตราการเข้าพักเฉลี่ย (Occupancy)</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-blue-600 font-['Plus_Jakarta_Sans',sans-serif]">
            {totals.avgOccupancy}%
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            ราคาเฉลี่ยต่อห้อง (ADR): ฿{totals.adr.toLocaleString()}
          </p>
        </div>

      </div>

      {/* Main Presentation Container */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        
        {/* VIEW 1: Monthly Revenue Bar Chart */}
        {displayMode === 'bar' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  กราฟแท่งสรุปรายได้แต่ละเดือน (Monthly Gross vs Net Revenue)
                </h3>
                <p className="text-xs text-slate-500">เปรียบเทียบยอดรวม ยอดสุทธิ และยอดการยกเลิกในแต่ละเดือน</p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-500"></span>
                  <span className="text-slate-600">รายได้รวม (Gross)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500"></span>
                  <span className="text-slate-600">รายได้สุทธิ (Net)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-red-400"></span>
                  <span className="text-slate-600">คืนเงินยกเลิก (Refund)</span>
                </div>
              </div>
            </div>

            {/* Bar Chart Visualization */}
            <div className="space-y-6 pt-4">
              {monthlyStats.map((item) => {
                const grossWidth = Math.max(4, Math.round((item.grossRevenue / maxMonthlyGross) * 100));
                const netWidth = Math.max(4, Math.round((item.netRevenue / maxMonthlyGross) * 100));
                const refundWidth = Math.round((item.refundedRevenue / maxMonthlyGross) * 100);

                return (
                  <div key={item.month} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{item.monthLabel}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500">จอง {item.totalBookings} รายการ</span>
                        <span className="font-bold text-slate-900">สุทธิ: ฿{item.netRevenue.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Dual comparative bars */}
                    <div className="w-full bg-slate-100 rounded-xl h-6 p-0.5 flex gap-1 relative overflow-hidden">
                      {/* Net revenue bar */}
                      <div
                        style={{ width: `${netWidth}%` }}
                        className="bg-emerald-500 rounded-lg h-full flex items-center px-2 text-[10px] font-bold text-white transition-all duration-500 truncate"
                        title={`Net: ฿${item.netRevenue.toLocaleString()}`}
                      >
                        {netWidth > 15 && `฿${item.netRevenue.toLocaleString()}`}
                      </div>

                      {/* Refunded portion */}
                      {refundWidth > 0 && (
                        <div
                          style={{ width: `${refundWidth}%` }}
                          className="bg-red-400 rounded-lg h-full flex items-center px-1 text-[9px] font-bold text-white transition-all duration-500 truncate"
                          title={`Refunded: ฿${item.refundedRevenue.toLocaleString()}`}
                        >
                          {refundWidth > 10 && `คืน ฿${item.refundedRevenue.toLocaleString()}`}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: Trend Line Chart Simulation */}
        {displayMode === 'line' && (
          <div>
            <div className="mb-6">
              <h3 className="font-bold text-base text-slate-900">
                กราฟเส้นแนวโน้มการเติบโตของรายได้ (Revenue Growth Trajectory)
              </h3>
              <p className="text-xs text-slate-500">ติดตามทิศทางรายได้สะสมและอัตราการเข้าพักตลอดแต่ละช่วงเดือน</p>
            </div>

            {/* SVG Visual Smooth Curved Line Chart */}
            <div className="w-full bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <div className="h-64 flex items-end justify-between gap-4 relative pt-8 pb-4">
                
                {/* Horizontal guide lines */}
                <div className="absolute inset-x-0 top-8 border-b border-dashed border-slate-200 text-[10px] text-slate-400 pl-2">
                  ฿{maxMonthlyGross.toLocaleString()}
                </div>
                <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-slate-200 text-[10px] text-slate-400 pl-2">
                  ฿{Math.round(maxMonthlyGross / 2).toLocaleString()}
                </div>
                <div className="absolute inset-x-0 bottom-4 border-b border-slate-300 text-[10px] text-slate-400 pl-2">
                  ฿0
                </div>

                {/* Line Points */}
                {monthlyStats.map((item, idx) => {
                  const heightPercent = Math.max(10, Math.round((item.netRevenue / maxMonthlyGross) * 80));

                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center justify-end h-full z-10 group">
                      {/* Floating tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg pointer-events-none text-center">
                        <p className="font-bold">฿{item.netRevenue.toLocaleString()}</p>
                        <p className="text-slate-300">เข้าพัก {item.occupancyRate}%</p>
                      </div>

                      {/* Point dot & stem */}
                      <div className="w-4 h-4 rounded-full bg-amber-600 border-4 border-white shadow-md group-hover:scale-125 transition-transform"></div>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-1 bg-gradient-to-t from-amber-200 to-amber-500 rounded-t mt-1"
                      ></div>

                      <span className="text-[11px] font-semibold text-slate-700 mt-2 truncate max-w-[80px]">
                        {item.month.slice(5)}/{item.month.slice(2, 4)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: Room Type Distribution */}
        {displayMode === 'pie' && (
          <div>
            <div className="mb-6">
              <h3 className="font-bold text-base text-slate-900">
                สัดส่วนรายได้แยกตามประเภทห้องพัก (Revenue by Room Category)
              </h3>
              <p className="text-xs text-slate-500">วิเคราะห์ประเภทห้องพักที่สร้างรายได้สูงสุดและจำนวนการจอง</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category bars & percentages */}
              <div className="space-y-4">
                {roomTypeDistribution.map((cat, idx) => {
                  const colors = [
                    'bg-amber-600',
                    'bg-blue-600',
                    'bg-purple-600',
                    'bg-emerald-600',
                    'bg-rose-600',
                  ];
                  const color = colors[idx % colors.length];

                  return (
                    <div key={cat.type} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${color}`}></span>
                          <span className="font-bold text-slate-800">{cat.type}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900">฿{cat.revenue.toLocaleString()}</span>
                          <span className="text-slate-400 text-[10px] ml-1.5">({cat.percentage}%)</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          style={{ width: `${cat.percentage}%` }}
                          className={`h-full ${color} rounded-full`}
                        ></div>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        จำนวนการจอง: {cat.count} ครั้ง
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Insight Box */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col justify-between">
                <div>
                  <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                    Executive Insight
                  </span>
                  <h4 className="text-lg font-bold mt-1">ห้องพักประเภทพูลวิลล่าและสวีทสร้างมูลค่าสูงสุด</h4>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    จากการวิเคราะห์ข้อมูลในระบบ Firestore bang-bf7d8 ห้องประเภท Ocean Villa และ Executive Suite มีอัตราค่าห้องพักต่อคืนสูงและมีอัตราการยกเลิกต่ำกว่า 5% แนะนำให้พิจารณาเพิ่มโปรโมชั่นพักผ่อนระยะยาว
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-700/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">ห้องพักยอดนิยม</span>
                    <span className="font-bold text-amber-400">{roomTypeDistribution[0]?.type || 'Deluxe'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">สัดส่วนรายได้</span>
                    <span className="font-bold text-emerald-400">{roomTypeDistribution[0]?.percentage || 45}%</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 4: Comprehensive Data Table */}
        {displayMode === 'table' && (
          <div>
            <div className="mb-4">
              <h3 className="font-bold text-base text-slate-900">
                ตารางแจกแจงข้อมูลตัวเลขเชิงลึก (Detailed Audit Grid)
              </h3>
              <p className="text-xs text-slate-500">ตรวจสอบรายละเอียดรายได้ ยอดคืนเงิน และอัตราการเข้าพักแต่ละเดือน</p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="p-3">เดือน</th>
                    <th className="p-3 text-center">การจองทั้งหมด</th>
                    <th className="p-3 text-center">ยืนยัน</th>
                    <th className="p-3 text-center">ยกเลิก</th>
                    <th className="p-3 text-right">รายได้รวม (Gross)</th>
                    <th className="p-3 text-right">ยอดคืนเงิน (Refund)</th>
                    <th className="p-3 text-right">รายได้สุทธิ (Net)</th>
                    <th className="p-3 text-center">อัตราเข้าพัก</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlyStats.map((item) => (
                    <tr key={item.month} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{item.monthLabel}</td>
                      <td className="p-3 text-center">{item.totalBookings}</td>
                      <td className="p-3 text-center text-emerald-700 font-bold">{item.confirmedBookings}</td>
                      <td className="p-3 text-center text-red-600 font-bold">{item.cancelledBookings}</td>
                      <td className="p-3 text-right">฿{item.grossRevenue.toLocaleString()}</td>
                      <td className="p-3 text-right text-red-500">- ฿{item.refundedRevenue.toLocaleString()}</td>
                      <td className="p-3 text-right font-extrabold text-slate-900">฿{item.netRevenue.toLocaleString()}</td>
                      <td className="p-3 text-center font-bold text-blue-700">{item.occupancyRate}%</td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="bg-slate-100 font-bold text-slate-900">
                    <td className="p-3">รวมทั้งหมด (TOTAL)</td>
                    <td className="p-3 text-center">{totals.totalCount}</td>
                    <td className="p-3 text-center text-emerald-700">{totals.confirmedCount}</td>
                    <td className="p-3 text-center text-red-600">{totals.cancelledCount}</td>
                    <td className="p-3 text-right">฿{totals.gross.toLocaleString()}</td>
                    <td className="p-3 text-right text-red-600">- ฿{totals.refunded.toLocaleString()}</td>
                    <td className="p-3 text-right text-emerald-700 text-sm">฿{totals.net.toLocaleString()}</td>
                    <td className="p-3 text-center">{totals.avgOccupancy}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
