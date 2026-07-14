import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Search, Eye, AlertCircle, MapPin, Receipt, X } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const DonationVerification = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  
  // Modals state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPendingDonations();
  }, []);

  const fetchPendingDonations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/donations/pending');
      if (res.data.success) {
        setDonations(res.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch pending donations");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedDonation || isProcessing) return;
    setIsProcessing(true);
    try {
      const res = await api.post(`/donations/${selectedDonation._id}/approve`, {
        remarks: remarks || "Verified manually from bank statement."
      });
      if (res.data.success) {
        toast.success("Donation Approved! Generating receipt...");
        if (!res.data.pdfUrl) {
           toast.error("Donation approved, but backend did not return a PDF receipt URL.");
        }
        setShowApproveModal(false);
        setSelectedDonation(null);
        setRemarks('');
        fetchPendingDonations();
        navigate('/accountant/receipts');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Approval failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedDonation || isProcessing) return;
    if (!rejectReason) return toast.error("Please select a reason.");
    
    setIsProcessing(true);
    try {
      const res = await api.post(`/donations/${selectedDonation._id}/reject`, {
        reason: rejectReason
      });
      if (res.data.success) {
        toast.success("Donation Rejected.");
        setShowRejectModal(false);
        setSelectedDonation(null);
        setRejectReason('');
        fetchPendingDonations();
        navigate('/accountant/receipts');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Rejection failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 md:p-8 w-full space-y-6">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif text-mahakal-burgundy flex items-center tracking-tight">Verify Donations</h1>
          <p className="text-stone-500 mt-1">Review pending manual UPI transfers before generating official receipts.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mahakal-saffron"></div>
        </div>
      ) : donations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-mahakal-burgundy mb-2">All Caught Up!</h2>
          <p className="text-stone-500">There are no pending donations requiring your verification at this moment.</p>
        </div>
      ) : (
        <div className="md:bg-white md:rounded-2xl md:border md:border-stone-200 overflow-hidden md:shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse block md:table">
              <thead className="hidden md:table-header-group">
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-xs uppercase tracking-widest font-bold">
                  <th className="p-4">Reference</th>
                  <th className="p-4">Donor Name</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">UTR Number</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="block md:table-row-group w-full divide-y divide-stone-100">
                {donations.map((d) => (
                  <tr key={d._id} className="flex flex-col md:table-row w-full bg-white md:bg-transparent border border-stone-200 md:border-b md:border-x-0 md:border-t-0 rounded-xl md:rounded-none mb-4 md:mb-0 shadow-sm md:shadow-none hover:bg-stone-50/50 overflow-hidden transition">
                    {/* Mobile Card Top & Desktop ID */}
                    <td className="p-3 md:p-4 flex flex-col md:table-cell w-full border-b border-stone-100 md:border-none">
                      <div className="flex md:hidden justify-between items-start mb-3">
                        <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Ref: <span className="font-mono text-mahakal-burgundy">{d.donationReference}</span></span>
                        <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-bold">
                          PENDING
                        </span>
                      </div>
                      <div className="md:hidden flex justify-between items-end mb-2">
                        <div>
                          <span className="text-[10px] text-stone-500 uppercase tracking-widest font-bold block mb-0.5">Donor Name</span>
                          <span className="font-bold text-stone-900 text-base">{d.donorName}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-stone-500 uppercase tracking-widest font-bold block mb-0.5">Amount</span>
                          <span className="font-bold text-mahakal-saffron text-lg">₹{d.amount}</span>
                        </div>
                      </div>
                      <div className="md:hidden text-xs text-stone-500 font-medium mb-1">
                        UTR: <span className="font-mono font-bold text-stone-700">{d.utrNumber}</span>
                      </div>
                      {/* Desktop view Content */}
                      <span className="hidden md:inline font-mono text-sm font-bold text-mahakal-burgundy bg-mahakal-saffron/10 px-2 py-1 rounded-md">
                        {d.donationReference}
                      </span>
                    </td>
                    <td className="hidden md:table-cell p-4 font-medium text-stone-800">
                      {d.donorName}
                    </td>
                    <td className="hidden md:table-cell p-4 font-bold text-mahakal-saffron">
                      ₹{d.amount}
                    </td>
                    <td className="hidden md:table-cell p-4 font-mono text-sm text-stone-600">
                      {d.utrNumber}
                    </td>
                    <td className="hidden md:table-cell p-4 text-sm text-stone-500">
                      {new Date(d.updatedAt).toLocaleDateString()}
                    </td>
                    {/* Mobile Footer & Desktop Actions */}
                    <td className="p-3 md:p-4 block md:table-cell bg-stone-50 md:bg-transparent rounded-b-xl md:rounded-none">
                      <div className="flex md:hidden justify-between items-center mb-3 px-1">
                        <span className="text-[11px] text-stone-500 font-medium">{new Date(d.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between md:justify-center border-t border-stone-200 md:border-none pt-3 md:pt-0">
                        <button 
                          onClick={() => setSelectedDonation(d)}
                          className="w-full md:w-auto flex justify-center items-center gap-2 bg-white border border-stone-200 shadow-sm px-4 py-2 md:py-1.5 rounded-lg text-sm font-bold text-mahakal-burgundy hover:border-mahakal-saffron hover:text-mahakal-saffron transition-colors"
                        >
                          <Eye className="w-4 h-4" /> Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {selectedDonation && !showApproveModal && !showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setSelectedDonation(null)}></div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] md:max-h-[85vh] flex flex-col relative z-10 overflow-hidden">
              <div className="p-4 md:p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50 shrink-0">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold font-serif text-mahakal-burgundy">Verify Payment</h2>
                  <p className="text-[10px] md:text-xs font-bold text-amber-600 uppercase tracking-widest">Status: Pending Verification</p>
                </div>
                <button onClick={() => setSelectedDonation(null)} className="w-8 h-8 flex items-center justify-center bg-stone-200 hover:bg-stone-300 rounded-full text-stone-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6 md:gap-8">
                <div className="flex-1 space-y-6">
                  <div className="bg-stone-50 p-5 rounded-xl border border-stone-200 space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-4 border-b border-stone-200 pb-4">
                      <div>
                        <p className="text-stone-400 font-bold uppercase text-[10px] tracking-widest mb-1">Donor Name</p>
                        <p className="font-bold text-stone-800">{selectedDonation.donorName}</p>
                      </div>
                      <div>
                        <p className="text-stone-400 font-bold uppercase text-[10px] tracking-widest mb-1">Contact</p>
                        <p className="font-medium text-stone-800">{selectedDonation.phone}</p>
                        <p className="text-stone-500 break-all">{selectedDonation.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 border-b border-stone-200 pb-4">
                      <div>
                        <p className="text-stone-400 font-bold uppercase text-[10px] tracking-widest mb-1">Claimed Amount</p>
                        <p className="text-2xl font-black text-mahakal-saffron">₹{selectedDonation.amount}</p>
                      </div>
                      <div>
                        <p className="text-stone-400 font-bold uppercase text-[10px] tracking-widest mb-1">Reference</p>
                        <p className="font-mono font-bold text-stone-700">{selectedDonation.donationReference}</p>
                      </div>
                    </div>
  
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-stone-400 font-bold uppercase text-[10px] tracking-widest mb-1">UTR Number</p>
                        <p className="font-mono font-bold text-lg md:text-xl text-stone-800 bg-yellow-100 inline-block px-1 rounded break-all">{selectedDonation.utrNumber}</p>
                      </div>
                      <div>
                        <p className="text-stone-400 font-bold uppercase text-[10px] tracking-widest mb-1">App Used</p>
                        <p className="font-medium text-stone-800">{selectedDonation.paymentApp || "N/A"}</p>
                      </div>
                    </div>
                  </div>
  
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 text-sm text-blue-800 font-medium">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-blue-500" />
                    <p>Please cross-check the UTR Number <strong className="font-mono bg-white px-1 border border-blue-200 rounded">{selectedDonation.utrNumber}</strong> and exact amount <strong className="font-bold text-mahakal-burgundy">₹{selectedDonation.amount}</strong> in your official bank statement before approving.</p>
                  </div>
                </div>

                {/* Right side: Screenshot Preview */}
                <div className="flex-1 bg-stone-50 rounded-xl border border-stone-200 flex flex-col overflow-hidden min-h-[300px]">
                  <div className="p-3 bg-stone-100 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-widest text-center shrink-0">
                    Uploaded Payment Screenshot
                  </div>
                  <div className="flex-1 p-4 flex items-center justify-center bg-stone-200/50">
                    {selectedDonation.screenshotUrl ? (
                      <img src={selectedDonation.screenshotUrl} alt="Payment Proof" className="max-w-full max-h-[400px] object-contain rounded-lg shadow-sm" />
                    ) : (
                      <div className="text-stone-400 flex flex-col items-center">
                        <AlertCircle className="w-10 h-10 mb-2" />
                        <p>No screenshot uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="p-4 md:p-6 border-t border-stone-100 bg-white flex flex-col md:flex-row gap-4 shrink-0">
                  <button onClick={() => setShowRejectModal(true)} className="w-full md:w-auto md:flex-1 py-3.5 md:py-3 rounded-xl border-2 border-red-100 text-red-600 font-bold hover:bg-red-50 transition-colors flex justify-center items-center gap-2 order-2 md:order-1">
                    <XCircle className="w-5 h-5" /> Reject
                  </button>
                  <button onClick={() => setShowApproveModal(true)} className="order-1 md:order-2 w-full md:w-auto md:flex-1 py-3.5 md:py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-md transition-colors flex justify-center items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Approve & Generate Receipt
                  </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setShowApproveModal(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative z-10 border-t-8 border-t-green-500">
             <h3 className="text-2xl font-bold font-serif text-stone-800 mb-2">Confirm Approval</h3>
             <p className="text-stone-600 text-sm mb-6">You are about to approve a donation of <strong className="text-mahakal-saffron">₹{selectedDonation.amount}</strong>. A PDF receipt will be generated automatically.</p>
             
             <div className="mb-6">
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Approval Remarks (Optional)</label>
                <textarea 
                  value={remarks} 
                  onChange={(e) => setRemarks(e.target.value)} 
                  className="w-full p-3 rounded-lg border border-stone-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none resize-none bg-stone-50 text-sm"
                  placeholder="e.g. Verified from HDFC Bank Statement on 15th June"
                  rows="3"
                ></textarea>
             </div>

             <div className="flex flex-col md:flex-row gap-3">
               <button onClick={() => setShowApproveModal(false)} className="w-full md:w-auto flex-1 py-3 rounded-xl bg-stone-100 text-stone-600 font-bold hover:bg-stone-200 order-2 md:order-1">Cancel</button>
               <button onClick={handleApprove} disabled={isProcessing} className="order-1 md:order-2 flex-1 py-3 rounded-xl bg-slate-900 hover:bg-black w-full md:w-auto justify-center text-white font-bold hover:bg-green-700 shadow flex items-center justify-center gap-2">
                 {isProcessing ? "Approving..." : <><Receipt className="w-5 h-5"/> Confirm & Issue</>}
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setShowRejectModal(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative z-10 border-t-8 border-t-red-500">
             <h3 className="text-2xl font-bold font-serif text-stone-800 mb-2">Reject Payment</h3>
             <p className="text-stone-600 text-sm mb-6">Select a reason for rejecting this payment submission.</p>
             
             <div className="mb-6">
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Rejection Reason *</label>
                <select 
                  value={rejectReason} 
                  onChange={(e) => setRejectReason(e.target.value)}
                  className={`w-full p-3 rounded-lg border focus:ring-2 outline-none text-sm transition-colors ${!rejectReason && isProcessing ? 'border-red-500 ring-2 ring-red-200' : 'border-stone-300 focus:border-red-500 focus:ring-red-200 bg-stone-50'}`}
                  required
                >
                  <option value="">Select a reason...</option>
                  <option value="Payment not found in bank statement">Payment not found in bank statement</option>
                  <option value="Amount mismatch">Amount mismatch</option>
                  <option value="Invalid or fake screenshot">Invalid or fake screenshot</option>
                  <option value="Duplicate transaction">Duplicate transaction</option>
                  <option value="Other">Other</option>
                </select>
                {!rejectReason && <p className="text-xs text-red-500 font-medium mt-1.5">You must select a reason to proceed.</p>}
             </div>

             <div className="flex flex-col md:flex-row gap-3">
               <button onClick={() => setShowRejectModal(false)} className="w-full md:w-auto flex-1 py-3 rounded-xl bg-stone-100 text-stone-600 font-bold hover:bg-stone-200 order-2 md:order-1">Cancel</button>
               <button 
                  onClick={handleReject} 
                  disabled={isProcessing || !rejectReason} 
                  className="order-1 md:order-2 flex-1 py-3 rounded-xl bg-slate-900 hover:bg-black w-full md:w-auto justify-center text-white font-bold hover:bg-red-700 shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
               >
                 {isProcessing ? "Rejecting..." : "Confirm Rejection"}
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationVerification;




