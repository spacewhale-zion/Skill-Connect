import { useEffect, useState } from 'react';
import { getMyOfferedServices, deleteService } from '../services/serviceServices';
import ServiceCard from '../components/services/ServiceCardDashBoard';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import toast from 'react-hot-toast';
import type { Service } from '../types/index';

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
        <>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">My Offered Services</h1>
                <div>Loading services...</div>
            </div>
            <Footer />
        </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Offered Services</h1>
        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => (
              <div key={service._id} className="relative">
                <ServiceCard service={service} />
                <button 
                  onClick={() => handleDelete(service._id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 bg-white p-6 rounded-lg">You haven't listed any services yet.</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AllMyServicesPage;