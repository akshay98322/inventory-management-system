import apiClient from './apiClient';

export interface Supplier {
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

export const getSuppliers = async (page: number = 1, search: string = '', ordering: string = 'id', pageSize: number = 50): Promise<PaginatedResponse<Supplier>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('page_size', pageSize.toString());
  if (search) {
    params.append('search', search);
  }
  if (ordering) {
    params.append('ordering', ordering);
  }
  const response = await apiClient.get(`/purchase/suppliers/?${params.toString()}`);
  return response.data;
};

export const createSupplier = async (supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> => {
  const response = await apiClient.post('/purchase/suppliers/', supplierData);
  return response.data;
};

export const updateSupplier = async (id: number, supplierData: Partial<Supplier>): Promise<Supplier> => {
  const response = await apiClient.put(`/purchase/suppliers/${id}/`, supplierData);
  return response.data;
};

export const deleteSupplier = async (id: number): Promise<void> => {
  await apiClient.delete(`/purchase/suppliers/${id}/`);
};
