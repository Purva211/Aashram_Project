import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaEye, FaTrash, FaCheck, FaTimes, FaSpinner, FaFilter, FaRegCommentDots, FaEnvelope, FaPhone } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const ContactEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/contact/enquiries', {
        params: { search, status: statusFilter, page, limit: 15 }
      });
      if (data.success) {
        setEnquiries(data.data);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      toast.error('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [search, statusFilter, page]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setUpdating(true);
      const { data } = await api.put(`/contact/enquiries/${id}`, { status: newStatus });
      if (data.success) {
        toast.success(`Status updated to ${newStatus}`);
        setEnquiries(enquiries.map(e => e._id === id ? { ...e, status: newStatus } : e));
        if (selectedEnquiry && selectedEnquiry._id === id) {
          setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
        }
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async (id) => {
    if (!noteText.trim()) return;
    try {
      setUpdating(true);
      const { data } = await api.put(`/contact/enquiries/${id}`, { internalNote: noteText });
      if (data.success) {
        toast.success('Internal note added');
        setNoteText('');
        setSelectedEnquiry(data.data);
      }
    } catch (error) {
      toast.error('Failed to add note');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this enquiry?")) return;
    try {
      const { data } = await api.delete(`/contact/enquiries/${id}`);
      if (data.success) {
        toast.success('Enquiry deleted');
        setEnquiries(enquiries.filter(e => e._id !== id));
        if (selectedEnquiry && selectedEnquiry._id === id) setSelectedEnquiry(null);
      }
    } catch (error) {
      toast.error('Failed to delete enquiry');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Replied': return 'bg-purple-100 text-purple-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="md:bg-white md:rounded-3xl md:shadow-sm md:border border-gray-100 md:p-6 w-full space-y-6 text-gray-800 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contact Enquiries</h2>
          <p className="text-gray-500 text-sm mt-1">Manage and respond to user messages sent via the Contact Us form.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search enquiries..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A2F]/20 focus:border-[#FF7A2F]"
            />
          </div>
          <div className="relative">
            <select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full sm:w-auto pl-4 pr-10 py-2 border border-gray-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#FF7A2F]/20 focus:border-[#FF7A2F]"
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Replied">Replied</option>
              <option value="Resolved">Resolved</option>
            </select>
            <FaFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
          </div>
        </div>
      </div>

      <div className="w-full overflow-hidden md:rounded-2xl md:border border-gray-100">
        <table className="w-full text-left border-collapse block md:table">
          <thead className="hidden md:table-header-group">
            <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="p-4 md:p-6 font-bold">Date</th>
              <th className="p-4 md:p-6 font-bold">Sender</th>
              <th className="p-4 md:p-6 font-bold">Subject</th>
              <th className="p-4 md:p-6 font-bold">Status</th>
              <th className="p-4 md:p-6 font-bold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="block md:table-row-group w-full divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  <FaSpinner className="animate-spin mx-auto text-2xl mb-2 text-[#FF7A2F]" />
                  Loading enquiries...
                </td>
              </tr>
            ) : enquiries.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  <FaRegCommentDots className="mx-auto text-3xl mb-2 text-gray-300" />
                  No enquiries found.
                </td>
              </tr>
            ) : (
              enquiries.map((enq) => (
                <tr key={enq._id} className="flex flex-col md:table-row w-full bg-white md:bg-transparent border border-gray-100 md:border-b md:border-x-0 md:border-t-0 md:border-gray-50 rounded-xl md:rounded-none mb-4 md:mb-0 shadow-sm md:shadow-none hover:bg-orange-50/30 transition-colors">
                  <td className="p-3 md:p-6 flex flex-col md:table-cell w-full border-b border-gray-50 md:border-none whitespace-normal md:whitespace-nowrap">
                    <div className="flex md:hidden justify-between items-start mb-3">
                      <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">{new Date(enq.createdAt).toLocaleDateString()} {new Date(enq.createdAt).toLocaleTimeString()}</span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusColor(enq.status)}`}>
                        {enq.status}
                      </span>
                    </div>
                    <div className="md:hidden">
                      <div className="font-bold text-gray-900 text-lg break-words">{enq.name}</div>
                      <div className="mt-2 text-sm text-gray-600 flex flex-col gap-1">
                        <div className="flex items-center gap-2"><FaEnvelope className="text-gray-400 shrink-0" /> <span className="break-all">{enq.email}</span></div>
                        {enq.phone && <div className="flex items-center gap-2"><FaPhone className="text-gray-400 shrink-0" /> {enq.phone}</div>}
                        <div className="mt-1">
                          <span className="text-xs font-bold text-gray-500 uppercase">Subject: </span>
                          <span className="text-sm text-gray-700 whitespace-normal break-words">{enq.subject || <span className="italic text-gray-400">No subject</span>}</span>
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:block text-gray-600">
                      {new Date(enq.createdAt).toLocaleDateString()}
                      <div className="text-xs text-gray-400">{new Date(enq.createdAt).toLocaleTimeString()}</div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell p-4 md:p-6">
                    <div className="font-bold text-gray-900">{enq.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><FaEnvelope className="text-[10px]" /> {enq.email}</div>
                    {enq.phone && <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><FaPhone className="text-[10px]" /> {enq.phone}</div>}
                  </td>
                  <td className="hidden md:table-cell p-4 md:p-6 text-gray-700 max-w-xs truncate">
                    {enq.subject || <span className="italic text-gray-400">No subject</span>}
                  </td>
                  <td className="hidden md:table-cell p-4 md:p-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(enq.status)}`}>
                      {enq.status}
                    </span>
                  </td>
                  <td className="p-3 md:p-6 md:text-center flex flex-col md:table-cell w-full bg-gray-50 md:bg-transparent rounded-b-xl md:rounded-none">
                    <div className="flex justify-between items-center w-full">
                      <span className="md:hidden text-xs text-gray-500 uppercase tracking-wider font-semibold px-1">Actions</span>
                      <div className="flex flex-wrap items-center md:justify-center gap-2 w-full md:w-auto justify-end">
                        <button onClick={() => setSelectedEnquiry(enq)} className="p-2 w-10 h-10 md:w-auto md:h-auto flex-1 md:flex-none flex items-center justify-center bg-white md:bg-blue-50 border border-gray-200 md:border-none text-blue-600 hover:bg-blue-100 rounded-lg transition-colors shadow-sm md:shadow-none" title="View Details">
                          <FaEye />
                        </button>
                        <button onClick={() => handleDelete(enq._id)} className="p-2 w-10 h-10 md:w-auto md:h-auto flex-1 md:flex-none flex items-center justify-center bg-white md:bg-red-50 border border-gray-200 md:border-none text-red-600 hover:bg-red-100 rounded-lg transition-colors shadow-sm md:shadow-none" title="Delete">
                          <FaTrash />
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

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50 text-sm">Prev</button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50 text-sm">Next</button>
        </div>
      )}

      {/* Enquiry Details Modal */}
      <AnimatePresence>
        {selectedEnquiry && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4 backdrop-blur-sm"
            onClick={() => setSelectedEnquiry(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-xl font-bold text-gray-900">Enquiry Details</h3>
                <button onClick={() => setSelectedEnquiry(null)} className="text-gray-400 hover:text-gray-900"><FaTimes size={20} /></button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="w-full">
                    <h4 className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Sender Info</h4>
                    <p className="font-bold text-gray-900 text-lg break-words">{selectedEnquiry.name}</p>
                    <p className="text-sm text-gray-600 flex items-start gap-2 mt-1"><FaEnvelope className="text-gray-400 mt-1 shrink-0" /> <a href={`mailto:${selectedEnquiry.email}`} className="hover:text-blue-600 hover:underline break-all">{selectedEnquiry.email}</a></p>
                    {selectedEnquiry.phone && <p className="text-sm text-gray-600 flex items-center gap-2 mt-1"><FaPhone className="text-gray-400 shrink-0" /> <a href={`tel:${selectedEnquiry.phone}`} className="hover:text-blue-600 hover:underline break-all">{selectedEnquiry.phone}</a></p>}
                    <p className="text-xs text-gray-400 mt-2">Received: {new Date(selectedEnquiry.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Status Management</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['New', 'In Progress', 'Replied', 'Resolved'].map(st => (
                        <button 
                          key={st}
                          disabled={updating}
                          onClick={() => handleUpdateStatus(selectedEnquiry._id, st)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors ${selectedEnquiry.status === st ? getStatusColor(st) + ' border-transparent' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100 mb-8">
                  <h4 className="font-bold text-gray-900 mb-2 border-b border-orange-200 pb-2">Subject: {selectedEnquiry.subject || 'N/A'}</h4>
                  <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{selectedEnquiry.message}</div>
                </div>

                <div>
                  <h4 className="text-sm uppercase tracking-wider text-gray-500 font-bold mb-4 flex items-center gap-2">
                    <FaRegCommentDots /> Internal Notes
                  </h4>
                  
                  <div className="space-y-3 mb-4">
                    {!selectedEnquiry.internalNotes || selectedEnquiry.internalNotes.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">No internal notes yet.</p>
                    ) : (
                      selectedEnquiry.internalNotes.map((note, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <p className="text-sm text-gray-800">{note.note}</p>
                          <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">{note.addedBy} • {new Date(note.date).toLocaleString()}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Add a note (visible only to trust members)..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
                    />
                    <button 
                      disabled={!noteText.trim() || updating}
                      onClick={() => handleAddNote(selectedEnquiry._id)}
                      className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-black transition-colors"
                    >
                      Add Note
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactEnquiries;



