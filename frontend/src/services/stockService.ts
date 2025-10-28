import apiClient from './apiClient';

export interface Stock {
  id: number;
  product: number;
  product_name?: string; // From backend serializer
  company_name?: string; // From backend serializer (manufacturer)
  batch_number: string;
  expiry_date: string;
  quantity: number;
  purchase_price: number;
  sale_price: number;
  mrp: number;
  tax: number;
  hsn_code: string;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedStockResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Stock[];
}

export const getStockItems = async (page: number = 1, search: string = '', ordering: string = ''): Promise<PaginatedStockResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    ...(search && { search }),
    ...(ordering && { ordering })
  });
  
  console.log('Fetching stock with params:', params.toString());
  const response = await apiClient.get(`/inventory/stock/?${params}`);
  console.log('Stock response:', response.data);
  return response.data;
};

export const createStock = async (stock: Omit<Stock, 'id' | 'created_at' | 'updated_at' | 'total_price' | 'product_name' | 'company_name'>): Promise<Stock> => {
  console.log('Creating stock:', stock);
  const response = await apiClient.post('/inventory/stock/', stock);
  console.log('Create stock response:', response.data);
  return response.data;
};

export const updateStock = async (id: number, stock: Partial<Stock>): Promise<Stock> => {
  const response = await apiClient.put(`/inventory/stock/${id}/`, stock);
  return response.data;
};

export const deleteStock = async (id: number): Promise<void> => {
  await apiClient.delete(`/inventory/stock/${id}/`);
};
