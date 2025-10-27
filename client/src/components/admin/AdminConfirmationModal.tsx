import React from 'react';
import { FaQuestionCircle, FaExclamationTriangle } from 'react-icons/fa'; // Added FaQuestionCircle

interface AdminConfirmationModalProps {
    isOpen: boolean;
    title: string;          // More generic title
    message: React.ReactNode; // Allow JSX for richer messages
    confirmText?: string;   // Optional custom confirm button text
    cancelText?: string;    // Optional custom cancel button text
    iconType?: 'warning' | 'info'; // Choose icon
    onConfirm: () => void;
    onCancel: () => void;
}

const AdminConfirmationModal: React.FC<AdminConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    iconType = 'info', // Default to info icon
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    const IconComponent = iconType === 'warning' ? FaExclamationTriangle : FaQuestionCircle;
    const iconColor = iconType === 'warning' ? 'text-red-500' : 'text-sky-500';

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-8 w-full max-w-md">
                <div className="flex items-center justify-center mb-4">
                    <IconComponent className={`${iconColor} text-4xl`} />
                </div>
                <h2 className="text-xl font-bold text-white text-center mb-2">{title}</h2>
                <div className="text-slate-300 text-center mb-6"> {/* Changed p to div for ReactNode */}
                    {message}
                </div>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-md hover:bg-slate-500 transition duration-200"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-6 py-2 ${iconType === 'warning' ? 'bg-red-600 hover:bg-red-500' : 'bg-indigo-600 hover:bg-indigo-500'} text-white font-semibold rounded-md transition duration-200`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminConfirmationModal;