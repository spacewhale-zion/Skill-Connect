import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { forgotPassword } from '@/services/authServices';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      toast.success('A password reset link has been sent to your email!');
    } catch (error) {
      toast.error('Failed to send reset link. Please check the email and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles = "w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition";

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-slate-900 text-white">
      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Forgot Password</h2>
          <p className="mt-2 text-slate-300">Enter your email to receive a reset link.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={`mt-1 ${inputStyles}`} placeholder="you@example.com" />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full px-4 py-3 font-bold text-slate-900 bg-yellow-400 rounded-lg hover:bg-yellow-500 disabled:opacity-50 transition-colors">
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
         <p className="text-sm text-center text-slate-300">
          Remembered your password?{' '}
          <Link to="/login" className="font-medium text-yellow-400 hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;