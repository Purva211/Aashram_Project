import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaFileAlt, FaDownload, FaCheck, FaTimes, FaSpinner, FaSearch, FaEye } from 'react-icons/fa';
import api from "../../utils/api";
import { usePermissions } from '../../hooks/usePermissions';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'requests'
  const [searchTerm, setSearchTerm] = useState('');
  const { hasManage } = usePermissions('Documents');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [docsRes, reqsRes] = await Promise.all([
        api.get('/trustees/documents'),
        api.get('/trustees/documents/deletion-requests')
      ]);
      setDocuments(docsRes.data.documents);
      setDeletionRequests(reqsRes.data.data);
    } catch (error) {
      console.error("Failed to fetch documents data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewDeletion = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this deletion request?`)) return;
    
    try {
      await api.put(`/trustees/documents/${id}/review-deletion`, { status });
      fetchData();
    } catch (error) {
      alert("Error reviewing request.");
    }
  };

  const filteredDocs = documents.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-black text-deepblue-900 flex items-center gap-2">
            <FaFileAlt className="text-saffron-500" /> Document Management
            {!hasManage && <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm ml-4 font-sans inline-block align-middle">View Only Access</span>}
          </h1>
          <p className="text-gray-500 mt-1">View documents and manage deletion requests.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('all')} 
            className={`px-6 py-2 rounded-md font-bold text-sm transition-all ${activeTab === 'all' ? 'bg-white shadow-sm text-deepblue-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            All Documents
          </button>
          <button 
            onClick={() => setActiveTab('requests')} 
            className={`px-6 py-2 rounded-md font-bold text-sm transition-all relative ${activeTab === 'requests' ? 'bg-white shadow-sm text-deepblue-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Deletion Requests
            {deletionRequests.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                {deletionRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px] relative">
        {loading ? (
           <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 backdrop-blur-sm">
              <FaSpinner className="animate-spin text-4xl text-saffron-500" />
           </div>
        ) : (
          <>
            {activeTab === 'all' && (
              <div className="p-6 space-y-4">
                <div className="relative max-w-md">
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search documents..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-saffron-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDocs.map((doc, i) => (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={doc._id} className="bg-white border border-gray-100 p-6 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200"><FaFileAlt className="text-2xl"/></div>
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg">{doc.category}</span>
                      </div>
                      <h3 className="font-black text-gray-900 text-lg mb-2 line-clamp-1">{doc.title}</h3>
                      <p className="text-sm text-gray-500 mb-6 line-clamp-2 flex-1 leading-relaxed">{doc.description}</p>
                      <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-400 font-bold px-2 py-1 bg-gray-50 rounded-md">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                        <div className="flex gap-2">
                          <a href={`${import.meta.env.VITE_ASSETS_URL || 'http://localhost:5000'}${doc.pdfUrl}`} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-indigo-50 text-indigo-600 font-bold hover:bg-indigo-600 hover:text-white rounded-xl transition-all text-sm flex items-center gap-1.5 shadow-sm" title="Read Online"><FaEye /> View</a>
                          <a href={`${import.meta.env.VITE_ASSETS_URL || 'http://localhost:5000'}${doc.pdfUrl}`} download className="px-3 py-2 bg-saffron-50 text-saffron-600 font-bold hover:bg-saffron-500 hover:text-white rounded-xl transition-all text-sm flex items-center gap-1.5 shadow-sm" title="Download File"><FaDownload /> Save</a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {filteredDocs.length === 0 && <p className="text-gray-500 col-span-full py-10 text-center">No documents found.</p>}
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Document Name</th>
                      <th className="px-6 py-4 font-semibold">Requested By</th>
                      <th className="px-6 py-4 font-semibold">Reason</th>
                      <th className="px-6 py-4 font-semibold text-center">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {deletionRequests.map((req, idx) => (
                      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }} className="hover:bg-gray-50" key={req._id}>
                        <td className="px-6 py-4 font-bold text-gray-800 flex items-center gap-3">
                          <FaFileAlt className="text-red-400" /> {req.title}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-700">{req.uploadedBy?.username || 'Unknown'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-gray-500 italic max-w-xs block truncate" title={req.deletionReason}>{req.deletionReason || "No reason"}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-md uppercase tracking-wider">{req.deleteStatus}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <a href={`${import.meta.env.VITE_ASSETS_URL || 'http://localhost:5000'}${req.pdfUrl}`} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="View Document"><FaEye /></a>
                            {hasManage && (
                              <>
                                <button onClick={() => handleReviewDeletion(req._id, 'Approved')} className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-1 font-bold text-xs"><FaCheck /> Approve</button>
                                <button onClick={() => handleReviewDeletion(req._id, 'Rejected')} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1 font-bold text-xs"><FaTimes /> Reject</button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                    {deletionRequests.length === 0 && <tr><td colSpan="5" className="text-center py-10 text-gray-500">No pending deletion requests.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Documents;
