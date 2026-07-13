import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaFileAlt, FaCheckCircle, FaEnvelope, FaWhatsapp, FaHistory, FaEye } from 'react-icons/fa';
import api from '../../../utils/api';
import AnimatedCounter from '../../../components/dashboard/AnimatedCounter';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, draft: 0, generated: 0, sent: 0, archived: 0 });
  const [recentLetters, setRecentLetters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/correspondence', { params: { limit: 10 } });
        if (res.data?.success) {
          const letters = res.data.data;
          setRecentLetters(letters.slice(0, 5));
          
          let drafts = 0;
          let generated = 0;
          let sent = 0;
          let archived = 0;

          letters.forEach(l => {
            if (l.status === 'Draft') drafts++;
            else if (l.status === 'Generated') generated++;
            else if (l.status === 'Email Sent' || l.status === 'WhatsApp Shared') sent++;
            else if (l.status === 'Archived') archived++;
          });

          setStats({
            total: res.data.pagination.total,
            draft: drafts,
            generated: generated,
            sent: sent,
            archived: archived
          });
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
            <FaFileAlt className="text-[#FF7A2F]" />
            Official Correspondence
          </h1>
          <p className="text-gray-500 mt-2 font-semibold">Manage Trust letters, circulars, and official communications</p>
        </div>
        <button
          onClick={() => navigate('/trustee/correspondence/create')}
          className="bg-[#FF7A2F] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#e86a24] transition-colors shadow-lg shadow-[#FF7A2F]/20"
        >
          <FaPlus /> Create New Letter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center text-xl shrink-0"><FaFileAlt /></div>
          <div><p className="text-sm font-bold text-gray-500 uppercase">Total Letters</p><h3 className="text-2xl font-black text-gray-900"><AnimatedCounter value={stats.total} /></h3></div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-500 flex items-center justify-center text-xl shrink-0"><FaHistory /></div>
          <div><p className="text-sm font-bold text-gray-500 uppercase">Drafts</p><h3 className="text-2xl font-black text-gray-900"><AnimatedCounter value={stats.draft} /></h3></div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-500 flex items-center justify-center text-xl shrink-0"><FaCheckCircle /></div>
          <div><p className="text-sm font-bold text-gray-500 uppercase">Generated</p><h3 className="text-2xl font-black text-gray-900"><AnimatedCounter value={stats.generated} /></h3></div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-500 flex items-center justify-center text-xl shrink-0"><FaEnvelope /></div>
          <div><p className="text-sm font-bold text-gray-500 uppercase">Sent / Shared</p><h3 className="text-2xl font-black text-gray-900"><AnimatedCounter value={stats.sent} /></h3></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Recent Letters</h2>
            <button onClick={() => navigate('/trustee/correspondence/history')} className="text-[#FF7A2F] text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="p-0">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : recentLetters.length > 0 ? (
              <table className="w-full text-left text-sm block md:table">
                <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs hidden md:table-header-group">
                  <tr>
                    <th className="px-6 py-4">Ref Number</th>
                    <th className="px-6 py-4">Recipient</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="block md:table-row-group w-full divide-y divide-gray-100">
                  {recentLetters.map(letter => (
                    <tr key={letter._id} className="flex flex-col md:table-row w-full bg-white md:bg-transparent border border-gray-100 md:border-b md:border-x-0 md:border-t-0 md:border-gray-50 rounded-xl md:rounded-none mb-4 md:mb-0 shadow-sm md:shadow-none hover:bg-gray-50 transition-colors">
                      <td className="p-4 md:px-6 md:py-4 block md:table-cell border-b border-gray-50 md:border-none">
                        <div className="flex md:hidden justify-between items-start mb-3">
                          <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">{letter.referenceNumber || 'Draft'}</span>
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            letter.status === 'Draft' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                            letter.status === 'Generated' ? 'bg-green-100 text-green-700 border-green-200' :
                            'bg-blue-100 text-blue-700 border-blue-200'
                          }`}>{letter.status}</span>
                        </div>
                        <div className="md:hidden">
                          <div className="font-bold text-gray-900 text-lg">{letter.recipient?.name}</div>
                          <div className="mt-1 text-sm text-gray-600">{letter.subject}</div>
                        </div>
                        <div className="hidden md:block font-semibold text-gray-900">
                          {letter.referenceNumber || 'Draft'}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4">
                        <div className="font-bold text-gray-900">{letter.recipient?.name}</div>
                        <div className="text-xs text-gray-500">{letter.subject}</div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                          letter.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                          letter.status === 'Generated' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>{letter.status}</span>
                      </td>
                      <td className="p-3 md:px-6 md:py-4 md:text-right block md:table-cell bg-gray-50 md:bg-transparent rounded-b-xl md:rounded-none">
                        <div className="flex justify-between items-center w-full">
                          <span className="md:hidden text-xs text-gray-500 uppercase tracking-wider font-semibold px-1">Action</span>
                          <div className="flex md:justify-end w-full md:w-auto">
                            <button onClick={() => navigate(`/trustee/correspondence/history?id=${letter._id}`)} className="p-2 w-10 h-10 md:w-auto md:h-auto flex items-center justify-center bg-white md:bg-transparent border border-gray-200 md:border-none text-blue-500 hover:bg-blue-50 rounded-lg transition-colors flex-1 md:flex-none shadow-sm md:shadow-none">
                              <FaEye />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-500">No letters found. Create one to get started.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <button onClick={() => navigate('/trustee/correspondence/create')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-[#FF7A2F] hover:bg-[#FF7A2F]/5 transition-all text-left group">
              <div className="w-10 h-10 rounded-full bg-[#FF7A2F]/10 text-[#FF7A2F] flex items-center justify-center text-lg group-hover:scale-110 transition-transform"><FaPlus /></div>
              <div><p className="font-bold text-gray-900">Create Letter</p><p className="text-xs text-gray-500">Draft a new official document</p></div>
            </button>
            <button onClick={() => navigate('/trustee/correspondence/history?status=Draft')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-yellow-500 hover:bg-yellow-50 transition-all text-left group">
              <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-500 flex items-center justify-center text-lg group-hover:scale-110 transition-transform"><FaHistory /></div>
              <div><p className="font-bold text-gray-900">View Drafts</p><p className="text-xs text-gray-500">Continue working on saved drafts</p></div>
            </button>
            <button onClick={() => navigate('/trustee/correspondence/history')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center text-lg group-hover:scale-110 transition-transform"><FaEye /></div>
              <div><p className="font-bold text-gray-900">Search Letters</p><p className="text-xs text-gray-500">Find previously generated documents</p></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


