import React, { useState, useMemo } from 'react'; // Import useState and useMemo
import { Link } from 'react-router-dom';
import type { Service } from '@/types';
import { FaTrash, FaExternalLinkAlt, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Import pagination icons

// Define items per page
const ITEMS_PER_PAGE = 30;

interface AdminServicesTabProps {
    services: Service[]; // Accept the full list
    searchTerm: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDeleteService: (serviceId: string, serviceTitle: string) => void;
    formatDate: (dateString?: string) => string;
}

const AdminServicesTab: React.FC<AdminServicesTabProps> = ({
    services, // Full filtered list
    searchTerm,
    onSearchChange,
    onDeleteService,
    formatDate,
}) => {
    const [currentPage, setCurrentPage] = useState(1);

    // Calculate pagination variables
    const totalPages = Math.ceil(services.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    // Get the services for the current page
    const currentServices = useMemo(() => services.slice(startIndex, endIndex), [services, startIndex, endIndex]);

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
                        placeholder="Search services by title, provider, category..."
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
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Provider</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Price (₹)</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Created</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-slate-900 divide-y divide-slate-800">
                        {currentServices.map((service) => ( // Use currentServices here
                            <tr key={service._id} className="hover:bg-slate-800/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{service.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{service.provider?.name || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{service.price}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${service.isActive ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                        {service.isActive ? 'Active' : 'Booked/Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{formatDate(service.createdAt)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <Link
                                        to={`/services/${service._id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded inline-flex items-center bg-blue-600/50 hover:bg-blue-500 text-blue-200 transition-colors"
                                        title="View Service Details"
                                    >
                                        <FaExternalLinkAlt size={12} />
                                    </Link>
                                    <button
                                        onClick={() => onDeleteService(service._id, service.title)}
                                        className="p-2 rounded bg-red-600/50 hover:bg-red-500 text-red-200 transition-colors"
                                        title="Delete Service"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div> {/* End overflow-x-auto */}
             {services.length === 0 && !searchTerm && <p className="p-10 text-center text-slate-500">No services found.</p>}
            {services.length === 0 && searchTerm && <p className="p-10 text-center text-slate-500">No services match your search.</p>}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center p-4 border-t border-slate-700 mt-4">
                    <span className="text-sm text-slate-400">
                        Page {currentPage} of {totalPages} (Total: {services.length})
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

export default AdminServicesTab;
