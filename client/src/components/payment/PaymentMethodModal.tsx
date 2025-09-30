import React from 'react';
import { FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPaymentMethod: (method: 'Stripe' | 'Cash') => void;
  bidAmount: number;
}

const PaymentMethodModal = ({ isOpen, onClose, onSelectPaymentMethod, bidAmount }: PaymentMethodModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-2">Choose Payment Method</h2>
        <p className="text-slate-400 mb-6">
          You are about to assign this task for a total of <span className="font-bold text-yellow-400">₹{bidAmount.toLocaleString()}</span>.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => onSelectPaymentMethod('Stripe')}
            className="w-full p-4 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 text-left flex flex-col transition border border-slate-600 hover:border-yellow-400"
          >
            <div className="flex items-center gap-3">
              <FaCreditCard className="text-yellow-400" />
              <span>Pay with Card (Recommended)</span>
            </div>
            <span className="text-sm font-normal text-slate-400 mt-1 pl-7">Secure payment via Stripe. Funds are held until you confirm completion.</span>
          </button>

          <button
            onClick={() => onSelectPaymentMethod('Cash')}
            className="w-full p-4 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 text-left flex flex-col transition border border-slate-600 hover:border-yellow-400"
          >
            <div className="flex items-center gap-3">
                <FaMoneyBillWave className="text-green-400" />
                <span>Pay in Cash</span>
            </div>
            <span className="text-sm font-normal text-slate-400 mt-1 pl-7">You agree to pay the provider directly upon task completion.</span>
          </button>
        </div>

        <button onClick={onClose} className="w-full mt-6 py-2 text-sm text-slate-400 hover:underline">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PaymentMethodModal;