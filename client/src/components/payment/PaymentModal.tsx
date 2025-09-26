// client/src/components/payment/PaymentModal.tsx
import { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';

// Make sure to replace this with your publishable key
console.log(import.meta.env.VITE_STRIPE_KEY)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY );

interface CheckoutFormProps {
  onSuccessfulPayment: () => void;
}

const CheckoutForm = ({ onSuccessfulPayment }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast.error(error.message || 'An unexpected error occurred.');
    } else {
      onSuccessfulPayment();
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        disabled={isProcessing || !stripe || !elements}
        className="w-full mt-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700"
      >
        {isProcessing ? 'Processing…' : 'Pay Now'}
      </button>
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
  if (!isOpen) return null;

  const options = {
    clientSecret,
  };

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-0 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Payment</h2>
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm onSuccessfulPayment={onPaymentSuccess} />
        </Elements>
        <button onClick={onClose} className="w-full mt-4 py-2 text-gray-600">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;