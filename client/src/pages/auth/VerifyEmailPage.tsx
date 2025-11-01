// src/pages/auth/VerifyEmailPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/authContext';
import { verifyEmailService, resendVerificationService } from '@/services/authServices';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); // <-- 1. Re-add useLocation
  const { loginAfterVerification } = useAuth();
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isEmailFromState, setIsEmailFromState] = useState(false); // <-- 2. Re-add state tracker

  // 3. Re-add this effect to pre-fill email
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
      setIsEmailFromState(true);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code) {
      toast.error("Please enter both your email and the code.");
      return;
    }
    setIsSubmitting(true);
    try {
      const userData = await verifyEmailService(email, code);
      loginAfterVerification(userData); // Use context to set user state and token
      toast.success('Email verified successfully! Welcome!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed. Invalid or expired code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error("Please enter your email address above to resend the code.");
      return;
    }
    setIsResending(true);
    try {
      const { message } = await resendVerificationService(email);
      toast.success(message);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  const inputStyles = "w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition";
  const codeInputStyles = `${inputStyles} text-center tracking-[0.5em] placeholder:tracking-normal`;

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-slate-900 text-white">
      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Verify Your Email</h2>
          <p className="mt-2 text-slate-300">
            {/* 4. Make text conditional */}
            {isEmailFromState
              ? `Enter the 6-digit code sent to ${email}.`
              : "Enter your email and the 6-digit code we sent you."}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              readOnly={isEmailFromState} // 5. Make it read-only if pre-filled
              className={`mt-1 ${inputStyles} ${isEmailFromState ? 'bg-slate-800 cursor-not-allowed' : ''}`}
              placeholder="you@example.com"
            />
          </div>
          
          {/* 6. Remove the "Send code" button from here */}

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-slate-300 mb-1">Verification Code</label>
            <input
              id="code"
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              required
              className={`mt-1 ${codeInputStyles}`}
              placeholder="------"
              autoComplete="one-time-code"
            />
          </div>
          <button
            type="submit" // This is the only submit button now
            disabled={isSubmitting}
            className="w-full px-4 py-3 font-bold text-slate-900 bg-yellow-400 rounded-lg hover:bg-yellow-500 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
        <p className="text-sm text-center text-slate-400">
          Didn't receive a code? Check your spam folder or{' '}
          <button
            type="button" // Set type to "button" to prevent form submission
            onClick={handleResendCode}
            disabled={isResending}
            className="font-medium text-yellow-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? 'Sending...' : 'request a new one'}
          </button>.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;