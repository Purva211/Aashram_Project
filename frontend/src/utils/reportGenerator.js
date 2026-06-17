import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getImageBase64 } from './imageUtils';

export const generateFinancialReport = async (data, filters) => {
  if (!data || data.length === 0) {
    alert("No data available to generate report.");
    return;
  }

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

  // --- Header ---
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', 40, 20, 60, 60);
  }

  doc.setTextColor(burgundy[0], burgundy[1], burgundy[2]);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Kolekar Mahaswamiji Math, Kole", 110, 35);
  
  doc.setFontSize(11);
  doc.text("Shri Gurumurti Rudrapashupati Lingayat Math Sansthan, Nimsod", 110, 50);

  // Box for Branch
  doc.setFillColor(burgundy[0], burgundy[1], burgundy[2]);
  doc.rect(110, 55, 110, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("MAIN BRANCH: KOLE", 115, 65);

  doc.setTextColor(120, 120, 120);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Head Office: Kole | Email: gurumurtikolekarmaharaj44@gmail.com | Contact No: 8421008424", 110, 80);

  // Horizontal Lines
  doc.setDrawColor(saffron[0], saffron[1], saffron[2]);
  doc.setLineWidth(1.5);
  doc.line(40, 95, 555, 95);
  doc.setLineWidth(0.5);
  doc.line(40, 98, 555, 98);

  // --- Watermark ---
  if (logoBase64) {
    doc.setGState(new doc.GState({opacity: 0.05}));
    doc.addImage(logoBase64, 'PNG', 100, 250, 400, 400);
    doc.setGState(new doc.GState({opacity: 1.0}));
  }

  // --- Report Title ---
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Financial Donations Report", 40, 130);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  // Filter context
  const yearText = filters.year ? `Year: ${filters.year}` : "Year: All";
  const monthText = filters.month !== '' ? `Month: ${new Date(2000, parseInt(filters.month)).toLocaleString('default', { month: 'long' })}` : "Month: All";
  const branchText = filters.branchName || "Branch: All";
  const statusText = filters.status ? `Status: ${filters.status}` : "Status: All";
  
  doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 40, 150);
  doc.text(`${yearText} | ${monthText} | ${branchText} | ${statusText}`, 40, 165);

  // Calculate Metrics
  const approved = data.filter(d => d.status === 'APPROVED');
  const rejected = data.filter(d => d.status === 'REJECTED');
  
  const totalApprovedAmount = approved.reduce((sum, d) => sum + d.amount, 0);
  const totalRejectedAmount = rejected.reduce((sum, d) => sum + d.amount, 0);
  const totalDonors = new Set(data.map(d => d.donorName)).size;

  // Executive Summary
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Summary", 40, 200);

  autoTable(doc, {
    startY: 210,
    head: [['Metric', 'Value']],
    body: [
      ['Total Approved Donations', `INR ${totalApprovedAmount.toLocaleString()}`],
      ['Total Approved Count', approved.length.toString()],
      ['Total Rejected Amount', `INR ${totalRejectedAmount.toLocaleString()}`],
      ['Total Rejected Count', rejected.length.toString()],
      ['Unique Donors', totalDonors.toString()],
    ],
    theme: 'grid',
    headStyles: { fillColor: burgundy, textColor: [255, 255, 255] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 200 },
      1: { cellWidth: 100 }
    },
    margin: { left: 40 }
  });

  // Monthly Breakdown
  const monthlyData = {};
  data.forEach(d => {
    if (d.status !== 'APPROVED') return;
    const m = new Date(d.date).toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!monthlyData[m]) monthlyData[m] = { count: 0, amount: 0 };
    monthlyData[m].count += 1;
    monthlyData[m].amount += d.amount;
  });

  const monthRows = Object.keys(monthlyData).map(k => [
    k, 
    monthlyData[k].count.toString(), 
    `INR ${monthlyData[k].amount.toLocaleString()}`
  ]);

  let nextY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 30 : 350;

  if (monthRows.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Monthly Breakdown (Approved)", 40, nextY);

    autoTable(doc, {
      startY: nextY + 10,
      head: [['Month', 'No. of Donations', 'Total Amount']],
      body: monthRows,
      theme: 'grid',
      headStyles: { fillColor: [204, 153, 51], textColor: [255, 255, 255] }
    });
    nextY = doc.lastAutoTable.finalY + 30;
  }

  // Detailed Ledger
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Detailed Ledger", 40, nextY);

  const ledgerRows = data.map(d => [
    new Date(d.date).toLocaleDateString(),
    d.donationReference || 'N/A',
    d.donorName,
    d.branchId?.name || 'Main Trust',
    d.status || 'PENDING',
    d.amount.toLocaleString()
  ]);

  autoTable(doc, {
    startY: nextY + 10,
    head: [['Date', 'Ref ID', 'Donor Name', 'Branch', 'Status', 'Amount (INR)']],
    body: ledgerRows,
    theme: 'grid',
    headStyles: { fillColor: burgundy, textColor: [255, 255, 255] },
    didDrawPage: function (data) {
      // Watermark on new pages
      if (data.pageNumber > 1 && logoBase64) {
        doc.setGState(new doc.GState({opacity: 0.05}));
        doc.addImage(logoBase64, 'PNG', 100, 250, 400, 400);
        doc.setGState(new doc.GState({opacity: 1.0}));
      }

      // Footer
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      
      doc.setDrawColor(saffron[0], saffron[1], saffron[2]);
      doc.setLineWidth(1);
      doc.line(40, pageHeight - 35, 555, pageHeight - 35);
      
      doc.setFontSize(10);
      doc.setTextColor(burgundy[0], burgundy[1], burgundy[2]);
      doc.setFont("helvetica", "italic");
      doc.text("|| Om Namah Shivaya || || Har Har Mahadev ||", doc.internal.pageSize.width / 2, pageHeight - 20, { align: 'center' });
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.text("Shri Gurumurti Rudrapashupati Lingayat Monastery Trust", 40, pageHeight - 10);
      
      const str = 'Page ' + doc.internal.getNumberOfPages();
      doc.text(str, pageSize.width - 40 - doc.getTextWidth(str), pageHeight - 10);
    }
  });

  // Save the PDF
  const filename = `Financial_Report_${new Date().getTime()}.pdf`;
  doc.save(filename);
};
