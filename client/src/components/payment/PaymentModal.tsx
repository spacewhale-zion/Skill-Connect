import { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY as string);

interface CheckoutFormProps {
  onSuccessfulPayment: () => void;
}

const CheckoutForm = ({ onSuccessfulPayment }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard`,
      },
      redirect: 'if_required' 
    });

    if (error) {
      setMessage(error.message || 'An unexpected error occurred.');
      setIsProcessing(false);
    } else {
      onSuccessfulPayment();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" />
      <button
        disabled={isProcessing || !stripe || !elements}
        className="w-full mt-8 py-3 bg-yellow-400 text-slate-900 font-bold rounded-lg hover:bg-yellow-500 disabled:opacity-50 transition"
      >
        {isProcessing ? 'Processing…' : 'Pay Now'}
      </button>

      {message && <div id="payment-message" className="text-sm text-red-400 mt-2 text-center">{message}</div>}
    </form>
  );
};

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientSecret: string;
  onPaymentSuccess: () => void;
}

const PaymentModal = ({ isOpen, onClose, clientSecret, onPaymentSuccess }: PaymentModalProps) => {
  if (!isOpen || !clientSecret) return null;

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'night', // Use Stripe's built-in dark theme
      variables: {
        colorPrimary: '#facc15', // Corresponds to Tailwind's yellow-400
        colorBackground: '#1e293b', // Corresponds to Tailwind's slate-800
        colorText: '#ffffff',
        colorDanger: '#f87171',
        fontFamily: 'Ideal Sans, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      }
    },
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">Confirm Payment</h2>
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm onSuccessfulPayment={onPaymentSuccess} />
        </Elements>
        <button onClick={onClose} className="w-full mt-4 py-2 text-sm text-slate-400 hover:underline">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;