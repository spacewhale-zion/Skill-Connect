// src/types/index.ts
// src/types/index.ts

// Assuming this is how your user data comes from the backend
export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  skills?: string[];
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  profilePicture?: string; // Add this
  averageRating?: number; // Add this
  phone?: string;         // Add this
  bio?: string;           // Add this
  token: string;
   portfolio?: string[]; // <-- Add this
  isVerified?: boolean;
  isEmailVerified:boolean;
}

// Data needed for user registration
export interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
  location: {
    coordinates: [number, number];
  };
  fcmToken?: string; // Added fcmToken property
}

// Data needed for user login
export interface UserCredentials {
  email: string;
  password: string;
}

// Data that can be updated on the profile
export interface ProfileUpdateData {
  name?: string;
  skills?: string[];
  location?: {
    coordinates: [number, number];
  };
  profilePicture?: string;
  phone?: string;
  bio?: string;
  portfolio?: string[]; 
}

export interface Bid {
  _id: string;
  amount: number;
  message: string;
  provider: {
    _id: string;
    name: string;
    profilePicture?: string;
    averageRating: number;
  };
  createdAt: string;
    status: 'Pending' | 'Accepted' | 'Rejected';
}


export interface Reviewer {
  _id: string;
  name: string;
  profilePicture?: string;
}

export interface Review {
  _id: string;
  task: string;
  reviewer: Reviewer; // Changed from string
  reviewee: string;
  rating: number;
  comment?: string;
  createdAt: string;
}
export interface Service {
  _id: string;
  provider: {
    _id: string;
    name: string;
    averageRating?: number;
  };
  // status:'Open' | 'Booked';
  title: string;
  description: string;
  category: string;
  price: number;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  isActive: boolean;
  createdAt: string;
   distance?: number; 
    originatingTask?: string;
}

export interface ServiceSearchParams {
  lat?: number;
  lng?: number;
  category?: string;
  keyword?: string;
  maxPrice?: number;
  radius?: number; 
 
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'Open' | 'Assigned' | 'Completed' | 'Cancelled'| 'Pending Payment' | 'CompletedByProvider' | 'CompletedBySeeker';
  category: string;
  budget: {
    amount: number;
    currency: string;
  };
  acceptedBidAmount:number;
  reviews?: Review[];
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  taskSeeker: {
    _id: string;
    name: string;
    profilePicture?: string;
    averageRating?: number;
  };
  assignedProvider?: {
    _id: string;
    name: string;
    profilePicture?: string;
    averageRating?: number;
  };
  isInstantBooking?: boolean;      // <-- ADD THIS
  originatingService?: string; 
  createdAt: string;
  completedAt?: string;

}

// Represents the data needed to create a new task
export interface TaskCreationData {
  title: string;
  description: string;
  category: string;
  budget: { amount: number };
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
}

// Represents the query parameters for searching tasks
export interface GeoSearchParams {
  lat: number;
  lng: number;
  radius: number; // in kilometers
  category?: string;
}


export interface TaskSearchParams {
  lat: number;
  lng: number;
  radius: number; // in kilometers
  category?: string;
  keyword?: string;
  maxBudget?: number;
}


export interface ProfileUpdateData {
  name?: string;
  skills?: string[];
  location?: {
    coordinates: [number, number];
  };
  profilePicture?: string;
}


export interface Notification {
  _id: string;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

