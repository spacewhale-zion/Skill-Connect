// client/src/pages/admin/AdminPage.tsx
import { useAdminPage } from '@/hooks/admin/useAdminPage'; // <-- Import the custom hook
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import AdminOverviewTab from '@/components/admin/AdminOverviewTab';
import AdminTasksTab from '@/components/admin/AdminTasksTab';
import AdminUsersTab from '@/components/admin/AdminUsersTab';
import AdminServicesTab from '@/components/admin/AdminServicesTab';
import AdminDeleteConfirmationModal from '@/components/admin/AdminDeleteConfirmationModal';
import AdminConfirmationModal from '@/components/admin/AdminConfirmationModal';

// Helper to format dates consistently
const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
        return 'Invalid Date';
    }
};

const AdminPage = () => {
    // --- Call the custom hook to get all state and handlers ---
    const {
        users,
        tasks,
        stats,
        isLoading, // This is for paginated tabs
        isLoadingStats, // This is for the *initial* page load
        isLoadingCharts, // This is for the overview charts
        activeTab,
        setActiveTab,
        monthlyRevenueData,
        taskStatusData,
        userSignupData,
        userPage,
        userTotalPages,
        userCount,
        userSearchInput,
        setUserSearchInput,
        setUserPage,
        openSuspendConfirmModal,
        openMakeAdminConfirmModal,
        taskPage,
        taskTotalPages,
        taskCount,
        taskSearchInput,
        setTaskSearchInput,
        setTaskPage,
        handleDeleteTask,
       services,
        servicePage,
        serviceTotalPages,
        serviceCount,
        serviceSearchInput,
        setServiceSearchInput,
        setServicePage,
        handleDeleteService,
        showDeleteModal,
        itemToDelete,
        confirmDelete,
        cancelDelete,
        showMakeAdminModal,
        userToMakeAdmin,
        confirmMakeAdmin,
        cancelMakeAdmin,
        showSuspendModal,
        userToSuspend,
        confirmSuspend,
        cancelSuspend
    } = useAdminPage();

    // --- Render ---
    // Show main loader *only* if stats are loading (initial load)
    if (isLoadingStats) { 
        return (
            <div className="bg-slate-900 min-h-screen text-white flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-900 text-white">
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-4xl font-extrabold text-white mb-8">Admin Dashboard</h1>

                {/* Tabs Navigation */}
                <div className="border-b border-slate-700 mb-6">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto pb-px scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                        <button onClick={() => setActiveTab('overview')} className={`flex-shrink-0 py-4 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-300 hover:text-white'}`}>
                            Overview
                        </button>
                        <button onClick={() => setActiveTab('users')} className={`flex-shrink-0 py-4 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'users' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-300 hover:text-white'}`}>
                            Manage Users ({userCount})
                        </button>
                        <button onClick={() => setActiveTab('tasks')} className={`flex-shrink-0 py-4 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'tasks' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-300 hover:text-white'}`}>
                            Manage Tasks ({taskCount})
                        </button>
                        <button onClick={() => setActiveTab('services')} className={`flex-shrink-0 py-4 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'services' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-300 hover:text-white'}`}>
                            Manage Services ({serviceCount})
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg shadow-lg min-h-[400px] relative">
                    {activeTab === 'overview' && (
                        <AdminOverviewTab
                            stats={stats}
                            userSignupData={userSignupData}
                            taskStatusData={taskStatusData}
                            monthlyRevenueData={monthlyRevenueData}
                            isLoading={isLoadingCharts} // <-- Pass the chart loader
                        />
                    )}
                    {activeTab === 'users' && (
                        <AdminUsersTab
                            users={users}
                            searchTerm={userSearchInput}
                            onSearchChange={e => setUserSearchInput(e.target.value)}
                            onOpenSuspendConfirm={openSuspendConfirmModal}
                            onOpenMakeAdminConfirm={openMakeAdminConfirmModal}
                            formatDate={formatDate}
                            currentPage={userPage}
                            totalPages={userTotalPages}
                            totalCount={userCount}
                            onPageChange={setUserPage}
                        />
                    )}
                    {activeTab === 'tasks' && (
                        <AdminTasksTab
                            tasks={tasks}
                            searchTerm={taskSearchInput}
                            onSearchChange={e => setTaskSearchInput(e.target.value)}
                            onDeleteTask={handleDeleteTask}
                            formatDate={formatDate}
                            currentPage={taskPage}
                            totalPages={taskTotalPages}
                            totalCount={taskCount}
                            onPageChange={setTaskPage}
                        />
                    )}
                  {activeTab === 'services' && (
                        <AdminServicesTab
                            services={services}
                            searchTerm={serviceSearchInput}
                            onSearchChange={e => setServiceSearchInput(e.target.value)}
                            onDeleteService={handleDeleteService}
                            formatDate={formatDate}
                            currentPage={servicePage}
                            totalPages={serviceTotalPages}
                            totalCount={serviceCount}
                            onPageChange={setServicePage}
                        />
                    )}

                    {/* Show overlay loader for paginated data fetching */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-slate-800/50 flex items-center justify-center z-20">
                            <LoadingSpinner />
                        </div>
                    )}
                </div>
            </main>

            {/* Modals */}
            <AdminDeleteConfirmationModal
                isOpen={showDeleteModal}
                itemToDelete={itemToDelete}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
            <AdminConfirmationModal
                isOpen={showMakeAdminModal}
                title="Confirm Admin Promotion"
                message={
                    <>
                        Are you sure you want to promote{' '}
                        <span className="font-semibold text-yellow-400">{userToMakeAdmin?.name}</span>{' '}
                        to an admin? This action grants significant permissions and cannot be easily undone.
                    </>
                }
                confirmText="Make Admin"
                iconType="warning"
                onConfirm={confirmMakeAdmin}
                onCancel={cancelMakeAdmin}
            />
            <AdminConfirmationModal
                isOpen={showSuspendModal}
                title={userToSuspend?.isSuspended ? "Confirm Unsuspend" : "Confirm Suspend"}
                message={
                    <>
                        Are you sure you want to {userToSuspend?.isSuspended ? 'unsuspend' : 'suspend'}{' '}
                        <span className="font-semibold text-yellow-400">{userToSuspend?.name}</span>?
                    </>
                }
                confirmText={userToSuspend?.isSuspended ? "Unsuspend" : "Suspend"}
                iconType="warning"
                onConfirm={confirmSuspend}
                onCancel={cancelSuspend}
            />
        </div>
    );
};

export default AdminPage;