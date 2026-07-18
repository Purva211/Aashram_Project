import React, { useState, useEffect } from 'react';
import { FiUsers, FiMapPin, FiLayers, FiActivity, FiTrendingUp, FiAward } from 'react-icons/fi';
import { FaUserFriends, FaVenusMars } from 'react-icons/fa';
import api from '../../utils/api';

const FamilyDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/family/reports/data');
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch family tree dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-saffron-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 max-w-xl mx-auto mt-10 text-center font-bold">
        {error || "No statistics available."}
      </div>
    );
  }

  const { stats, largestFamiliesList, branchSummaries } = data;

  // Helpers to draw premium inline SVG charts
  const totalGender = (stats.genderBreakdown.Male || 0) + (stats.genderBreakdown.Female || 0) + (stats.genderBreakdown.Other || 0) || 1;
  const malePct = Math.round(((stats.genderBreakdown.Male || 0) / totalGender) * 100);
  const femalePct = Math.round(((stats.genderBreakdown.Female || 0) / totalGender) * 100);
  const otherPct = Math.round(((stats.genderBreakdown.Other || 0) / totalGender) * 100);

  return (
    <div className="w-full space-y-8 pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <FiActivity className="text-saffron-500" /> Vanshawal Analytics Dashboard
        </h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Real-time statistics of family trees, branches, generations, and devotee demographics.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full opacity-50"></div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs text-slate-400 font-black uppercase tracking-wider">Total Families</p>
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 font-bold"><FaUserFriends /></div>
          </div>
          <h2 className="text-3xl font-black text-slate-900">{stats.totalFamilies}</h2>
          <p className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-1"><FiTrendingUp className="text-emerald-500" /> Unique family lineages registered</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full opacity-50"></div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs text-slate-400 font-black uppercase tracking-wider">Total Devotees</p>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold"><FiUsers /></div>
          </div>
          <h2 className="text-3xl font-black text-slate-900">{stats.totalDevotees}</h2>
          <p className="text-[10px] text-slate-400 font-bold mt-2">Belonging to a connected family</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full opacity-50"></div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs text-slate-400 font-black uppercase tracking-wider">Largest Family Size</p>
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 font-bold"><FiUsers /></div>
          </div>
          <h2 className="text-3xl font-black text-slate-900">{stats.largestFamilySize} Members</h2>
          <p className="text-[10px] text-rose-600 font-black mt-2 truncate">Head: {stats.largestFamilyName}</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full opacity-50"></div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs text-slate-400 font-black uppercase tracking-wider">Branch Count</p>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold"><FiMapPin /></div>
          </div>
          <h2 className="text-3xl font-black text-slate-900">{Object.keys(stats.branchCounts).length} Shakhas</h2>
          <p className="text-[10px] text-slate-400 font-bold mt-2">Active lineage record registries</p>
        </div>

      </div>

      {/* Main Charts & Lists Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Branch Wise Distributions */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-[2rem] p-6 lg:col-span-8 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2">
              <FiMapPin className="text-saffron-500" /> Shakha-wise Family Registries
            </h3>
            
            <div className="space-y-4">
              {branchSummaries.map((b, idx) => {
                const pct = Math.round((b.memberCount / stats.totalDevotees) * 100) || 1;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{b.branchName}</span>
                      <span>{b.memberCount} Devotees ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-saffron-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
              {branchSummaries.length === 0 && (
                <p className="text-center py-10 text-slate-400 text-sm font-semibold">No branch data available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Gender Breakdown Mini Chart */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-[2rem] p-6 lg:col-span-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2">
              <FaVenusMars className="text-saffron-500" /> Gender Demographics
            </h3>

            {/* Premium circular donut-like SVG simulation */}
            <div className="flex justify-center mb-6">
              <div className="relative w-36 h-36 flex items-center justify-center bg-slate-50 rounded-full border border-slate-100">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Lineage</p>
                  <p className="text-xs font-black text-slate-700">Ratios</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-orange-500 block"></span>
                  <span className="text-slate-600">Male</span>
                </div>
                <span className="text-slate-800">{stats.genderBreakdown.Male || 0} ({malePct}%)</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-rose-500 block"></span>
                  <span className="text-slate-600">Female</span>
                </div>
                <span className="text-slate-800">{stats.genderBreakdown.Female || 0} ({femalePct}%)</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-slate-400 block"></span>
                  <span className="text-slate-600">Other</span>
                </div>
                <span className="text-slate-800">{stats.genderBreakdown.Other || 0} ({otherPct}%)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Generation Level Counts */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-[2rem] p-6 lg:col-span-6 flex flex-col">
          <h3 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2">
            <FiLayers className="text-saffron-500" /> Generation Depth Distribution
          </h3>
          
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {Object.keys(stats.generationCounts).map((gen, idx) => {
              const count = stats.generationCounts[gen];
              const pct = Math.round((count / stats.totalDevotees) * 100) || 1;
              return (
                <div key={idx} className="flex items-center gap-4 text-xs font-bold">
                  <span className="w-16 text-slate-600">{gen}</span>
                  <div className="flex-1 bg-slate-100 h-6 rounded-lg overflow-hidden relative">
                    <div className="bg-gradient-to-r from-orange-400 to-saffron-500 h-full rounded-lg" style={{ width: `${pct}%` }}></div>
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-white">{count} Members</span>
                  </div>
                  <span className="w-10 text-right text-slate-700">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Largest Families List */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-[2rem] p-6 lg:col-span-6">
          <h3 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2">
            <FiAward className="text-saffron-500" /> Largest Family Lineages (Top 5)
          </h3>

          <div className="divide-y divide-gray-100">
            {largestFamiliesList.slice(0, 5).map((fam, idx) => (
              <div key={idx} className="py-3 flex justify-between items-center gap-4 text-xs">
                <div>
                  <p className="font-bold text-slate-800">{fam.headName}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{fam.branch}</p>
                </div>
                <span className="bg-saffron-50 text-saffron-600 border border-saffron-100 px-3 py-1.5 rounded-full font-black">
                  {fam.size} Members
                </span>
              </div>
            ))}
            {largestFamiliesList.length === 0 && (
              <p className="text-center py-8 text-slate-400 font-semibold">No family registries registered yet.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default FamilyDashboard;
