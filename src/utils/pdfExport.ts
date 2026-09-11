import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MonthlyRevenueStats, Booking, Room } from '../types/hotel';

export const exportRevenueReportPDF = (
  stats: MonthlyRevenueStats[],
  bookings: Booking[],
  rooms: Room[],
  filterYearMonth?: string
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Primary Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 42, 'F');

  doc.setFillColor(217, 119, 6); // amber-600 accent line
  doc.rect(0, 42, pageWidth, 2.5, 'F');

  // Title & Subtitle (In English & Latin transliteration for universal standard PDF font compatibility)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('BANG HOTEL & LUXURY RESORTS', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('Monthly Revenue & Performance Analytics Report (Database: bang-bf7d8)', 14, 26);
  doc.text(`Generated: ${new Date().toLocaleString('th-TH')} | Period: ${filterYearMonth || 'All Recent Months'}`, 14, 33);

  // Executive KPI Summary Cards
  const totalGross = stats.reduce((acc, s) => acc + s.grossRevenue, 0);
  const totalRefund = stats.reduce((acc, s) => acc + s.refundedRevenue, 0);
  const totalNet = stats.reduce((acc, s) => acc + s.netRevenue, 0);
  const totalBookings = stats.reduce((acc, s) => acc + s.totalBookings, 0);
  const totalConfirmed = stats.reduce((acc, s) => acc + s.confirmedBookings, 0);
  const totalCancelled = stats.reduce((acc, s) => acc + s.cancelledBookings, 0);
  const cancellationRate = totalBookings > 0 ? ((totalCancelled / totalBookings) * 100).toFixed(1) : '0.0';

  let y = 52;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. EXECUTIVE SUMMARY & KEY METRICS', 14, y);

  y += 6;
  const kpis = [
    { label: 'Gross Revenue', val: `THB ${totalGross.toLocaleString()}`, color: [30, 41, 59] },
    { label: 'Net Revenue', val: `THB ${totalNet.toLocaleString()}`, color: [16, 185, 129] },
    { label: 'Refunded (Cancellations)', val: `THB ${totalRefund.toLocaleString()}`, color: [239, 68, 68] },
    { label: 'Confirmed / Total', val: `${totalConfirmed} / ${totalBookings} (${cancellationRate}% cancel)`, color: [59, 130, 246] },
  ];

  const colWidth = (pageWidth - 28) / 4;
  kpis.forEach((kpi, idx) => {
    const x = 14 + idx * colWidth;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, colWidth - 2, 20, 2, 2, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 3, y + 6);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.val, x + 3, y + 14);
  });

  // Table 1: Monthly Breakdown
  y += 28;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('2. MONTHLY REVENUE BREAKDOWN', 14, y);

  const monthlyRows = stats.map((s) => [
    s.month,
    s.totalBookings.toString(),
    s.confirmedBookings.toString(),
    s.cancelledBookings.toString(),
    `THB ${s.grossRevenue.toLocaleString()}`,
    `THB ${s.refundedRevenue.toLocaleString()}`,
    `THB ${s.netRevenue.toLocaleString()}`,
    `${s.occupancyRate}%`,
  ]);

  // Append Total Row
  monthlyRows.push([
    'TOTAL',
    totalBookings.toString(),
    totalConfirmed.toString(),
    totalCancelled.toString(),
    `THB ${totalGross.toLocaleString()}`,
    `THB ${totalRefund.toLocaleString()}`,
    `THB ${totalNet.toLocaleString()}`,
    '-',
  ]);

  autoTable(doc, {
    startY: y + 4,
    head: [[
      'Month',
      'Total',
      'Confirmed',
      'Cancelled',
      'Gross Revenue',
      'Refunded',
      'Net Revenue',
      'Est. Occupancy'
    ]],
    body: monthlyRows,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { halign: 'center', fontStyle: 'bold' },
      1: { halign: 'center' },
      2: { halign: 'center', textColor: [16, 185, 129] },
      3: { halign: 'center', textColor: [239, 68, 68] },
      4: { halign: 'right' },
      5: { halign: 'right', textColor: [239, 68, 68] },
      6: { halign: 'right', fontStyle: 'bold', textColor: [15, 23, 42] },
      7: { halign: 'center' },
    },
    didParseCell: (data) => {
      if (data.row.index === monthlyRows.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [241, 245, 249];
      }
    },
  });

  // Table 2: Room Status & Category Breakdown
  // @ts-ignore
  let finalY = (doc as any).lastAutoTable.finalY + 12;

  if (finalY > 230) {
    doc.addPage();
    finalY = 20;
  }

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('3. ACTIVE ROOM INVENTORY & RATE PLAN', 14, finalY);

  const roomRows = rooms.map((r) => [
    `#${r.roomNumber}`,
    r.name,
    r.type,
    `THB ${r.pricePerNight.toLocaleString()}`,
    `${r.capacity} Guests`,
    `Floor ${r.floor}`,
    r.status.toUpperCase(),
  ]);

  autoTable(doc, {
    startY: finalY + 4,
    head: [[
      'Room No.',
      'Room Name',
      'Type',
      'Rate/Night',
      'Capacity',
      'Floor',
      'Status'
    ]],
    body: roomRows,
    theme: 'grid',
    headStyles: {
      fillColor: [217, 119, 6], // amber-600
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'center' },
      3: { halign: 'right', fontStyle: 'bold' },
      4: { halign: 'center' },
      5: { halign: 'center' },
      6: { halign: 'center' },
    },
  });

  // Footer notes and signature
  // @ts-ignore
  const lastY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text('* Confidential: Report generated directly from Bang Hotel Firestore cloud database (bang-bf7d8).', 14, lastY);
  doc.text('Authorized by Hotel Financial Management System.', 14, lastY + 5);

  // Save the PDF
  const filename = `BangHotel_Revenue_Report_${filterYearMonth || 'All'}_${Date.now()}.pdf`;
  doc.save(filename);
};
