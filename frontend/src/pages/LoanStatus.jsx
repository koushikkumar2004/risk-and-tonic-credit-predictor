import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { formatINR } from '../utils/format';

export default function LoanStatus() {
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Application History</h1>
        <p className="text-slate-500">Track the status and AI predictions of your loan applications.</p>
      </div>

      <div className="space-y-4">
        {loans.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm text-center text-slate-500">
            No loan applications found.
          </div>
        ) : (
          loans.map((loan, index) => (
            <motion.div 
              key={loan._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div>
                <p className="text-sm text-slate-500">Applied on {new Date(loan.createdAt).toLocaleDateString()}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{formatINR(loan.loanAmount)}</p>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-sm text-slate-500">AI Risk Prediction</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${
                    loan.riskPrediction === 'Low Risk' ? 'bg-green-100 text-green-700' :
                    loan.riskPrediction === 'Medium Risk' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {loan.riskPrediction} ({(loan.probabilityScore * 100).toFixed(1)}%)
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm text-slate-500">Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium w-fit capitalize ${
                    loan.status === 'approved' ? 'bg-green-100 text-green-700' :
                    loan.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {loan.status}
                </span>
              </div>
              
              {loan.comments && (
                <div className="w-full md:w-auto mt-4 md:mt-0 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border">
                  <strong>Notes:</strong> {loan.comments}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
