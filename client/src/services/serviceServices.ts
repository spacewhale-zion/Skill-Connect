import api from '../api/axiosConfig';
import { Service, Task,ServiceSearchParams } from '../types';

// Define the shape of the data needed to create a service
export interface ServiceCreationData {
  title: string;
  description: string;
  category: string;
  price: number;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
}

/**
 * Fetches all available services.
 * Corresponds to: GET /api/services
 */
export const getServices = async (params: ServiceSearchParams): Promise<Service[]> => {
  // Filter out empty params
  const filteredParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null && v !== ''));
  const { data } = await api.get('/services', { params: filteredParams });
  return data;
};

/**
 * Creates a new service listing for the logged-in provider.
 * Corresponds to: POST /api/services
 * @param serviceData The data for the new service.
 */
export const createService = async (serviceData: ServiceCreationData): Promise<Service> => {
  const { data } = await api.post('/services', serviceData);
  return data;
};

/**
 * Books a service, creating a task and payment intent.
 * Corresponds to: POST /api/services/:serviceId/book
 * @param serviceId The ID of the service to book.
 */
export const bookService = async (
  serviceId: string,
  paymentMethod: 'Stripe' | 'Cash'
): Promise<{ task: Task; clientSecret: string | null }> => {
  const { data } = await api.post(`/services/${serviceId}/book`, { paymentMethod });
  return data;
};

/**
 * Fetches services created by the currently logged-in user.
 * Corresponds to: GET /api/services/myservices
 */
export const getMyOfferedServices = async (): Promise<Service[]> => {
  const { data } = await api.get('/services/myservices');
  return data;
};


/**
 * Fetches a single service by its ID.
 * Corresponds to: GET /api/services/:id
 * @param serviceId The ID of the service.
 */
export const getServiceById = async (serviceId: string): Promise<Service> => {
  const { data } = await api.get(`/services/${serviceId}`);
  return data;
};