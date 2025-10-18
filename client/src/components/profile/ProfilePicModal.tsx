import React from 'react';

interface ProfilePicModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText: string;
}

const ProfilePicModal: React.FC<ProfilePicModalProps> = ({ isOpen, onClose, imageUrl, altText }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose} // Close modal on overlay click
    >
      <div 
        className="relative bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-4 max-w-lg max-h-[80vh]"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
      >
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 text-slate-400 hover:text-white text-3xl font-light z-10 bg-slate-800/50 rounded-full w-8 h-8 flex items-center justify-center"
          aria-label="Close image view"
        >
          &times;
        </button>
        <img 
          src={imageUrl} 
          alt={altText} 
          className="max-w-full max-h-[75vh] object-contain rounded-md" 
        />
      </div>
    </div>
  );
};

export default ProfilePicModal;