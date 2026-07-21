import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiFilter, FiDownload, FiCheck, FiX, FiClock, FiFileText, 
  FiDollarSign, FiPlus, FiEye, FiUploadCloud, FiCheckCircle, FiActivity, FiShield 
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import AnimatedCounter from '../../components/dashboard/AnimatedCounter';

const ASSETS_URL = import.meta.env.VITE_ASSETS_URL || "http://localhost:5000";

const AccountantDashboard = () => {
  const { user } = useAuth();
  
  // Tab state: 'transactions' or 'documents'
  const [activeTab, setActiveTab] = useState('transactions');

  // Transaction States
  const [donations, setDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const [transSearch, setTransSearch] = useState('');
  const [transStatusFilter, setTransStatusFilter] = useState('ALL');

  // Financial Document States
  const [finDocuments, setFinDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [docSearch, setDocSearch] = useState('');
  const [docCategoryFilter, setDocCategoryFilter] = useState('All');

  // Stats
  const [stats, setStats] = useState({
    totalAmount: 0,
    pendingVerifications: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalDocCount: 0
  });

  // Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  
  // Document Upload Form
  const [docForm, setDocForm] = useState({ title: '', description: '', category: 'Financial' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const docCategories = ['All', 'Financial', 'Audit', 'Tax', 'Receipt', 'Reports'];

  useEffect(() => {
    fetchDonations();
    fetchFinancialDocuments();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoadingDonations(true);
      const res = await api.get('/donations');
      const list = res.data?.data || [];
      setDonations(list);
      
      // Calculate Stats
      let totalAmount = 0;
      let pendingVerifications = 0;
      let approvedCount = 0;
      let rejectedCount = 0;

      list.forEach(d => {
        if (d.status === 'APPROVED') {
          approvedCount++;
          totalAmount += (d.amount || 0);
        } else if (d.status === 'REJECTED') {
          rejectedCount++;
        } else {
          pendingVerifications++;
        }
      });

      setStats(prev => ({
        ...prev,
        totalAmount,
        pendingVerifications,
        approvedCount,
        rejectedCount
      }));

    } catch (err) {
      console.error("Error fetching donations:", err);
      toast.error("Failed to load financial transactions");
    } finally {
      setLoadingDonations(false);
    }
  };

  const fetchFinancialDocuments = async () => {
    try {
      setLoadingDocs(true);
      const res = await api.get('/documents');
      const docs = res.data?.documents || [];
      // Filter for accounting relevant documents if needed or show all with category
      setFinDocuments(docs);
      setStats(prev => ({ ...prev, totalDocCount: docs.length }));
    } catch (err) {
      console.error("Error fetching financial documents:", err);
    } finally {
      setLoadingDocs(false);
    }
  };

  // Status Action Handler for Donations
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/donations/${id}`, { status: newStatus });
      toast.success(`Transaction ${newStatus.toLowerCase()} successfully!`);
      fetchDonations();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update transaction status");
    }
  };

  // Upload Financial Document Handler
  const handleDocUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    const data = new FormData();
    data.append("title", docForm.title);
    data.append("description", docForm.description);
    data.append("category", docForm.category);
    data.append("pdf", file);

    try {
      setUploading(true);
      await api.post('/documents', data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Financial document uploaded successfully!");
      setIsUploadModalOpen(false);
      setDocForm({ title: '', description: '', category: 'Financial' });
      setFile(null);
      fetchFinancialDocuments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Download Handler Helper
  const handleDownload = async (url, filename) => {
    try {
      const fullUrl = `${ASSETS_URL}${url}`;
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(`${ASSETS_URL}${url}`, '_blank');
    }
  };

  // Filter Transactions
  const filteredDonations = donations.filter(d => {
    const matchesSearch = 
      (d.donorName || '').toLowerCase().includes(transSearch.toLowerCase()) ||
      (d.donationReference || '').toLowerCase().includes(transSearch.toLowerCase()) ||
      (d._id || '').toLowerCase().includes(transSearch.toLowerCase());

    const matchesStatus = 
      transStatusFilter === 'ALL' || 
      (transStatusFilter === 'PENDING' && (d.status === 'PENDING_VERIFICATION' || d.status === 'PENDING_PAYMENT')) ||
      d.status === transStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filter Financial Documents
  const filteredDocs = finDocuments.filter(doc => {
    const matchesSearch = 
      (doc.title || '').toLowerCase().includes(docSearch.toLowerCase()) ||
      (doc.description || '').toLowerCase().includes(docSearch.toLowerCase()) ||
      (doc.pdfName || '').toLowerCase().includes(docSearch.toLowerCase());

    const matchesCategory = docCategoryFilter === 'All' || doc.category === docCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-hidden text-slate-800 font-sans">
      
      {/* Dashboard Header */}
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <FiDollarSign className="text-indigo-600" /> Accountant Hub
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">
            Financial transactions, verification approvals, and accounting document management
          </p>
        </div>
        
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95 text-sm"
        >
          <FiPlus className="text-lg" /> Upload Financial Document
        </button>
      </div>

      {/* Top Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Verified Revenue</p>
            <h3 className="text-2xl md:text-3xl font-black text-slate-800">
              <AnimatedCounter value={stats.totalAmount} prefix="₹" />
            </h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <FiDollarSign className="text-xl" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pending Verifications</p>
            <h3 className="text-2xl md:text-3xl font-black text-amber-600">
              <AnimatedCounter value={stats.pendingVerifications} />
            </h3>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
            <FiClock className="text-xl" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Approved Transactions</p>
            <h3 className="text-2xl md:text-3xl font-black text-indigo-600">
              <AnimatedCounter value={stats.approvedCount} />
            </h3>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
            <FiCheckCircle className="text-xl" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Financial Documents</p>
            <h3 className="text-2xl md:text-3xl font-black text-slate-800">
              <AnimatedCounter value={stats.totalDocCount} />
            </h3>
          </div>
          <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
            <FiFileText className="text-xl" />
          </div>
        </div>

      </div>

      {/* Navigation Switch Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-8">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`pb-3 text-sm font-bold tracking-wide transition-all border-b-2 ${
            activeTab === 'transactions' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Pending Financial Tasks & Transactions ({donations.length})
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-3 text-sm font-bold tracking-wide transition-all border-b-2 ${
            activeTab === 'documents' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Financial Document Repository ({finDocuments.length})
        </button>
      </div>

      {/* TAB 1: FINANCIAL TRANSACTIONS & PENDING TASKS */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          
          {/* Action & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by Donor or Ref ID..." 
                  value={transSearch}
                  onChange={(e) => setTransSearch(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white w-full md:w-64 transition-all"
                />
              </div>

              <select 
                value={transStatusFilter}
                onChange={(e) => setTransStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white text-slate-700 transition-all font-semibold"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Verification</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="text-xs text-slate-400 font-medium self-end md:self-auto">
              Showing {filteredDonations.length} records
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse block md:table">
                <thead className="hidden md:table-header-group">
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                    <th className="px-6 py-4 font-medium">Ref ID / Donor Info</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingDonations ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500 block md:table-cell">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                          Loading financial records...
                        </div>
                      </td>
                    </tr>
                  ) : filteredDonations.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500 block md:table-cell">
                        <div className="flex flex-col items-center justify-center">
                          <FiDollarSign className="text-4xl text-slate-300 mb-3" />
                          <p>No financial records found matching your filter.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDonations.map((don) => (
                      <tr 
                        key={don._id}
                        className="flex flex-col md:table-row w-full bg-white md:bg-transparent border border-slate-100 md:border-b md:border-x-0 md:border-t-0 md:border-slate-50 rounded-xl md:rounded-none mb-4 md:mb-0 shadow-sm md:shadow-none hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="p-4 md:px-6 md:py-4 block md:table-cell border-b border-slate-50 md:border-none">
                          <div className="flex justify-between items-start md:hidden mb-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                              ID: {don.donationReference || don._id.substring(0,8)}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              don.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                              don.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {don.status.replace('_', ' ')}
                            </span>
                          </div>

                          <div>
                            <p className="font-bold text-slate-900 text-base">{don.donorName}</p>
                            <p className="text-xs text-slate-400 font-medium">Ref: {don.donationReference || don._id}</p>
                            {don.paymentMethod && <p className="text-xs text-indigo-600 font-semibold mt-0.5">Method: {don.paymentMethod}</p>}
                          </div>
                        </td>

                        <td className="hidden md:table-cell px-6 py-4 font-black text-slate-900 text-base">
                          ₹{don.amount?.toLocaleString()}
                        </td>

                        <td className="hidden md:table-cell px-6 py-4 text-sm text-slate-600">
                          {new Date(don.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>

                        <td className="hidden md:table-cell px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                            don.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                            don.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {don.status.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="p-3 md:px-6 md:py-4 md:text-right block md:table-cell bg-slate-50 md:bg-transparent rounded-b-xl md:rounded-none">
                          <div className="flex justify-between items-center w-full">
                            <span className="md:hidden font-bold text-slate-800 text-base">₹{don.amount?.toLocaleString()}</span>
                            
                            <div className="flex items-center justify-end w-full md:w-auto gap-2">
                              {don.receiptUrl && (
                                <button 
                                  onClick={() => handleDownload(don.receiptUrl, `Receipt_${don.donationReference || don._id}.pdf`)}
                                  className="p-2 bg-white md:bg-transparent border border-slate-200 md:border-none text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                                  title="Download Receipt"
                                >
                                  <FiDownload /> Receipt
                                </button>
                              )}

                              {(don.status === 'PENDING_VERIFICATION' || don.status === 'PENDING_PAYMENT') && (
                                <>
                                  <button 
                                    onClick={() => handleUpdateStatus(don._id, 'REJECTED')}
                                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                                  >
                                    <FiX /> Reject
                                  </button>

                                  <button 
                                    onClick={() => handleUpdateStatus(don._id, 'APPROVED')}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
                                  >
                                    <FiCheck /> Approve
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: FINANCIAL DOCUMENT REPOSITORY */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          
          {/* Filter & Action Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search financial documents..." 
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white w-full md:w-64 transition-all"
                />
              </div>

              <select 
                value={docCategoryFilter}
                onChange={(e) => setDocCategoryFilter(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white text-slate-700 transition-all font-semibold"
              >
                {docCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <FiPlus /> New Document
            </button>
          </div>

          {/* Financial Documents Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse block md:table">
                <thead className="hidden md:table-header-group">
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                    <th className="px-6 py-4 font-medium">Document Title</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">File Size</th>
                    <th className="px-6 py-4 font-medium">Uploaded Date</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingDocs ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500 block md:table-cell">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                          Loading financial documents...
                        </div>
                      </td>
                    </tr>
                  ) : filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500 block md:table-cell">
                        <div className="flex flex-col items-center justify-center">
                          <FiFileText className="text-4xl text-slate-300 mb-3" />
                          <p>No financial documents found.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc) => (
                      <tr 
                        key={doc._id}
                        className="flex flex-col md:table-row w-full bg-white md:bg-transparent border border-slate-100 md:border-b md:border-x-0 md:border-t-0 md:border-slate-50 rounded-xl md:rounded-none mb-4 md:mb-0 shadow-sm md:shadow-none hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="p-4 md:px-6 md:py-4 block md:table-cell border-b border-slate-50 md:border-none">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold text-xs">
                              DOC
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-base">{doc.title}</p>
                              <p className="text-xs text-slate-400">{doc.pdfName}</p>
                            </div>
                          </div>
                        </td>

                        <td className="hidden md:table-cell px-6 py-4">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                            {doc.category}
                          </span>
                        </td>

                        <td className="hidden md:table-cell px-6 py-4 text-sm text-slate-600">
                          {formatFileSize(doc.fileSize)}
                        </td>

                        <td className="hidden md:table-cell px-6 py-4 text-sm text-slate-600">
                          {new Date(doc.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>

                        <td className="p-3 md:px-6 md:py-4 md:text-right block md:table-cell bg-slate-50 md:bg-transparent rounded-b-xl md:rounded-none">
                          <div className="flex justify-between items-center w-full">
                            <span className="md:hidden text-xs text-slate-400 font-medium">{formatFileSize(doc.fileSize)}</span>
                            
                            <div className="flex items-center justify-end w-full md:w-auto gap-2">
                              <button 
                                onClick={() => { setSelectedDoc(doc); setIsViewModalOpen(true); }}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm transition-colors"
                                title="View Document"
                              >
                                <FiEye />
                              </button>

                              <button 
                                onClick={() => handleDownload(doc.pdfUrl, doc.pdfName || `${doc.title}.pdf`)}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg text-sm transition-colors"
                                title="Download Document"
                              >
                                <FiDownload />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Upload Financial Document Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-lg text-slate-800">Upload Financial Document</h3>
                <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <FiX className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleDocUpload} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Document Title</label>
                  <input 
                    type="text" required 
                    value={docForm.title} 
                    onChange={e => setDocForm({...docForm, title: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-sm"
                    placeholder="e.g. Q3 Financial Audit Summary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                  <select 
                    value={docForm.category} 
                    onChange={e => setDocForm({...docForm, category: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-sm font-semibold"
                  >
                    {docCategories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                  <textarea 
                    rows="2" required 
                    value={docForm.description} 
                    onChange={e => setDocForm({...docForm, description: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-sm resize-none"
                    placeholder="Brief description of the financial record..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">File Attachment (PDF / Image)</label>
                  <div 
                    onClick={() => document.getElementById('acc-file-upload').click()}
                    className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-indigo-50/20 transition-all"
                  >
                    <input 
                      id="acc-file-upload" 
                      type="file" 
                      accept=".pdf,image/*" 
                      onChange={e => setFile(e.target.files[0])} 
                      className="hidden" 
                    />
                    <FiUploadCloud className="mx-auto text-3xl text-indigo-500 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">
                      {file ? file.name : "Click to browse file"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">PDF or Image up to 10MB</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => setIsUploadModalOpen(false)} 
                    className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={uploading}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md transition-all disabled:opacity-50"
                  >
                    {uploading ? "Uploading..." : "Upload Document"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* View Document Modal */}
        {isViewModalOpen && selectedDoc && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col p-4 md:p-8">
            <div className="flex justify-between items-center mb-4 text-white">
              <div>
                <h3 className="font-bold text-lg">{selectedDoc.title}</h3>
                <p className="text-xs text-slate-300">{selectedDoc.pdfName}</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleDownload(selectedDoc.pdfUrl, selectedDoc.pdfName || `${selectedDoc.title}.pdf`)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  <FiDownload /> Download File
                </button>
                <button 
                  onClick={() => setIsViewModalOpen(false)}
                  className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl text-lg transition-colors"
                >
                  <FiX />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-white rounded-2xl overflow-hidden shadow-2xl">
              {selectedDoc.pdfUrl?.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                <img src={`${ASSETS_URL}${selectedDoc.pdfUrl}`} alt={selectedDoc.title} className="w-full h-full object-contain" />
              ) : (
                <iframe 
                  src={`${ASSETS_URL}${selectedDoc.pdfUrl}`} 
                  className="w-full h-full border-0"
                  title={selectedDoc.title}
                />
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AccountantDashboard;
