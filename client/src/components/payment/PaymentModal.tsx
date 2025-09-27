// spacewhale-zion/skill-connect/Skill-Connect-6ff14bc1e35fe2984b9bfa9c060b6b7639e02145/client/src/components/payment/PaymentModal.tsx
import { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

interface CheckoutFormProps {
  onSuccessfulPayment: () => void;
  clientSecret: string;
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
    // Immediately retrieve the PaymentIntent to check its status upon loading
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      
        console.log(paymentIntent?.status );
      switch (paymentIntent?.status) {

        case "succeeded":
          // If already paid, trigger success immediately.
          onSuccessfulPayment();
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          // This is the normal, expected state. Clear any previous messages.
          setMessage(null);
          break;
        default:
          setMessage("Something went wrong. Please try again.");
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
        // Redirect back to the dashboard after payment is confirmed by Stripe
        return_url: `${window.location.origin}/dashboard`,
      },
      // This option tells Stripe to handle the redirect only if required for authentication (like 3D Secure)
      // If not required, the promise will resolve here after success.
      redirect: 'if_required' 
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || 'An unexpected error occurred.');
      } else {
        setMessage("An unexpected error occurred.");
      }
      setIsProcessing(false);
    } else {
      // If confirmPayment resolves without an error, it was successful.
      onSuccessfulPayment();
      // No need to set isProcessing to false here, as the modal will close.
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" />
      <button
        disabled={isProcessing || !stripe || !elements}
        className="w-full mt-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
      >
        {isProcessing ? 'Processing…' : 'Pay Now'}
      </button>

      {/* Show any error or status messages */}
      {message && <div id="payment-message" className="text-sm text-red-500 mt-2 text-center">{message}</div>}
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
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Confirm Payment</h2>
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