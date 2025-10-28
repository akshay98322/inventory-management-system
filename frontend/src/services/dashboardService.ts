import apiClient from './apiClient';

export interface DashboardMetrics {
  manufacturers_count: number;
  products_count: number;
  suppliers_count: number;
  customers_count: number;
  stock_items_count: number;
}

export interface EmptyStockItem {
  id: number;
  product_name: string;
  company_name: string;
  batch_number: string;
  expiry_date: string;
  purchase_price: number;
  sale_price: number;
  mrp: number;
  tax: number;
  hsn_code: string;
}

export interface LowStockItem {
  id: number;
  product_name: string;
  company_name: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  purchase_price: number;
  sale_price: number;
  mrp: number;
  tax: number;
  hsn_code: string;
}

export interface DashboardMetricsResponse {
  metrics: DashboardMetrics;
  empty_stock_items: EmptyStockItem[];
  empty_stock_count: number;
}

export interface LowStockResponse {
  low_stock_items: LowStockItem[];
  low_stock_count: number;
  threshold: number;
}

/**
 * Service for dashboard-related API operations
 */
export const dashboardService = {
  /**
   * Get dashboard metrics including counts and empty stock items
   */
  getDashboardMetrics: async (): Promise<DashboardMetricsResponse> => {
    try {
      const response = await apiClient.get('/dashboard/metrics/');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  },

  /**
   * Get low stock items with optional threshold
   */
  getLowStockItems: async (threshold: number = 10): Promise<LowStockResponse> => {
    try {
      const response = await apiClient.get('/dashboard/low-stock/', {
        params: { threshold }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      throw error;
    }
  },

  /**
   * Get only metrics without empty stock items (lighter response)
   */
  getMetricsOnly: async (): Promise<DashboardMetrics> => {
    try {
      const response = await apiClient.get('/dashboard/metrics/');
      return response.data.metrics;
    } catch (error) {
      console.error('Error fetching metrics:', error);
      throw error;
    }
  },

  /**
   * Get only empty stock items without metrics
   */
  getEmptyStockOnly: async (): Promise<EmptyStockItem[]> => {
    try {
      const response = await apiClient.get('/dashboard/metrics/');
      return response.data.empty_stock_items;
    } catch (error) {
      console.error('Error fetching empty stock items:', error);
      throw error;
    }
  }
};

export default dashboardService;