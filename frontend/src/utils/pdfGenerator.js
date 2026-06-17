import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getImageBase64 } from './imageUtils';

export const generateDonationReceipt = async (donation) => {
  const doc = new jsPDF('p', 'pt', 'a4');

  // Colors
  const burgundy = [121, 26, 31];
  const saffron = [200, 150, 100]; // Muted saffron/brown for lines

  let logoBase64 = null;
  try {
    logoBase64 = await getImageBase64('/logo.png');
  } catch (err) {
    console.error("Failed to load logo for PDF", err);
  }

  // Outer Border (optional, but looks good for receipts)
  doc.setDrawColor(saffron[0], saffron[1], saffron[2]);
  doc.setLineWidth(2);
  doc.rect(20, 20, 555, 802); // Outer Border

  // --- Header ---
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', 40, 30, 60, 60);
  }

  doc.setTextColor(burgundy[0], burgundy[1], burgundy[2]);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Kolekar Mahaswamiji Math, Kole", 110, 45);
  
  doc.setFontSize(11);
  doc.text("Shri Gurumurti Rudrapashupati Lingayat Math Sansthan, Nimsod", 110, 60);

  // Box for Branch
  doc.setFillColor(burgundy[0], burgundy[1], burgundy[2]);
  doc.rect(110, 65, 110, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("MAIN BRANCH: KOLE", 115, 75);

  doc.setTextColor(120, 120, 120);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Head Office: Kole | Email: gurumurtikolekarmaharaj44@gmail.com | Contact No: 8421008424", 110, 90);

  // Horizontal Lines
  doc.setDrawColor(saffron[0], saffron[1], saffron[2]);
  doc.setLineWidth(1.5);
  doc.line(40, 105, 555, 105);
  doc.setLineWidth(0.5);
  doc.line(40, 108, 555, 108);

  // --- Watermark ---
  if (logoBase64) {
    doc.setGState(new doc.GState({opacity: 0.05}));
    doc.addImage(logoBase64, 'PNG', 100, 250, 400, 400);
    doc.setGState(new doc.GState({opacity: 1.0}));
  }

  // Receipt Title
  doc.setTextColor(burgundy[0], burgundy[1], burgundy[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text("DONATION RECEIPT", 297, 140, { align: 'center' });
  doc.setLineWidth(1);
  doc.line(220, 145, 375, 145);

  // Receipt Details (Top Section)
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  
  doc.text(`Receipt No:`, 50, 180);
  doc.setFont('helvetica', 'normal');
  doc.text(`${donation.receiptNumber || 'N/A'}`, 120, 180);

  doc.setFont('helvetica', 'bold');
  doc.text(`Date:`, 400, 180);
  doc.setFont('helvetica', 'normal');
  doc.text(`${new Date(donation.updatedAt || donation.createdAt).toLocaleDateString()}`, 440, 180);

  // Donor Details Table
  doc.autoTable({
    startY: 210,
    theme: 'grid',
    headStyles: { fillColor: burgundy, textColor: [255, 255, 255], fontStyle: 'bold' },
    bodyStyles: { textColor: [0, 0, 0], fontSize: 11 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 150, fillColor: [250, 245, 245] },
      1: { cellWidth: 355 }
    },
    body: [
      ['Donor Name', donation.donorName],
      ['Mobile Number', donation.phone],
      ['Email Address', donation.email || 'N/A'],
      ['Address', donation.address || 'N/A'],
    ]
  });

  // Payment Details Table
  const nextY = doc.lastAutoTable.finalY + 30;
  
  doc.autoTable({
    startY: nextY,
    theme: 'grid',
    headStyles: { fillColor: [204, 153, 51], textColor: [255, 255, 255], fontStyle: 'bold' },
    bodyStyles: { textColor: [0, 0, 0], fontSize: 11 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 150, fillColor: [255, 250, 245] },
      1: { cellWidth: 355 }
    },
    body: [
      ['Amount Received', `Rs. ${donation.amount}/-`],
      ['Payment Method', 'UPI / Online Transfer'],
      ['Transaction UTR', donation.utrNumber || 'N/A'],
      ['System Reference', donation.donationReference],
      ['Status', 'Verified & Approved']
    ]
  });

  // Footer Section
  const footerY = doc.lastAutoTable.finalY + 60;
  
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.text("This is a computer-generated receipt and does not require a physical signature.", 297, footerY, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Verify this receipt at: ${window.location.origin}/verify-receipt/${donation.receiptNumber}`, 297, footerY + 20, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.text("Authorized Signatory", 480, footerY + 80, { align: 'center' });
  doc.setDrawColor(0,0,0);
  doc.line(420, footerY + 65, 540, footerY + 65);

  // Bottom Footer Style (like report)
  const pageSize = doc.internal.pageSize;
  const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
  
  doc.setDrawColor(saffron[0], saffron[1], saffron[2]);
  doc.setLineWidth(1);
  doc.line(40, pageHeight - 45, 555, pageHeight - 45);
  
  doc.setFontSize(10);
  doc.setTextColor(burgundy[0], burgundy[1], burgundy[2]);
  doc.setFont("helvetica", "italic");
  doc.text("|| Om Namah Shivaya || || Har Har Mahadev ||", doc.internal.pageSize.width / 2, pageHeight - 30, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text("Shri Gurumurti Rudrapashupati Lingayat Monastery Trust", 40, pageHeight - 15);

  // Save the PDF
  doc.save(`Donation_Receipt_${donation.receiptNumber}.pdf`);
};
