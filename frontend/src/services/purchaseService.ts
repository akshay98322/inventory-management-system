import apiClient from './apiClient';
import { Supplier } from './supplierService';
import { Product } from './productService';

export interface PurchaseOrderItem {
  id?: number;
  product: number;
  quantity: number;
}

export interface PurchaseOrder {
  id: number;
  supplier: number;
  supplier_name: string;
  invoice_number: string;
  order_date: string;
  status: string;
  total_amount: string;
  items: PurchaseOrderItem[];
  order_items?: PurchaseOrderItem[]; // For viewing existing orders from backend
  created_at: string;
  updated_at: string;
}

export interface PaginatedPurchaseOrderResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PurchaseOrder[];
}

export const getPurchaseOrders = async (page: number = 1, search: string = '', ordering: string = ''): Promise<PaginatedPurchaseOrderResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    ...(search && { search }),
    ...(ordering && { ordering })
  });
  
  const response = await apiClient.get(`/purchase/purchase-orders/?${params}`);
  return response.data;
};

export const getPurchaseOrderById = async (id: number): Promise<PurchaseOrder> => {
  const response = await apiClient.get(`/purchase/purchase-orders/${id}/`);
  return response.data;
};

export interface CreatePurchaseOrderItem {
  product: number;
  quantity: number;
  batch_number: string;
  expiry_date: string;
  purchase_price: number;
  sale_price: number;
  mrp: number;
  tax: number;
  hsn_code: string;
}

export interface CreatePurchaseOrderData {
  supplier: number;
  invoice_number: string;
  order_date: string;
  items: CreatePurchaseOrderItem[];
}

export const createPurchaseOrder = async (orderData: CreatePurchaseOrderData): Promise<PurchaseOrder> => {
  try {
    console.log('Creating purchase order with data:', JSON.stringify(orderData, null, 2));
    const response = await apiClient.post('/purchase/purchase-orders/', orderData);
    console.log('Purchase order created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating purchase order:');
    console.error('Request data:', JSON.stringify(orderData, null, 2));
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.message);
    throw error;
  }
};

export const updatePurchaseOrderStatus = async (id: number, status: string): Promise<PurchaseOrder> => {
  console.log('Making API call to update purchase order:', id, status);
  const response = await apiClient.patch(`/purchase/purchase-orders/${id}/`, { status });
  console.log('API response:', response.data);
  return response.data;
};

export const updatePurchaseOrder = async (id: number, orderData: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
  const response = await apiClient.patch(`/purchase/purchase-orders/${id}/`, orderData);
  return response.data;
};

export const getSuppliers = async (): Promise<Supplier[]> => {
    const response = await apiClient.get('/purchase/suppliers/');
    return response.data;
};

export const getProducts = async (): Promise<Product[]> => {
    const response = await apiClient.get('/inventory/products/');
    return response.data;
};
