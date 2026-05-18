import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, Activity, TrendingUp, Lock } from 'lucide-react';

export default function LandingPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex-grow flex flex-col items-center overflow-hidden bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex flex-col lg:flex-row items-center justify-between">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-black dark:from-emerald-950/30 dark:via-slate-950 dark:to-black"></div>
        
        <motion.div 
          className="lg:w-1/2 text-center lg:text-left z-10"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-6 text-sm font-semibold tracking-wide backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Premium Fintech & AI Decision Engine
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Risk & Tonic <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400">
              AI Credit Intelligence
            </span>
          </h1>
          <p className="text-2xl font-medium text-amber-400/90 mb-4 italic">
            “Because Every Loan Has a Hangover.”
          </p>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Pour your financial data into our advanced Decision Tree cocktail. Get crystal-clear risk predictions, zero fluff, and enterprise-grade underwriting instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link to="/register" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105">
              Apply for Loan
            </Link>
            <Link to="/employee-login" className="bg-slate-800/80 backdrop-blur-md text-slate-200 border border-slate-700 hover:bg-slate-800 hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-sm hover:border-slate-600">
              Employee Access
            </Link>
          </div>
        </motion.div>

        <motion.div 
          className="lg:w-1/2 mt-16 lg:mt-0 relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative rounded-3xl bg-slate-900/80 backdrop-blur-xl shadow-2xl p-8 border border-slate-700/60 overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/30 rounded-full mix-blend-screen filter blur-2xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-amber-500/20 rounded-full mix-blend-screen filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
            
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span className="font-semibold text-slate-200 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" /> Risk & Tonic Engine
                </span>
                <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                  99.8% Underwriting Accuracy
                </span>
              </div>
              <div className="flex items-end gap-4 h-36 pt-4">
                <div className="w-1/3 bg-slate-800 rounded-t-xl p-3 flex flex-col justify-end border-t border-slate-700">
                  <span className="text-[10px] text-slate-400 mb-1 block">Data Intake</span>
                  <div className="h-12 bg-emerald-500/20 rounded-lg border border-emerald-500/30"></div>
                </div>
                <div className="w-1/3 bg-slate-800 rounded-t-xl p-3 flex flex-col justify-end border-t border-slate-700">
                  <span className="text-[10px] text-slate-400 mb-1 block">Decision Tree</span>
                  <div className="h-20 bg-emerald-500/40 rounded-lg border border-emerald-500/50"></div>
                </div>
                <div className="w-1/3 bg-slate-800 rounded-t-xl p-3 flex flex-col justify-end border-t border-slate-700">
                  <span className="text-[10px] text-slate-400 mb-1 block">Risk Output</span>
                  <div className="h-28 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-lg shadow-lg shadow-emerald-500/20"></div>
                </div>
              </div>
              <div className="pt-4 flex justify-between items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                 <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Cocktail Classification</p>
                    <p className="text-2xl font-extrabold text-emerald-400 flex items-center gap-2 mt-0.5">
                      Low Risk Profile
                    </p>
                 </div>
                 <ShieldCheck className="w-10 h-10 text-emerald-400 flex-shrink-0" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-slate-900/60 border-t border-b border-slate-800 py-24 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose Risk & Tonic?</h2>
            <p className="text-lg text-slate-400">Premium fintech tools mixed with state-of-the-art decision tree analytics.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Activity className="w-8 h-8 text-emerald-400" />}
              title="Real-Time Cocktails"
              desc="Monitor loan applications, risk tiers, and default probabilities in real-time with elegant fintech dashboards."
            />
            <FeatureCard 
              icon={<TrendingUp className="w-8 h-8 text-amber-400" />}
              title="AI Decision Trees"
              desc="Our advanced Machine Learning model evaluates dozens of financial factors to provide highly accurate risk assessments."
            />
            <FeatureCard 
              icon={<Lock className="w-8 h-8 text-teal-400" />}
              title="Top-Shelf Security"
              desc="Enterprise-grade encryption ensures your financial data stays locked down tighter than a premium distillery."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800 bg-slate-950 py-12 mt-auto z-10">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
          <p className="text-lg font-bold text-slate-200">Risk & Tonic</p>
          <p className="text-sm text-amber-400/80 italic">“Because Every Loan Has a Hangover.”</p>
          <p className="text-xs text-slate-500">© 2026 Risk & Tonic AI Fintech. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-slate-900/80 p-8 rounded-2xl shadow-lg border border-slate-700/50 hover:border-slate-600 transition-all"
    >
      <div className="bg-emerald-500/10 border border-emerald-500/20 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{desc}</p>
    </motion.div>
  );
}
