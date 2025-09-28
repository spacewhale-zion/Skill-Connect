import { Link } from 'react-router-dom';
import { Service } from '../../types';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  const statusColors: Record<string, string> = {
    Open: "bg-green-100 text-green-600",
    Booked: "bg-yellow-100 text-yellow-600",
  };

  const statusLabel = service.isActive ? "Open" : "Booked";

  return (
    <div className="relative bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between h-full">
      {/* Status badge (top-right corner) */}
      <span
        className={`absolute top-3 right-3 text-xs font-semibold py-1 px-3 rounded-full ${statusColors[statusLabel]}`}
      >
        {statusLabel}
      </span>

      <div>
        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
          {service.category}
        </span>
        <h3 className="text-xl font-semibold text-gray-800 mt-3">{service.title}</h3>
        <p className="text-2xl font-bold text-green-600 mt-2">${service.price}</p>
        <p className="text-gray-600 mt-2 text-sm">
          {service.description.substring(0, 100)}
        </p>
      </div>

      <div className="mt-6">
        <Link 
          to={`/services/${service._id}`} 
          className="text-indigo-600 hover:underline font-semibold"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ServiceCard;
