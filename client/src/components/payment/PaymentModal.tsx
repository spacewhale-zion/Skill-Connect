import { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe, StripeError } from '@stripe/stripe-js';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface CheckoutFormProps {
  onSuccessfulPayment: () => void;
  clientSecret: string; // Pass clientSecret to the form
}

const CheckoutForm = ({ onSuccessfulPayment, clientSecret }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!stripe) {
      return;
    }
    // Retrieve the PaymentIntent to check its status
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          onSuccessfulPayment();
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          // This is the expected state, do nothing
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe, clientSecret, onSuccessfulPayment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard`,
      },
      // If you want to handle the redirect manually instead of Stripe doing it
      // redirect: 'if_required' 
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || 'An unexpected error occurred.');
      } else {
        setMessage("An unexpected error occurred.");
      }
    } else {
        // This point is typically only reached if redirect: 'if_required' is used
        onSuccessfulPayment();
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        disabled={isProcessing || !stripe || !elements}
        className="w-full mt-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
      >
        {isProcessing ? 'Processing…' : 'Pay Now'}
      </button>

      {/* Show any error or success messages */}
      {message && <div id="payment-message" className="text-sm text-red-500 mt-2">{message}</div>}
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

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Payment</h2>
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm onSuccessfulPayment={onPaymentSuccess} clientSecret={clientSecret} />
        </Elements>
        <button onClick={onClose} className="w-full mt-4 py-2 text-sm text-gray-600 hover:underline">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;