import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/authContext';
import { getServices } from '../services/serviceServices';
import ServiceCard from '../components/services/ServiceCardOffer';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import toast from 'react-hot-toast';
import { Service, ServiceSearchParams } from '../types';

const FindServicesPage = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ServiceSearchParams>({});

  useEffect(() => {
    if (user?.location?.coordinates) {
      setFilters(prev => ({
        ...prev,
        lat: user.location?.coordinates[1],
        lng: user.location?.coordinates[0],
      }));
    }
  }, [user]);

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getServices(filters);
      setServices(data);
    } catch (error) {
      toast.error('Failed to load services.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value === '' ? undefined : value,
    }));
  };

  const inputStyles = "w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition";

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white">
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-white">Browse Instant-Book Services</h1>
            <p className="text-slate-400 mt-2">Find skilled providers ready to help you now.</p>
        </div>
        
        {/* --- FILTER CONTROLS --- */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl shadow-lg mb-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <input
                    type="text"
                    name="keyword"
                    placeholder="Search by keyword (e.g., 'plumbing', 'tutor')..."
                    onChange={handleFilterChange}
                    className={`${inputStyles} md:col-span-2`}
                />
                <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max Price (₹)"
                    onChange={handleFilterChange}
                    className={inputStyles}
                />
                <select name="category" onChange={handleFilterChange} className={inputStyles}>
                    <option value="">All Categories</option>
                    <option value="Home Repair">Home Repair</option>
                    <option value="Gardening">Gardening</option>
                    <option value="Tutoring">Tutoring</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Other">Other</option>
                </select>
            </div>
        </div>

        {isLoading ? (
          <div className="text-center text-slate-400">Loading services...</div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {services
  .filter(service => service.provider._id !== user?._id)
  .map(service => (
    <ServiceCard key={service._id} service={service} />
))}
          </div>
        ) : (
          <div className="text-center py-20 px-6 bg-slate-800/50 rounded-lg border border-slate-700">
            <h3 className="text-xl font-semibold text-white">No Services Found</h3>
            <p className="text-slate-400 mt-2">Try adjusting your search filters to find what you're looking for.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default FindServicesPage;