import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { updateUserProfile } from '../services/userServices';
import toast from 'react-hot-toast';
import { ProfileUpdateData } from '../types';
import MapView from '../components/map/MapView'; // Assuming you have this component
interface ProfilePageProps {
  isModalOpen: boolean; // <-- NEW PROP
}

const ProfilePage = () => {
  const { user, updateUser, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    skills: '', // Using a comma-separated string for easy editing in a single input
    bio: '',
  });

  // This effect runs when the component mounts or when the global 'user' object changes.
  // It populates the form with the latest user data.
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        skills: user.skills?.join(', ') || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleCancelEdit = () => {
    // Reset form to original user data and exit edit mode
    if (user) {
      setFormData({
        name: user.name,
        skills: user.skills?.join(', ') || '',
        bio: user.bio || '',
      });
    }
    setIsEditing(false);
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    const updatedData: ProfileUpdateData = {
      name: formData.name,
      skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean),
      bio: formData.bio,
    };

    try {
      const updatedUserFields = await updateUserProfile(updatedData);
      updateUser(updatedUserFields); // Update the global state
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || !user) {
    return <div className="text-center py-10">Loading profile...</div>;
  }

  // Leaflet requires coordinates as [latitude, longitude]
  const mapCoordinates: [number, number] | undefined = user.location?.coordinates
    ? [user.location.coordinates[1], user.location.coordinates[0]]
    : undefined;

  return (
    <div className="bg-white p-8 rounded-lg shadow-xl max-w-4xl mx-auto">
      {/* --- PROFILE HEADER --- */}
      <div className="flex flex-col md:flex-row items-center gap-6 border-b pb-6 mb-6">
        <div className="w-32 h-32 rounded-full bg-gray-200 flex-shrink-0">
          {/* Placeholder for an actual image */}
          <img 
            src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}&background=random&size=128`} 
            alt="Profile" 
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <div className="flex-grow text-center md:text-left w-full">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-800">{user.name}</h1>
              <p className="text-lg text-gray-500 mt-1">{user.email}</p>
            </div>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition duration-200">
                Edit Profile
              </button>
            )}
          </div>
           {typeof user.averageRating === 'number' && (
              <div className="flex items-center mt-3 justify-center md:justify-start">
                <span className="text-xl font-bold text-yellow-500 mr-2">⭐ {user.averageRating.toFixed(1)}</span>
                <span className="text-gray-500">Average Rating</span>
              </div>
            )}
        </div>
      </div>

      {/* --- PROFILE DETAILS FORM --- */}
      <form onSubmit={handleSaveChanges} className="space-y-8">
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">About Me</label>
          {isEditing ? (
            <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={4} className="mt-1 w-full border-gray-300 rounded-md shadow-sm resize-none"/>
          ) : (
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{user.bio || 'No bio provided. Click "Edit Profile" to add one.'}</p>
          )}
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">Skills</label>
          {isEditing ? (
            <>
              <input type="text" name="skills" value={formData.skills} onChange={handleInputChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" />
              <p className="text-xs text-gray-500 mt-1">Separate skills with commas (e.g., "Plumbing, Gardening")</p>
            </>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {user.skills && user.skills.length > 0 ? (
                user.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">{skill}</span>
                ))
              ) : <p className="text-gray-500">No skills listed.</p>}
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">Your Location</label>
          {mapCoordinates ? <MapView  coordinates={mapCoordinates} /> : <p className="text-gray-500">Location not set.</p>}
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-4 pt-6 border-t mt-8">
            <button type="button" onClick={handleCancelEdit} className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition duration-200">
              Cancel
            </button>
            <button type="submit" disabled={isUpdating} className="px-5 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-green-400 transition duration-200">
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfilePage;