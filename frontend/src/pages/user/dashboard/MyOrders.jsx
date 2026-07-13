import React, { useEffect, useState } from 'react';
import { getMyOrders } from '../../../services/userDashboardService';
import { TableSkeleton } from '../../../components/dashboard/LoadingSkeleton';
import EmptyState from '../../../components/dashboard/EmptyState';
import StatusBadge from '../../../components/dashboard/StatusBadge';
import { FaSearch, FaFilter, FaCalendarAlt, FaClock, FaUser } from 'react-icons/fa';
import { motion } from 'framer-motion';

export const MyOrders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getMyOrders({
        page,
        limit: 10,
        status,
        search
      });
      if (res.data?.success) {
        setOrders(res.data.data);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch pooja bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, status, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter bar */}
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-cream-dark/20 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by Pooja type..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-dark/40 bg-white/50 text-caramel-deep placeholder-caramel-dark/50 focus:outline-none focus:border-primary transition-colors text-sm"
          />
          <button type="submit" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-caramel-dark/60 hover:text-primary">
            <FaSearch size={14} />
          </button>
        </form>

        <div className="flex items-center gap-2">
          <FaFilter className="text-caramel-dark/60 text-sm hidden sm:block" />
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="px-3.5 py-2.5 rounded-xl border border-cream-dark/40 bg-white/50 text-caramel-deep focus:outline-none focus:border-primary text-sm cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <TableSkeleton cols={5} rows={5} />
      ) : orders.length === 0 ? (
        <div className="py-12">
          <EmptyState
            title="No Pooja Bookings Found"
            description={search || status !== 'all' ? "Try adjusting your search query or status filters." : "You haven't booked any pooja yet. Book one from the services page."}
            actionText={search || status !== 'all' ? "Reset Filters" : "Book a Pooja"}
            onAction={
              search || status !== 'all'
                ? () => {
                    setSearch('');
                    setSearchInput('');
                    setStatus('all');
                    setPage(1);
                  }
                : () => window.location.href = '/services'
            }
          />
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-cream-dark/20 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-xs font-black uppercase tracking-wider text-white">
                  <th className="px-6 py-4">Devotee Name</th>
                  <th className="px-6 py-4">Pooja Type</th>
                  <th className="px-6 py-4">Scheduled Date</th>
                  <th className="px-6 py-4">Time Slot</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="block md:table-row-group w-full divide-y divide-cream-dark/10 text-sm">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-cream/20 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-caramel-dark/50" />
                        <span>{order.devoteeName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-serif text-base text-caramel-deep font-semibold">
                      {order.poojaType}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-caramel-dark/80">
                        <FaCalendarAlt className="text-primary/70" />
                        <span>{new Date(order.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-caramel-dark/80">
                        <FaClock className="text-primary/70" />
                        <span>{order.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-cream-dark/5 border-t border-cream-dark/10 flex items-center justify-between">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                className="px-4 py-2 border border-transparent rounded-xl text-xs font-black bg-slate-900 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors shadow-md"
              >
                Previous
              </button>
              <span className="text-xs font-medium text-caramel-dark/80">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                className="px-4 py-2 border border-transparent rounded-xl text-xs font-black bg-slate-900 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors shadow-md"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyOrders;

