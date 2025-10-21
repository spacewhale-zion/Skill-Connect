import axios from 'axios';

// Create an Axios instance with a base URL pointing to your backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BaseURL,
});
console.log(import.meta.env.VITE_API_BaseURL)
// This interceptor adds the auth token to every request if it exists
api.interceptors.request.use(
  (config) => {
    // Retrieve the user data from local storage
    const userString = localStorage.getItem('user');
    
    if (userString) {
      const user = JSON.parse(userString);
      const token = user?.token;
      
      // If a token exists, add it to the Authorization header
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

export default api;