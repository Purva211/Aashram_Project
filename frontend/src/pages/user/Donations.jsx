import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, ShieldCheck, CheckCircle2, ChevronDown, Upload, ArrowRight, User, MapPin } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { FaRupeeSign, FaInfoCircle, FaCheckCircle, FaPrayingHands, FaUserCircle } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { validateName, getMobileError } from '../../utils/validationUtils';

const Donation = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Step 1 Details
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [donationType, setDonationType] = useState('dengi_pavti');
  
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  
  const selectedBranch = branches.find(b => b._id === selectedBranchId);
  const isMainBranch = selectedBranch 
    ? (selectedBranch.name.toLowerCase().includes("kole") || selectedBranch.location.toLowerCase().includes("kole")) 
    : true;
  
  // Tracking Reference
  const [donationId, setDonationId] = useState(null);
  const [donationReference, setDonationReference] = useState('');
  
  // Step 3 Details
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentApp, setPaymentApp] = useState('');
  const [screenshot, setScreenshot] = useState(null);

  const TRUST_UPI_ID = "8421004824@ybl";
  const TRUST_NAME = "Shobha godase";

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.mobile || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await api.get('/branches');
        if (response.data?.success && response.data.branches?.length > 0) {
          setBranches(response.data.branches);
          const firstBranch = response.data.branches[0];
          setSelectedBranchId(firstBranch._id);
          const isMain = firstBranch.name.toLowerCase().includes("kole") || firstBranch.location.toLowerCase().includes("kole");
          if (!isMain) {
            setDonationType("shakha_pavti");
          }
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };
    fetchBranches();
  }, []);

  const presetAmounts = [101, 501, 1001, 5001];

  const handleCreateDonation = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return toast.error("Please enter a valid amount.");
    if (!name || !email || !phone || !address || !selectedBranchId) {
      return toast.error("Please fill in all required details.");
    }
    if (!validateName(name)) {
      return toast.error("Name must contain only alphabets and spaces.");
    }
    const mobileError = getMobileError(phone);
    if (mobileError) {
      return toast.error(mobileError);
    }

    // Generate a temporary reference for QR Code
    if (!donationReference) {
      const tempRef = `TEMP-${Date.now().toString().slice(-6)}`;
      setDonationReference(tempRef);
    }
    
    setStep(2);
  };

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    if (!utrNumber) {
      return toast.error("UTR Number is mandatory.");
    }
    if (!/^\d{12}$/.test(utrNumber)) {
      return toast.error("UTR Number must be exactly 12 numeric digits.");
    }

    setIsProcessing(true);
    const loadingToast = toast.loading("Submitting payment for verification...");

    try {
      const formData = new FormData();
      formData.append('donorName', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('address', address);
      formData.append('amount', Number(amount));
      formData.append('branchId', selectedBranchId);
      formData.append('message', message);
      formData.append('donationType', donationType);
      
      formData.append('utrNumber', utrNumber);
      formData.append('paymentApp', paymentApp);
      if (screenshot) {
        formData.append('screenshot', screenshot);
      }

      const response = await api.post(`/donations/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setDonationReference(response.data.data.donationReference);
        setStep(4);
        toast.dismiss(loadingToast);
        toast.success("Payment submitted successfully!");
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || "Failed to submit verification");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF6] flex flex-col font-sans text-mahakal-burgundy pt-28">
      <Navbar />
      <Toaster position="top-center" />
      
      <div className="text-center pt-8 pb-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full px-4 sm:px-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-4">
             <span className="w-12 h-px bg-mahakal-saffron"></span>
             <h4 className="text-mahakal-saffron font-bold tracking-[0.2em] uppercase text-xs md:text-sm">Contribute to the Divine</h4>
             <span className="w-12 h-px bg-mahakal-saffron"></span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-mahakal-burgundy mb-4 tracking-tight">
            Online <span className="text-mahakal-saffron">Donation</span>
          </h1>
        </motion.div>
      </div>

      <div className="flex-grow w-full px-0 sm:px-4 mt-4 relative z-20 pb-24">
        <div className="max-w-4xl mx-auto">
          
          {(!user || user.role !== 'Devotee') ? (
               <div className="bg-white sm:rounded-2xl shadow-sm p-5 sm:p-8 md:p-12 border-y sm:border border-stone-200 text-center py-16">
                 <FaUserCircle className="text-6xl text-mahakal-saffron mx-auto mb-4 opacity-50" />
                 <h2 className="text-2xl font-bold text-mahakal-burgundy font-serif mb-2">Login Required</h2>
                 <p className="text-stone-500 mb-6 font-medium">Please login or register as a Devotee to make an online donation.</p>
                 <button onClick={() => navigate('/login', { state: { returnUrl: '/donate' } })} className="px-8 py-3 bg-gradient-to-r from-mahakal-saffron to-amber-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">Login to Continue</button>
               </div>
          ) : (
            <>
          {/* Progress Tracker */}
          <div className="flex items-center justify-between mb-10 px-4 md:px-12 relative">
            <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1 bg-stone-200 -z-10"></div>
            <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1 bg-mahakal-saffron -z-10 transition-all duration-500" style={{ width: `${(step - 1) * 33.3}%` }}></div>
            
            {['Details', 'Payment', 'Verification', 'Done'].map((label, idx) => {
              const isActive = step >= idx + 1;
              const isCurrent = step === idx + 1;
              const isClickable = idx + 1 < step && idx + 1 < 4; // Can only go back to previous steps, not forward, and not from Done

              return (
                <div key={idx} className="flex flex-col items-center gap-2 bg-[#FFFDF6] px-2">
                  <button 
                    type="button"
                    onClick={() => isClickable && setStep(idx + 1)}
                    disabled={!isClickable}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300 ${isActive ? 'bg-mahakal-saffron border-mahakal-saffron text-white shadow-md' : 'bg-white border-stone-300 text-stone-400'} ${isClickable ? 'cursor-pointer hover:bg-amber-600' : 'cursor-default'}`}
                  >
                    {isActive && !isCurrent ? <CheckCircle2 className="w-6 h-6" /> : idx + 1}
                  </button>
                  <span className={`text-xs md:text-sm font-bold ${isActive ? 'text-mahakal-burgundy' : 'text-stone-400'}`}>{label}</span>
                </div>
              );
            })}
          </div>

          <div className="bg-white sm:rounded-2xl shadow-sm p-4 sm:p-6 md:p-10 border-y sm:border border-stone-200">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: Details Form */}
              {step === 1 && (
                <motion.form key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleCreateDonation} className="space-y-8">
                  <div>
                    <label className="block text-sm font-bold text-caramel-deep uppercase tracking-widest mb-4">Select Amount</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {presetAmounts.map((preset) => (
                        <button
                          type="button"
                          key={preset}
                          onClick={() => setAmount(preset)}
                          className={`py-4 rounded-xl border-2 font-bold text-lg transition-all ${Number(amount) === preset ? 'border-mahakal-saffron bg-amber-50 text-mahakal-saffron shadow-sm' : 'border-stone-200 text-stone-600 hover:border-amber-200'}`}
                        >
                          ₹{preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-mahakal-burgundy uppercase tracking-widest mb-3">Custom Amount</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-bold text-stone-400">₹</span>
                      <input type="number" min="1" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full pl-12 pr-6 py-4 rounded-xl border-2 border-stone-200 focus:ring-2 focus:ring-mahakal-saffron focus:border-mahakal-saffron outline-none bg-white text-xl font-bold" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-mahakal-burgundy uppercase tracking-widest mb-3">पावती प्रकार / Receipt Type</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: 'dengi_pavti', labelMarathi: 'देणगी पावती', labelEnglish: 'Dengi Pavti (Donation)' },
                        { id: 'shakha_pavti', labelMarathi: 'शाखा पावती', labelEnglish: 'Shakha Pavti (Branch)' },
                        { id: 'jama_pavti', labelMarathi: 'जमा पावती', labelEnglish: 'Jama Pavti (Collection)' }
                      ].map((opt) => {
                        return (
                          <button
                            type="button"
                            key={opt.id}
                            onClick={() => setDonationType(opt.id)}
                            className={`py-3 px-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                              donationType === opt.id 
                                ? 'border-mahakal-saffron bg-amber-50 text-mahakal-saffron shadow-sm' 
                                : 'border-stone-200 text-stone-600 hover:border-amber-200'
                            }`}
                          >
                            <span className="font-bold text-base">{opt.labelMarathi}</span>
                            <span className="text-xs text-stone-400 font-medium mt-0.5">{opt.labelEnglish}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {branches.length > 0 && (
                    <div>
                      <label className="block text-sm font-bold text-mahakal-burgundy uppercase tracking-widest mb-3">Select Branch</label>
                      <div className="relative">
                        <select 
                          required 
                          value={selectedBranchId} 
                          onChange={(e) => {
                            const newBranchId = e.target.value;
                            setSelectedBranchId(newBranchId);
                            if (newBranchId !== 'global') {
                              const newBranch = branches.find(b => b._id === newBranchId);
                              if (newBranch) {
                                const isMain = newBranch.name.toLowerCase().includes("kole") || newBranch.location.toLowerCase().includes("kole");
                                // We don't automatically override donation type anymore
                              }
                            }
                          }}
                          className="w-full px-6 py-4 rounded-xl border-2 border-stone-200 focus:ring-2 focus:ring-mahakal-saffron focus:border-mahakal-saffron outline-none bg-white text-mahakal-burgundy font-medium appearance-none"
                        >
                          <option value="" disabled>Select a branch</option>
                          <option value="global">Global Trust / Math (Common)</option>
                          {branches.map(b => (
                            <option key={b._id} value={b._id}>{b.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-mahakal-burgundy uppercase tracking-widest mb-3">Full Name</label>
                      <input type="text" required pattern="[A-Za-z\s]+" title="Name must contain only alphabets and spaces" value={name} onChange={(e) => setName(e.target.value.replace(/[^A-Za-z\s]/g, ''))} className="w-full px-6 py-4 rounded-xl border-2 border-stone-200 focus:ring-2 focus:ring-mahakal-saffron focus:border-mahakal-saffron outline-none bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-mahakal-burgundy uppercase tracking-widest mb-3">Email</label>
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-6 py-4 rounded-xl border-2 border-stone-200 focus:ring-2 focus:ring-mahakal-saffron focus:border-mahakal-saffron outline-none bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-mahakal-burgundy uppercase tracking-widest mb-3">Mobile Number</label>
                      <input type="tel" required pattern="\d{10}" title="Mobile number must be exactly 10 digits" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} className="w-full px-6 py-4 rounded-xl border-2 border-stone-200 focus:ring-2 focus:ring-mahakal-saffron focus:border-mahakal-saffron outline-none bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-mahakal-burgundy uppercase tracking-widest mb-3">City/Address</label>
                      <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-6 py-4 rounded-xl border-2 border-stone-200 focus:ring-2 focus:ring-mahakal-saffron focus:border-mahakal-saffron outline-none bg-white" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-mahakal-burgundy uppercase tracking-widest mb-3">Donation Purpose (e.g. देणगी / अन्नदान)</label>
                      <input type="text" required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter purpose of donation" className="w-full px-6 py-4 rounded-xl border-2 border-stone-200 focus:ring-2 focus:ring-mahakal-saffron focus:border-mahakal-saffron outline-none bg-white" />
                    </div>
                  </div>

                  <button type="submit" disabled={isProcessing} className="w-full py-4 rounded-xl text-white font-bold text-lg bg-mahakal-saffron hover:bg-amber-600 transition-all flex items-center justify-center gap-2">
                    {isProcessing ? "Processing..." : "Proceed to Payment"} <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.form>
              )}

              {/* STEP 2: Payment QR Code */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center">
                  <div className="bg-amber-50 text-amber-800 px-4 py-2 rounded-lg font-bold mb-6 flex items-center gap-2 border border-amber-200">
                    <span>Ref: {donationReference}</span>
                  </div>

                  <div className="bg-white p-6 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-stone-100 flex flex-col items-center">
                    <h3 className="text-2xl font-bold font-serif mb-1">{TRUST_NAME}</h3>
                    <p className="text-stone-500 font-medium mb-6">Scan QR with any UPI app</p>
                    
                    <div className="p-4 bg-white border-2 border-stone-100 rounded-2xl mb-6 shadow-inner">
                      <QRCodeSVG 
                        value={`upi://pay?pa=${TRUST_UPI_ID}&pn=${encodeURIComponent(TRUST_NAME)}&am=${amount}&cu=INR&tn=${donationReference}`}
                        size={240}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 bg-mahakal-saffron/10 px-6 py-3 rounded-xl border border-mahakal-saffron/20 mb-6">
                      <span className="text-3xl font-black text-mahakal-burgundy">₹{amount}</span>
                    </div>
                    
                    <p className="text-sm font-bold tracking-widest text-stone-400 uppercase mb-1">UPI ID</p>
                    <p className="text-lg text-mahakal-saffron font-bold">{TRUST_UPI_ID}</p>
                  </div>

                  <div className="mt-8 flex gap-4 w-full">
                    <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-xl text-stone-600 font-bold text-lg bg-stone-100 hover:bg-stone-200 transition-all flex items-center justify-center">
                      Back
                    </button>
                    <button onClick={() => setStep(3)} className="flex-[2] py-4 rounded-xl text-white font-bold text-lg bg-mahakal-saffron hover:bg-amber-600 transition-all flex items-center justify-center gap-2">
                      I have made the payment <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Verification Details */}
              {step === 3 && (
                <motion.form key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSubmitVerification} className="space-y-6">
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 font-medium text-sm mb-6 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>To verify your donation, please provide the 12-digit UTR/Transaction Number and upload a screenshot of your successful payment.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-mahakal-burgundy uppercase tracking-widest mb-3">UTR / Transaction Number *</label>
                    <input type="text" required value={utrNumber} onChange={(e) => setUtrNumber(e.target.value)} placeholder="e.g. 312345678901" className="w-full px-6 py-4 rounded-xl border-2 border-stone-200 focus:ring-2 focus:ring-mahakal-saffron focus:border-mahakal-saffron outline-none bg-white font-mono text-lg" />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-mahakal-burgundy uppercase tracking-widest mb-3">Payment App Used</label>
                    <select value={paymentApp} onChange={(e) => setPaymentApp(e.target.value)} className="w-full px-6 py-4 rounded-xl border-2 border-stone-200 focus:ring-2 focus:ring-mahakal-saffron focus:border-mahakal-saffron outline-none bg-white">
                      <option value="">Select App (Optional)</option>
                      <option value="PhonePe">PhonePe</option>
                      <option value="Google Pay">Google Pay</option>
                      <option value="Paytm">Paytm</option>
                      <option value="BHIM">BHIM</option>
                      <option value="Other">Other Bank App</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-mahakal-burgundy uppercase tracking-widest mb-3">Upload Payment Screenshot (Optional)</label>
                    <div className="border-2 border-dashed border-stone-300 rounded-2xl p-8 text-center hover:bg-stone-50 transition-colors">
                      <input type="file" accept="image/*" id="screenshot-upload" className="hidden" onChange={(e) => setScreenshot(e.target.files[0])} />
                      <label htmlFor="screenshot-upload" className="cursor-pointer flex flex-col items-center">
                        <Upload className="w-10 h-10 text-stone-400 mb-3" />
                        <span className="text-mahakal-saffron font-bold">Click to browse</span>
                        <span className="text-stone-500 text-sm mt-1">{screenshot ? screenshot.name : "or drag and drop an image"}</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button type="button" onClick={() => setStep(2)} disabled={isProcessing} className="flex-1 py-4 rounded-xl text-stone-600 font-bold text-lg bg-stone-100 hover:bg-stone-200 transition-all flex items-center justify-center">
                      Back
                    </button>
                    <button type="submit" disabled={isProcessing} className="flex-[2] py-4 rounded-xl text-white font-bold text-lg bg-green-600 hover:bg-green-700 transition-all flex items-center justify-center gap-2">
                      {isProcessing ? "Uploading..." : "Submit for Verification"} <CheckCircle2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.form>
              )}

              {/* STEP 4: Success */}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-10">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold font-serif text-mahakal-burgundy mb-4">Donation Submitted!</h2>
                  <p className="text-stone-600 text-lg max-w-md mx-auto mb-6">
                    Thank you for making donation request. Your PDF receipt will show on your dashboard after verification and you can download it from there.
                  </p>
                  <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 w-full max-w-md text-left space-y-3">
                    <p className="flex justify-between"><span className="text-stone-500 font-bold text-sm">Reference</span> <span className="font-mono font-bold text-mahakal-burgundy">{donationReference}</span></p>
                    <p className="flex justify-between"><span className="text-stone-500 font-bold text-sm">Amount</span> <span className="font-bold text-mahakal-burgundy">₹{amount}</span></p>
                    <p className="flex justify-between"><span className="text-stone-500 font-bold text-sm">UTR</span> <span className="font-mono font-bold text-mahakal-burgundy">{utrNumber}</span></p>
                  </div>
                  <p className="text-stone-500 text-sm mt-6">Please check your dashboard later for the verified receipt.</p>
                  <button 
                    onClick={() => navigate('/devotee/donations')} 
                    className="mt-4 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg transition-all flex items-center gap-2"
                  >
                    <FaCheckCircle /> Go to My Dashboard
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Donation;
