import React from 'react';

const Receipt = ({ donation }) => {
  if (!donation) return null;

  const date = new Date(donation.date || Date.now());
  const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

  return (
    <div id="receipt-content" className="bg-[#fffdfa] p-8 max-w-[210mm] mx-auto w-full relative font-sans text-gray-900" style={{ minHeight: '297mm', border: '3px solid #b83b1b', boxSizing: 'border-box' }}>
      {/* Inner border */}
      <div className="absolute inset-[4px] border border-[#e67e22] pointer-events-none"></div>
      
      {/* Watermark Logo */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
        <img src="/logo.png" alt="Watermark" className="w-[500px] h-[500px] object-contain grayscale" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-4">
          
          {/* Real Logo */}
          <div className="w-[200px] h-[200px] flex-shrink-0 flex items-center justify-center">
             <img src="/logo.png" alt="Logo" className="max-w-full max-h-full object-contain" />
          </div>
          
          {/* Title Section */}
          <div className="flex-1 text-center flex flex-col items-center justify-center pl-4">
            <h1 className="text-[2.75rem] font-extrabold mb-3 tracking-wide" style={{ color: '#680000', fontFamily: '"Tiro Devanagari Marathi", serif' }}>कोळेकर महास्वामीजी मठ, कोळे</h1>
            
            <div className="flex items-center gap-4 mb-3">
               <span style={{ color: '#d35400' }}>❦</span>
               <div className="bg-[#680000] text-white px-8 py-1.5 rounded-full text-xl font-bold flex items-center gap-3">
                  <span className="text-white text-lg">❖</span> मुख्य शाखा मठ-कोळे <span className="text-white text-lg">❖</span>
               </div>
               <span style={{ color: '#d35400' }}>❦</span>
            </div>
            
            <h2 className="text-[1.35rem] font-bold text-[#680000] leading-snug font-serif">
              श्री. गुरुमूर्ती रुद्रपशुपती <br/> लिंगायत मठ संस्थान, निमसोड.
            </h2>
            
            <div className="mt-3 flex gap-2 justify-center items-center text-[#d35400]">
                <span className="w-32 h-[1px] bg-[#d35400] block"></span>
                <span className="text-xl">🙡 ❦ 🙣</span>
                <span className="w-32 h-[1px] bg-[#d35400] block"></span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mb-4 text-black font-bold text-[15px] leading-relaxed">
          <p>Head Office: Kole</p>
          <p>Email: gurumurtikolekarmaharaj44@gmail.com</p>
          <p>Contact No: 8421004824</p>
        </div>

        {/* Exemption & Receipt Info */}
        <div className="bg-[#ffe89c] -mx-8 px-10 py-3 flex justify-between items-center mb-8 font-bold text-[16px] border-y border-[#d35400]">
          <div>
            Income Tax Exemption (80-G) Number: <span className="inline-block w-48 border-b border-black ml-2"></span>
          </div>
          <div className="text-right flex flex-col gap-1">
            <div className="flex justify-end items-center gap-2">
              <span>Receipt No:</span> 
              <span className="inline-block w-40 border-b border-black text-center text-gray-800">{donation.receiptNumber || donation.donationReference || ' '}</span>
            </div>
            <div className="flex justify-end items-center gap-2">
              <span>Date:</span> 
              <span className="inline-block w-40 border-b border-black text-center text-gray-800">{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-[1fr_1fr] gap-12 px-2">
          {/* Left Column: Donors Detail */}
          <div className="pr-4">
            <h3 className="text-[22px] font-bold mb-6" style={{ color: '#8b0000' }}>Donors Detail:</h3>
            
            <div className="mb-8 text-[17px] italic font-serif text-black">Received With Thanks</div>
            
            <div className="mb-8 flex items-end">
              <span className="font-bold mr-4 text-[17px] text-black">From</span>
              <div className="flex-1 border-b border-black pb-1 text-[16px] font-bold text-gray-800 px-2">{donation.donorName || donation.name}</div>
            </div>
            
            <div className="mb-10 flex items-start">
              <span className="font-bold mr-4 text-[17px] text-black pt-1">Address:</span>
              <div className="flex-1 flex flex-col gap-8">
                <div className="border-b border-black text-[16px] font-bold text-gray-800 px-2 h-6">{donation.address || ''}</div>
                <div className="border-b border-black h-6"></div>
              </div>
            </div>
            
            <div className="mb-12 flex items-end">
              <span className="font-bold mr-4 text-[17px] text-black">Contact No:</span>
              <div className="flex-1 border-b border-black pb-1 text-[16px] font-bold text-gray-800 px-2">{donation.phone}</div>
            </div>
            
            <div className="border border-[#e67e22] rounded-sm inline-block bg-white relative">
              <div className="px-6 py-4 flex items-center font-bold text-[18px]">
                <span className="mr-6 text-black">INR.</span>
                <span className="border-b border-black flex-1 min-w-[160px] text-center px-4">{donation.amount?.toLocaleString() || ''}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Transaction Detail */}
          <div className="space-y-7">
            <div>
              <div className="bg-[#da3c0b] text-white px-4 py-1 font-bold text-[16px] inline-block w-full rounded-sm mb-3">Transaction Detail:</div>
              <div className="border-b border-black h-7 mb-4 font-bold text-[15px] text-gray-800 flex items-end pb-1 px-2">{donation.utrNumber ? `UTR: ${donation.utrNumber}` : ' '}</div>
              <div className="border-b border-black h-7 font-bold text-[15px] text-gray-800 flex items-end pb-1 px-2"></div>
            </div>
            
            <div>
              <div className="bg-[#da3c0b] text-white px-4 py-1 font-bold text-[16px] inline-block w-full rounded-sm mb-3">Purpose of Donation:</div>
              <div className="border-b border-black h-7 mb-4 font-bold text-[15px] text-gray-800 flex items-end pb-1 px-2">{donation.message || donation.annadaanType || 'General Donation'}</div>
              <div className="border-b border-black h-7 font-bold text-[15px] text-gray-800 flex items-end pb-1 px-2"></div>
            </div>
            
            <div>
              <div className="bg-[#da3c0b] text-white px-4 py-1 font-bold text-[16px] inline-block w-full rounded-sm mb-3">Payment Details:</div>
              <div className="border-b border-black h-7 mb-4 font-bold text-[15px] text-gray-800 flex items-end pb-1 px-2">{donation.status || ' '}</div>
              <div className="border-b border-black h-7 font-bold text-[15px] text-gray-800 flex items-end pb-1 px-2"></div>
            </div>
            
            <div>
              <div className="bg-[#da3c0b] text-white px-4 py-1 font-bold text-[16px] inline-block w-full rounded-sm mb-3">Mode of Payment:</div>
              <div className="border-b border-black h-7 font-bold text-[15px] text-gray-800 flex items-end pb-1 px-2">{donation.paymentApp || 'Online'}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-[60px] pt-10 flex justify-end pr-8">
          <div className="text-center">
            <div className="border-b border-black w-48 mb-2"></div>
            <p className="font-bold text-black text-[14px]">Authorised Signatory</p>
          </div>
        </div>
        
        <div className="mt-[40px] text-center text-2xl font-bold flex justify-center items-center gap-8 border-t border-[#b83b1b] pt-4 relative" style={{ color: '#8b0000' }}>
          <span className="absolute -top-[14px] left-1/2 -translate-x-1/2 bg-[#fffdfa] px-3 text-[#b83b1b] text-lg flex items-center">
             <span className="text-xl mr-2">❦</span>
             <img src="/logo.png" alt="icon" className="w-6 h-6 object-contain inline-block" />
             <span className="text-xl ml-2">❦</span>
          </span>
          <span>|| ॐ नमः शिवाय ||</span>
          <span>|| हर हर महादेव ||</span>
        </div>

      </div>
      
      {/* Print styles applied globally when this component is mounted */}
      <style>{`
        @media print {
          @page {
             size: A4 portrait;
             margin: 0;
          }
          body * {
            visibility: hidden;
          }
          #receipt-content, #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 50%;
            top: 0;
            transform: translateX(-50%);
            width: 210mm;
            min-height: 297mm;
            border: 3px solid #b83b1b !important;
            padding: 15mm;
            background: white !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .bg-\\[\\#fffdfa\\] {
             background-color: white !important;
          }
          .bg-\\[\\#ffe89c\\] {
             background-color: #ffe89c !important;
          }
          .bg-\\[\\#da3c0b\\] {
             background-color: #da3c0b !important;
          }
          .bg-\\[\\#680000\\] {
             background-color: #680000 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Receipt;
