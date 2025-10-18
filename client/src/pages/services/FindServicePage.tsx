import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/authContext';
import { getServices } from '@/services/serviceServices';
import ServiceCard from '@/components/services/ServiceCardOffer';
import toast from 'react-hot-toast';
import { Service, ServiceSearchParams } from '@/types';
import { FaCrosshairs } from 'react-icons/fa';


// // Helper component to programmatically change the map's view
// function ChangeMapView({ center, zoom }: { center: LatLngExpression; zoom: number }) {
//     const map = useMap();
//     useEffect(() => {
//         map.setView(center, zoom);
//     }, [center, zoom, map]);
//     return null;
// }

const FindServicesPage = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ServiceSearchParams>({
    radius: 50, // Default radius
  });



  useEffect(() => {
    // Set initial location from user's profile when the component loads
    if (user?.location?.coordinates) {
      const userCoords: [number, number] = [user.location.coordinates[1], user.location.coordinates[0]];
      setFilters(prev => ({
        ...prev,
        lat: userCoords[0],
        lng: userCoords[1],
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

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      return toast.error('Geolocation is not supported by your browser.');
    }
    const toastId = toast.loading('Fetching your current location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.dismiss(toastId);
        toast.success('Location updated!');
        const userCoords: [number, number] = [position.coords.latitude, position.coords.longitude];
        setFilters(prev => ({
          ...prev,
          lat: userCoords[0],
          lng: userCoords[1],
        }));
      },
      () => {
        toast.dismiss(toastId);
        toast.error('Could not get your location. Please enable location services.');
      }
    );
  };

  const inputStyles = "w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition";

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white">
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-white">Browse Instant-Book Services</h1>
            <p className="text-slate-400 mt-2">Find skilled providers ready to help you now.</p>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl shadow-lg mb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <input
                    type="text"
                    name="keyword"
                    placeholder="Search by keyword..."
                    onChange={handleFilterChange}
                    className={`${inputStyles} lg:col-span-2`}
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
                <button
                  onClick={handleGetCurrentLocation}
                  className="flex items-center justify-center gap-2 h-12 px-4 py-2 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition"
                >
                  <FaCrosshairs /> Use Current Location
                </button>
            </div>
            {/* --- Radius Slider --- */}
            <div className="mt-4">
                <label className="text-sm text-slate-300">Search Radius: {filters.radius} km</label>
                <input type="range" name="radius" min="1" max="100" value={filters.radius} onChange={handleFilterChange} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400" />
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