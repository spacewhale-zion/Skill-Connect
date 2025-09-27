import { Link } from 'react-router-dom';
import { Service } from '../../types';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <div className="flex-grow">
        <div className="flex justify-between items-start">
            <h3 className="text-xl font-semibold text-gray-800">{service.title}</h3>
            {/* --- THIS IS THE FIX --- */}
            {service.distance && (
                <span className="text-sm font-medium text-gray-500 bg-blue-50-100 px-2 py-1 rounded">
                    {service.distance} km away
                </span>
            )}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Offered by {service.provider.name} (⭐ {service.provider.averageRating?.toFixed(1) || 'New'})
        </p>
        <p className="text-lg font-bold text-indigo-600 mt-4">${service.price}</p>
        <p className="text-gray-600 mt-2 text-sm h-10 overflow-hidden">{service.description}</p>
      </div>
      <div className="mt-6">
        <Link 
          to={`/services/${service._id}`} 
          className="text-indigo-600 hover:underline font-semibold"
        >
          View & Book
        </Link>
      </div>
    </div>
  );
};

export default ServiceCard;