import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpinner, FaCheck, FaTimes, FaFileAlt, FaHandHoldingHeart, FaTrash, FaClock, FaCheckCircle, FaExclamationCircle, FaEye } from 'react-icons/fa';
import { FiShield, FiFilter, FiSearch, FiFileText } from 'react-icons/fi';
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from 'react-hot-toast';

const ASSETS_URL = import.meta.env.VITE_ASSETS_URL || "http://localhost:5000";

const TrusteeDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'annadaan', 'documents', 'deletions'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pending items state
  const [pendingAnnadaan, setPendingAnnadaan] = useState([]);
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [pendingDeletions, setPendingDeletions] = useState([]);

  // Modal for previewing document
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const [annadaanRes, docsRes, deletionsRes] = await Promise.all([
        api.get('/annadaan').catch(() => ({ data: { data: [] } })),
        api.get('/trustees/documents/pending').catch(() => ({ data: { data: [] } })),
        api.get('/trustees/documents/deletion-requests').catch(() => ({ data: { data: [] } }))
      ]);

      // Filter annadaan for status === 'pending'
      const allAnnadaan = annadaanRes.data?.data || [];
      const pendingAnn = allAnnadaan.filter(a => a.status === 'pending');
      setPendingAnnadaan(pendingAnn);

      setPendingDocuments(docsRes.data?.data || []);
      setPendingDeletions(deletionsRes.data?.data || []);
    } catch (err) {
      console.error("Error fetching pending requests:", err);
      toast.error("Failed to fetch pending approval requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  // Action Handlers
  const handleReviewAnnadaan = async (id, status) => {
    try {
      await api.put(`/annadaan/${id}`, { status });
      toast.success(`Annadaan request ${status} successfully`);
      fetchPendingRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update Annadaan request");
    }
  };

  const handleReviewDocument = async (id, status) => {
    try {
      await api.put(`/trustees/documents/${id}/review`, { status, reviewComment: `Reviewed by Trustee` });
      toast.success(`Document upload ${status.toLowerCase()} successfully`);
      fetchPendingRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to review document");
    }
  };

  const handleReviewDeletion = async (id, status) => {
    try {
      await api.put(`/trustees/documents/${id}/review-deletion`, { status });
      toast.success(`Deletion request ${status.toLowerCase()} successfully`);
      fetchPendingRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to review deletion request");
    }
  };

  const totalPending = pendingAnnadaan.length + pendingDocuments.length + pendingDeletions.length;

  // Combine items for 'all' tab or filter
  const getFilteredItems = () => {
    let list = [];

    if (activeTab === 'all' || activeTab === 'annadaan') {
      pendingAnnadaan.forEach(item => {
        list.push({
          id: item._id,
          type: 'ANNADAAN',
          title: `Annadaan: ${item.annadaanType}`,
          subtitle: `Donor: ${item.name} (${item.phone})`,
          details: `Date: ${new Date(item.date).toLocaleDateString()} at ${item.time}${item.description ? ` | Note: ${item.description}` : ''}`,
          date: item.createdAt || item.date,
          original: item,
          onApprove: () => handleReviewAnnadaan(item._id, 'approved'),
          onReject: () => handleReviewAnnadaan(item._id, 'rejected')
        });
      });
    }

    if (activeTab === 'all' || activeTab === 'documents') {
      pendingDocuments.forEach(item => {
        list.push({
          id: item._id,
          type: 'DOCUMENT_UPLOAD',
          title: `Doc Upload: ${item.title}`,
          subtitle: `Category: ${item.category} ${item.branch ? `• Branch: ${item.branch.name}` : '• Global'}`,
          details: item.description || 'Uploaded for trustee review',
          fileUrl: item.pdfUrl,
          fileName: item.pdfName,
          date: item.createdAt,
          original: item,
          onApprove: () => handleReviewDocument(item._id, 'Approved'),
          onReject: () => handleReviewDocument(item._id, 'Rejected')
        });
      });
    }

    if (activeTab === 'all' || activeTab === 'deletions') {
      pendingDeletions.forEach(item => {
        list.push({
          id: item._id,
          type: 'DOCUMENT_DELETION',
          title: `Deletion Request: ${item.title}`,
          subtitle: `Category: ${item.category} ${item.branch ? `• Branch: ${item.branch.name}` : ''}`,
          details: `Reason: ${item.deletionReason || 'No reason provided'}`,
          fileUrl: item.pdfUrl,
          fileName: item.pdfName,
          date: item.updatedAt || item.createdAt,
          original: item,
          onApprove: () => handleReviewDeletion(item._id, 'Approved'),
          onReject: () => handleReviewDeletion(item._id, 'Rejected')
        });
      });
    }

    // Filter by search term if typed
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(item => 
        item.title.toLowerCase().includes(term) ||
        item.subtitle.toLowerCase().includes(term) ||
        item.details.toLowerCase().includes(term)
      );
    }

    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const filteredItems = getFilteredItems();

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center py-20 text-gray-500">
        <FaSpinner className="text-4xl text-amber-500 animate-spin mb-4" />
        <p className="font-semibold text-sm">Loading pending approval requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8 pb-12 w-full text-gray-900 font-sans overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
            <FiShield className="text-amber-600" /> Pending Approval Requests
          </h1>
          <p className="text-sm text-gray-500 mt-1">Review and manage all pending authorizations required by the Trustee.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-4 py-2 bg-amber-100 text-amber-800 rounded-xl font-extrabold text-sm flex items-center gap-2 shadow-sm border border-amber-200">
            <FaClock className="text-amber-600" /> {totalPending} Pending {totalPending === 1 ? 'Action' : 'Actions'}
          </span>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div 
          onClick={() => setActiveTab('annadaan')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${activeTab === 'annadaan' ? 'bg-orange-50/80 border-orange-300 shadow-md ring-2 ring-orange-400' : 'bg-white border-gray-100 shadow-sm hover:border-orange-200'}`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Annadaan Seva</span>
            <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <FaHandHoldingHeart />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{pendingAnnadaan.length}</p>
          <p className="text-xs text-gray-400 font-medium mt-1">Pending verification</p>
        </div>

        <div 
          onClick={() => setActiveTab('documents')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${activeTab === 'documents' ? 'bg-indigo-50/80 border-indigo-300 shadow-md ring-2 ring-indigo-400' : 'bg-white border-gray-100 shadow-sm hover:border-indigo-200'}`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Document Uploads</span>
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <FaFileAlt />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{pendingDocuments.length}</p>
          <p className="text-xs text-gray-400 font-medium mt-1">Pending upload approvals</p>
        </div>

        <div 
          onClick={() => setActiveTab('deletions')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${activeTab === 'deletions' ? 'bg-rose-50/80 border-rose-300 shadow-md ring-2 ring-rose-400' : 'bg-white border-gray-100 shadow-sm hover:border-rose-200'}`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Deletion Requests</span>
            <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <FaTrash />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{pendingDeletions.length}</p>
          <p className="text-xs text-gray-400 font-medium mt-1">Pending deletion authorizations</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeTab === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            All Pending ({totalPending})
          </button>
          <button 
            onClick={() => setActiveTab('annadaan')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeTab === 'annadaan' ? 'bg-orange-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Annadaan Seva ({pendingAnnadaan.length})
          </button>
          <button 
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeTab === 'documents' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Document Uploads ({pendingDocuments.length})
          </button>
          <button 
            onClick={() => setActiveTab('deletions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeTab === 'deletions' ? 'bg-rose-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Deletions ({pendingDeletions.length})
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-amber-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Main Pending Items Table / List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[350px]">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-3xl mb-3">
              <FaCheckCircle />
            </div>
            <h3 className="text-lg font-bold text-gray-800">All Clear!</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-1">
              {searchTerm ? "No pending requests match your search criteria." : "There are currently no pending requests requiring your approval."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredItems.map(item => (
              <div key={`${item.type}-${item.id}`} className="p-4 sm:p-6 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                <div className="flex items-start gap-4 flex-1">
                  {/* Category Badge Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                    item.type === 'ANNADAAN' ? 'bg-orange-100 text-orange-600' :
                    item.type === 'DOCUMENT_UPLOAD' ? 'bg-indigo-100 text-indigo-600' :
                    'bg-rose-100 text-rose-600'
                  }`}>
                    {item.type === 'ANNADAAN' ? <FaHandHoldingHeart /> : item.type === 'DOCUMENT_UPLOAD' ? <FaFileAlt /> : <FaTrash />}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                        item.type === 'ANNADAAN' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        item.type === 'DOCUMENT_UPLOAD' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {item.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        Submitted: {new Date(item.date).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs font-semibold text-gray-600">{item.subtitle}</p>
                    <p className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded-lg border border-gray-100 inline-block w-full">{item.details}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  {item.fileUrl && (
                    <button 
                      onClick={() => setPreviewDoc(item)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                      title="Preview Document"
                    >
                      <FaEye /> View Doc
                    </button>
                  )}
                  
                  <button 
                    onClick={item.onReject}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <FaTimes /> Reject
                  </button>

                  <button 
                    onClick={item.onApprove}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <FaCheck /> Approve
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Document Modal */}
      <AnimatePresence>
        {previewDoc && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col p-4 md:p-8">
            <div className="flex justify-between items-center mb-4 text-white">
              <div>
                <h3 className="font-bold text-lg">{previewDoc.title}</h3>
                <p className="text-xs text-slate-300">{previewDoc.fileName}</p>
              </div>
              <div className="flex items-center gap-3">
                <a 
                  href={`${ASSETS_URL}${previewDoc.fileUrl}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  download
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  Download File
                </a>
                <button 
                  onClick={() => setPreviewDoc(null)}
                  className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl text-lg transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-white rounded-2xl overflow-hidden shadow-2xl">
              {previewDoc.fileUrl?.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                <img src={`${ASSETS_URL}${previewDoc.fileUrl}`} alt={previewDoc.title} className="w-full h-full object-contain" />
              ) : (
                <iframe 
                  src={`${ASSETS_URL}${previewDoc.fileUrl}`} 
                  className="w-full h-full border-0"
                  title={previewDoc.title}
                />
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default TrusteeDashboard;
