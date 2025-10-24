import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

type DeletionTarget = {
    id: string;
    title: string;
    type: 'task' | 'service';
} | null;

interface AdminDeleteConfirmationModalProps {
    isOpen: boolean;
    itemToDelete: DeletionTarget;
    onConfirm: () => void;
    onCancel: () => void;
}

const AdminDeleteConfirmationModal: React.FC<AdminDeleteConfirmationModalProps> = ({
    isOpen,
    itemToDelete,
    onConfirm,
    onCancel,
}) => {
    if (!isOpen || !itemToDelete) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-8 w-full max-w-md">
                <div className="flex items-center justify-center mb-4">
                    <FaExclamationTriangle className="text-red-500 text-4xl" />
                </div>
                <h2 className="text-xl font-bold text-white text-center mb-2">Confirm Deletion</h2>
                <p className="text-slate-300 text-center mb-6">
                    Are you sure you want to permanently delete the {itemToDelete.type}{' '}
                    <span className="font-semibold text-yellow-400">"{itemToDelete.title}"</span>?
                    This action cannot be undone.
                </p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-md hover:bg-slate-500 transition duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-500 transition duration-200"
                    >
                        Confirm Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDeleteConfirmationModal;