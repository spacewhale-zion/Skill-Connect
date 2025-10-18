import type { Task } from '@/types/index';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaClock, FaGavel } from 'react-icons/fa';

// Using the same themed status styles from the dashboard for consistency
const statusStyles: { [key: string]: { text: string; bg: string; } } = {
  Open: { text: 'text-sky-300', bg: 'bg-sky-500/20' },
  Assigned: { text: 'text-yellow-300', bg: 'bg-yellow-500/20' },
  'Pending Payment': { text: 'text-orange-400', bg: 'bg-orange-500/20' },
  CompletedByProvider: { text: 'text-blue-400', bg: 'bg-blue-500/20' },
  Completed: { text: 'text-green-400', bg: 'bg-green-500/20' },
  Cancelled: { text: 'text-red-400', bg: 'bg-red-500/20' },
};

const TaskCard = ({ task }: { task: Task }) => {
  const currentStatus = statusStyles[task.status] || { text: 'text-slate-300', bg: 'bg-slate-700' };

  return (
    <Link to={`/tasks/${task._id}`} className="block">
      <div className="card-glow-hover bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-lg transition-all duration-300 h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white pr-4">{task.title}</h3>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${currentStatus.bg} ${currentStatus.text}`}>
            {task.status}
          </span>
        </div>
        
        {/* Description */}
        <p className="text-slate-300 text-sm mb-4">
            {task.description.substring(0, 120)}{task.description.length > 120 ? '...' : ''}
        </p>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center text-sm text-slate-400 mb-4">
          <span className="text-lg font-bold text-yellow-400 mr-6">₹{task.budget.amount}</span>
          <span className="flex items-center mr-6"><FaMapMarkerAlt className="mr-2" />{task.location.coordinates.map(coord => coord.toFixed(2)).join(', ')}</span>
          <span className="flex items-center"><FaClock className="mr-2" />{new Date(task.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Footer/Tags */}
        <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-pink-500/20 text-pink-400">
                {task.category}
            </span>
            <span className="text-sm font-semibold text-slate-300">
                View Details →
            </span>
        </div>
      </div>
    </Link>
  );
};

export default TaskCard;