import React, { useState } from 'react';

const getStaticAssetPath = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return `${window.location.origin}${cleanPath}`;
  }
  return cleanPath;
};

// Helper to convert number to Marathi words
function convertNumberToMarathiWords(amount) {
  if (amount === 0) return "शून्य";
  
  const marathiNums = [
    "", "एक", "दोन", "तीन", "चार", "पाच", "सहा", "सात", "आठ", "नऊ", "दहा",
    "अकरा", "बारा", "तेरा", "चौदा", "पंधरा", "सोळा", "सतरा", "अठरा", "एकोणीस", "वीस",
    "एकवीस", "बावीस", "तेवीस", "चोवीस", "पंचवीस", "सव्वीस", "सत्तावीस", "अठ्ठावीस", "एकोणतीस", "तीस",
    "एकतीस", "बत्तीस", "तेहतीस", "चौतीस", "पस्तीस", "छत्तीस", "सडतीस", "अडतीस", "एकोणचाळीस", "चाळीस",
    "एकचाळीस", "बेचाळीस", "तेचाळीस", "चोवेचाळीस", "पंचेचाळीस", "सचेचाळीस", "सत्तेचाळीस", "अठ्ठेचाळीस", "एकोणपन्नास", "पन्नास",
    "एकपन्न", "बावन", "त्रिपन्न", "चौपन", "पंचावन", "सप्पन", "सत्तावन", "अठ्ठावन", "एकोणसाठ", "साठ",
    "एकसष्ठ", "बासष्ठ", "त्रेसष्ठ", "चौसष्ठ", "पायसष्ठ", "सहासष्ठ", "सदुसष्ठ", "अडुसष्ठ", "एकोणसत्तर", "सत्तर",
    "एकहत्तर", "बाहत्तर", "त्र्याहत्तर", "चौऱ्याहत्तर", "पंच्याहत्तर", "शहात्तर", "सत्त्याहत्तर", "अठ्ठ्याहत्तर", "एकोणऐंशी", "ऐंशी",
    "एक्याऐंशी", "ब्याऐंशी", "त्र्याऐंशी", "चौऱ्याऐंशी", "पंच्याऐंशी", "शहाऐंशी", "सत्त्याऐंशी", "अठ्ठ्याऐंशी", "एकोणनव्वद", "नव्वद",
    "एक्याण्णव", "ब्याण्णव", "त्र्याण्णव", "चौऱ्याण्णव", "पंच्याण्णव", "शहाण्णव", "सत्त्याण्णव", "अठ्ठ्याण्णव", "नव्याण्णव"
  ];

  let words = "";
  let temp = Math.floor(amount);
  
  const crores = Math.floor(temp / 10000000);
  temp %= 10000000;
  
  const lakhs = Math.floor(temp / 100000);
  temp %= 100000;
  
  const thousands = Math.floor(temp / 1000);
  temp %= 1000;
  
  const hundreds = Math.floor(temp / 100);
  temp %= 100;
  
  const remaining = temp;

  if (crores > 0) {
    words += (crores < 100 ? marathiNums[crores] : convertNumberToMarathiWords(crores)) + " कोटी ";
  }
  if (lakhs > 0) {
    words += marathiNums[lakhs] + " लाख ";
  }
  if (thousands > 0) {
    words += marathiNums[thousands] + " हजार ";
  }
  if (hundreds > 0) {
    words += marathiNums[hundreds] + "शे ";
  }
  if (remaining > 0) {
    words += marathiNums[remaining] + " ";
  }

  return words.trim() + " रुपये फक्त";
}

// Helper to split Marathi amount words across two lines
function splitMarathiWords(words, maxCharLength) {
  if (!words || words.length <= maxCharLength) {
    return [words || "", ""];
  }
  const parts = words.split(" ");
  let line1 = "";
  let line2 = "";
  for (const part of parts) {
    if ((line1 + (line1 ? " " : "") + part).length <= maxCharLength) {
      line1 += (line1 ? " " : "") + part;
    } else {
      line2 += (line2 ? " " : "") + part;
    }
  }
  return [line1, line2];
}

function convertToMarathiScript(name) {
  if (!name) return "";
  const mappings = {
    "akanksha mali": "आकांक्षा माळी",
    "akanksha": "आकांक्षा",
    "amol patil": "अमोल पाटील",
    "amol": "अमोल"
  };
  const key = name.toLowerCase().trim();
  return mappings[key] || name;
}

// Helper to convert number to English words
function convertNumberToEnglishWords(amount) {
  if (amount === 0) return "Zero";
  
  const a = ["", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  
  if ((amount = amount.toString()).length > 9) return "Overflow";
  
  const n = ("000000000" + amount).substr(-9).match(/^(d{2})(d{2})(d{2})(d{1})(d{2})$/);
  if (!n) return "";
  
  let str = "";
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + "Crore " : "";
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + "Lakh " : "";
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + "Thousand " : "";
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + "Hundred " : "";
  str += (n[5] != 0) ? ((str != "") ? "and " : "") + (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]]) : "";
  
  return str.trim() + " Rupees Only";
}

