import React from 'react';
import { Link } from 'react-router-dom';
import type { AuthUser } from '@/types';
import { FaUserSlash, FaUserCheck, FaSearch } from 'react-icons/fa';

interface AdminUsersTabProps {
    users: AuthUser[];
    searchTerm: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onToggleSuspend: (userId: string) => void;
    formatDate: (dateString?: string) => string;
}

const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
    users,
    searchTerm,
    onSearchChange,
    onToggleSuspend,
    formatDate,
}) => {
    return (
        <div className="overflow-x-auto">
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
            <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-800">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Joined</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-slate-900 divide-y divide-slate-800">
                    {users.map((user) => (
                        <tr key={user._id} className="hover:bg-slate-800/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white flex items-center gap-2">
                                <img src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=32`} alt={user.name} className="w-6 h-6 rounded-full" />
                                {user.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isSuspended ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                                    {user.isSuspended ? 'Suspended' : 'Active'}
                                </span>
                                {user.role === 'admin' && <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-500/20 text-blue-300">Admin</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{formatDate(user.createdAt)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <button
                                    onClick={() => onToggleSuspend(user._id)}
                                    disabled={user.role === 'admin'}
                                    className={`p-2 rounded ${user.isSuspended ? 'bg-green-600/50 hover:bg-green-500 text-green-200' : 'bg-yellow-600/50 hover:bg-yellow-500 text-yellow-200'} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                                    title={user.role === 'admin' ? 'Cannot suspend admin' : (user.isSuspended ? 'Unsuspend User' : 'Suspend User')}
                                >
                                    {user.isSuspended ? <FaUserCheck /> : <FaUserSlash />}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {users.length === 0 && <p className="p-10 text-center text-slate-500">No users match your search.</p>}
        </div>
    );
};

export default AdminUsersTab;