import { useEffect, useState } from 'react';
import { getMyOfferedServices, deleteService } from '@/services/serviceServices';
import ServiceCard from '@/components/services/ServiceCardDashBoard';
import toast from 'react-hot-toast';
import type { Service } from '@/types/index';
import { FaTrash } from 'react-icons/fa';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

const AllMyServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const myServices = await getMyOfferedServices();
      setServices(myServices);
    } catch (error) {
      toast.error('Failed to load your offered services.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteService(serviceId);
        toast.success('Service deleted successfully');
        fetchServices();
      } catch (error) {
        toast.error('Failed to delete service.');
      }
    }
  };

  if (isLoading) {
 return (
      <div className="bg-slate-900 min-h-screen text-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white relative">
      
      {/* --- Page Content (must be relative and have a z-index) --- */}
      <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
        <h1 className="text-4xl font-extrabold text-center mb-10">My Offered Services</h1>
        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => (
              <div key={service._id} className="relative group">
                <ServiceCard service={service} />
                <button
                  onClick={() => handleDelete(service._id)}
                  className="cursor-pointer absolute top-4 right-4 bg-red-600/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-500"
                  aria-label="Delete service"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-6 bg-slate-800/50 rounded-lg border border-slate-700">
            <h3 className="text-xl font-semibold text-white">No Services to Display</h3>
            <p className="text-slate-400 mt-2">You haven't listed any services yet.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AllMyServicesPage;