import React from 'react';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPaymentMethod: (method: 'Stripe' | 'Cash') => void;
  bidAmount: number;
}

const PaymentMethodModal = ({ isOpen, onClose, onSelectPaymentMethod, bidAmount }: PaymentMethodModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Choose Payment Method</h2>
        <p className="text-gray-600 mb-6">
          You are about to assign this task for a total of <span className="font-bold">${bidAmount}</span>.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => onSelectPaymentMethod('Stripe')}
            className="w-full p-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 text-left flex flex-col"
          >
            <span>Pay with Card (Recommended)</span>
            <span className="text-sm font-normal text-indigo-200 mt-1">Secure payment via Stripe. Funds are held until you mark the task as complete.</span>
          </button>

          <button
            onClick={() => onSelectPaymentMethod('Cash')}
            className="w-full p-4 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 text-left flex flex-col"
          >
            <span>Pay in Cash</span>
            <span className="text-sm font-normal text-gray-600 mt-1">You agree to pay the provider in cash directly upon task completion.</span>
          </button>
        </div>

        <button onClick={onClose} className="w-full mt-6 py-2 text-sm text-gray-500 hover:underline">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PaymentMethodModal;