 import { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import { updateUserProfile, createStripeOnboardingLink } from '@/services/userServices';
import toast from 'react-hot-toast';
import { ProfileUpdateData } from '@/types';
 export const useProfilePage = () => {
 const { user, updateUser, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isProfilePicModalOpen, setIsProfilePicModalOpen] = useState(false); // State for modal

  const [formData, setFormData] = useState({
    name: '',
    skills: '',
    bio: '',
    latitude: '',
    longitude: '',
    portfolio: '',
    profilePicture: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        skills: user.skills?.join(', ') || '',
        bio: user.bio || '',
        longitude: user.location?.coordinates[0]?.toString() || '',
        latitude: user.location?.coordinates[1]?.toString() || '',
        portfolio: user.portfolio?.join(', ') || '',
        profilePicture: user.profilePicture || '',
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
        portfolio: user.portfolio?.join(', ') || '',
        profilePicture: user.profilePicture || '',
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
      portfolio: formData.portfolio.split(',').map(url => url.trim()).filter(Boolean),
      profilePicture: formData.profilePicture,
    };

    if (formData.latitude && formData.longitude) {
      updatedData.location = {
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


  return {
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

  }

}