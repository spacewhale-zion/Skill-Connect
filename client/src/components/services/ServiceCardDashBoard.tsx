import { Link } from 'react-router-dom';
import { Service } from '@/types';

const statusColors: Record<string, string> = {
  Open: "bg-green-500/20 text-green-400",
  Booked: "bg-yellow-500/20 text-yellow-300",
};

const ServiceCard = ({ service }: { service: Service }) => {
  const statusLabel = service.isActive ? "Open" : "Booked";

  return (
    <div className="card-glow-hover relative bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-lg transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start">
          <p className="text-xs font-semibold uppercase rounded-full text-pink-400">
            {service.category}
          </p>
          {/* Added some right margin to the status label */}
          <span className={`text-xs font-semibold py-1 px-3 rounded-full ${statusColors[statusLabel]} mr-12`}>
            {statusLabel}
          </span>
        </div>
        <h3 className="text-lg font-bold text-white mt-3">{service.title}</h3>
        <p className="text-2xl font-bold text-yellow-400 mt-2">₹{service.price}</p>
        <p className="text-slate-400 mt-2 text-sm">
          {service.description.substring(0, 100)}{service.description.length > 100 ? '...' : ''}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-700">
        <Link 
          to={`/services/${service._id}`} 
          className="text-yellow-400 hover:text-yellow-300 font-semibold"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default ServiceCard;