const templatesTranslations = {
  dengi_pavti: {
    mr: {
      mantra: "।। ॐ नमः शिवाय ।। ।। गुरुनिर्वाण प्रसाद ।।",
      titleMain: "श्री श्री श्री १०८ ष.ब्र.गुरुमुर्ती गुरुनिर्वाण",
      titleSub: "रुद्रपशुपती कोळेकर महास्वामीजी",
      addressDengi: "कोळे ता.सांगोला जि.सोलापूर",
      badgeDengi: "देणगी पावती",
      receiptNo: "पावती क्र. :",
      dateLabel: "दिनांक :",
      nameLabel: "श्री / सौ / श्रीमती",
      addressLabelDengi: "राहणार",
      suffixAddressDengi: "आपणाकडून आज रोजी दिशाविधी कार्यक्रमाकरीता देणगी",
      amountWordsLabel: "अक्षरी रुपये",
      suffixAmountDengi: "आज रोख मिळाले.",
      thankYou: "धन्यवाद !",
      signatureDengi: "देणगी स्विकारणाऱ्याची सही",
      purposeDefault: "साधारण देणगी",
      branchDefault: "कोळे"
    },
    en: {
      mantra: "|| Om Namah Shivaya || || Gurunirvan Prasad ||",
      titleMain: "Shri Shri Shri 108 Sha. Bra. Gurumurti Gurunirvan",
      titleSub: "Rudrapashupati Kolekar Mahaswamiji",
      addressDengi: "Kole, Tal. Sangola, Dist. Solapur",
      badgeDengi: "Donation Receipt",
      receiptNo: "Receipt No.:",
      dateLabel: "Date :",
      nameLabel: "Mr / Mrs / Ms",
      addressLabelDengi: "Resident of",
      suffixAddressDengi: "donation received from you today for Dishavidhi program.",
      amountWordsLabel: "Amount in words",
      suffixAmountDengi: "received in cash today.",
      thankYou: "Thank You !",
      signatureDengi: "Receiver's Signature",
      purposeDefault: "General Donation",
      branchDefault: "Kole"
    }
  },
  shakha_pavti: {
    mr: {
      quote: "।। धर्माने विश्वाला शांती मिळते ।।",
      title: "श्री गुरुमूर्ती रुद्रपशुपती लिंगायत मठ संस्थान",
      addressLeft1: "पत्रव्यवहार पत्ता : श्री गुरुमूर्ती रुद्रपशुपती मठ, मु.पो. कोळे",
      addressLeft2: "ता.सांगोला, जि.सोलापूर ४१३३१४",
      addressRight: "पत्रव्यवहार पत्ता : श्री गुरुमूर्ती रुद्रपशुपती मठ, मु.पो. कोळे ता.सांगोला, जि.सोलापूर ४१३३१४",
      trustNo: "ट्रस्ट नं.: ए/१७५०",
      receipt: "पावती",
      branchMath: "शाखा मठ -",
      receiptNo: "पावती क्र.",
      dateLabel: "दिनांक :",
      nameLabel: "श्री/सौ/श्रीमती",
      receivedLabel: "आपणाकडून आज रोजी",
      forLabel: "यासाठी",
      amountWordsLabel: "अक्षरी रुपये",
      receivedCashLabel: "आज रोख मिळाले.",
      receiverSignature: "देणगी स्वीकारणाराची सही",
      thankYou: "धन्यवाद!",
      purposeDefault: "साधारण देणगी",
      branchDefault: "कोळे"
    },
    en: {
      quote: "।। Religion brings peace to the world ।।",
      title: "Shri Gurumurti Rudrapashupati Lingayat Math Sansthan",
      addressLeft1: "Address: Shri Gurumurti Rudrapashupati Math, A/P Kole",
      addressLeft2: "Tal. Sangola, Dist. Solapur 413314",
      addressRight: "Address: Shri Gurumurti Rudrapashupati Math, A/P Kole, Tal. Sangola, Dist. Solapur 413314",
      trustNo: "Trust No.: A/1750",
      receipt: "RECEIPT",
      branchMath: "Branch Math -",
      receiptNo: "Receipt No.",
      dateLabel: "Date :",
      nameLabel: "Mr/Mrs/Ms",
      receivedLabel: "Received from you today",
      forLabel: "for",
      amountWordsLabel: "Amount in words",
      receivedCashLabel: "received in cash today.",
      receiverSignature: "Receiver's Signature",
      thankYou: "Thank You!",
      purposeDefault: "General Donation",
      branchDefault: "Kole"
    }
  },
  jama_pavti: {
    mr: {
      title: "श्री गुरुमूर्ती रुद्रपशुपती लिंगायत मठ निमसोड, मिरज",
      address: "पत्रव्यवहार पत्ता : श्री गुरुमूर्ती रुद्रपशुपती मठ, मु.पो. कोळे ता. सांगोला, जि. सोलापूर ४१३३१४",
      branchLabel: "शाखा मठ - जवळा ता. सांगोला",
      trustNo: "ट्रस्ट नं. : ए/ १७५० सांगली",
      badge: "जमा पावती",
      receiptNo: "पावती नंबर :",
      dateLabel: "दिनांक :",
      nameLabel: "श्री. / सौ. / श्रीमती",
      addressLabel: "रा.",
      phoneLabel: "मो.",
      receivedLabel: "आजरोजी आपणाकडून",
      amountWordsLabel: "अक्षरी रुपये",
      paymentMethodLabel: "रोख / चेक / ड्राफ्ट नं.",
      thankYou: "धन्यवाद!",
      payerSignature: "पैसे देणाऱ्याची सही",
      receiverSignature: "पैसे घेणाऱ्याची सही",
      authorizedTrustee: "Authorized Trustee",
      purposeDefault: "साधारण देणगी",
      branchDefault: "कोळे"
    },
    en: {
      title: "Shri Gurumurti Rudrapashupati Lingayat Math Nimsod, Miraj",
      address: "Address: Shri Gurumurti Rudrapashupati Math, A/P Kole, Tal. Sangola, Dist. Solapur 413314",
      branchLabel: "Branch Math - Jawala, Tal. Sangola",
      trustNo: "Trust No.: A/1750 Sangli",
      badge: "Jama Receipt",
      receiptNo: "Receipt No.:",
      dateLabel: "Date :",
      nameLabel: "Mr. / Mrs. / Ms.",
      addressLabel: "A/P.",
      phoneLabel: "Mo.",
      receivedLabel: "Received from you today",
      amountWordsLabel: "Amount in Words",
      paymentMethodLabel: "Cash / Cheque / Draft No.",
      thankYou: "Thank You!",
      payerSignature: "Payer's Signature",
      receiverSignature: "Receiver's Signature",
      authorizedTrustee: "Authorized Trustee",
      purposeDefault: "General Donation",
      branchDefault: "Kole"
    }
  }
};

const purposeMapping = {
  "साधारण देणगी": "General Donation",
  "अन्नदान": "Annadaan",
  "बांधकाम निधी": "Construction Fund",
  "General Donation": "साधारण देणगी"
};

const branchMapping = {
  "कोळे": "Kole",
  "Kole": "कोळे"
};

