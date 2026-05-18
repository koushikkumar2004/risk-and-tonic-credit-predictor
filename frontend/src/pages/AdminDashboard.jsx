import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { ShieldAlert, TrendingUp, Users, FileText, CheckCircle, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatINR } from '../utils/format';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function AdminDashboard() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const { data } = await api.get('/loan/all');
      setLoans(data);
    } catch (error) {
      console.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  // Stats calculation
  const totalApps = loans.length;
  const pendingApps = loans.filter(l => l.status === 'pending').length;
  const highRiskApps = loans.filter(l => l.riskPrediction === 'High Risk').length;
  const totalCustomers = new Set(loans.map(l => l.user?._id)).size;

  const totalDisbursed = loans
    .filter(l => l.status === 'approved')
    .reduce((sum, l) => sum + l.loanAmount, 0);

  const riskData = [
    { name: 'Low Risk', value: loans.filter(l => l.riskPrediction === 'Low Risk').length },
    { name: 'Medium Risk', value: loans.filter(l => l.riskPrediction === 'Medium Risk').length },
    { name: 'High Risk', value: loans.filter(l => l.riskPrediction === 'High Risk').length },
  ];
  const COLORS = ['#22c55e', '#eab308', '#ef4444'];

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Admin Dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Risk & Tonic Admin</h1>
          <p className="text-sm text-amber-500 dark:text-amber-400 font-medium italic mt-0.5">“Because Every Loan Has a Hangover.”</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/applications"
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            Review Applications <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Applications</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalApps}</p>
            <p className="text-xs text-slate-400 mt-1">Across all risk tiers</p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/40 p-3.5 rounded-xl text-blue-600 dark:text-blue-400">
            <FileText className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500 mt-1">{pendingApps}</p>
            <p className="text-xs text-slate-400 mt-1">Requires manual decision</p>
          </div>
          <div className="bg-yellow-100 dark:bg-yellow-900/40 p-3.5 rounded-xl text-yellow-600 dark:text-yellow-500">
            <TrendingUp className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">High Risk Alerts</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-500 mt-1">{highRiskApps}</p>
            <p className="text-xs text-slate-400 mt-1">AI flagged applications</p>
          </div>
          <div className="bg-red-100 dark:bg-red-900/40 p-3.5 rounded-xl text-red-600 dark:text-red-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Customers</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{totalCustomers}</p>
            <p className="text-xs text-slate-400 mt-1">Registered applicants</p>
          </div>
          <div className="bg-indigo-100 dark:bg-indigo-900/40 p-3.5 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* Financial Overview & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Risk Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 lg:col-span-2 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Financial Disbursal Summary</h3>
            <p className="text-sm text-slate-500 mb-6">Total approved loan volume monitored by the AI decision engine.</p>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Approved Volume</p>
                <p className="text-3xl font-extrabold text-primary mt-1">{formatINR(totalDisbursed)}</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle className="w-3.5 h-3.5" /> Active Disbursal
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <span className="text-sm text-slate-500">Need detailed breakdown?</span>
            <Link
              to="/admin/reports"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              View Analytics Reports <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Recent Applications Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Applications</h3>
          <Link
            to="/admin/applications"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">
              <tr>
                <th className="p-4 rounded-tl-xl">Applicant</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Credit Score</th>
                <th className="p-4">AI Risk Level</th>
                <th className="p-4 rounded-tr-xl text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loans.slice(0, 5).map((loan) => (
                <tr key={loan._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-4 font-medium text-slate-900 dark:text-white">
                    {loan.user?.name || 'Unknown'}
                    <span className="block text-xs text-slate-400 font-normal">{loan.user?.email}</span>
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
                  <td className="p-4 text-right">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
