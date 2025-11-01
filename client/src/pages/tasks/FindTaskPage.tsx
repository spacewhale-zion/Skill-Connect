import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/authContext';
import { getTasks } from '@/services/taskServices';
import toast from 'react-hot-toast';
import TaskCard from '@/components/tasks/TaskCard';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { Task, TaskSearchParams } from '@/types/index';
import { FaCrosshairs } from 'react-icons/fa';
import { Icon, LatLngExpression } from 'leaflet';

// Helper component to programmatically change the map's view
function ChangeMapView({ center, zoom }: { center: LatLngExpression; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

const FindTasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(14); // Set a closer zoom level
  const [filters, setFilters] = useState<TaskSearchParams>({
    lat: 20.5937, 
    lng: 78.9629,
    radius: 50,
    keyword: '',
    maxBudget: undefined,
    category: '',
  });
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);
  
  const userLocationIcon = new Icon({
    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const searchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const results = await getTasks(filters);
      setTasks(results);
    } catch (error) {
      toast.error('Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (user?.location?.coordinates) {
      const profileCoords: [number, number] = [user.location.coordinates[1], user.location.coordinates[0]];
      setFilters(prev => ({ ...prev, lat: profileCoords[0], lng: profileCoords[1] }));
      setMapCenter(profileCoords);
    } else {
      searchTasks();
    }
  }, [user]);

  useEffect(() => {
    searchTasks();
  }, [searchTasks]);

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
        setFilters(prev => ({ ...prev, lat: userCoords[0], lng: userCoords[1] }));
        setMapCenter(userCoords);
      },
      () => {
        toast.dismiss(toastId);
        toast.error('Could not get your location. Please enable location services.');
      }
    );
  };
  
  const inputStyles = "w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition";

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white">
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col p-4 overflow-y-auto">
          {/* Filters... */}
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl mb-4 sticky top-4 z-10">
            <h2 className="text-2xl font-bold mb-4">Find a Task</h2>
            <button
              onClick={handleGetCurrentLocation}
              className="w-full flex items-center justify-center gap-2 mb-4 px-4 py-2 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition"
            >
              <FaCrosshairs /> Use My Current Location
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="keyword" placeholder="Search by skill or keyword..." value={filters.keyword || ''} onChange={handleFilterChange} className={`${inputStyles} md:col-span-2`}/>
              <input type="number" name="maxBudget" placeholder="Max Budget (₹)" value={filters.maxBudget || ''} onChange={handleFilterChange} className={inputStyles}/>
              <select name="category" value={filters.category || ''} onChange={handleFilterChange} className={inputStyles}>
                <option value="">All Categories</option>
                <option value="Home Repair">Home Repair</option>
                <option value="Gardening">Gardening</option>
                <option value="Tutoring">Tutoring</option>
                <option value="Delivery">Delivery</option>
                <option value="Other">Other</option>
              </select>
              <div className="md:col-span-2">
                  <label className="text-sm text-slate-300">Search Radius: {filters.radius} km</label>
                  <input type="range" name="radius" min="1" max="50" value={filters.radius} onChange={handleFilterChange} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400" />
              </div>
            </div>
          </div>
          {/* Task List... */}
          {loading ? ( <div className="text-center p-10 text-slate-400">Searching for tasks...</div> ) : (
            <div className="space-y-4">
              {tasks.length > 0 ? ( tasks.map(task => <TaskCard key={task._id} task={task} />) ) : ( <div className="text-center p-10 text-slate-400 bg-slate-800 rounded-lg border border-slate-700">No tasks found. Try expanding your search!</div> )}
            </div>
          )}
        </div>
        {/* Map */}
        <div className="hidden lg:block sticky top-0 h-full">
           <MapContainer center={mapCenter} zoom={zoomLevel} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
              <ChangeMapView center={mapCenter} zoom={zoomLevel} />
              <TileLayer 
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
              />
              {tasks.map(task => (
                <Marker key={task._id} position={[task.location.coordinates[1], task.location.coordinates[0]]}>
                  <Popup>
                    <div className="font-bold">{task.title}</div>
                    <div>Budget: ₹{task.budget.amount}</div>
                    <Link to={`/tasks/${task._id}`} className="text-indigo-600">View Details</Link>
                  </Popup>
                </Marker>
              ))}
              {mapCenter && (
                <Marker position={mapCenter} icon={userLocationIcon}>
                  <Popup>Your Location</Popup>
                </Marker>
              )}
            </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default FindTasksPage;