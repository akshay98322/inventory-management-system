import apiClient from './apiClient';

export interface Customer {
  id: number;
  name: string;
  contact_person: string;
  phone_number: string;
  email: string;
  address: string;
  drug_license_number: string;
  gst_number: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const getCustomers = async (page: number = 1, search: string = '', ordering: string = 'id', pageSize: number = 50): Promise<PaginatedResponse<Customer>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('page_size', pageSize.toString());
  if (search) {
    params.append('search', search);
  }
  if (ordering) {
    params.append('ordering', ordering);
  }
  const response = await apiClient.get(`/sale/customers/?${params.toString()}`);
  return response.data;
};

export const createCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> => {
  const response = await apiClient.post('/sale/customers/', customerData);
  return response.data;
};

export const updateCustomer = async (id: number, customerData: Partial<Customer>): Promise<Customer> => {
  const response = await apiClient.put(`/sale/customers/${id}/`, customerData);
  return response.data;
};

export const deleteCustomer = async (id: number): Promise<void> => {
  await apiClient.delete(`/sale/customers/${id}/`);
};