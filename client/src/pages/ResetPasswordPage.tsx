import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { resetPassword } from '../services/authServices';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match.");
    }
    if (!token) {
        return toast.error("Invalid or missing reset token.");
    }

    setIsSubmitting(true);
    try {
      const user = await resetPassword(password, token);
      toast.success('Password reset successfully! Logging you in...');
      // Manually log the user in with the new credentials from the backend response
      await login({ email: user.email, password: password });
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to reset password. The token may be invalid or expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles = "w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition";

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-slate-900 text-white">
      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Reset Your Password</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300">New Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={`mt-1 ${inputStyles}`} placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={`mt-1 ${inputStyles}`} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full px-4 py-3 font-bold text-slate-900 bg-yellow-400 rounded-lg hover:bg-yellow-500 disabled:opacity-50 transition-colors">
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;