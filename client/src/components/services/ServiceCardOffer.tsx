import { Link } from 'react-router-dom';
import { Service } from '@/types';
import { FaStar } from 'react-icons/fa';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-lg shadow-lg hover:border-yellow-400/50 transition-all duration-300 flex flex-col h-full group">
      <div className="flex-grow">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold text-pink-400">{service.category}</p>
          {service.distance != null && (
            <span className="text-xs font-medium text-slate-300 bg-slate-700 px-2 py-1 rounded">
              {service.distance} km away
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold text-white mt-3 group-hover:text-yellow-400 transition-colors">{service.title}</h3>
        <div className="text-sm text-slate-400 mt-2 flex items-center gap-2">
          <span>Offered by {service.provider.name}</span>
          <span className="flex items-center gap-1">
            <FaStar className="text-yellow-500" /> 
            {service.provider.averageRating?.toFixed(1) || 'New'}
          </span>
        </div>
        <p className="text-2xl font-bold text-yellow-400 mt-4">₹{service.price}</p>
        <p className="text-slate-400 mt-2 text-sm h-10 overflow-hidden">{service.description}</p>
      </div>
      <div className="mt-6 pt-4 border-t border-slate-700">
        <Link 
          to={`/services/${service._id}`} 
          className="text-yellow-400 hover:text-yellow-300 font-semibold text-sm"
        >
          View & Book →
        </Link>
      </div>
    </div>
  );
};

export default ServiceCard;