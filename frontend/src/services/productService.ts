import apiClient from './apiClient';
import { Company } from './companyService';

export interface Product {
  id: number;
  name: string;
  company: number;
  company_name: string;
  sale_price: string;
  purchase_price: string;
  mrp: string;
  tax: string;
  hsn_code: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const getProducts = async (page: number = 1, search: string = '', ordering: string = 'id', pageSize: number = 50): Promise<PaginatedResponse<Product>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('page_size', pageSize.toString());
  if (search) {
    params.append('search', search);
  }
  if (ordering) {
    params.append('ordering', ordering);
  }
  const response = await apiClient.get(`/inventory/products/?${params.toString()}`);
  return response.data;
};

export const getProduct = async (id: number): Promise<Product> => {
    const response = await apiClient.get(`/inventory/products/${id}/`);
    return response.data;
};

export const createProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
  const response = await apiClient.post('/inventory/products/', productData);
  return response.data;
};

export const updateProduct = async (id: number, productData: Partial<Product>): Promise<Product> => {
  const response = await apiClient.put(`/inventory/products/${id}/`, productData);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await apiClient.delete(`/inventory/products/${id}/`);
};

export const getCompanies = async (): Promise<Company[]> => {
    const response = await apiClient.get('/inventory/companies/');
    return response.data;
};
