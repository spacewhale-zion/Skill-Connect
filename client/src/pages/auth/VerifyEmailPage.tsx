// src/pages/auth/VerifyEmailPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/authContext';
import { verifyEmailService } from '@/services/authServices'; // <-- Add this service function

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAfterVerification } = useAuth(); // Assuming you add this helper in context
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Attempt to get email from navigation state or prompt if missing
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
       // Maybe redirect to register or show error if no email provided
       toast.error("Email missing for verification.");
       // navigate('/register'); // Or handle differently
    }
  }, [location.state, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code) {
      toast.error("Please enter the code.");
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

  const inputStyles = "w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition text-center tracking-[1em]"; // Added text-center and tracking

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-slate-900 text-white">
      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Verify Your Email</h2>
          <p className="mt-2 text-slate-300">
            Enter the 6-digit code sent to <span className='font-semibold text-yellow-400'>{email}</span>.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="code" className="sr-only">Verification Code</label>
            <input
              id="code"
              type="text" // Keep as text to allow easy input
              maxLength={6} // Limit length
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))} // Allow only numbers
              required
              className={`mt-1 ${inputStyles}`}
              placeholder="------"
              autoComplete="one-time-code" // Helps with autofill
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-3 font-bold text-slate-900 bg-yellow-400 rounded-lg hover:bg-yellow-500 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
         <p className="text-sm text-center text-slate-400">
           Didn't receive a code? Check your spam folder or{' '}
          {/* Add resend functionality here if needed */}
          <button className="font-medium text-yellow-400 hover:underline">request a new one</button>.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;