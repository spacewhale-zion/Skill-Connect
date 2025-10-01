import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { updateUserProfile, createStripeOnboardingLink } from '../services/userServices';
import toast from 'react-hot-toast';
import { ProfileUpdateData } from '../types';
import MapView from '../components/map/MapView';
import { FaEdit, FaStripeS, FaMapMarkerAlt } from 'react-icons/fa';
import LoadingSpinner from '../components/reviews/SubmitReviewmodal';

const ProfilePage = () => {
  const { user, updateUser, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    skills: '',
    bio: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        skills: user.skills?.join(', ') || '',
        bio: user.bio || '',
        longitude: user.location?.coordinates[0]?.toString() || '',
        latitude: user.location?.coordinates[1]?.toString() || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCancelEdit = () => {
    if (user) {
      setFormData({
        name: user.name,
        skills: user.skills?.join(', ') || '',
        bio: user.bio || '',
        longitude: user.location?.coordinates[0]?.toString() || '',
        latitude: user.location?.coordinates[1]?.toString() || '',
      });
    }
    setIsEditing(false);
  };
  
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    const toastId = toast.loading('Fetching location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.dismiss(toastId);
        toast.success('Location found!');
        setFormData(prev => ({
            ...prev,
            longitude: position.coords.longitude.toString(),
            latitude: position.coords.latitude.toString(),
        }))
      },
      (error) => {
        toast.dismiss(toastId);
        toast.error(error.message || 'Could not get location.');
      }
    );
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    const updatedData: ProfileUpdateData = {
      name: formData.name,
      skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean),
      bio: formData.bio,
    };

    if (formData.latitude && formData.longitude) {
      updatedData.location = {
        // Remember: GeoJSON format is [longitude, latitude]
        coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)],
      };
    }

    try {
      const updatedUserFields = await updateUserProfile(updatedData);
      updateUser(updatedUserFields);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStripeOnboarding = async () => {
    setIsOnboarding(true);
    try {
      const { url } = await createStripeOnboardingLink();
      window.location.href = url;
    } catch (error) {
      toast.error('Could not create onboarding link. Please try again.');
      setIsOnboarding(false);
    }
  };
  
  const inputStyles = "w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition";

  if (isLoading || !user) {
    return ( <div className="bg-slate-900 min-h-screen text-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  const mapCoordinates: [number, number] | undefined = user.location?.coordinates
    ? [user.location.coordinates[1], user.location.coordinates[0]]
    : undefined;

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white relative">
      <div className="absolute inset-0 z-0">
        <div id="stars"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
      </div>

      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl max-w-4xl mx-auto p-8">
          <div className="flex flex-col md:flex-row items-center gap-6 border-b border-slate-700 pb-6 mb-6">
            <img
              src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}&background=random&size=128`}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-slate-600 flex-shrink-0"
            />
            <div className="flex-grow text-center md:text-left w-full">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-extrabold text-white">{user.name}</h1>
                  <p className="text-lg text-slate-400 mt-1">{user.email}</p>
                </div>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-5 py-2 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-600 transition duration-200">
                    <FaEdit /> Edit Profile
                  </button>
                )}
              </div>
              {typeof user.averageRating === 'number' && user.averageRating > 0 && (
                <div className="flex items-center mt-3 justify-center md:justify-start">
                  <span className="text-xl font-bold text-yellow-400 mr-2">⭐ {user.averageRating.toFixed(1)}</span>
                  <span className="text-slate-400">Average Rating</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="my-8 p-6 bg-slate-900/50 rounded-lg border border-slate-700">
            <h3 className="text-lg font-semibold text-white">Payouts Setup</h3>
            <p className="text-sm text-slate-400 mt-1">
              Connect your bank account via Stripe to receive payments for completed tasks.
            </p>
            <button
              onClick={handleStripeOnboarding}
              disabled={isOnboarding}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-sky-500 text-white font-semibold rounded-md hover:bg-sky-600 transition duration-200 disabled:bg-sky-400/50"
            >
              <FaStripeS size={20} /> {isOnboarding ? 'Redirecting...' : 'Set Up Payouts'}
            </button>
          </div>

          <form onSubmit={handleSaveChanges} className="space-y-8">
            <div>
              <label className="block text-lg font-semibold text-slate-300 mb-2">About Me</label>
              {isEditing ? (
                <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={4} className={inputStyles}/>
              ) : (
                <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">{user.bio || 'No bio provided. Click "Edit Profile" to add one.'}</p>
              )}
            </div>

            <div>
              <label className="block text-lg font-semibold text-slate-300 mb-2">My Skills</label>
              {isEditing ? (
                <>
                  <input type="text" name="skills" value={formData.skills} onChange={handleInputChange} className={inputStyles} />
                  <p className="text-xs text-slate-500 mt-1">Separate skills with commas (e.g., Plumbing, Gardening)</p>
                </>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {user.skills && user.skills.length > 0 ? (
                    user.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-pink-500/20 text-pink-400 text-sm font-medium rounded-full">{skill}</span>
                    ))
                  ) : <p className="text-slate-500">No skills listed.</p>}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-lg font-semibold text-slate-300 mb-2">Your Location</label>
              {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Update your primary location.</p>
                        <button type="button" onClick={handleGetLocation} className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-white bg-slate-600 rounded-md hover:bg-slate-500 transition">
                            <FaMapMarkerAlt /> Get My Location
                        </button>
                    </div>
                    <div className="flex space-x-2">
                        <input type="number" step="any" placeholder="Longitude" name="longitude" value={formData.longitude} onChange={handleInputChange} required className={`w-1/2 mt-1 ${inputStyles}`}/>
                        <input type="number" step="any" placeholder="Latitude" name="latitude" value={formData.latitude} onChange={handleInputChange} required className={`w-1/2 mt-1 ${inputStyles}`}/>
                    </div>
                </div>
              ) : (
                 mapCoordinates ? <MapView coordinates={mapCoordinates} className="grayscale" /> : <p className="text-slate-500">Location not set.</p>
              )}
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700 mt-8">
                <button type="button" onClick={handleCancelEdit} className="px-5 py-2 text-slate-300 font-semibold rounded-md hover:underline">
                  Cancel
                </button>
                <button type="submit" disabled={isUpdating} className="px-5 py-2 bg-yellow-400 text-slate-900 font-bold rounded-md hover:bg-yellow-500 disabled:opacity-50 transition duration-200">
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;