import { Link } from 'react-router-dom';
import { Service } from '../../types';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between h-full">
      <div>
        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
          {service.category}
        </span>
        <h3 className="text-xl font-semibold text-gray-800 mt-3">{service.title}</h3>
        <p className="text-2xl font-bold text-green-600 mt-2">${service.price}</p>
        <p className="text-gray-600 mt-2 text-sm">{service.description.substring(0, 100)
            
            }</p>
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