const Receipt = ({ donation, isUserSide = true }) => {
  const [lang, setLang] = useState('mr');
  
  if (!donation) return null;

  const donationType = donation.donationType || 'dengi_pavti';
  const t = templatesTranslations[donationType]?.[lang] || templatesTranslations.dengi_pavti[lang];

  let donorName = donation.donorName || "";
  if (lang === 'mr') {
    donorName = convertToMarathiScript(donorName);
  }

  const date = new Date(donation.date || Date.now());
  const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  const receiptNo = donation.receiptNumber || donation.donationReference || "901";
  
  let branchName = donation.branchId?.name || (donation.branchId ? (typeof donation.branchId === 'object' ? donation.branchId.name : donation.branchId) : null) || t.branchDefault;
  if (lang === 'en' && branchMapping[branchName]) branchName = branchMapping[branchName];
  if (lang === 'mr' && branchMapping[branchName] === branchName) branchName = t.branchDefault;
  
  const amountValue = donation.amount || 0;
  const amountWordsRaw = lang === 'mr' ? convertNumberToMarathiWords(amountValue) : convertNumberToEnglishWords(amountValue);
  
  let purposeTextRaw = donation.message || donation.annadaanType || t.purposeDefault;
  if (lang === 'en' && purposeMapping[purposeTextRaw]) purposeTextRaw = purposeMapping[purposeTextRaw];
  if (lang === 'mr' && purposeMapping[purposeTextRaw]) purposeTextRaw = purposeMapping[purposeTextRaw];

  const amountWords = amountWordsRaw;
  const purposeText = purposeTextRaw;

  const toggleLanguage = () => {
    setLang(lang === 'mr' ? 'en' : 'mr');
  };

  const renderDengiPavti = () => {
    return (
      <div id="receipt-content" className={`receipt-outer-container dengi-pavti ${isUserSide ? 'user-side' : ''}`}>
        <div className="receipt-container">
          <div className="receipt-inner">
            <div className="header">
              <div className="mantra">{t.mantra}</div>
              <div className="title-main">{t.titleMain}</div>
              <div className="title-sub">{t.titleSub}</div>
              <div className="address">{t.addressDengi}</div>
            </div>

            <div className="badge-container">
              <div className="badge">{t.badgeDengi}</div>
            </div>

            <div className="metadata-row">
              <div>
                <span className="metadata-label">{t.receiptNo} </span>
                <span className="metadata-value-red">{receiptNo}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <span className="metadata-label">{t.dateLabel} </span>
                <span className="metadata-value-blue" style={{ borderBottom: '0.75px solid #be1e4d', minWidth: '80px', display: 'inline-block', textAlign: 'center', lineHeight: '1.2' }}>
                  {formattedDate}
                </span>
              </div>
            </div>

            <div className="form-fields-container">
              <div className="form-row">
                <span className="form-label">{t.nameLabel}</span>
                <div className="form-line" style={{ marginLeft: '14px' }}>
                  <span className="handwritten-val" style={{ left: '6px' }}>{donorName}</span>
                </div>
              </div>

              <div className="form-row">
                <span className="form-label">{t.addressLabelDengi}</span>
                <div className="form-line">
                  <span className="handwritten-val">{donation.address || ""}</span>
                </div>
                <span className="form-label-suffix">{t.suffixAddressDengi}</span>
              </div>

              <div className="form-row">
                <span className="form-label">{t.amountWordsLabel}</span>
                <div className="form-line">
                  <span className="handwritten-val">{amountWords}</span>
                </div>
                <span className="form-label-suffix">{t.suffixAmountDengi}</span>
              </div>
            </div>

            <div className="bottom-area">
              <div className="amount-box-container">
                <div className="amount-diamond">
                  <span className="amount-diamond-symbol">₹</span>
                </div>
                <div className="amount-rect">
                  ₹ {donation.amount?.toLocaleString()}
                </div>
              </div>

              <div className="thankyou-text">{t.thankYou}</div>

              <div className="signature-text" style={{ paddingBottom: '2px', fontSize: '9.5px' }}>
                {t.signatureDengi}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderShakhaPavti = () => {
    return (
      <div id="receipt-content" className={`receipt-outer-container shakha-pavti ${isUserSide ? 'user-side' : ''}`}>
        {/* --- LEFT CARD (Counterfoil) --- */}
        {!isUserSide && (
          <div className="receipt-card-left">
            {/* Header Block */}
            <div style={{ padding: '12px 10px 0 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
              <div className="header-quote">{t.quote}</div>
              <div className="header-title" style={{ fontSize: '11px', marginTop: '4px', letterSpacing: '-0.3px', lineHeight: '1.2' }}>
                {t.title}
              </div>
              <div className="header-address" style={{ marginTop: '4px', fontSize: '7.8px', lineHeight: '1.2' }}>
                {t.addressLeft1}
              </div>
              <div className="header-address" style={{ marginTop: '4px', fontSize: '7.8px', lineHeight: '1.2' }}>
                {t.addressLeft2}
              </div>
              <div style={{ marginTop: '4px', textAlign: 'center', width: '100%' }}>
                <span className="trust-capsule">{t.trustNo}</span>
              </div>
            </div>

            {/* Ribbon bar */}
            <div className="ribbon-container" style={{ margin: '10px 10px 0 10px', width: '240px' }}>
              <svg width="240" height="28" viewBox="0 0 240 28" preserveAspectRatio="none" style={{ display: 'block' }}>
                <path d="M 0,0 L 80,0 L 68,28 L 0,28 Z" fill="#8B2D3B" />
                <path d="M 83,0 L 240,0 L 240,28 L 71,28 Z" fill="#EEEEEE" stroke="#8B2D3B" strokeWidth="1" />
              </svg>
              <div className="ribbon-label-pavti" style={{ left: '16px' }}>{t.receipt}</div>
              <div className="ribbon-label-shakha" style={{ left: '88px' }}>
                <span style={{ color: '#8B2D3B' }}>{t.branchMath}</span>
                <span className="handwritten-val-inline">{branchName}</span>
              </div>
            </div>

            {/* Metadata Row */}
            <div className="metadata-row" style={{ marginTop: '20px' }}>
              <div>
                <span className="metadata-label">{t.receiptNo} </span>
                <span className="metadata-value-red">{receiptNo}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <span className="metadata-label">{t.dateLabel} </span>
                <span className="metadata-value-blue" style={{ borderBottom: '0.75px solid #5B7590', minWidth: '70px', display: 'inline-block', textAlign: 'center', lineHeight: '1.2' }}>
                  {formattedDate}
                </span>
              </div>
            </div>

            {/* Form Fields Area */}
            <div className="form-fields-container">
              {/* Line 1: Name */}
              <div className="form-row">
                <span className="form-label">{t.nameLabel}</span>
                <div className="form-line" style={{ marginLeft: '14px' }}>
                  <span className="handwritten-val" style={{ left: '6px' }}>
                    {donorName}
                  </span>
                </div>
              </div>
              
              {/* Line 2: Purpose */}
              <div className="form-row">
                <span className="form-label">{t.receivedLabel}</span>
                <div className="form-line">
                  <span className="handwritten-val">
                    {purposeText}
                  </span>
                </div>
              </div>

              {/* Line 3: Words (Part 1) */}
              <div className="form-row">
                <span className="form-label">{t.amountWordsLabel}</span>
                <div className="form-line">
                  <span className="handwritten-val" style={{ fontSize: '13px' }}>
                    {splitMarathiWords(amountWords, 22)[0]}
                  </span>
                </div>
              </div>

              {/* Line 4: Words (Part 2) + today received */}
              <div className="form-row">
                <div className="form-line-prefix-fill">
                  <span className="handwritten-val" style={{ left: '0px', fontSize: '13px' }}>
                    {splitMarathiWords(amountWords, 22)[1]}
                  </span>
                </div>
                <span className="form-label" style={{ marginLeft: '6px' }}>{t.receivedCashLabel}</span>
              </div>
            </div>

            {/* Bottom Area */}
            <div style={{ padding: '0 14px 10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', boxSizing: 'border-box' }}>
              {/* Amount Box */}
              <div className="amount-box-container">
                <div className="amount-diamond">
                  <span className="amount-diamond-symbol">₹</span>
                </div>
                <div className="amount-rect">
                  ₹ {donation.amount?.toLocaleString()}
                </div>
              </div>
              
              {/* Signature */}
              <div className="signature-text" style={{ paddingBottom: '2px', fontSize: '9.5px' }}>
                {t.receiverSignature}
              </div>
            </div>
          </div>
        )}

        {/* --- SEPARATOR DOTTED LINE --- */}
        {!isUserSide && (
          <div className="receipt-separator">
            <div className="receipt-dotted-line"></div>
          </div>
        )}

        {/* --- RIGHT CARD (Main Receipt) --- */}
        <div className="receipt-card-right">
          {/* Top Header Row with Swamiji Photos */}
          <div style={{ padding: '8px 14px 0 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
            {/* Left Swamiji */}
            <div className="swamiji-photo-frame">
              <img src={getStaticAssetPath("/guru_swamiji.png")} alt="Guru Swamiji" className="swamiji-photo" onError={(e) => { e.target.onerror = null; e.target.src = "/guru_swamiji.png"; }} />
            </div>

            {/* Middle Header Text */}
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 8px', width: '320px', boxSizing: 'border-box' }}>
              <div className="header-quote">{t.quote}</div>
              <div className="header-title" style={{ fontSize: '15.5px', marginTop: '4.5px', letterSpacing: '-0.3px', lineHeight: '1.2' }}>
                {t.title}
              </div>
              <div className="header-address" style={{ marginTop: '4.5px', fontSize: '7.8px', lineHeight: '1.2' }}>
                {t.addressRight}
              </div>
              <div style={{ marginTop: '4px', textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span className="trust-capsule">{t.trustNo}</span>
                
                {/* Ribbon bar situated between the 2 Swamiji images */}
                <div className="ribbon-container" style={{ marginTop: '3px', height: '24px', width: '260px', position: 'relative' }}>
                  <svg width="260" height="24" viewBox="0 0 260 24" preserveAspectRatio="none" style={{ display: 'block' }}>
                    <path d="M 0,0 L 80,0 L 70,24 L 0,24 Z" fill="#8B2D3B" />
                    <path d="M 83,0 L 260,0 L 260,24 L 73,24 Z" fill="#EEEEEE" stroke="#8B2D3B" strokeWidth="0.75" />
                  </svg>
                  <div style={{ position: 'absolute', left: '0px', top: '0px', width: '73px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D8B321', fontFamily: "'Noto Sans Devanagari', sans-serif", fontWeight: '900', fontSize: '10px' }}>
                    {t.receipt}
                  </div>
                  <div style={{ position: 'absolute', left: '82px', top: '0px', height: '24px', display: 'flex', alignItems: 'center', fontFamily: "'Noto Sans Devanagari', sans-serif", fontWeight: '700', fontSize: '9px', gap: '3px' }}>
                    <span style={{ color: '#8B2D3B' }}>{t.branchMath}</span>
                    <span style={{ color: '#1A365D', fontFamily: "'Kalam', cursive", fontWeight: '700', fontSize: '10.5px', marginTop: '-1px' }}>{branchName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Swamiji */}
            <div className="swamiji-photo-frame">
              <img src={getStaticAssetPath("/current_swamiji.png")} alt="Current Swamiji" className="swamiji-photo" onError={(e) => { e.target.onerror = null; e.target.src = "/current_swamiji.png"; }} />
            </div>
          </div>

          {/* Metadata Row */}
          <div className="metadata-row" style={{ padding: '0 20px', marginTop: '20px' }}>
            <div>
              <span className="metadata-label">{t.receiptNo} </span>
              <span className="metadata-value-red" style={{ fontSize: '14px' }}>{receiptNo}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <span className="metadata-label">{t.dateLabel} </span>
              <span className="metadata-value-blue" style={{ borderBottom: '0.75px solid #5B7590', minWidth: '80px', display: 'inline-block', textAlign: 'center', lineHeight: '1.2', fontSize: '13px' }}>
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Form Fields Area */}
          <div className="form-fields-container" style={{ padding: '0 20px', gap: '8px' }}>
            {/* Line 1: Name */}
            <div className="form-row">
              <span className="form-label">{t.nameLabel}</span>
              <div className="form-line" style={{ marginLeft: '14px' }}>
                <span className="handwritten-val" style={{ left: '6px' }}>
                  {donorName}
                </span>
              </div>
            </div>
            
            {/* Line 2: Purpose */}
            <div className="form-row">
              <span className="form-label">{t.receivedLabel}</span>
              <div className="form-line-double">
                <span className="handwritten-val">
                  {purposeText}
                </span>
              </div>
              <span className="form-label">{t.forLabel}</span>
            </div>

            {/* Line 3: Words (Part 1) */}
            <div className="form-row">
              <span className="form-label">{t.amountWordsLabel}</span>
              <div className="form-line">
                <span className="handwritten-val" style={{ fontSize: '13.5px' }}>
                  {splitMarathiWords(amountWords, 40)[0]}
                </span>
              </div>
            </div>

            {/* Line 4: Words (Part 2) + today received */}
            <div className="form-row">
              <div className="form-line-prefix-fill">
                <span className="handwritten-val" style={{ left: '0px', fontSize: '13.5px' }}>
                  {splitMarathiWords(amountWords, 40)[1]}
                </span>
              </div>
              <span className="form-label" style={{ marginLeft: '6px' }}>{t.receivedCashLabel}</span>
            </div>
          </div>

          {/* Bottom Area */}
          <div style={{ padding: '0 20px 10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', boxSizing: 'border-box' }}>
            {/* Amount Box */}
            <div className="amount-box-container">
              <div className="amount-diamond">
                <span className="amount-diamond-symbol">₹</span>
              </div>
              <div className="amount-rect" style={{ minWidth: '115px', height: '30px', fontSize: '14.5px' }}>
                ₹ {donation.amount?.toLocaleString()}
              </div>
            </div>
            
            {/* Thank You Logo & Text */}
            <div className="thankyou-container">
              <img src={getStaticAssetPath("/shiva_linga_logo.png")} alt="Shiva Linga" className="thankyou-logo" onError={(e) => { e.target.onerror = null; e.target.src = "/shiva_linga_logo.png"; }} />
              <span className="thankyou-text">{t.thankYou}</span>
            </div>

            {/* Signature */}
            <div className="signature-text" style={{ paddingBottom: '2px', fontSize: '9.5px' }}>
              {t.receiverSignature}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderJamaPavti = () => {
    return (
      <div id="receipt-content" className={`receipt-outer-container jama-pavti ${isUserSide ? 'user-side' : ''}`}>
        <div className="receipt-container">
          <div className="receipt-inner">
            {/* Watermark Logo */}
            <img src={getStaticAssetPath("/logo.png")} alt="watermark" className="watermark-logo" onError={(e) => { e.target.onerror = null; e.target.src = "/logo.png"; }} />

            <div className="header">
              <div className="title-main">{t.title}</div>
              <div className="address">{t.address}</div>
            </div>

            <div className="header-meta-row">
              <span className="branch-label">{t.branchLabel}</span>
              <span className="trust-no">{t.trustNo}</span>
            </div>

            <div className="badge-container">
              <div className="badge">{t.badge}</div>
            </div>

            <div className="metadata-row">
              <div>
                <span className="metadata-label">{t.receiptNo} </span>
                <span className="metadata-value-red">{receiptNo}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <span className="metadata-label">{t.dateLabel} </span>
                <span className="metadata-value-blue" style={{ borderBottom: '0.75px solid #d81b60', minWidth: '80px', display: 'inline-block', textAlign: 'center', lineHeight: '1.2' }}>
                  {formattedDate}
                </span>
              </div>
            </div>

            <div className="form-fields-container">
              <div className="form-row">
                <span className="form-label">{t.nameLabel}</span>
                <div className="form-line" style={{ marginLeft: '14px' }}>
                  <span className="handwritten-val" style={{ left: '6px' }}>{donorName}</span>
                </div>
              </div>

              <div className="form-row">
                <span className="form-label">{t.addressLabel}</span>
                <div className="form-line" style={{ flexGrow: 2, marginLeft: '6px' }}>
                  <span className="handwritten-val">{donation.address || ""}</span>
                </div>
                <span className="form-label" style={{ marginLeft: '10px' }}>{t.phoneLabel}</span>
                <div className="form-line" style={{ flexGrow: 1, marginLeft: '6px' }}>
                  <span className="handwritten-val">{donation.phone || ""}</span>
                </div>
              </div>

              <div className="form-row">
                <span className="form-label">{t.receivedLabel}</span>
                <div className="form-line">
                  <span className="handwritten-val">{purposeText}</span>
                </div>
              </div>

              <div className="form-row">
                <span className="form-label">{t.amountWordsLabel}</span>
                <div className="form-line">
                  <span className="handwritten-val">{amountWords}</span>
                </div>
              </div>

              <div className="form-row">
                <span className="form-label">{t.paymentMethodLabel}</span>
                <div className="form-line">
                  <span className="handwritten-val">
                    {donation.utrNumber ? `UPI (UTR: ${donation.utrNumber})` : (donation.paymentApp || (lang === 'mr' ? 'रोख' : 'Cash'))}
                  </span>
                </div>
              </div>
            </div>

            <div className="bottom-area">
              <div className="amount-box-container">
                <div className="amount-diamond">
                  <span className="amount-diamond-symbol">₹</span>
                </div>
                <div className="amount-rect">
                  ₹ {donation.amount?.toLocaleString()}
                </div>
              </div>

              <div className="thankyou-text">{t.thankYou}</div>

              <div className="signature-section">
                <div className="sig-block">
                  <span className="sig-name">({donorName})</span>
                  <span className="sig-label">{t.payerSignature}</span>
                </div>
                <div className="sig-block">
                  <span className="sig-name">({t.authorizedTrustee})</span>
                  <span className="sig-label">{t.receiverSignature}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getPageStyle = () => {
    if (donationType === "shakha_pavti") {
      return `
        @page {
          size: ${isUserSide ? '137mm 111mm' : '210mm 111mm'};
          margin: 0;
        }
      `;
    }
    return `
      @page {
        size: A5 landscape;
        margin: 0;
      }
    `;
  };

  const getReceiptMarkup = () => {
    switch (donationType) {
      case 'shakha_pavti': return renderShakhaPavti();
      case 'jama_pavti': return renderJamaPavti();
      case 'dengi_pavti':
      default: return renderDengiPavti();
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Language Toggle Button */}
      <button 
        onClick={toggleLanguage}
        style={{
          position: 'absolute',
          top: '-40px',
          right: '0',
          padding: '6px 12px',
          backgroundColor: '#1A365D',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontFamily: "'Noto Sans Devanagari', sans-serif",
          fontWeight: 'bold',
          zIndex: 10
        }}
      >
        {lang === 'mr' ? 'English Receipt' : 'मराठी पावती'}
      </button>

      {getReceiptMarkup()}

      {/* Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Noto+Sans+Devanagari:wght@400;500;600;700;800;900&family=Noto+Serif+Devanagari:wght@400;500;600;700;800;900&display=swap');
        
        /* General outer constraints */
        .receipt-outer-container.user-side {
          justify-content: center;
        }

        /* --- Shakha Pavti Styles --- */
        .receipt-outer-container.shakha-pavti {
          width: 794px;
          height: 420px;
          background-color: #F58220;
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px;
          box-sizing: border-box;
          font-family: 'Noto Sans Devanagari', sans-serif;
          user-select: none;
        }
        .receipt-outer-container.shakha-pavti.user-side {
          width: 520px;
          background-color: #F58220;
          justify-content: center;
        }
        .receipt-outer-container.shakha-pavti .receipt-card-left {
          width: 260px;
          height: 392px;
          background-color: #FFFFFF;
          border: 1px solid #8B2D3B;
          border-radius: 4px;
          box-sizing: border-box;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
        }
        .receipt-outer-container.shakha-pavti .receipt-card-right {
          width: 492px;
          height: 392px;
          background-color: #FFFFFF;
          border: 1px solid #8B2D3B;
          border-radius: 4px;
          box-sizing: border-box;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
        }
        .receipt-outer-container.shakha-pavti .receipt-separator {
          width: 14px;
          height: 392px;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }
        .receipt-outer-container.shakha-pavti .receipt-dotted-line {
          border-left: 1px dashed #A0A0A0;
          height: 100%;
          width: 1px;
        }
        .receipt-outer-container.shakha-pavti .header-quote {
          font-family: 'Noto Sans Devanagari', sans-serif;
          font-size: 9.5px;
          font-weight: 700;
          color: #222222;
          text-align: center;
          margin: 0;
          line-height: 1.1;
        }
        .receipt-outer-container.shakha-pavti .header-title {
          font-family: 'Noto Serif Devanagari', serif;
          font-weight: 800;
          color: #D32F2F;
          text-align: center;
          margin: 0;
        }
        .receipt-outer-container.shakha-pavti .header-address {
          font-family: 'Noto Sans Devanagari', sans-serif;
          font-size: 8px;
          font-weight: 600;
          color: #333333;
          text-align: center;
          line-height: 1.2;
          margin: 0;
        }
        .receipt-outer-container.shakha-pavti .trust-capsule {
          background-color: #8B2D3B;
          color: #FFFFFF;
          font-size: 8.5px;
          font-weight: 700;
          border-radius: 50px;
          padding: 4.5px 18px;
          display: inline-block;
          line-height: 1;
        }
        .receipt-outer-container.shakha-pavti .swamiji-photo-frame {
          width: 70px;
          height: 92px;
          border: 1px solid #8B2D3B;
          border-radius: 4px;
          overflow: hidden;
          background-color: transparent;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .receipt-outer-container.shakha-pavti .swamiji-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .receipt-outer-container.shakha-pavti .ribbon-container {
          height: 28px;
          position: relative;
          width: 100%;
        }
        .receipt-outer-container.shakha-pavti .ribbon-label-pavti {
          position: absolute;
          left: 12px;
          top: 0;
          height: 28px;
          display: flex;
          align-items: center;
          color: #D8B321;
          font-family: 'Noto Sans Devanagari', sans-serif;
          font-weight: 900;
          font-size: 12.5px;
        }
        .receipt-outer-container.shakha-pavti .ribbon-label-shakha {
          position: absolute;
          left: 92px;
          top: 0;
          height: 28px;
          display: flex;
          align-items: center;
          font-family: 'Noto Sans Devanagari', sans-serif;
          font-weight: 700;
          font-size: 11px;
          gap: 6px;
        }
        .receipt-outer-container.shakha-pavti .handwritten-val-inline {
          color: #1A365D;
          font-family: 'Kalam', cursive;
          font-weight: 700;
          font-size: 12.5px;
          margin-top: -1px;
        }
        .receipt-outer-container.shakha-pavti .metadata-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 14px;
          font-size: 12px;
          font-weight: 700;
          margin-top: 4px;
        }
        .receipt-outer-container.shakha-pavti .metadata-label {
          color: #222222;
          font-family: 'Noto Sans Devanagari', sans-serif;
          font-weight: 700;
        }
        .receipt-outer-container.shakha-pavti .metadata-value-red {
          color: #D32F2F;
          font-family: 'Noto Sans Devanagari', sans-serif;
          font-weight: 800;
          font-size: 13.5px;
        }
        .receipt-outer-container.shakha-pavti .metadata-value-blue {
          color: #1A365D;
          font-family: 'Kalam', cursive;
          font-weight: 700;
          font-size: 13px;
        }
        .receipt-outer-container.shakha-pavti .form-fields-container {
          padding: 0 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 4px;
        }
        .receipt-outer-container.shakha-pavti .form-row {
          display: flex;
          align-items: flex-end;
          position: relative;
          height: 24px;
          width: 100%;
        }
        .receipt-outer-container.shakha-pavti .form-label {
          color: #222222;
          font-family: 'Noto Sans Devanagari', sans-serif;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          margin-bottom: 2px;
        }
        .receipt-outer-container.shakha-pavti .form-line {
          flex-grow: 1;
          border-bottom: 0.75px solid #5B7590;
          margin-left: 6px;
          position: relative;
          height: 100%;
          display: flex;
          align-items: flex-end;
        }
        .receipt-outer-container.shakha-pavti .form-line-double {
          flex-grow: 1;
          border-bottom: 0.75px solid #5B7590;
          margin-left: 6px;
          margin-right: 6px;
          position: relative;
          height: 100%;
          display: flex;
          align-items: flex-end;
        }
        .receipt-outer-container.shakha-pavti .form-line-prefix-fill {
          flex-grow: 1;
          border-bottom: 0.75px solid #5B7590;
          position: relative;
          height: 100%;
          display: flex;
          align-items: flex-end;
        }
        .receipt-outer-container.shakha-pavti .handwritten-val {
          color: #1A365D;
          font-family: 'Kalam', cursive;
          font-weight: 700;
          font-size: 14.5px;
          white-space: nowrap;
          position: absolute;
          left: 4px;
          bottom: -1px;
        }
        .receipt-outer-container.shakha-pavti .amount-box-container {
          display: flex;
          align-items: center;
        }
        .receipt-outer-container.shakha-pavti .amount-diamond {
          width: 18px;
          height: 18px;
          background-color: #D32F2F;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(45deg);
          flex-shrink: 0;
        }
        .receipt-outer-container.shakha-pavti .amount-diamond-symbol {
          transform: rotate(-45deg);
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 0.5px;
          margin-right: 0.5px;
        }
        .receipt-outer-container.shakha-pavti .amount-rect {
          border: 1px solid #8B2D3B;
          border-radius: 15px;
          background-color: #FFFFFF;
          height: 30px;
          padding: 0 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Kalam', cursive;
          font-weight: 700;
          font-size: 14px;
          color: #1A365D;
          margin-left: 8px;
          min-width: 90px;
          box-sizing: border-box;
        }
        .receipt-outer-container.shakha-pavti .thankyou-container {
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: center;
          flex-grow: 1;
          padding-bottom: 2px;
        }
        .receipt-outer-container.shakha-pavti .thankyou-logo {
          width: 44px;
          height: 28px;
          object-fit: contain;
          border-radius: 50%;
          border: 0.5px solid #E2E8F0;
          background-color: #FFFFFF;
        }
        .receipt-outer-container.shakha-pavti .thankyou-text {
          font-family: 'Kalam', cursive;
          font-weight: 700;
          font-size: 16px;
          color: #D32F2F;
          font-style: normal;
        }
        .receipt-outer-container.shakha-pavti .signature-text {
          font-family: 'Noto Sans Devanagari', sans-serif;
          font-size: 9.5px;
          font-weight: 700;
          color: #222222;
          text-align: right;
          flex-shrink: 0;
        }

        /* --- Dengi Pavti Styles --- */
        .receipt-outer-container.dengi-pavti {
          width: 520px;
          height: 420px;
          background-color: #f6f3eb;
          padding: 14px;
          box-sizing: border-box;
          font-family: 'Noto Sans Devanagari', sans-serif;
        }
        .receipt-outer-container.dengi-pavti .receipt-container {
          width: 100%;
          height: 100%;
          border: 3px solid #be1e4d;
          padding: 5px;
          box-sizing: border-box;
          background-color: #f6f3eb;
        }
        .receipt-outer-container.dengi-pavti .receipt-inner {
          width: 100%;
          height: 100%;
          border-top: 5px solid #be1e4d;
          border-bottom: 5px solid #be1e4d;
          padding: 8px 14px;
          box-sizing: border-box;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .receipt-outer-container.dengi-pavti .header {
          text-align: center;
          line-height: 1.2;
        }
        .receipt-outer-container.dengi-pavti .mantra {
          font-size: 9.5px;
          font-weight: 600;
          color: #be1e4d;
          letter-spacing: 0.5px;
        }
        .receipt-outer-container.dengi-pavti .title-main {
          font-family: 'Noto Serif Devanagari', serif;
          font-size: 15px;
          font-weight: 800;
          margin: 1.5px 0;
          color: #be1e4d;
        }
        .receipt-outer-container.dengi-pavti .title-sub {
          font-family: 'Noto Serif Devanagari', serif;
          font-size: 13.5px;
          font-weight: 800;
          margin: 1.5px 0;
          color: #be1e4d;
        }
        .receipt-outer-container.dengi-pavti .address {
          font-size: 10.5px;
          font-weight: 700;
          color: #be1e4d;
        }
        .receipt-outer-container.dengi-pavti .badge-container {
          display: flex;
          justify-content: center;
          margin: 4px 0;
        }
        .receipt-outer-container.dengi-pavti .badge {
          background-color: #be1e4d;
          color: white;
          padding: 3px 22px;
          border-radius: 18px;
          font-size: 12px;
          font-weight: 800;
          line-height: 1;
        }
        .receipt-outer-container.dengi-pavti .metadata-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          font-weight: 700;
          color: #be1e4d;
        }
        .receipt-outer-container.dengi-pavti .metadata-label {
          color: #be1e4d;
          font-weight: 700;
        }
        .receipt-outer-container.dengi-pavti .metadata-value-red {
          color: #be1e4d;
          font-weight: 800;
          font-size: 12px;
        }
        .receipt-outer-container.dengi-pavti .metadata-value-blue {
          color: #1A365D;
          font-family: 'Kalam', cursive;
          font-weight: 700;
          font-size: 12px;
        }
        .receipt-outer-container.dengi-pavti .form-fields-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .receipt-outer-container.dengi-pavti .form-row {
          display: flex;
          align-items: flex-end;
          position: relative;
          height: 22px;
          width: 100%;
        }
        .receipt-outer-container.dengi-pavti .form-label {
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          color: #be1e4d;
          margin-bottom: 1px;
        }
        .receipt-outer-container.dengi-pavti .form-label-suffix {
          font-size: 9px;
          font-weight: 600;
          white-space: nowrap;
          color: #be1e4d;
          margin-left: 6px;
          margin-bottom: 1px;
        }
        .receipt-outer-container.dengi-pavti .form-line {
          flex-grow: 1;
          border-bottom: 0.75px solid #be1e4d;
          margin-left: 6px;
          position: relative;
          height: 100%;
          display: flex;
          align-items: flex-end;
        }
        .receipt-outer-container.dengi-pavti .handwritten-val {
          color: #1A365D;
          font-family: 'Kalam', cursive;
          font-weight: 700;
          font-size: 13.5px;
          white-space: nowrap;
          position: absolute;
          left: 4px;
          bottom: -1px;
        }
        .receipt-outer-container.dengi-pavti .bottom-area {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .receipt-outer-container.dengi-pavti .amount-box-container {
          display: flex;
          align-items: center;
        }
        .receipt-outer-container.dengi-pavti .amount-diamond {
          width: 16px;
          height: 16px;
          background-color: #be1e4d;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(45deg);
          flex-shrink: 0;
        }
        .receipt-outer-container.dengi-pavti .amount-diamond-symbol {
          transform: rotate(-45deg);
          font-size: 10px;
          font-weight: 700;
          margin-bottom: 0.5px;
          margin-right: 0.5px;
        }
        .receipt-outer-container.dengi-pavti .amount-rect {
          border: 1px solid #be1e4d;
          border-radius: 12px;
          background-color: #FFFFFF;
          height: 26px;
          padding: 0 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Kalam', cursive;
          font-weight: 700;
          font-size: 13px;
          color: #1A365D;
          margin-left: 6px;
          min-width: 80px;
          box-sizing: border-box;
        }
        .receipt-outer-container.dengi-pavti .thankyou-text {
          font-family: 'Kalam', cursive;
          font-weight: 700;
          font-size: 15px;
          color: #be1e4d;
          padding-bottom: 2px;
        }
        .receipt-outer-container.dengi-pavti .signature-text {
          font-family: 'Noto Sans Devanagari', sans-serif;
          font-size: 9px;
          font-weight: 700;
          color: #be1e4d;
          text-align: right;
          flex-shrink: 0;
        }

        /* --- Jama Pavti Styles --- */
        .receipt-outer-container.jama-pavti {
          width: 520px;
          height: 420px;
          background-color: #FFFFFF;
          padding: 14px;
          box-sizing: border-box;
          font-family: 'Noto Sans Devanagari', sans-serif;
          position: relative;
        }
        .receipt-outer-container.jama-pavti .receipt-container {
          width: 100%;
          height: 100%;
          border: 2px solid #d81b60;
          padding: 5px;
          box-sizing: border-box;
          background-color: #FFFFFF;
          position: relative;
          z-index: 2;
        }
        .receipt-outer-container.jama-pavti .receipt-inner {
          width: 100%;
          height: 100%;
          border-top: 5px solid #d81b60;
          border-bottom: 5px solid #d81b60;
          padding: 8px 14px;
          box-sizing: border-box;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .receipt-outer-container.jama-pavti .watermark-logo {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 160px;
          height: auto;
          opacity: 0.03;
          pointer-events: none;
          z-index: 1;
        }
        .receipt-outer-container.jama-pavti .header {
          text-align: center;
          line-height: 1.2;
        }
        .receipt-outer-container.jama-pavti .title-main {
          font-family: 'Noto Serif Devanagari', serif;
          font-size: 14px;
          font-weight: 800;
          margin: 1.5px 0;
          color: #d81b60;
        }
        .receipt-outer-container.jama-pavti .address {
          font-size: 8px;
          font-weight: 700;
          color: #d81b60;
        }
        .receipt-outer-container.jama-pavti .header-meta-row {
          display: flex;
          justify-content: space-between;
          font-size: 9px;
          font-weight: 700;
          color: #d81b60;
          padding: 0 10px;
        }
        .receipt-outer-container.jama-pavti .badge-container {
          display: flex;
          justify-content: center;
          margin: 3px 0;
        }
        .receipt-outer-container.jama-pavti .badge {
          background-color: #d81b60;
          color: white;
          padding: 3px 22px;
          border-radius: 18px;
          font-size: 11px;
          font-weight: 800;
          line-height: 1;
        }
        .receipt-outer-container.jama-pavti .metadata-row {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          font-weight: 700;
          color: #d81b60;
        }
        .receipt-outer-container.jama-pavti .metadata-label {
          color: #d81b60;
        }
        .receipt-outer-container.jama-pavti .metadata-value-red {
          color: #d81b60;
          font-weight: 800;
          font-size: 11px;
        }
        .receipt-outer-container.jama-pavti .metadata-value-blue {
          color: #1A365D;
          font-family: 'Kalam', cursive;
          font-weight: 700;
          font-size: 11px;
        }
        .receipt-outer-container.jama-pavti .form-fields-container {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .receipt-outer-container.jama-pavti .form-row {
          display: flex;
          align-items: flex-end;
          position: relative;
          height: 22px;
          width: 100%;
        }
        .receipt-outer-container.jama-pavti .form-label {
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
          color: #d81b60;
          margin-bottom: 1px;
        }
        .receipt-outer-container.jama-pavti .form-line {
          flex-grow: 1;
          border-bottom: 0.75px solid #d81b60;
          margin-left: 6px;
          position: relative;
          height: 100%;
          display: flex;
          align-items: flex-end;
        }
        .receipt-outer-container.jama-pavti .handwritten-val {
          color: #1A365D;
          font-family: 'Kalam', cursive;
          font-weight: 700;
          font-size: 12.5px;
          white-space: nowrap;
          position: absolute;
          left: 4px;
          bottom: -1px;
        }
        .receipt-outer-container.jama-pavti .bottom-area {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .receipt-outer-container.jama-pavti .amount-box-container {
          display: flex;
          align-items: center;
        }
        .receipt-outer-container.jama-pavti .amount-diamond {
          width: 16px;
          height: 16px;
          background-color: #d81b60;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(45deg);
          flex-shrink: 0;
        }
        .receipt-outer-container.jama-pavti .amount-diamond-symbol {
          transform: rotate(-45deg);
          font-size: 10px;
          font-weight: 700;
          margin-bottom: 0.5px;
          margin-right: 0.5px;
        }
        .receipt-outer-container.jama-pavti .amount-rect {
          border: 1px solid #d81b60;
          border-radius: 12px;
          background-color: #FFFFFF;
          height: 26px;
          padding: 0 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Kalam', cursive;
          font-weight: 700;
          font-size: 13px;
          color: #1A365D;
          margin-left: 6px;
          min-width: 80px;
          box-sizing: border-box;
        }
        .receipt-outer-container.jama-pavti .thankyou-text {
          font-family: 'Kalam', cursive;
          font-weight: 700;
          font-size: 14px;
          color: #d81b60;
          padding-bottom: 2px;
        }
        .receipt-outer-container.jama-pavti .signature-section {
          display: flex;
          gap: 20px;
          align-items: flex-end;
        }
        .receipt-outer-container.jama-pavti .sig-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 90px;
        }
        .receipt-outer-container.jama-pavti .sig-name {
          font-family: 'Kalam', cursive;
          font-weight: 700;
          font-size: 10px;
          color: #1A365D;
          height: 14px;
          line-height: 1;
        }
        .receipt-outer-container.jama-pavti .sig-label {
          font-size: 8px;
          font-weight: 700;
          color: #d81b60;
          border-top: 0.5px solid #d81b60;
          width: 100%;
          text-align: center;
          padding-top: 2px;
        }

        /* --- Printing Rules --- */
        @media print {
          ${getPageStyle()}
          body * {
            visibility: hidden;
          }
          #receipt-content, #receipt-content * {
            visibility: visible;
          }
          
          /* Shakha Pavti Print Adjustments */
          #receipt-content.shakha-pavti {
            position: absolute;
            left: 0;
            top: 0;
            width: ${isUserSide ? '137mm' : '210mm'} !important;
            height: 111mm !important;
            margin: 0 !important;
            padding: 14px !important;
            box-sizing: border-box;
            display: flex !important;
            justify-content: ${isUserSide ? 'center' : 'space-between'} !important;
            align-items: center !important;
            background-color: #F58220 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #receipt-content.shakha-pavti .receipt-card-left, 
          #receipt-content.shakha-pavti .receipt-card-right {
            border: 1px solid #8B2D3B !important;
            background-color: #FFFFFF !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #receipt-content.shakha-pavti .amount-diamond {
            background-color: #D32F2F !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #receipt-content.shakha-pavti .trust-capsule {
            background-color: #8B2D3B !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #receipt-content.shakha-pavti .form-line, 
          #receipt-content.shakha-pavti .form-line-double, 
          #receipt-content.shakha-pavti .form-line-prefix-fill {
            border-bottom: 0.75px solid #5B7590 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Dengi Pavti Print Adjustments */
          #receipt-content.dengi-pavti {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm !important;
            height: 148mm !important;
            margin: 0 !important;
            padding: 14px !important;
            box-sizing: border-box;
            background-color: #f6f3eb !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #receipt-content.dengi-pavti .receipt-container {
            border: 3px solid #be1e4d !important;
            background-color: #f6f3eb !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #receipt-content.dengi-pavti .receipt-inner {
            border-top: 5px solid #be1e4d !important;
            border-bottom: 5px solid #be1e4d !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #receipt-content.dengi-pavti .badge {
            background-color: #be1e4d !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #receipt-content.dengi-pavti .form-line {
            border-bottom: 0.75px solid #be1e4d !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #receipt-content.dengi-pavti .amount-diamond {
            background-color: #be1e4d !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #receipt-content.dengi-pavti .amount-rect {
            border: 1px solid #be1e4d !important;
            background-color: #FFFFFF !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Jama Pavti Print Adjustments */
          #receipt-content.jama-pavti {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm !important;
            height: 148mm !important;
            margin: 0 !important;
            padding: 14px !important;
            box-sizing: border-box;
            background-color: #FFFFFF !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #receipt-content.jama-pavti .receipt-container {
            border: 2px solid #d81b60 !important;
            background-color: #FFFFFF !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #receipt-content.jama-pavti .receipt-inner {
            border-top: 5px solid #d81b60 !important;
            border-bottom: 5px solid #d81b60 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #receipt-content.jama-pavti .badge {
            background-color: #d81b60 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #receipt-content.jama-pavti .form-line {
            border-bottom: 0.75px solid #d81b60 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #receipt-content.jama-pavti .amount-diamond {
            background-color: #d81b60 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #receipt-content.jama-pavti .amount-rect {
            border: 1px solid #d81b60 !important;
            background-color: #FFFFFF !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #receipt-content.jama-pavti .sig-label {
            border-top: 0.5px solid #d81b60 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />
    </div>
  );
};

export default Receipt;
