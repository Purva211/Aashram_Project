import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiEdit2, FiTrash2, FiUsers, FiDollarSign, FiX, FiCheckCircle, FiClock, FiSearch, FiFilter, FiChevronUp, FiChevronDown, FiPrinter } from 'react-icons/fi';
import api from "../../utils/api";
import { useTableFeatures } from '../../hooks/useTableFeatures';
import TablePagination from '../../components/TablePagination';

const ManageAnnadan = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  const [formData, setFormData] = useState({
    status: 'pending'
  });

  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  const filteredByCustom = records.filter(r => {
    let match = true;
    if (filterStatus && r.status !== filterStatus) match = false;
    return match;
  });

  const {
    searchTerm, setSearchTerm, sortConfig, handleSort,
    currentPage, setCurrentPage, itemsPerPage, setItemsPerPage,
    totalPages, paginatedData, totalItems
  } = useTableFeatures(filteredByCustom, ['name', 'phone', 'email', 'annadaanType']);

  const fetchData = async () => {
    try {
      const [recordsRes, statsRes] = await Promise.all([
        api.get('/annadaan'),
        api.get('/annadaan/stats')
      ]);
      setRecords(recordsRes.data.data);
      setStats(statsRes.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);



  if (loading) return <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-saffron-500 rounded-full border-t-transparent animate-spin"></div></div>;

  return (
    <div className="w-full space-y-8 text-gray-800 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex flex-wrap items-center gap-2 text-slate-900"><FiHeart className="text-rose-500" /> Annadan Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage food donation requests, track beneficiaries, and monitor expenses.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
          <div className="relative w-full sm:w-auto">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search records..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 w-48 sm:w-full sm:w-full sm:w-64 shadow-sm transition-all"
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-6 py-2.5 bg-white border-2 ${showFilters ? 'border-rose-500 text-rose-600' : 'border-gray-200 text-gray-700'} hover:bg-gray-50 rounded-xl text-sm font-black shadow-sm transition-colors`}>
            <FiFilter /> Filter
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-rose-500">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={() => setFilterStatus('')} className="text-sm font-bold text-gray-500 hover:text-gray-700">Clear Filters</button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-2xl relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-bl-full opacity-50"></div>
            <div className="flex justify-between items-center mb-2 relative z-10">
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Pending Records</p>
              <FiClock className="text-yellow-500 text-xl" />
            </div>
            <p className="text-3xl font-bold text-slate-900 relative z-10">{stats.totalPending}</p>
          </div>

          <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-2xl relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full opacity-50"></div>
            <div className="flex justify-between items-center mb-2 relative z-10">
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total Approved</p>
              <FiCheckCircle className="text-emerald-400 text-xl" />
            </div>
            <p className="text-3xl font-bold text-slate-900 relative z-10">{stats.totalApproved}</p>
          </div>

          <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-2xl relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full opacity-50"></div>
            <div className="flex justify-between items-center mb-2 relative z-10">
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total Rejected</p>
              <FiX className="text-rose-400 text-xl" />
            </div>
            <p className="text-3xl font-bold text-slate-900 relative z-10">{stats.totalRejected}</p>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden flex flex-col border-t-4 border-t-saffron-500">
        <div className="overflow-auto max-h-[500px] custom-scrollbar">
          <div className="overflow-x-auto w-full">
<table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 z-20">
              <tr className="bg-slate-100 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-700 shadow-sm">
                <th className="p-4 font-bold cursor-pointer hover:bg-slate-200 transition-colors bg-slate-100" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">Donor Info {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <FiChevronUp/> : <FiChevronDown/>)}</div>
                </th>
                <th className="p-4 font-bold cursor-pointer hover:bg-slate-200 transition-colors bg-slate-100" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1">Date & Time {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? <FiChevronUp/> : <FiChevronDown/>)}</div>
                </th>
                <th className="p-4 font-bold cursor-pointer hover:bg-slate-200 transition-colors bg-slate-100" onClick={() => handleSort('annadaanType')}>
                  <div className="flex items-center gap-1">Type {sortConfig.key === 'annadaanType' && (sortConfig.direction === 'asc' ? <FiChevronUp/> : <FiChevronDown/>)}</div>
                </th>
                <th className="p-4 font-bold cursor-pointer hover:bg-slate-200 transition-colors bg-slate-100" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? <FiChevronUp/> : <FiChevronDown/>)}</div>
                </th>
                <th className="p-4 font-bold text-center bg-slate-100">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {paginatedData.map(r => (
                <tr key={r._id} className={`transition-colors border-l-4 ${r.status === 'pending' ? 'bg-yellow-50 hover:bg-yellow-100 border-yellow-500' : r.status === 'approved' ? 'bg-blue-50 hover:bg-blue-100 border-blue-500' : r.status === 'completed' ? 'bg-green-50 hover:bg-green-100 border-green-500' : r.status === 'rejected' ? 'bg-red-50 hover:bg-red-100 border-red-500' : 'hover:bg-gray-50 border-transparent'}`}>
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{r.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{r.phone}</div>
                    <div className="text-xs text-gray-400">{r.email}</div>
                  </td>
                  <td className="p-4 text-gray-600">
                    <div className="flex items-center gap-1.5 font-medium"><FiClock className="text-saffron-500" /> {new Date(r.date).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500 mt-1">{r.time}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 border border-gray-200 text-gray-600">
                      {r.annadaanType}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-black uppercase tracking-wide rounded-md ${r.status === 'completed' ? 'bg-green-100 text-green-700' : r.status === 'approved' ? 'bg-blue-100 text-blue-700' : r.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => {
                        if (r.receiptPdfUrl) {
                          window.open(r.receiptPdfUrl, '_blank');
                        } else {
                          alert('This is a legacy record. The old receipt format has been removed.');
                        }
                      }}
                      className="p-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900 rounded-lg shadow-sm transition-colors"
                      title="View Receipt"
                    >
                      <FiPrinter size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">No Annadan records found.</td>
                </tr>
              )}
            </tbody>
          </table>
</div>
        </div>
        <TablePagination 
          currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage}
          totalItems={totalItems} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage}
        />
      </div>


    </div>
  );
};

export default ManageAnnadan;
