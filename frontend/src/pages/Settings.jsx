import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Shield, Eye, EyeOff, Smartphone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function Toggle({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-600'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

export default function Settings() {
  const { updatePassword } = useAuth();
  const toast = useToast();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    twoFactor: false,
    darkMode: false,
    marketingEmails: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const toggle = (key) => setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleUpdatePassword = async () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('New passwords do not match');
      return;
    }

    setUpdatingPassword(true);
    try {
      await updatePassword(passwordForm.current, passwordForm.new);
      toast.success('Password updated successfully!');
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <SettingsIcon className="w-7 h-7 text-emerald-600" />
            Settings & Security
          </h1>
          <p className="text-sm text-amber-500 dark:text-amber-400 font-medium italic">“Because Every Loan Has a Hangover.”</p>
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-5">
            <Bell className="w-5 h-5 text-emerald-500" /> Notification Preferences
          </h2>
          <div className="space-y-4">
            {[
              { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email', icon: Mail },
              { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive updates via SMS', icon: Smartphone },
              { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications', icon: Bell },
              { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Offers and product updates', icon: Mail },
            ].map(({ key, label, desc, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-center border border-emerald-500/20">
                    <Icon className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
                  </div>
                </div>
                <Toggle enabled={settings[key]} onToggle={() => toggle(key)} />
              </div>
            ))}
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-5">
            <Shield className="w-5 h-5 text-emerald-500" /> Security
          </h2>
          <div className="flex items-center justify-between mb-6 py-2 border-b border-slate-100 dark:border-slate-700/50 pb-6">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Two-Factor Authentication</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Add an extra layer of security to your account</p>
            </div>
            <Toggle enabled={settings.twoFactor} onToggle={() => toggle('twoFactor')} />
          </div>

          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Change Password</h3>
          <div className="space-y-4">
            {[
              { name: 'current', placeholder: 'Current Password' },
              { name: 'new', placeholder: 'New Password' },
              { name: 'confirm', placeholder: 'Confirm New Password' },
            ].map(({ name, placeholder }) => (
              <div key={name} className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={placeholder}
                  value={passwordForm[name]}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, [name]: e.target.value }))}
                  className="w-full px-4 py-3 pr-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors shadow-inner"
                />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            ))}
            <button
              onClick={handleUpdatePassword}
              disabled={updatingPassword}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 rounded-xl text-sm font-semibold transition-all mt-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {updatingPassword ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating Password...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30 p-6">
          <h2 className="text-base font-bold text-red-600 mb-4">Danger Zone</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
          <button className="bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            Delete Account
          </button>
        </div>
      </motion.div>
    </div>
  );
}
