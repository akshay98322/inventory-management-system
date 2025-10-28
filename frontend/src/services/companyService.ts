import apiClient from './apiClient';

export interface Company {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const getCompanies = async (page: number = 1, search: string = '', ordering: string = 'id'): Promise<PaginatedResponse<Company>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  if (search) {
    params.append('search', search);
  }
  if (ordering) {
    params.append('ordering', ordering);
  }
  const response = await apiClient.get(`/inventory/companies/?${params.toString()}`);
  return response.data;
};

// Keep the old function for backward compatibility with other components
export const getAllCompanies = async (): Promise<Company[]> => {
  const response = await apiClient.get('/inventory/companies/?page_size=1000');
  return response.data.results || response.data;
};export const createCompany = async (company: Omit<Company, 'id' | 'created_at' | 'updated_at'>): Promise<Company> => {
    const response = await apiClient.post('/inventory/companies/', company);
    return response.data;
};

export const updateCompany = async (id: number, company: Partial<Omit<Company, 'id' | 'created_at' | 'updated_at'>>): Promise<Company> => {
    const response = await apiClient.put(`/inventory/companies/${id}/`, company);
    return response.data;
};

export const deleteCompany = async (id: number): Promise<void> => {
    await apiClient.delete(`/inventory/companies/${id}/`);
};
