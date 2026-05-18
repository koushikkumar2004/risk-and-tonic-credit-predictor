import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Check, X, CheckCircle, XCircle, AlertCircle, Eye, Briefcase, Phone, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatINR } from '../utils/format';
import { useToast } from '../context/ToastContext';

export default function AdminApplications() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [comments, setComments] = useState({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const toast = useToast();

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const { data } = await api.get('/loan/all');
      setLoans(data);
    } catch (error) {
      console.error('Failed to fetch applications', error);
      toast.error('Failed to fetch loan applications');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    setActionLoading(true);
    try {
      await api.put(`/loan/${id}/status`, { status, comments: comments[id] || '' });
      toast.success(`Application ${status} successfully!`);
      fetchLoans();
      if (selectedLoan?._id === id) {
        setSelectedLoan(prev => ({ ...prev, status, comments: comments[id] || prev.comments }));
      }
    } catch (error) {
      console.error('Failed to update status', error);
      toast.error('Failed to update application status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCommentChange = (id, value) => {
    setComments(prev => ({ ...prev, [id]: value }));
  };

  // Filtered loans
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = (loan.user?.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
                          (loan.user?.email?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    const matchesRisk = riskFilter === 'all' || loan.riskPrediction === riskFilter;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
  const paginatedLoans = filteredLoans.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Applications...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Application Review</h1>
          <p className="text-sm text-slate-500">Review AI risk assessments, add notes, and approve or reject loan requests.</p>
        </div>
      </div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center"
      >
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by applicant name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={riskFilter}
              onChange={(e) => { setRiskFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto transition-all"
            >
              <option value="all">All Risk Levels</option>
              <option value="Low Risk">Low Risk</option>
              <option value="Medium Risk">Medium Risk</option>
              <option value="High Risk">High Risk</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Applications Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">
              <tr>
                <th className="p-4 rounded-tl-xl">Applicant</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Credit Score</th>
                <th className="p-4">AI Risk Level</th>
                <th className="p-4">Status</th>
                <th className="p-4 rounded-tr-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {paginatedLoans.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">No applications found matching the criteria.</td>
                </tr>
              ) : (
                paginatedLoans.map((loan) => (
                  <tr key={loan._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {loan.user?.name ? loan.user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{loan.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{loan.user?.email}</p>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">{formatINR(loan.loanAmount)}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{loan.creditScore}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        loan.riskPrediction === 'Low Risk' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        loan.riskPrediction === 'Medium Risk' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {loan.riskPrediction} ({(loan.probabilityScore * 100).toFixed(0)}%)
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        loan.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        loan.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {loan.status === 'approved' && <CheckCircle className="w-3.5 h-3.5" />}
                        {loan.status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                        {loan.status === 'pending' && <AlertCircle className="w-3.5 h-3.5" />}
                        {loan.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedLoan(loan)}
                          className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>
                        {loan.status === 'pending' && (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              placeholder="Notes..."
                              className="text-xs px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary w-24 sm:w-28 transition-all"
                              value={comments[loan._id] || ''}
                              onChange={(e) => handleCommentChange(loan._id, e.target.value)}
                            />
                            <button
                              onClick={() => handleAction(loan._id, 'approved')}
                              disabled={actionLoading}
                              className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                              title="Approve Application"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction(loan._id, 'rejected')}
                              disabled={actionLoading}
                              className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                              title="Reject Application"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <div>
              Showing <span className="font-semibold text-slate-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredLoans.length)}</span> of <span className="font-semibold text-slate-900 dark:text-white">{filteredLoans.length}</span> applications
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Loan Details Modal */}
      <AnimatePresence>
        {selectedLoan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 max-w-2xl w-full overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-start relative">
                <div>
                  <h2 className="text-xl font-bold">Application Details</h2>
                  <p className="text-blue-100 text-sm mt-1">Submitted by {selectedLoan.user?.name || 'Unknown'}</p>
                </div>
                <button
                  onClick={() => setSelectedLoan(null)}
                  className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Requested Amount</p>
                    <p className="text-lg font-bold text-primary mt-1">{formatINR(selectedLoan.loanAmount)}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">AI Risk Assessment</p>
                    <p className={`text-base font-bold mt-1 ${
                      selectedLoan.riskPrediction === 'Low Risk' ? 'text-green-600 dark:text-green-400' :
                      selectedLoan.riskPrediction === 'Medium Risk' ? 'text-yellow-600 dark:text-yellow-500' :
                      'text-red-600 dark:text-red-400'
                    }`}>{selectedLoan.riskPrediction}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Application Status</p>
                    <p className="text-base font-bold text-slate-900 dark:text-white capitalize mt-1">{selectedLoan.status}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700 pt-5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Applicant Profile & Financials</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500 block text-xs font-semibold uppercase">Occupation</span>
                      <span className="font-medium text-slate-900 dark:text-white">{selectedLoan.user?.occupation || 'Other'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs font-semibold uppercase">Annual Income</span>
                      <span className="font-medium text-slate-900 dark:text-white">{formatINR(selectedLoan.income)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs font-semibold uppercase">Credit Score</span>
                      <span className="font-medium text-slate-900 dark:text-white">{selectedLoan.creditScore}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs font-semibold uppercase">Employment Status</span>
                      <span className="font-medium text-slate-900 dark:text-white">{selectedLoan.employmentStatus}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs font-semibold uppercase">Existing Loans</span>
                      <span className="font-medium text-slate-900 dark:text-white">{selectedLoan.existingLoans}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs font-semibold uppercase">Payment History Quality</span>
                      <span className="font-medium text-slate-900 dark:text-white">{selectedLoan.paymentHistory}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs font-semibold uppercase">Marital Status</span>
                      <span className="font-medium text-slate-900 dark:text-white">{selectedLoan.maritalStatus}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs font-semibold uppercase">Age</span>
                      <span className="font-medium text-slate-900 dark:text-white">{selectedLoan.age} years</span>
                    </div>
                  </div>
                </div>

                {selectedLoan.comments && (
                  <div className="border-t border-slate-100 dark:border-slate-700 pt-5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Reviewer Notes</h3>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl text-sm text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                      {selectedLoan.comments}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 flex justify-between items-center border-t border-slate-100 dark:border-slate-700">
                {selectedLoan.status === 'pending' ? (
                  <div className="flex items-center gap-2 w-full justify-between">
                    <input
                      type="text"
                      placeholder="Add review notes here..."
                      className="text-sm px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary flex-1 transition-all"
                      value={comments[selectedLoan._id] || ''}
                      onChange={(e) => handleCommentChange(selectedLoan._id, e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(selectedLoan._id, 'approved')}
                        disabled={actionLoading}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm disabled:opacity-50 transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleAction(selectedLoan._id, 'rejected')}
                        disabled={actionLoading}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm disabled:opacity-50 transition-colors flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex justify-end">
                    <button
                      onClick={() => setSelectedLoan(null)}
                      className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-5 py-2 rounded-xl text-sm font-medium transition-colors"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
