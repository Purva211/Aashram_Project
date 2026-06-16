import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHandHoldingHeart, FaPlus, FaSpinner, FaEdit, FaTrash, FaTimes, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import api from "../../utils/api";
import { usePermissions } from '../../hooks/usePermissions';

const Annadaan = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', annadaanType: '', date: '', time: '', description: '', status: 'pending' });
  const [editingId, setEditingId] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [stats, setStats] = useState(null);
  const { hasManage } = usePermissions('Annadan');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const [res, statsRes] = await Promise.all([
        api.get('/annadaan'),
        api.get('/annadaan/stats')
      ]);
      setRecords(res.data.data);
      setStats(statsRes.data.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch annadaan records.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/annadaan/${editingId}`, formData);
      } else {
        await api.post('/annadaan', formData);
      }
      setIsModalOpen(false);
      fetchRecords();
      setFormData({ name: '', phone: '', email: '', annadaanType: '', date: '', time: '', description: '', status: 'pending' });
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Error saving record: " + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (record) => {
    setFormData({
      name: record.name,
      phone: record.phone,
      email: record.email,
      annadaanType: record.annadaanType,
      date: new Date(record.date).toISOString().split('T')[0],
      time: record.time,
      description: record.description || '',
      status: record.status
    });
    setEditingId(record._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await api.delete(`/annadaan/${id}`);
        fetchRecords();
      } catch (err) {
        alert("Error deleting record.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-deepblue-900 flex items-center gap-2">
            <FaHandHoldingHeart className="text-saffron-500" /> Annadan Records
            {!hasManage && <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm ml-4 font-sans inline-block align-middle">View Only Access</span>}
          </h1>
          <p className="text-gray-500 mt-1">Manage and track temple food donations.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200">
            <span className="text-sm font-bold text-gray-600">Date:</span>
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="text-sm outline-none bg-transparent text-gray-800 font-semibold cursor-pointer" />
            {filterDate && <button onClick={() => setFilterDate("")} className="text-gray-400 hover:text-red-500 text-xs font-bold ml-2 transition-colors"><FaTimes /></button>}
          </div>
          {hasManage && (
            <button 
              onClick={() => { setFormData({ name: '', phone: '', email: '', annadaanType: '', date: '', time: '', description: '', status: 'pending' }); setEditingId(null); setIsModalOpen(true); }}
              className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl shadow-lg shadow-gray-900/30 font-black transition-all hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap"
            >
              <FaPlus /> Add Record
            </button>
          )}
        </div>
      </div>

      {error && <div className="text-red-500 bg-red-50 p-4 rounded-xl font-bold">{error}</div>}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-2xl relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-bl-full opacity-50"></div>
            <div className="flex justify-between items-center mb-2 relative z-10">
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Pending Records</p>
              <FaClock className="text-yellow-500 text-xl" />
            </div>
            <p className="text-3xl font-bold text-slate-900 relative z-10">{stats.totalPending}</p>
          </div>

          <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-2xl relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full opacity-50"></div>
            <div className="flex justify-between items-center mb-2 relative z-10">
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total Approved</p>
              <FaCheckCircle className="text-emerald-400 text-xl" />
            </div>
            <p className="text-3xl font-bold text-slate-900 relative z-10">{stats.totalApproved}</p>
          </div>

          <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-2xl relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full opacity-50"></div>
            <div className="flex justify-between items-center mb-2 relative z-10">
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total Rejected</p>
              <FaTimesCircle className="text-rose-400 text-xl" />
            </div>
            <p className="text-3xl font-bold text-slate-900 relative z-10">{stats.totalRejected}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[400px]">
        {loading ? (
           <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <FaSpinner className="animate-spin text-4xl text-saffron-500" />
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="text-xs text-gray-400 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Donor Name</th>
                  <th className="px-6 py-4 font-semibold">Contact</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Date & Time</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records
                  .filter(record => filterDate ? new Date(record.date).toLocaleDateString() === new Date(filterDate).toLocaleDateString() : true)
                  .map((record, idx) => (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }} className="hover:bg-gray-50" key={record._id}>
                    <td className="px-6 py-4 font-bold text-gray-800">{record.name}</td>
                    <td className="px-6 py-4">{record.phone}<br/><span className="text-xs text-gray-400">{record.email}</span></td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md font-semibold text-xs">{record.annadaanType}</span></td>
                    <td className="px-6 py-4">{new Date(record.date).toLocaleDateString()}<br/><span className="text-xs text-gray-400">{record.time}</span></td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${record.status === 'completed' ? 'bg-green-100 text-green-700' : record.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      {hasManage ? (
                        <>
                          <button onClick={() => handleEdit(record)} className="p-2 bg-blue-50 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"><FaEdit /></button>
                          <button onClick={() => handleDelete(record._id)} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"><FaTrash /></button>
                        </>
                      ) : (
                        <div className="text-xs text-gray-400 font-bold">View Only</div>
                      )}
                    </td>
                  </motion.tr>
                ))}
                {records.length === 0 && <tr><td colSpan="6" className="text-center py-8">No records found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-deepblue-900">{editingId ? 'Edit Record' : 'Add Record'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><FaTimes className="text-xl" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Donor Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-saffron-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-saffron-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-saffron-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                    <input type="text" name="annadaanType" value={formData.annadaanType} onChange={handleInputChange} required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-saffron-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                    <input type="date" name="date" value={formData.date} onChange={handleInputChange} required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-saffron-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Time</label>
                    <input type="time" name="time" value={formData.time} onChange={handleInputChange} required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-saffron-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-saffron-500 outline-none">
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 font-bold transition-colors">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl shadow-lg shadow-gray-900/30 font-black transition-all hover:-translate-y-0.5">{editingId ? 'Update' : 'Save'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Annadaan;
