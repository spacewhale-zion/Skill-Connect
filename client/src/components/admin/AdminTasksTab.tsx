import React, { useState, useMemo } from 'react'; // Import useState and useMemo
import { Link } from 'react-router-dom';
import type { Task } from '@/types';
import { FaTrash, FaExternalLinkAlt, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Import pagination icons

// Define items per page
const ITEMS_PER_PAGE = 30;

interface AdminTasksTabProps {
    tasks: Task[]; // Accept the full list
    searchTerm: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDeleteTask: (taskId: string, taskTitle: string) => void;
    formatDate: (dateString?: string) => string;
}

const AdminTasksTab: React.FC<AdminTasksTabProps> = ({
    tasks, // Full filtered list
    searchTerm,
    onSearchChange,
    onDeleteTask,
    formatDate,
}) => {
    const [currentPage, setCurrentPage] = useState(1);

    // Calculate pagination variables
    const totalPages = Math.ceil(tasks.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    // Get the tasks for the current page
    const currentTasks = useMemo(() => tasks.slice(startIndex, endIndex), [tasks, startIndex, endIndex]);

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    // Reset to page 1 when search term changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);


    return (
        <div> {/* Wrap content in a div */}
            {/* Search Bar */}
            <div className="p-4 bg-slate-800/50 sticky top-0 z-10 border-b border-slate-700 mb-2">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search tasks by title, user, category, status..."
                        value={searchTerm}
                        onChange={onSearchChange}
                        className="w-full p-2 pl-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition"
                    />
                </div>
            </div>
            {/* Table */}
            <div className="overflow-x-auto"> {/* Added overflow-x-auto here */}
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Seeker</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Provider</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Created</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-slate-900 divide-y divide-slate-800">
                        {currentTasks.map((task) => ( // Use currentTasks here
                            <tr key={task._id} className="hover:bg-slate-800/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{task.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{task.taskSeeker?.name || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{task.assignedProvider?.name || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{task.status || 'Unknown'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{formatDate(task.createdAt)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <Link
                                        to={`/tasks/${task._id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded inline-flex items-center bg-blue-600/50 hover:bg-blue-500 text-blue-200 transition-colors"
                                        title="View Task Details"
                                    >
                                        <FaExternalLinkAlt size={12} />
                                    </Link>
                                    <button
                                        onClick={() => onDeleteTask(task._id, task.title)}
                                        className="p-2 rounded bg-red-600/50 hover:bg-red-500 text-red-200 transition-colors"
                                        title="Delete Task"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div> {/* End overflow-x-auto */}
             {tasks.length === 0 && !searchTerm && <p className="p-10 text-center text-slate-500">No tasks found.</p>}
            {tasks.length === 0 && searchTerm && <p className="p-10 text-center text-slate-500">No tasks match your search.</p>}


            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center p-4 border-t border-slate-700 mt-4">
                    <span className="text-sm text-slate-400">
                        Page {currentPage} of {totalPages} (Total: {tasks.length})
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

export default AdminTasksTab;
