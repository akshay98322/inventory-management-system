import apiClient from './apiClient';

export interface SaleOrder {
  id: number;
  customer: number;
  customer_name: string;
  invoice_number: string;
  order_date: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
  total_amount: string;
  created_at: string;
  updated_at: string;
  order_items?: SaleOrderItem[];
}

export interface SaleOrderItem {
  id: number;
  stock: number;
  stock_details?: any; // Stock object from API
  product?: string; // Product name from stock
  product_id?: number; // Product ID from stock
  batch_number?: string;
  expiry_date?: string;
  quantity: number;
  purchase_price?: number;
  sale_price?: number;
  mrp?: number;
  tax?: number;
  hsn_code?: string;
  total_price: string;
}

export interface CreateSaleOrderData {
  customer: number;
  items: {
    stock: number;
    quantity: number;
  }[];
}

export interface PaginatedSaleOrderResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SaleOrder[];
}

// Sale Orders API
export const getSaleOrders = async (page: number = 1, search: string = '', ordering: string = ''): Promise<PaginatedSaleOrderResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    ...(search && { search }),
    ...(ordering && { ordering })
  });
  
  console.log('Fetching sale orders with params:', params.toString());
  const response = await apiClient.get(`/sale/orders/?${params}`);
  console.log('Sale orders response:', response.data);
  return response.data;
};

export const getSaleOrderById = async (id: number): Promise<SaleOrder> => {
  const response = await apiClient.get(`/sale/orders/${id}/`);
  return response.data;
};

export const createSaleOrder = async (orderData: CreateSaleOrderData): Promise<SaleOrder> => {
  console.log('Creating sale order:', orderData);
  const response = await apiClient.post('/sale/orders/', orderData);
  console.log('Create sale order response:', response.data);
  return response.data;
};

export const updateSaleOrderStatus = async (id: number, status: string): Promise<SaleOrder> => {
  console.log('Updating sale order status:', id, status);
  const response = await apiClient.patch(`/sale/orders/${id}/`, { status });
  console.log('Update sale order status response:', response.data);
  return response.data;
};

export const updateSaleOrder = async (id: number, updateData: Partial<SaleOrder>): Promise<SaleOrder> => {
  const response = await apiClient.patch(`/sale/orders/${id}/`, updateData);
  return response.data;
};

// Sale Order Items API
export const getSaleOrderItems = async (): Promise<SaleOrderItem[]> => {
  const response = await apiClient.get('/sale/order-items/');
  return response.data.results;
};

export const createSaleOrderItem = async (itemData: Omit<SaleOrderItem, 'id' | 'total_price'>): Promise<SaleOrderItem> => {
  const response = await apiClient.post('/sale/order-items/', itemData);
  return response.data;
};