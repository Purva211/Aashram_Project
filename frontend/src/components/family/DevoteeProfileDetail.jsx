import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiX, FiUser, FiPhone, FiMail, FiMapPin, FiBriefcase, FiAward, 
  FiFileText, FiHeart, FiCalendar, FiClock, FiActivity, FiLayers 
} from 'react-icons/fi';
import { FaUserFriends, FaBaby, FaHeartbeat } from 'react-icons/fa';
import api from "../../utils/api";

const DevoteeProfileDetail = ({ devoteeId, onClose, onSelectMember, onViewFamilyTree }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    if (devoteeId) {
      fetchDetails();
    }
  }, [devoteeId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/family/member/${devoteeId}`);
      setData(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch devotee profile details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-saffron-200 border-t-saffron-500 rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Retrieving profile...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 text-center">
        <p className="text-red-500 font-bold mb-4">{error || "No data available."}</p>
        <button onClick={onClose} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold">Close Drawer</button>
      </div>
    );
  }

  const { devotee, relationships, donations, annadaan } = data;

  const tabs = [
    { id: "general", label: "Overview", icon: <FiUser /> },
    { id: "family", label: "Family Links", icon: <FaUserFriends /> },
    { id: "donations", label: `Donations (${donations?.length || 0})`, icon: <FiHeart /> },
    { id: "annadan", label: `Annadaan (${annadaan?.length || 0})`, icon: <FaHeartbeat /> },
    { id: "history", label: "Monastery History", icon: <FiActivity /> }
  ];

  return (
    <div className="h-full flex flex-col bg-white border border-gray-100 shadow-2xl rounded-3xl overflow-hidden relative border-t-8 border-t-saffron-500">
      
      {/* Profile Header Card */}
      <div className="p-6 bg-slate-50 border-b border-gray-100 flex justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-inner ${devotee.gender === 'Male' ? 'bg-gradient-to-br from-orange-400 to-saffron-600' : 'bg-gradient-to-br from-pink-400 to-rose-600'}`}>
            {devotee.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 leading-tight">{devotee.name}</h2>
            <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="bg-slate-200/80 px-2 py-0.5 rounded text-[10px]">{devotee.devoteeId}</span>
              {relationships.relationToHead && (
                <span className="bg-saffron-50 border border-saffron-200 text-saffron-700 px-2 py-0.5 rounded text-[10px]">{relationships.relationToHead}</span>
              )}
            </p>
            {devotee.familyRootId && onViewFamilyTree && (
              <button 
                onClick={() => onViewFamilyTree(devotee.familyRootId)}
                className="mt-2 px-3 py-1 bg-saffron-500 hover:bg-saffron-600 text-white rounded text-[10px] font-black uppercase tracking-wider shadow-sm transition-colors"
              >
                View Family Tree
              </button>
            )}
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors shadow-sm"><FiX size={18} /></button>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-gray-100 overflow-x-auto whitespace-nowrap scrollbar-thin bg-slate-50/50">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold transition-all border-b-2 ${activeTab === tab.id ? 'border-b-saffron-500 text-saffron-600 bg-white' : 'border-b-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {activeTab === "general" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Gender</p>
                <p className="text-sm font-bold text-slate-800">{devotee.gender}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Date of Birth</p>
                <p className="text-sm font-bold text-slate-800">{devotee.dob ? new Date(devotee.dob).toLocaleDateString() : "Not Provided"}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Mobile</p>
                <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><FiPhone size={12} className="text-slate-400" /> {devotee.mobile || "Not Provided"}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Email</p>
                <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5 truncate" title={devotee.email}><FiMail size={12} className="text-slate-400" /> {devotee.email || "Not Provided"}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Gotra</p>
                <p className="text-sm font-bold text-slate-800">{devotee.gotra || "Not Provided"}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Kuldevta</p>
                <p className="text-sm font-bold text-slate-800">{devotee.kuldevta || "Not Provided"}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Blood Group</p>
                <p className="text-sm font-bold text-slate-800">{devotee.bloodGroup || "Not Provided"}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Marital Status</p>
                <p className="text-sm font-bold text-slate-800">{devotee.maritalStatus || "Single"}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Aadhaar Number</p>
              <p className="text-sm font-bold text-slate-800">{devotee.aadhaar || "Not Provided"}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Address</p>
              <p className="text-sm font-bold text-slate-800 flex items-start gap-1.5"><FiMapPin size={12} className="text-saffron-500 mt-1 shrink-0" /> {devotee.address || "Not Provided"}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Branch</p>
                <p className="text-sm font-bold text-slate-800">{devotee.branch?.name || "Head Office"}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Generation Level</p>
                <p className="text-sm font-bold text-saffron-600 flex items-center gap-1"><FiLayers /> Level {devotee.generationLevel}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "family" && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-800 border-b border-gray-100 pb-2">Immediate Family Members</h3>
            
            <div className="space-y-4">
              {/* Parents */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Father</p>
                  {relationships.father ? (
                    <button 
                      onClick={() => onSelectMember(relationships.father._id)}
                      className="w-full text-left p-3 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 rounded-xl font-bold text-sm text-blue-900 transition-colors"
                    >
                      {relationships.father.name}
                    </button>
                  ) : (
                    <p className="text-xs text-slate-400 font-medium italic p-3 bg-slate-50 rounded-xl">Not Registered</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Mother</p>
                  {relationships.mother ? (
                    <button 
                      onClick={() => onSelectMember(relationships.mother._id)}
                      className="w-full text-left p-3 bg-pink-50/50 hover:bg-pink-50 border border-pink-100 rounded-xl font-bold text-sm text-pink-900 transition-colors"
                    >
                      {relationships.mother.name}
                    </button>
                  ) : (
                    <p className="text-xs text-slate-400 font-medium italic p-3 bg-slate-50 rounded-xl">Not Registered</p>
                  )}
                </div>
              </div>

              {/* Spouse */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Spouse</p>
                {relationships.spouse ? (
                  <button 
                    onClick={() => onSelectMember(relationships.spouse._id)}
                    className="w-full text-left p-3 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 rounded-xl font-bold text-sm text-emerald-900 transition-colors"
                  >
                    {relationships.spouse.name} ({relationships.spouse.gender})
                  </button>
                ) : (
                  <p className="text-xs text-slate-400 font-medium italic p-3 bg-slate-50 rounded-xl">No Spouse Registered</p>
                )}
              </div>

              {/* Siblings */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Brothers & Sisters</p>
                <div className="flex flex-col gap-2">
                  {[...(relationships.brothers || []), ...(relationships.sisters || [])].map(sib => (
                    <button
                      key={sib._id}
                      onClick={() => onSelectMember(sib._id)}
                      className="text-left p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 transition-colors flex items-center justify-between"
                    >
                      <span>{sib.name}</span>
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-white text-slate-500">{sib.gender === 'Male' ? 'Brother' : 'Sister'}</span>
                    </button>
                  ))}
                  {[...(relationships.brothers || []), ...(relationships.sisters || [])].length === 0 && (
                    <p className="text-xs text-slate-400 font-medium italic p-3 bg-slate-50 rounded-xl">No siblings registered</p>
                  )}
                </div>
              </div>

              {/* Children */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Children</p>
                <div className="flex flex-col gap-2">
                  {relationships.children?.map(child => (
                    <button
                      key={child._id}
                      onClick={() => onSelectMember(child._id)}
                      className="text-left p-3 bg-orange-50/50 hover:bg-orange-50 border border-orange-100 rounded-xl font-bold text-xs text-orange-900 transition-colors flex items-center justify-between"
                    >
                      <span>{child.name}</span>
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-white text-orange-600">{child.gender}</span>
                    </button>
                  ))}
                  {relationships.children?.length === 0 && (
                    <p className="text-xs text-slate-400 font-medium italic p-3 bg-slate-50 rounded-xl">No children registered</p>
                  )}
                </div>
              </div>

              {/* Grandchildren */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1"><FaBaby /> Grandchildren</p>
                <div className="flex flex-col gap-2">
                  {relationships.grandchildren?.map(gc => (
                    <button
                      key={gc._id}
                      onClick={() => onSelectMember(gc._id)}
                      className="text-left p-3 bg-purple-50/50 hover:bg-purple-50 border border-purple-100 rounded-xl font-bold text-xs text-purple-900 transition-colors flex items-center justify-between"
                    >
                      <span>{gc.name}</span>
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-white text-purple-600">{gc.gender}</span>
                    </button>
                  ))}
                  {relationships.grandchildren?.length === 0 && (
                    <p className="text-xs text-slate-400 font-medium italic p-3 bg-slate-50 rounded-xl">No grandchildren registered</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === "donations" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-gray-100 pb-2">Donation History</h3>
            
            <div className="space-y-3">
              {donations?.map((don, idx) => (
                <div key={don._id || idx} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-sm font-black text-slate-800">₹ {don.amount}</p>
                    <p className="text-[10px] font-bold text-slate-500 mt-0.5">{don.donationReference}</p>
                    <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5 mt-1"><FiCalendar /> {new Date(don.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase">Success</span>
                </div>
              ))}
              {(!donations || donations.length === 0) && (
                <div className="text-center py-8 text-slate-400 font-medium">No donation records found for this member.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === "annadan" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-gray-100 pb-2">Annadaan History</h3>
            
            <div className="space-y-3">
              {annadaan?.map((ad, idx) => (
                <div key={ad._id || idx} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-black text-slate-800">{ad.annadaanType}</p>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">{ad.description || "Divine Food Offering Service"}</p>
                    </div>
                    <span className="bg-saffron-50 text-saffron-600 border border-saffron-200 px-3 py-1 rounded-full text-[10px] font-black uppercase">Reserved</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 mt-3 pt-3 border-t border-slate-200/50">
                    <span className="flex items-center gap-1"><FiCalendar /> {new Date(ad.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><FiClock /> {ad.time}</span>
                  </div>
                </div>
              ))}
              {(!annadaan || annadaan.length === 0) && (
                <div className="text-center py-8 text-slate-400 font-medium">No Annadaan bookings registered for this devotee.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-gray-100 pb-2">Recent Activities</h3>
            
            <div className="relative border-l-2 border-slate-100 pl-4 ml-2 space-y-6 py-2">
              <div className="relative">
                <span className="absolute -left-[21px] top-1 bg-saffron-500 rounded-full w-2.5 h-2.5 border-2 border-white ring-4 ring-saffron-50"></span>
                <p className="text-xs font-bold text-slate-800">Added to Vanshawal</p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Jai Kolekar Maha Swamiji Monastery registry updated.</p>
                <span className="text-[9px] text-slate-400 font-bold block mt-1">{new Date(devotee.createdAt).toLocaleString()}</span>
              </div>
              <div className="relative">
                <span className="absolute -left-[21px] top-1 bg-slate-300 rounded-full w-2.5 h-2.5 border-2 border-white ring-4 ring-slate-100"></span>
                <p className="text-xs font-bold text-slate-700">Devotee Record Synchronized</p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Profile metadata, links, and levels verified successfully.</p>
                <span className="text-[9px] text-slate-400 font-bold block mt-1">{new Date(devotee.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default DevoteeProfileDetail;
