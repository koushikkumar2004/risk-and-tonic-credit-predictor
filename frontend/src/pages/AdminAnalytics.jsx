import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { formatINR } from '../utils/format';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

export default function AdminAnalytics() {
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
      console.error('Failed to fetch applications', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Analytics...</div>;

  // 1. Risk Distribution Data
  const riskCounts = { 'Low Risk': 0, 'Medium Risk': 0, 'High Risk': 0 };
  loans.forEach(l => { if (riskCounts[l.riskPrediction] !== undefined) riskCounts[l.riskPrediction]++; });
  const riskData = [
    { name: 'Low Risk', value: riskCounts['Low Risk'] },
    { name: 'Medium Risk', value: riskCounts['Medium Risk'] },
    { name: 'High Risk', value: riskCounts['High Risk'] },
  ];
  const COLORS = ['#22c55e', '#eab308', '#ef4444'];

  // 2. Average Loan Amount & Income by Risk Level
  const riskFinancials = {
    'Low Risk': { totalLoan: 0, totalIncome: 0, count: 0 },
    'Medium Risk': { totalLoan: 0, totalIncome: 0, count: 0 },
    'High Risk': { totalLoan: 0, totalIncome: 0, count: 0 },
  };
  loans.forEach(l => {
    if (riskFinancials[l.riskPrediction]) {
      riskFinancials[l.riskPrediction].totalLoan += l.loanAmount || 0;
      riskFinancials[l.riskPrediction].totalIncome += l.income || 0;
      riskFinancials[l.riskPrediction].count++;
    }
  });

  const financialData = Object.keys(riskFinancials).map(risk => ({
    name: risk,
    avgLoan: riskFinancials[risk].count ? Math.round(riskFinancials[risk].totalLoan / riskFinancials[risk].count) : 0,
    avgIncome: riskFinancials[risk].count ? Math.round(riskFinancials[risk].totalIncome / riskFinancials[risk].count) : 0,
  }));

  // 3. AI Probability Score Trends (Chronological)
  const sortedLoans = [...loans].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const probabilityTrendData = sortedLoans.slice(-20).map((l, i) => ({
    index: `App #${i + 1}`,
    probability: Math.round(l.probabilityScore * 100),
    creditScore: l.creditScore,
    loanAmount: l.loanAmount,
    applicant: l.user?.name || 'Unknown'
  }));

  // Custom Tooltip for Financials
  const CustomFinancialTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-xl border border-slate-700 text-sm">
          <p className="font-bold mb-2">{label}</p>
          <p className="text-blue-400">Avg Loan Amount: {formatINR(payload[0].value)}</p>
          <p className="text-green-400">Avg Annual Income: {formatINR(payload[1].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI & Financial Analytics</h1>
        <p className="text-sm text-slate-500">In-depth visualizations of AI decision tree outcomes, risk distribution, and applicant financial profiles.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">AI Risk Classification Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
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

        {/* Avg Loan & Income by Risk Tier */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Average Financials by Risk Tier</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip content={<CustomFinancialTooltip />} />
                <Legend />
                <Bar dataKey="avgLoan" name="Avg Loan Amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="avgIncome" name="Avg Annual Income" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* AI Probability Score & Credit Score Correlation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">AI Risk Probability vs Credit Score</h3>
        <p className="text-sm text-slate-500 mb-6">Tracking the last 20 applications: higher probability indicates higher AI-assessed default risk.</p>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={probabilityTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="index" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                formatter={(value, name) => [name === 'probability' ? `${value}%` : value, name === 'probability' ? 'AI Default Probability' : 'Credit Score']}
              />
              <Legend />
              <Area type="monotone" dataKey="probability" name="AI Default Probability (%)" stroke="#ef4444" fillOpacity={0.2} fill="#ef4444" />
              <Area type="monotone" dataKey="creditScore" name="Credit Score" stroke="#3b82f6" fillOpacity={0.1} fill="#3b82f6" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
