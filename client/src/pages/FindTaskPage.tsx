import { useState, useEffect, useCallback } from 'react';
import { getTasks,  } from '../services/taskServices';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import TaskCard from '../components/tasks/TaskCard';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

import type {Task, TaskSearchParams} from '../types/index'
const FindTasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TaskSearchParams>({
    lat: 20.5937, // Default center of India
    lng: 78.9629,
    radius: 50,
    keyword: '',
    maxBudget: undefined,
    category: '',
  });
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);

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
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords: [number, number] = [position.coords.latitude, position.coords.longitude];
        setFilters(prev => ({ ...prev, lat: userCoords[0], lng: userCoords[1], radius: 10 }));
        setMapCenter(userCoords);
      },
      () => searchTasks()
    );
  }, []);

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

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2">
        {/* Left Column: Filters and Task List */}
        <div className="flex flex-col p-4 overflow-y-auto">
          <div className="bg-white p-4 rounded-lg shadow-md mb-4 sticky top-0 z-10">
            <h2 className="text-xl font-bold mb-4">Find a Task</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Keyword Search Input */}
              <input
                type="text"
                name="keyword"
                placeholder="Search by skill or keyword..."
                value={filters.keyword || ''}
                onChange={handleFilterChange}
                className="p-2 border rounded-md md:col-span-2"
              />
              {/* Max Budget Input */}
              <input
                type="number"
                name="maxBudget"
                placeholder="Max Budget (₹)"
                value={filters.maxBudget || ''}
                onChange={handleFilterChange}
                className="p-2 border rounded-md"
              />
              {/* Category Filter */}
              <select name="category" value={filters.category || ''} onChange={handleFilterChange} className="p-2 border rounded-md">
                <option value="">All Categories</option>
                <option value="Home Repair">Home Repair</option>
                <option value="Gardening">Gardening</option>
                <option value="Tutoring">Tutoring</option>
                <option value="Delivery">Delivery</option>
                <option value="Other">Other</option>
              </select>
              {/* Radius Slider */}
              <div className="md:col-span-2">
                  <label className="text-sm">Search Radius: {filters.radius} km</label>
                  <input type="range" name="radius" min="1" max="50" value={filters.radius} onChange={handleFilterChange} className="w-full" />
              </div>
            </div>
          </div>
          {loading ? (
            <div className="text-center p-10">Searching for tasks...</div>
          ) : (
            <div className="space-y-4">
              {tasks.length > 0 ? (
                tasks.map(task => <TaskCard key={task._id} task={task} />)
              ) : (
                <div className="text-center p-10 text-gray-500">No tasks found. Try expanding your search!</div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Map */}
        <div className="hidden lg:block sticky top-0 h-full">
           <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {tasks.map(task => (
                <Marker key={task._id} position={[task.location.coordinates[1], task.location.coordinates[0]]}>
                  <Popup>
                    <div className="font-bold">{task.title}</div>
                    <div>Budget: ₹{task.budget.amount}</div>
                    <Link to={`/tasks/${task._id}`} className="text-indigo-600">View Details</Link>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default FindTasksPage;