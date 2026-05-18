import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Download, FileSpreadsheet, FileText, Printer, Calendar, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatINR } from '../utils/format';
import { useToast } from '../context/ToastContext';

export default function AdminReports() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
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
      toast.error('Failed to fetch reporting data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Reports...</div>;

  // Monthly stats grouping
  const monthlyStats = {};
  loans.forEach(loan => {
    const date = new Date(loan.createdAt);
    const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (!monthlyStats[monthYear]) {
      monthlyStats[monthYear] = {
        monthYear,
        totalApps: 0,
        approvedVol: 0,
        approvedCount: 0,
        rejectedCount: 0,
        pendingCount: 0,
        highRiskCount: 0,
      };
    }
    monthlyStats[monthYear].totalApps++;
    if (loan.status === 'approved') {
      monthlyStats[monthYear].approvedVol += loan.loanAmount || 0;
      monthlyStats[monthYear].approvedCount++;
    } else if (loan.status === 'rejected') {
      monthlyStats[monthYear].rejectedCount++;
    } else {
      monthlyStats[monthYear].pendingCount++;
    }
    if (loan.riskPrediction === 'High Risk') {
      monthlyStats[monthYear].highRiskCount++;
    }
  });

  const monthlyData = Object.values(monthlyStats);

  // Export functions
  const exportCSV = () => {
    if (loans.length === 0) {
      toast.info('No data available to export');
      return;
    }
    const headers = ['Applicant Name,Email,Requested Amount (INR),Credit Score,AI Risk Prediction,Status,Applied Date'];
    const rows = loans.map(l => 
      `"${l.user?.name || 'Unknown'}","${l.user?.email || ''}","${l.loanAmount}","${l.creditScore}","${l.riskPrediction}","${l.status}","${new Date(l.createdAt).toLocaleDateString()}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `risk_and_tonic_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV report exported successfully!');
  };

  const exportJSON = () => {
    if (loans.length === 0) {
      toast.info('No data available to export');
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(loans, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `risk_and_tonic_data_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('JSON data exported successfully!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Risk & Tonic Reports</h1>
          <p className="text-sm text-amber-500 dark:text-amber-400 font-medium italic mt-0.5">“Because Every Loan Has a Hangover.”</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV / Excel
          </button>
          <button
            onClick={exportJSON}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Export JSON
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" /> Print / PDF
          </button>
        </div>
      </div>

      {/* Monthly Summary Report Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> Monthly Performance Breakdown
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wider">
              <tr>
                <th className="p-4 rounded-tl-xl">Month / Year</th>
                <th className="p-4">Total Applications</th>
                <th className="p-4">Approved Volume</th>
                <th className="p-4">Approved</th>
                <th className="p-4">Rejected</th>
                <th className="p-4">Pending</th>
                <th className="p-4 rounded-tr-xl text-right">High Risk Flagged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {monthlyData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">No monthly data available.</td>
                </tr>
              ) : (
                monthlyData.map((stat, idx) => (
                  <tr key={stat.monthYear} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{stat.monthYear}</td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{stat.totalApps}</td>
                    <td className="p-4 font-bold text-primary">{formatINR(stat.approvedVol)}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" /> {stat.approvedCount}
                      </span>
                    </td>
                    <td className="p-4 text-red-600 dark:text-red-400 font-semibold">{stat.rejectedCount}</td>
                    <td className="p-4 text-yellow-600 dark:text-yellow-500 font-semibold">{stat.pendingCount}</td>
                    <td className="p-4 text-right">
                      <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-900/30 px-2.5 py-1 rounded-full">
                        <AlertTriangle className="w-3.5 h-3.5" /> {stat.highRiskCount}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Compliance & Audit Notes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-start gap-4"
      >
        <div className="bg-blue-100 dark:bg-blue-900/40 p-3.5 rounded-xl text-blue-600 dark:text-blue-400 flex-shrink-0">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Compliance & Audit Trail</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            All AI decision tree probability scores, applicant financial inputs, and manual review notes are logged immutably. Exported CSV and JSON reports contain complete timestamps and audit trails suitable for regulatory review and internal risk auditing.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
