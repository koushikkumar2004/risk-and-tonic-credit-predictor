import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldAlert, TrendingUp, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { formatINR } from '../utils/format';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const { data } = await api.get('/loan/status');
        setLoans(data);
      } catch (error) {
        console.error('Failed to fetch loans');
      } finally {
        setLoading(false);
      }
    };
    fetchLoans();
  }, []);

  const latestLoan = loans.length > 0 ? loans[0] : null;

  // Mock data for chart
  const creditData = [
    { name: 'Jan', score: 620 },
    { name: 'Feb', score: 630 },
    { name: 'Mar', score: 650 },
    { name: 'Apr', score: 680 },
    { name: 'May', score: 710 },
    { name: 'Jun', score: user?.creditScore || 720 },
  ];

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, {user?.name}</h1>
          <p className="text-sm text-amber-500 dark:text-amber-400 font-medium italic mt-0.5">“Because Every Loan Has a Hangover.”</p>
        </div>
        <Link to="/dashboard/apply" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 font-medium transition-all hover:scale-105">
          Apply for New Loan
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center text-2xl font-bold">
              {user?.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{user?.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-600 dark:text-slate-400">Credit Score</span>
              <span className="font-bold text-lg text-slate-900 dark:text-white">{user?.creditScore || '720'}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
              <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '80%' }}></div>
            </div>
          </div>
        </motion.div>

        {/* Latest AI Prediction Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 md:col-span-2"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Latest Application AI Analysis</h3>
          {latestLoan ? (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Loan Amount:</span>
                  <span className="font-semibold">{formatINR(latestLoan.loanAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Risk Level:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    latestLoan.riskPrediction === 'Low Risk' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    latestLoan.riskPrediction === 'Medium Risk' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {latestLoan.riskPrediction}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Status:</span>
                  <span className="capitalize font-medium flex items-center gap-1">
                    {latestLoan.status === 'approved' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {latestLoan.status === 'rejected' && <XCircle className="w-4 h-4 text-red-500" />}
                    {latestLoan.status === 'pending' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                    {latestLoan.status}
                  </span>
                </div>
              </div>
              <div className="flex-1 border-l border-slate-100 dark:border-slate-700 pl-6 flex flex-col justify-center">
                <p className="text-sm text-slate-500 mb-2">AI Confidence Score</p>
                <div className="text-4xl font-bold text-primary mb-2">{(latestLoan.probabilityScore * 100).toFixed(1)}%</div>
                <p className="text-xs text-slate-400">Our Decision Tree model indicates a {latestLoan.riskPrediction.toLowerCase()} profile.</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              No recent applications found. Apply for a loan to see AI predictions.
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Credit Score Trend Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-96"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Credit Score Trend</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={creditData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis domain={['dataMin - 20', 'dataMax + 20']} stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Smart Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Smart Financial Tips</h3>
          <ul className="space-y-4">
            <li className="flex gap-3 items-start">
              <div className="bg-green-100 text-green-600 p-2 rounded-lg mt-1"><TrendingUp className="w-5 h-5" /></div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">Keep Credit Utilization Low</h4>
                <p className="text-sm text-slate-500">Aim to use less than 30% of your available credit limit to boost your score.</p>
              </div>
            </li>
            <li className="flex gap-3 items-start">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg mt-1"><ShieldAlert className="w-5 h-5" /></div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">Never Miss a Payment</h4>
                <p className="text-sm text-slate-500">Payment history is the biggest factor in our AI's risk assessment.</p>
              </div>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
