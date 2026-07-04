import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Search, Download, Share2, Printer, Eye, Info, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ReceiptHistory = ({ defaultCategory = 'All', hideTitle = false, hideCategoryFilter = false }) => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: defaultCategory,
    branchId: 'All',
    search: ''
  });
  const [selectedInfo, setSelectedInfo] = useState(null);

  const categories = ['All', 'Notice', 'Donation', 'Branch Donation', 'Annadan', 'Prasad', 'Payment', 'Expense'];

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(filters).toString();
      const res = await api.get(`/receipts?${queryParams}`);
      if (res.data.success) {
        setReceipts(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load receipts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [filters.category, filters.branchId]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReceipts();
  };

  const handleDownload = async (receipt) => {
    if (!receipt.pdfUrl) return;
    
    if (receipt.pdfUrl.startsWith('/api')) {
      const toastId = toast.loading("Downloading document...");
      try {
        const fetchUrl = receipt.pdfUrl.replace('/api', '');
        const response = await api.get(fetchUrl, { responseType: 'blob' });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${receipt.category.replace(/\s+/g, '_')}_${receipt.receiptNumber}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("Downloaded successfully!", { id: toastId });
      } catch (error) {
        console.error("Failed to download PDF:", error);
        toast.error("Failed to download PDF.", { id: toastId });
      }
    } else {
      // Legacy static Cloudinary/local URL
      const link = document.createElement('a');
      link.href = receipt.pdfUrl;
      link.target = "_blank";
      link.download = `${receipt.category}_${receipt.receiptNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  const handleView = async (receipt) => {
    if (!receipt.pdfUrl) return;

    if (receipt.pdfUrl.startsWith('/api')) {
      const toastId = toast.loading("Loading document...");
      try {
        const fetchUrl = receipt.pdfUrl.replace('/api', '');
        const response = await api.get(fetchUrl, { responseType: 'blob' });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        toast.dismiss(toastId);
      } catch (error) {
        console.error("Failed to load PDF:", error);
        toast.error("Failed to load PDF.", { id: toastId });
      }
    } else {
      window.open(receipt.pdfUrl, '_blank');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {!hideTitle && <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">Document & Receipt History</h1>}

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Document No.</label>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search REC-..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            </form>
          </div>
          
          
          {!hideCategoryFilter && (
            <div className="min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="w-full p-2 border rounded-lg bg-gray-50"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          )}
          
          <button 
            onClick={fetchReceipts}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Apply Filters
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-4 font-semibold">Document No</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Recipient</th>
                  <th className="p-4 font-semibold">Branch</th>
                  <th className="p-4 font-semibold">Generated By</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan="6" className="text-center p-8 text-gray-500">Loading documents...</td></tr>
                ) : receipts.length === 0 ? (
                  <tr><td colSpan="6" className="text-center p-8 text-gray-500">No documents found matching filters</td></tr>
                ) : (
                  receipts.map(receipt => (
                    <tr key={receipt._id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-medium text-gray-900">{receipt.receiptNumber}</td>
                      <td className="p-4 text-gray-600">
                        {new Date(receipt.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {receipt.category}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-gray-800">
                        {receipt.dynamicData?.donorName || receipt.dynamicData?.name || receipt.dynamicData?.subject || 'N/A'}
                      </td>
                      <td className="p-4 text-gray-600">{receipt.branchId?.name || 'Main Trust'}</td>
                      <td className="p-4 text-gray-600">
                        {receipt.generatedBy?.name || receipt.generatedBy?.fullName || receipt.generatedBy?.displayName || 'System'}
                      </td>
                      <td className="p-4 flex justify-end gap-2">
                        {receipt.pdfUrl ? (
                          <>
                            <button onClick={() => handleView(receipt)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="View PDF">
                              <Eye className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDownload(receipt)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Download">
                              <Download className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Share via WhatsApp" onClick={() => window.open(`https://api.whatsapp.com/send?text=View your document here: ${receipt.pdfUrl.startsWith('/api') ? '(Requires Login) ' + window.location.origin + receipt.pdfUrl : receipt.pdfUrl}`, '_blank')}>
                              <Share2 className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg" title="More Info" onClick={() => setSelectedInfo(receipt)}>
                              <Info className="w-5 h-5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">PDF Pending</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Info Modal */}
      {selectedInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-800">Document Metadata</h2>
              <button onClick={() => setSelectedInfo(null)} className="text-gray-400 hover:text-gray-800 p-2 transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-sm text-gray-700">
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-500">Document No:</span>
                <span className="font-medium">{selectedInfo.receiptNumber}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-500">Category:</span>
                <span className="font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">{selectedInfo.category}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-500">Recipient Name:</span>
                <span className="font-medium text-right">{selectedInfo.dynamicData?.donorName || selectedInfo.dynamicData?.name || selectedInfo.dynamicData?.subject || 'N/A'}</span>
              </div>
              {selectedInfo.dynamicData?.amount && (
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold text-gray-500">Amount:</span>
                  <span className="font-medium text-green-600">₹{selectedInfo.dynamicData.amount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-500">Submitted Date:</span>
                <span className="font-medium">{selectedInfo.createdAt ? new Date(selectedInfo.createdAt).toLocaleString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-500">Approved Date:</span>
                <span className="font-medium">{selectedInfo.approvalDate ? new Date(selectedInfo.approvalDate).toLocaleString() : (selectedInfo.createdAt ? new Date(selectedInfo.createdAt).toLocaleString() : 'N/A')}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-500">Last Downloaded:</span>
                <span className="font-medium text-indigo-600">{selectedInfo.lastReceiptDownloadedAt ? new Date(selectedInfo.lastReceiptDownloadedAt).toLocaleString() : 'Never'}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="font-semibold text-gray-500">Generated By:</span>
                <span className="font-medium">{selectedInfo.generatedBy?.name || selectedInfo.generatedBy?.fullName || selectedInfo.generatedBy?.displayName || 'System'}</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-b-2xl flex justify-end">
              <button onClick={() => setSelectedInfo(null)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-semibold transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptHistory;
