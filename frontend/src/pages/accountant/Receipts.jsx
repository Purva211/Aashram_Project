import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { Search, Printer, Download, Eye, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Receipt from '../../components/Receipt';
import { generateDonationReceipt } from '../../utils/pdfGenerator';

const Receipts = () => {
  const [approvedDonations, setApprovedDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await api.get('/donations');
        const approved = (res.data.data || []).filter(d => d.status === 'APPROVED' && d.receiptNumber);
        setApprovedDonations(approved);
        setFilteredDonations(approved);
      } catch (err) {
        toast.error('Failed to fetch receipts');
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      setFilteredDonations(approvedDonations.filter(d => 
        d.donorName?.toLowerCase().includes(lower) || 
        d.receiptNumber?.toLowerCase().includes(lower) ||
        d.donationReference?.toLowerCase().includes(lower)
      ));
    } else {
      setFilteredDonations(approvedDonations);
    }
  }, [searchTerm, approvedDonations]);

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Quick reset after printing
    }
  };

  return (
    <div className="p-6 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center tracking-tight">Donation Receipts</h1>
          <p className="text-gray-500 mt-1">View and print receipts for approved donations.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Receipt No, Name or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading receipts...</div>
        ) : filteredDonations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No receipts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse block md:table">
              <thead className="hidden md:table-header-group">
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-4 font-semibold">Receipt Number</th>
                  <th className="p-4 font-semibold">Donation ID</th>
                  <th className="p-4 font-semibold">Donor Name</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">Approval Date</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map(don => (
                  <tr key={don._id} className="border-b border-gray-50 hover:bg-gray-50/50 flex flex-col md:table-row border-b md:border-b-0 border-gray-200">
                    <td className="p-4 font-bold text-indigo-600 block md:table-cell">
                      <span className="md:hidden text-xs text-gray-500 uppercase tracking-wider block mb-1">Receipt Number</span>
                      {don.receiptNumber}
                    </td>
                    <td className="p-4 font-medium text-gray-600 block md:table-cell pt-0 md:pt-4">
                      <span className="md:hidden text-xs text-gray-500 uppercase tracking-wider block mb-1">Donation ID</span>
                      {don.donationReference || don._id.substring(0,8)}
                    </td>
                    <td className="p-4 text-gray-900 block md:table-cell pt-0 md:pt-4">
                      <span className="md:hidden text-xs text-gray-500 uppercase tracking-wider block mb-1">Donor Name</span>
                      {don.donorName}
                    </td>
                    <td className="p-4 font-bold text-gray-900 block md:table-cell pt-0 md:pt-4">
                      <span className="md:hidden text-xs text-gray-500 uppercase tracking-wider block mb-1">Amount</span>
                      ₹{don.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-sm text-gray-600 block md:table-cell pt-0 md:pt-4">
                      <span className="md:hidden text-xs text-gray-500 uppercase tracking-wider block mb-1">Approval Date</span>
                      {don.approvalDate ? new Date(don.approvalDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 md:text-right block md:table-cell pt-0 md:pt-4">
                      <span className="md:hidden text-xs text-gray-500 uppercase tracking-wider block mb-1">Actions</span>
                      <div className="flex md:justify-end gap-2">
                        <button onClick={() => { setSelectedDonation(don); setShowReceiptModal(true); }} className="p-2 text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition" title="View"><Eye size={18} /></button>
                        <button onClick={() => generateDonationReceipt(don)} className="p-2 text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100 transition" title="Download PDF"><Download size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 rounded-t-2xl relative">
              <h2 className="text-lg font-bold text-gray-800">Receipt Details</h2>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto mt-4 md:mt-0">
                <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-900 hover:bg-black w-full md:w-auto justify-center text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition order-2 md:order-1">
                  <Printer size={16} /> Print
                </button>
                <button onClick={() => generateDonationReceipt(selectedDonation)} className="flex items-center gap-2 bg-indigo-600 w-full md:w-auto justify-center text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition order-1 md:order-2">
                  <Download size={16} /> Download
                </button>
                <button onClick={() => setShowReceiptModal(false)} className="text-gray-400 hover:text-gray-800 p-2 md:ml-2 transition absolute top-4 right-4 md:static">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-100 flex justify-center">
               <div ref={printRef} className="w-full max-w-xl bg-white shadow-sm">
                  {/* Using existing receipt component or fallback */}
                  {Receipt ? (
                    <Receipt donation={selectedDonation} />
                  ) : (
                    <div className="p-8 border-2 border-gray-800 m-4">
                      <h1 className="text-xl sm:text-2xl md:text-3xl text-center font-bold mb-4 flex items-center tracking-tight">Official Receipt</h1>
                      <div className="flex justify-between border-b pb-4 mb-4">
                        <div><strong>Receipt No:</strong> {selectedDonation.receiptNumber}</div>
                        <div><strong>Date:</strong> {new Date(selectedDonation.approvalDate || Date.now()).toLocaleDateString()}</div>
                      </div>
                      <div className="space-y-2">
                        <p><strong>Received with thanks from:</strong> {selectedDonation.donorName}</p>
                        <p><strong>Amount:</strong> ₹{selectedDonation.amount.toLocaleString()}</p>
                        <p><strong>Donation ID:</strong> {selectedDonation.donationReference}</p>
                        <p><strong>Status:</strong> APPROVED</p>
                      </div>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Receipts;
