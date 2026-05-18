import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { ShieldAlert, Check, X, TrendingUp, Users, FileText } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function EmployeeDashboard() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [comments, setComments] = useState({});

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

  const handleAction = async (id, status) => {
    setActionLoading(true);
    try {
      await api.put(`/loan/${id}/status`, { status, comments: comments[id] || '' });
      fetchLoans();
    } catch (error) {
      console.error('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCommentChange = (id, value) => {
    setComments(prev => ({ ...prev, [id]: value }));
  };

  // Stats
  const totalApps = loans.length;
  const pendingApps = loans.filter(l => l.status === 'pending').length;
  const highRiskApps = loans.filter(l => l.riskPrediction === 'High Risk').length;
  
  const riskData = [
    { name: 'Low Risk', value: loans.filter(l => l.riskPrediction === 'Low Risk').length },
    { name: 'Medium Risk', value: loans.filter(l => l.riskPrediction === 'Medium Risk').length },
    { name: 'High Risk', value: loans.filter(l => l.riskPrediction === 'High Risk').length },
  ];
  const COLORS = ['#22c55e', '#eab308', '#ef4444'];

  if (loading) return <div>Loading Admin Dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin / Employee Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
             <p className="text-sm text-slate-500">Total Applications</p>
             <p className="text-2xl font-bold">{totalApps}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg"><FileText className="text-blue-600" /></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
             <p className="text-sm text-slate-500">Pending Review</p>
             <p className="text-2xl font-bold text-yellow-600">{pendingApps}</p>
          </div>
          <div className="bg-yellow-100 p-3 rounded-lg"><TrendingUp className="text-yellow-600" /></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
             <p className="text-sm text-slate-500">High Risk Alerts</p>
             <p className="text-2xl font-bold text-red-600">{highRiskApps}</p>
          </div>
          <div className="bg-red-100 p-3 rounded-lg"><ShieldAlert className="text-red-600" /></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
             <p className="text-sm text-slate-500">Total Customers</p>
             <p className="text-2xl font-bold text-indigo-600">{new Set(loans.map(l => l.user?._id)).size}</p>
          </div>
          <div className="bg-indigo-100 p-3 rounded-lg"><Users className="text-indigo-600" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Risk Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-80">
          <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
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
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Applications Table */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:col-span-2 overflow-hidden flex flex-col">
          <h3 className="text-lg font-semibold mb-4">Recent Applications Review</h3>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3 rounded-tl-lg">Applicant</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Credit Score</th>
                  <th className="p-3">AI Risk Level</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-tr-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loans.slice(0, 10).map((loan) => (
                  <tr key={loan._id} className="hover:bg-slate-50">
                    <td className="p-3 font-medium">{loan.user?.name || 'Unknown'}</td>
                    <td className="p-3">${loan.loanAmount}</td>
                    <td className="p-3">{loan.creditScore}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        loan.riskPrediction === 'Low Risk' ? 'bg-green-100 text-green-700' :
                        loan.riskPrediction === 'Medium Risk' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {loan.riskPrediction} ({(loan.probabilityScore * 100).toFixed(0)}%)
                      </span>
                    </td>
                    <td className="p-3 capitalize">{loan.status}</td>
                    <td className="p-3 text-right">
                      {loan.status === 'pending' && (
                        <div className="flex flex-col items-end gap-2">
                          <input 
                            type="text" 
                            placeholder="Add notes..." 
                            className="text-xs border rounded p-1 w-32"
                            value={comments[loan._id] || ''}
                            onChange={(e) => handleCommentChange(loan._id, e.target.value)}
                          />
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleAction(loan._id, 'approved')}
                              disabled={actionLoading}
                              className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleAction(loan._id, 'rejected')}
                              disabled={actionLoading}
                              className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
