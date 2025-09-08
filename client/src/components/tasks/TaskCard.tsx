import { Task } from '../../services/taskServices';
import { Link } from 'react-router-dom';

const statusColors: { [key: string]: string } = {
  Open: 'bg-blue-100 text-blue-800',
  Assigned: 'bg-yellow-100 text-yellow-800',
  Completed: 'bg-green-100 text-green-800',
};

const TaskCard = ({ task }: { task: Task }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-semibold text-gray-800">{task.title}</h3>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[task.status]}`}>
          {task.status}
        </span>
      </div>
      <p className="text-sm text-gray-500 mt-2">{task.category}</p>
      <p className="text-lg font-bold text-indigo-600 mt-4">₹{task.budget.amount}</p>
      <div className="mt-6">
        <Link 
          to={`/tasks/${task._id}`} 
          className="text-indigo-600 hover:underline font-semibold"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default TaskCard;