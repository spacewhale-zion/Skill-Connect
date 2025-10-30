import { useProfilePage } from '@/hooks/dashboard/useProfilePage';
import MapView from '@/components/map/MapView';
import { FaEdit, FaStripeS, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';
import ProfilePicModal from '@/components/profile/ProfilePicModal'; // Import the modal

const ProfilePage = () => {
  const {
     user,
    isLoading,
    formData,
    setFormData,
    isEditing,
    setIsEditing,
    isUpdating,
    isOnboarding,
    isProfilePicModalOpen,
    setIsProfilePicModalOpen,
    handleInputChange,
    handleCancelEdit,
    handleGetLocation,
    handleSaveChanges,
    handleStripeOnboarding,
  } =useProfilePage();
  const inputStyles = "w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition";

  if (isLoading || !user) {
    return <div className="bg-slate-900 min-h-screen text-white text-center py-10">Loading profile...</div>;
  }

  const mapCoordinates: [number, number] | undefined = user.location?.coordinates
    ? [user.location.coordinates[1], user.location.coordinates[0]]
    : undefined;

  // Use formData for the profile picture URL
  const profilePicUrl = formData.profilePicture || `https://ui-avatars.com/api/?name=${formData.name}&background=random&size=128`;

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
              src={profilePicUrl} // Use state variable for URL
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-slate-600 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" // Add cursor-pointer and hover effect
              onClick={() => setIsProfilePicModalOpen(true)} // Add onClick to open modal
            />
            <div className="flex-grow text-center md:text-left w-full">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                     <h1 className="text-3xl font-extrabold text-white">{user.name}</h1>
                     {user.isVerified && (
                        <FaCheckCircle className="text-sky-400" title="Verified Provider" />
                     )}
                  </div>
                  <p className="text-lg text-slate-400 mt-1">{user.email}</p>
                </div>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-5 py-2 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-600 transition duration-200">
                    <FaEdit /> Edit Profile
                  </button>
                )}
              </div>
               {isEditing && (
                 <div className="mt-4 text-left">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Profile Picture URL</label>
                    <input
                        type="text"
                        name="profilePicture"
                        value={formData.profilePicture}
                        onChange={handleInputChange}
                        className={inputStyles}
                        placeholder="https://example.com/your-image.jpg"
                    />
                </div>
              )}
              {typeof user.averageRating === 'number' && user.averageRating > 0 && !isEditing && (
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
              <label className="block text-lg font-semibold text-slate-300 mb-2">Portfolio</label>
              {isEditing ? (
                <>
                  <textarea
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleInputChange}
                    rows={3}
                    className={inputStyles}
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.png"
                  />
                  <p className="text-xs text-slate-500 mt-1">Add image URLs separated by commas.</p>
                </>
              ) : (
                user.portfolio && user.portfolio.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {user.portfolio.map((url, index) => (
                      <img key={index} src={url} alt={`Portfolio item ${index + 1}`} className="w-full h-40 object-cover rounded-lg border-2 border-slate-700"/>
                    ))}
                  </div>
                ) : <p className="text-slate-500">No portfolio images added yet.</p>
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
      {/* Render the modal */}
      <ProfilePicModal
        isOpen={isProfilePicModalOpen}
        onClose={() => setIsProfilePicModalOpen(false)}
        imageUrl={profilePicUrl} // Pass the correct image URL
        altText={`${user.name}'s profile picture`}
      />
    </div>
  );
};

export default ProfilePage;