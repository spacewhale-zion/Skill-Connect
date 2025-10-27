import React, { useState } from 'react'; // Import useState
import StatCard from '@/components/dasboard/StatCard';
import { AdminStats } from '@/services/adminServices';
import { FaUsers, FaTasks, FaClipboardCheck, FaConciergeBell, FaRupeeSign, FaChartBar, FaChartPie, FaCalendarAlt } from 'react-icons/fa'; // Added chart icons
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, PieLabelRenderProps } from 'recharts';

interface AdminOverviewTabProps {
    stats: AdminStats | null;
    userSignupData: { name: string; users: number }[];
    taskStatusData: { name: string; value: number }[];
    monthlyRevenueData: { name: string; revenue: number }[];
}

const COLORS = ['#38bdf8', '#f472b6', '#facc15', '#34d399', '#fb7185', '#a78bfa'];
const REVENUE_COLOR = '#82ca9d';

// Define the possible chart types
type ChartType = 'signups' | 'revenue' | 'status';

const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({ stats, userSignupData, taskStatusData, monthlyRevenueData }) => {
    // State to manage the currently selected chart
    const [selectedChart, setSelectedChart] = useState<ChartType>('signups');

    // Add console log to check data props
    console.log("AdminOverviewTab - Props Data:", { userSignupData, taskStatusData, monthlyRevenueData });

    const renderChart = () => {
        switch (selectedChart) {
            case 'signups':
                return (
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 h-[400px]">
                        <h3 className="text-lg font-semibold text-white mb-4">User Signups This Year</h3>
                        <ResponsiveContainer width="100%" height="90%">
                            {userSignupData.length > 0 ? (
                                <BarChart data={userSignupData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.5} />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                    <YAxis stroke="#94a3b8" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', borderRadius: '4px' }}
                                        labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                                        itemStyle={{ color: '#facc15' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    <Bar dataKey="users" fill="#facc15" name="New Users" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-500">No user data for chart.</div>
                            )}
                        </ResponsiveContainer>
                    </div>
                );

            case 'revenue':
                return (
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 h-[400px]">
                        <h3 className="text-lg font-semibold text-white mb-4">Estimated Monthly Revenue (10% Fee)</h3>
                        <ResponsiveContainer width="100%" height="90%">
                            {monthlyRevenueData?.some(d => d.revenue >= 0) ? (
                                <BarChart data={monthlyRevenueData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.5} />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value) => `₹${value}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', borderRadius: '4px' }}
                                        labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                                        itemStyle={{ color: REVENUE_COLOR }}
                                        formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Revenue']}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '12px' }}/>
                                    <Bar dataKey="revenue" fill={REVENUE_COLOR} name="Revenue (₹)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-500">No revenue data for this year yet.</div>
                            )}
                        </ResponsiveContainer>
                    </div>
                );

            case 'status':
                return (
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 h-[400px]">
                        <h3 className="text-lg font-semibold text-white mb-4">Task Status Distribution</h3>
                        <ResponsiveContainer width="100%" height="90%">
                            {taskStatusData.some(d => d.value > 0) ? (
                                <PieChart>
                                    <Pie
                                        data={taskStatusData.filter(d => d.value > 0)}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={110}
                                        innerRadius={50}
                                        fill="#8884d8"
                                        dataKey="value"
                                        paddingAngle={2}
                                        label={(props: PieLabelRenderProps) => {
                                            // Ensure props.percent and props.name are defined before accessing
                                            if (props.percent === undefined || props.name === undefined) return null;
                                            // Type assertion for safety
                                            const percentValue = props.percent as number;
                                            // Only show label if percentage is significant
                                            return percentValue > 0.05 ? `${props.name} ${(percentValue * 100).toFixed(0)}%` : null;
                                        }}
                                        fontSize={12}
                                    >
                                        {taskStatusData.filter(d => d.value > 0).map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', borderRadius: '4px' }}
                                        formatter={(value: number, name: string) => [`${value} tasks`, name]}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                                </PieChart>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-500">No task data for chart.</div>
                            )}
                        </ResponsiveContainer>
                    </div>
                );

            default:
                return null;
        }
    };

    // Helper for sidebar button styling
    const sidebarButtonClass = (chartType: ChartType) => `
        w-full text-left px-4 py-3 rounded-md flex items-center gap-3 transition-colors duration-200
        ${selectedChart === chartType
            ? 'bg-slate-700 text-yellow-400 font-semibold'
            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
        }
    `;

    return (
        <div className="p-6 space-y-8">
            <h2 className="text-2xl font-bold text-white mb-6">Platform Overview</h2>
            {!stats ? (
                <p className="text-slate-400">Loading statistics...</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
                    <StatCard icon={<FaUsers size={24} />} label="Total Users" value={stats.totalUsers} />
                    <StatCard icon={<FaTasks size={24} />} label="Total Tasks" value={stats.totalTasks} />
                    <StatCard icon={<FaClipboardCheck size={24} />} label="Completed Tasks" value={stats.completedTasks} />
                    <StatCard icon={<FaConciergeBell size={24} />} label="Total Services" value={stats.totalServices} />
                    <StatCard icon={<FaRupeeSign size={24} />} label="Est. Income (10% Fee)" value={`₹${stats.totalIncome.toLocaleString()}`} />
                </div>
            )}

            {/* Flex container for sidebar + chart area */}
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full md:w-64 flex-shrink-0 bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-2 self-start">
                    <h3 className="text-lg font-semibold text-white mb-3 px-2">Charts</h3>
                    <button onClick={() => setSelectedChart('signups')} className={sidebarButtonClass('signups')}>
                        <FaCalendarAlt /> User Signups
                    </button>
                    <button onClick={() => setSelectedChart('revenue')} className={sidebarButtonClass('revenue')}>
                        <FaChartBar /> Monthly Revenue
                    </button>
                    <button onClick={() => setSelectedChart('status')} className={sidebarButtonClass('status')}>
                        <FaChartPie /> Task Status
                    </button>
                </div>

                {/* Main Chart Area */}
                <div className="flex-grow min-w-0">
                    {renderChart()}
                </div>
            </div>
        </div>
    );
};

export default AdminOverviewTab;