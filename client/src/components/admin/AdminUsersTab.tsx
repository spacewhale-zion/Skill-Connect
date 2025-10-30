// client/src/components/admin/AdminUsersTab.tsx
import React from 'react';
import type { AuthUser } from '@/types';
import { FaUserSlash, FaUserCheck, FaSearch, FaUserCog, FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Added pagination icons

interface AdminUsersTabProps {
    users: AuthUser[]; // This is NOW just the users for the current page
    searchTerm: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onOpenSuspendConfirm: (userId: string, userName: string, isSuspended: boolean) => void;
    onOpenMakeAdminConfirm: (userId: string, userName: string) => void;
    formatDate: (dateString?: string) => string;
    // --- NEW PROPS ---
    currentPage: number;
    totalPages: number;
    totalCount: number;
    onPageChange: (newPage: number) => void;
}

const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
    users,
    searchTerm,
    onSearchChange,
    onOpenSuspendConfirm,
    onOpenMakeAdminConfirm,
    formatDate,
    // --- NEW PROPS ---
    currentPage,
    totalPages,
    totalCount,
    onPageChange,
}) => {

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    return (
        <div> {/* Wrapped in div to hold table and pagination */}
            {/* Search Bar */}
            <div className="p-4 bg-slate-800/50 sticky top-0 z-10 border-b border-slate-700 mb-2">
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={onSearchChange}
                        className="w-full p-2 pl-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition"
                    />
                </div>
            </div>
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status & Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Joined</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-slate-900 divide-y divide-slate-800">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-slate-800/50">
                                {/* Name */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white flex items-center gap-2">
                                    <img src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=32`} alt={user.name} className="w-6 h-6 rounded-full" />
                                    {user.name}
                                </td>
                                {/* Email */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{user.email}</td>
                                {/* Status & Role */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isSuspended ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                                        {user.isSuspended ? 'Suspended' : 'Active'}
                                    </span>
                                    {user.role === 'admin' && <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-500/20 text-indigo-300">Admin</span>}
                                    {user.role === 'user' && <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-600/50 text-slate-300">User</span>}
                                </td>
                                {/* Joined */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{formatDate(user.createdAt)}</td>
                                {/* Actions */}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    {/* Suspend Button */}
                                    <button
                                        onClick={() => onOpenSuspendConfirm(user._id, user.name, user.isSuspended)}
                                        disabled={user.role === 'admin'}
                                        className={`p-2 rounded ${user.isSuspended ? 'bg-green-600/50 hover:bg-green-500 text-green-200' : 'bg-yellow-600/50 hover:bg-yellow-500 text-yellow-200'} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                                        title={user.role === 'admin' ? 'Cannot suspend admin' : (user.isSuspended ? 'Unsuspend User' : 'Suspend User')}
                                    >
                                        {user.isSuspended ? <FaUserCheck /> : <FaUserSlash />}
                                    </button>
                                    {/* Make Admin Button */}
                                    {user.role !== 'admin' && (
                                        <button
                                            onClick={() => onOpenMakeAdminConfirm(user._id, user.name)}
                                            className="p-2 rounded bg-indigo-600/50 hover:bg-indigo-500 text-indigo-200 transition-colors"
                                            title="Make Admin"
                                        >
                                            <FaUserCog />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div> {/* End overflow-x-auto */}

            {users.length === 0 && !searchTerm && <p className="p-10 text-center text-slate-500">No users found.</p>}
            {users.length === 0 && searchTerm && <p className="p-10 text-center text-slate-500">No users match your search.</p>}
            
            {/* --- NEW: Pagination Controls --- */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center p-4 border-t border-slate-700 mt-4">
                    <span className="text-sm text-slate-400">
                        Page {currentPage} of {totalPages} (Total: {totalCount})
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="px-3 py-1 bg-slate-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition flex items-center gap-1"
                        >
                           <FaChevronLeft size={12}/> Prev
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 bg-slate-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition flex items-center gap-1"
                        >
                            Next <FaChevronRight size={12}/>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsersTab;