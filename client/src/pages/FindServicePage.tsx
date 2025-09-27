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

//   console.log(user);
  useEffect(() => {
    // Set initial location from user profile
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Browse Instant-Book Services</h1>
        
        {/* --- FILTER CONTROLS --- */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                    type="text"
                    name="keyword"
                    placeholder="Search by keyword..."
                    onChange={handleFilterChange}
                    className="p-2 border rounded-md md:col-span-3"
                />
                <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max Price ($)"
                    onChange={handleFilterChange}
                    className="p-2 border rounded-md"
                />
                <select name="category" onChange={handleFilterChange} className="p-2 border rounded-md">
                    <option value="">All Categories</option>
                    <option value="Home Repair">Home Repair</option>
                    <option value="Gardening">Gardening</option>
                    <option value="Tutoring">Tutoring</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Other">Other</option>
                </select>
                <button onClick={fetchServices} className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    Search
                </button>
            </div>
        </div>

        {isLoading ? (
          <div>Loading services...</div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => <ServiceCard key={service._id} service={service} />)}
          </div>
        ) : (
          <p className="text-gray-500 bg-white p-6 rounded-lg">No services found matching your criteria.</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default FindServicesPage;