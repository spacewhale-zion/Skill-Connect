import React, { useState } from 'react';
import { useAuth } from '../context/authContext.tsx';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import useFcmToken from '../hooks/useFCMtoken.ts';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const { token } = useFcmToken();
  console.log(token)

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      toast.loading('Fetching your location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast.dismiss();
          toast.success('Location found!');
          setLongitude(position.coords.longitude.toString());
          setLatitude(position.coords.latitude.toString());
        },
        (error) => {
          toast.dismiss();
          toast.error('Could not get location. Please enter it manually.');
          console.error('Geolocation error:', error);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!latitude || !longitude) {
    toast.error("Location is required.");
    return;
  }

  if (!token) {
    toast.error("Notification token not ready yet, please try again.");
    return;
  }

  setIsSubmitting(true);
  try {
    await register({
      name,
      email,
      password,
      location: {
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      fcmToken: token,
    });
    toast.success("Registration successful! Welcome!");
    navigate("/");
  } catch (error) {
    toast.error("Registration failed. The email might already be in use.");
    console.error(error);
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Create your SkillConnect Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Location</label>
              <button type="button" onClick={handleGetLocation} className="px-3 py-1 text-xs font-semibold text-white bg-gray-500 rounded-md hover:bg-gray-600">Get My Location</button>
            </div>
            <div className="flex space-x-2">
              <input type="number" step="any" placeholder="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} required className="w-1/2 px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
              <input type="number" step="any" placeholder="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} required className="w-1/2 px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-400"
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
