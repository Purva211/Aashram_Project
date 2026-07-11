import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaFileAlt, FaEye, FaDownload, FaEnvelope, FaWhatsapp, FaArchive, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import api from '../../../utils/api';
import TablePagination from '../../../components/TablePagination';

const LetterHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialStatus = searchParams.get('status') || '';
  const initialId = searchParams.get('id') || '';

  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  
  const [filters, setFilters] = useState({
    search: '',
    status: initialStatus
  });

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState({ type: '', letterId: '', contact: '' });
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    fetchLetters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters.status]);

  // Debounced search
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchLetters();
    }, 500);
    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  const fetchLetters = async () => {
    try {
      setLoading(true);
      const res = await api.get('/correspondence', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          status: filters.status,
          search: filters.search
        }
      });
      if (res.data?.success) {
        setLetters(res.data.data);
        setPagination(prev => ({ ...prev, total: res.data.pagination.total }));
      }
    } catch (error) {
      console.error("Error fetching letters", error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id) => {
    if (window.confirm("Are you sure you want to archive this letter?")) {
      try {
        await api.put(`/correspondence/${id}/archive`);
        fetchLetters();
      } catch (err) {
        alert("Failed to archive");
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this letter? This action cannot be undone.")) {
      try {
        await api.delete(`/correspondence/${id}`);
        fetchLetters();
      } catch (err) {
        alert("Failed to delete");
      }
    }
  };

  const handleShareClick = (letter, type) => {
    if (letter.status === 'Draft') {
      alert("Please generate the PDF first.");
      return;
    }
    setShareData({
      type,
      letterId: letter._id,
      contact: type === 'Email' ? letter.recipient.email : letter.recipient.mobile,
      pdfUrl: letter.file?.pdfUrl
    });
    setShowShareModal(true);
  };

  const submitShare = async () => {
    if (!shareData.contact) {
      alert(`Please enter ${shareData.type === 'Email' ? 'Email' : 'WhatsApp number'}`);
      return;
    }
    try {
      setSharing(true);
      await api.post(`/correspondence/${shareData.letterId}/share`, {
        actionType: shareData.type,
        recipient: shareData.contact
      });
      
      if (shareData.type === 'WhatsApp') {
        const text = encodeURIComponent(`Please find the attached official document: ${shareData.pdfUrl}`);
        window.open(`https://wa.me/${shareData.contact.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
      } else {
        alert("Email sent successfully! (Simulated)");
      }
      
      setShowShareModal(false);
      fetchLetters();
    } catch (err) {
      alert("Failed to record share action.");
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <FaFileAlt className="text-[#FF7A2F]" />
            Letter History
          </h1>
        </div>
        <button
          onClick={() => navigate('/trustee/correspondence/create')}
          className="bg-[#FF7A2F] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#e86a24]"
        >
          <FaPlus /> New Letter
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Ref No, Subject, Recipient..." 
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF7A2F]"
            />
          </div>
          <div className="w-full md:w-64">
            <select 
              value={filters.status} 
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF7A2F]"
            >
              <option value="">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Generated">Generated</option>
              <option value="Email Sent">Email Sent</option>
              <option value="WhatsApp Shared">WhatsApp Shared</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100 text-xs uppercase font-bold text-gray-500">
                <th className="px-4 py-3">Ref No</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Recipient & Subject</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-10">Loading...</td></tr>
              ) : letters.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-10 text-gray-500">No records found.</td></tr>
              ) : (
                letters.map(letter => (
                  <tr key={letter._id} className={`hover:bg-gray-50 ${letter._id === initialId ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-4 font-bold text-gray-900">{letter.referenceNumber || 'Draft'}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{new Date(letter.letterDate).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-4 max-w-[300px]">
                      <div className="font-bold text-gray-900 truncate" title={letter.recipient?.name}>{letter.recipient?.name}</div>
                      <div className="text-xs text-gray-500 truncate" title={letter.subject}>{letter.subject}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                        letter.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                        letter.status === 'Archived' ? 'bg-gray-100 text-gray-600' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {letter.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {letter.status === 'Draft' ? (
                          <button onClick={() => navigate(`/trustee/correspondence/create?id=${letter._id}`)} className="text-blue-500 hover:bg-blue-100 p-2 rounded" title="Edit Draft"><FaEye /></button>
                        ) : (
                          <>
                            <a href={letter.file?.pdfUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:bg-blue-100 p-2 rounded" title="View PDF"><FaEye /></a>
                            <a href={letter.file?.pdfUrl} download className="text-green-500 hover:bg-green-100 p-2 rounded" title="Download PDF"><FaDownload /></a>
                            <button onClick={() => handleShareClick(letter, 'Email')} className="text-red-500 hover:bg-red-100 p-2 rounded" title="Send Email"><FaEnvelope /></button>
                            <button onClick={() => handleShareClick(letter, 'WhatsApp')} className="text-green-600 hover:bg-green-100 p-2 rounded" title="Share WhatsApp"><FaWhatsapp /></button>
                          </>
                        )}
                        <button onClick={() => handleArchive(letter._id)} className="text-gray-500 hover:bg-gray-200 p-2 rounded" title="Archive"><FaArchive /></button>
                        <button onClick={() => handleDelete(letter._id)} className="text-red-500 hover:bg-red-100 p-2 rounded" title="Delete"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && letters.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <TablePagination
              currentPage={pagination.page}
              totalPages={Math.ceil(pagination.total / pagination.limit)}
              onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            />
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[400px] shadow-xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              {shareData.type === 'Email' ? <FaEnvelope className="text-red-500" /> : <FaWhatsapp className="text-green-500" />}
              Share via {shareData.type}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-1">
                {shareData.type === 'Email' ? 'Email Address' : 'WhatsApp Number (with country code)'}
              </label>
              <input 
                type="text" 
                value={shareData.contact || ''} 
                onChange={(e) => setShareData({ ...shareData, contact: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#FF7A2F] outline-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowShareModal(false)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={submitShare} disabled={sharing} className="px-4 py-2 bg-[#FF7A2F] text-white font-bold rounded-lg hover:bg-[#e86a24] disabled:opacity-50">
                {sharing ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LetterHistory;
