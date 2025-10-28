import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Modal,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  Autocomplete,
  Grid,
  Chip,
  Divider
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { Add, Search, Print, Edit, Visibility } from '@mui/icons-material';
import { getSaleOrders, getSaleOrderById, createSaleOrder, updateSaleOrderStatus, updateSaleOrder, SaleOrder, CreateSaleOrderData } from '../services/saleService';
import { getCompanySettings, CompanySettings } from '../services/companySettingsService';
import { getCustomers, Customer } from '../services/customerService';
import { getStockItems, Stock } from '../services/stockService';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useOptimizedCallback, useStableReference } from '../hooks/usePerformance';
import { useDebouncedValue } from '../hooks/useDebounceValue';
import DataTable, { Column } from '../components/DataTable';

type SortField = keyof SaleOrder;
type SortDirection = 'asc' | 'desc';

interface NewOrderItem {
  stock: Stock | null;
  quantity: number;
}

interface NewOrder {
  customer: Customer | null;
  items: NewOrderItem[];
}

// Memoized modal style to prevent recreation
const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  maxHeight: '90vh',
  overflow: 'auto',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

// Memoized status chip component
const StatusChip = React.memo<{ status: string }>(({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Chip 
      label={status} 
      color={getStatusColor(status) as any}
      size="small"
      variant="filled"
    />
  );
});

StatusChip.displayName = 'StatusChip';

// Memoized order item row component
const OrderItemRow = React.memo<{
  item: NewOrderItem;
  index: number;
  availableStocks: Stock[];
  onStockChange: (index: number, stock: Stock | null) => void;
  onQuantityChange: (index: number, quantity: number) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}>(({ 
  item, 
  index, 
  availableStocks, 
  onStockChange, 
  onQuantityChange, 
  onRemove, 
  canRemove 
}) => {
  const handleStockChange = useCallback(
    (stock: Stock | null) => onStockChange(index, stock),
    [index, onStockChange]
  );

  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const quantity = parseInt(e.target.value) || 0;
      onQuantityChange(index, quantity);
    },
    [index, onQuantityChange]
  );

  const handleRemove = useCallback(
    () => onRemove(index),
    [index, onRemove]
  );

  const maxQuantity = item.stock?.quantity || 0;
  const isQuantityValid = item.quantity > 0 && item.quantity <= maxQuantity;

  return (
    <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Autocomplete
          options={availableStocks}
          getOptionLabel={(option) => `${option.product_name} - ${option.batch_number}`}
          value={item.stock}
          onChange={(_, newValue) => handleStockChange(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Product"
              required
              error={!item.stock}
              helperText={
                !item.stock 
                  ? 'Please select a product' 
                  : `Available: ${item.stock.quantity}`
              }
            />
          )}
        />
      </Grid>
      
      <Grid size={{ xs: 8, md: 3 }}>
        <TextField
          label="Quantity"
          type="number"
          value={item.quantity}
          onChange={handleQuantityChange}
          required
          error={!isQuantityValid}
          helperText={
            !isQuantityValid 
              ? `Must be between 1 and ${maxQuantity}` 
              : undefined
          }
          inputProps={{ min: 1, max: maxQuantity }}
        />
      </Grid>

      <Grid size={{ xs: 4, md: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          ₹{((item.stock?.sale_price || 0) * item.quantity).toFixed(2)}
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, md: 2 }}>
        <IconButton
          onClick={handleRemove}
          disabled={!canRemove}
          color="error"
          size="small"
        >
          <RemoveCircleOutlineIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
});

OrderItemRow.displayName = 'OrderItemRow';

const SalesPageOptimized: React.FC = () => {
  // Simple notification function
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    alert(`${type.toUpperCase()}: ${message}`);
  };

  // State management
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<keyof SaleOrder>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Modal states
  const [modals, setModals] = useState({
    create: false,
    view: false,
    edit: false
  });
  
  const [selectedOrder, setSelectedOrder] = useState<SaleOrder | null>(null);
  const [editOrder, setEditOrder] = useState<SaleOrder | null>(null);
  
  // Form states
  const [customerLoading, setCustomerLoading] = useState(false);
  const [stockLoading, setStockLoading] = useState(false);
  const [customerOptions, setCustomerOptions] = useState<Customer[]>([]);
  const [customerInputValue, setCustomerInputValue] = useState('');
  
  const [newOrder, setNewOrder] = useState<NewOrder>({
    customer: null,
    items: [{ stock: null, quantity: 1 }]
  });

  // Debounced search
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);
  const debouncedCustomerSearch = useDebouncedValue(customerInputValue, 300);

  // Memoized ordering
  const ordering = useMemo(() => 
    sortDirection === 'desc' ? `-${sortField}` : sortField,
    [sortField, sortDirection]
  );

  // Available stocks (non-zero quantity only)
  const availableStocks = useMemo(() => 
    stocks.filter(stock => stock.quantity > 0),
    [stocks]
  );

  // Stable modal style reference
  const stableModalStyle = useStableReference(modalStyle);

  // Data fetching with useInfiniteScroll
  const fetchSaleOrdersData = useOptimizedCallback(async (page: number, search: string, ordering: string) => {
    return await getSaleOrders(page, search, ordering);
  }, []);

  const {
    data: saleOrders = [],
    loading,
    hasMore,
    error,
    loadMore,
    refresh,
    totalCount
  } = useInfiniteScroll({
    fetchData: fetchSaleOrdersData,
    searchTerm: debouncedSearchTerm,
    ordering,
    dependencies: []
  });

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [customersData, stocksData] = await Promise.all([
          getCustomers(1, '', 'name', 100),
          getStockItems(1, '', '')
        ]);
        
        setCustomers(customersData.results);
        setStocks(stocksData.results);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        showNotification('Error loading data', 'error');
      }
    };

    fetchInitialData();
  }, [showNotification]);

  // Customer search effect
  useEffect(() => {
    if (debouncedCustomerSearch) {
      const searchCustomers = async () => {
        setCustomerLoading(true);
        try {
          const data = await getCustomers(1, debouncedCustomerSearch, 'name', 500);
          setCustomerOptions(data.results);
        } catch (error) {
          console.error('Error searching customers:', error);
          showNotification('Error searching customers', 'error');
        } finally {
          setCustomerLoading(false);
        }
      };
      searchCustomers();
    } else {
      setCustomerOptions(customers.slice(0, 20));
    }
  }, [debouncedCustomerSearch, customers, showNotification]);

  // Optimized event handlers
  const handleOpenModal = useOptimizedCallback((modalType: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalType]: true }));
  }, []);

  const handleCloseModal = useOptimizedCallback((modalType: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalType]: false }));
    if (modalType === 'create') {
      setNewOrder({
        customer: null,
        items: [{ stock: null, quantity: 1 }]
      });
    }
    if (modalType === 'view') setSelectedOrder(null);
    if (modalType === 'edit') setEditOrder(null);
  }, []);

  const handleSort = useOptimizedCallback((field: keyof SaleOrder) => {
    setSortDirection(prev => 
      sortField === field && prev === 'asc' ? 'desc' : 'asc'
    );
    setSortField(field);
  }, [sortField]);

  // Order item management
  const handleStockChange = useOptimizedCallback((index: number, stock: Stock | null) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, stock, quantity: 1 } : item
      )
    }));
  }, []);

  const handleQuantityChange = useOptimizedCallback((index: number, quantity: number) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, quantity } : item
      )
    }));
  }, []);

  const handleAddItem = useOptimizedCallback(() => {
    setNewOrder(prev => ({
      ...prev,
      items: [...prev.items, { stock: null, quantity: 1 }]
    }));
  }, []);

  const handleRemoveItem = useOptimizedCallback((index: number) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  }, []);

  const handleSubmitOrder = useOptimizedCallback(async () => {
    if (!newOrder.customer) {
      showNotification('Please select a customer', 'error');
      return;
    }

    const invalidItems = newOrder.items.filter(item => 
      !item.stock || item.quantity <= 0 || item.quantity > (item.stock?.quantity || 0)
    );

    if (invalidItems.length > 0) {
      showNotification('Please check all items have valid stock and quantity', 'error');
      return;
    }

    try {
      const orderData: CreateSaleOrderData = {
        customer: newOrder.customer.id,
        items: newOrder.items.map(item => ({
          stock: item.stock!.id,
          quantity: item.quantity
        }))
      };

      await createSaleOrder(orderData);
      showNotification('Sale order created successfully', 'success');
      handleCloseModal('create');
      refresh();
    } catch (error) {
      console.error('Error creating sale order:', error);
      showNotification('Error creating sale order', 'error');
    }
  }, [newOrder, showNotification, handleCloseModal, refresh]);

  // Table columns configuration
  const columns = useMemo<Column<SaleOrder>[]>(() => [
    {
      id: 'id',
      label: 'ID',
      sortable: true,
      minWidth: 70
    },
    {
      id: 'invoice_number',
      label: 'Invoice',
      sortable: true,
      minWidth: 120
    },
    {
      id: 'customer',
      label: 'Customer',
      sortable: true,
      render: (_, order) => order.customer_name || '-',
      minWidth: 150
    },
    {
      id: 'order_date',
      label: 'Order Date',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
      minWidth: 120
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => <StatusChip status={value} />,
      minWidth: 120
    },
    {
      id: 'total_amount',
      label: 'Total Amount',
      sortable: true,
      render: (value) => `₹${value}`,
      align: 'right',
      minWidth: 130
    }
  ], [handleOpenModal]);

  const handlePrintInvoice = useOptimizedCallback(async (order: SaleOrder) => {
    try {
      // Implementation for printing invoice
      showNotification('Invoice print feature coming soon', 'info');
    } catch (error) {
      showNotification('Error printing invoice', 'error');
    }
  }, [showNotification]);

  // Calculate total for new order
  const orderTotal = useMemo(() => 
    newOrder.items.reduce((total, item) => 
      total + (item.stock?.sale_price || 0) * item.quantity, 0
    ),
    [newOrder.items]
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">Sales Orders</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenModal('create')}
        >
          Create Sale Order
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ minWidth: 300 }}
        />
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Data Table */}
      <DataTable
        data={saleOrders}
        columns={columns}
        loading={loading}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        hasMore={hasMore}
        onLoadMore={loadMore}
        totalCount={totalCount}
        emptyMessage="No sale orders found"
        rowKey="id"
        onRowClick={(order) => {
          setSelectedOrder(order);
          handleOpenModal('view');
        }}
      />

      {/* Create Order Modal */}
      <Modal
        open={modals.create}
        onClose={() => handleCloseModal('create')}
      >
        <Box sx={stableModalStyle}>
          <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
            Create New Sale Order
          </Typography>

          {/* Customer Selection */}
          <Box sx={{ mb: 3 }}>
            <Autocomplete
              options={customerOptions}
              getOptionLabel={(option) => option.name}
              value={newOrder.customer}
              onChange={(_, newValue) => setNewOrder(prev => ({ ...prev, customer: newValue }))}
              inputValue={customerInputValue}
              onInputChange={(_, newInputValue) => setCustomerInputValue(newInputValue)}
              loading={customerLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Customer"
                  required
                  error={!newOrder.customer}
                  helperText={!newOrder.customer ? 'Please select a customer' : undefined}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {customerLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Order Items */}
          <Typography variant="h6" sx={{ mb: 2 }}>Order Items</Typography>
          
          {newOrder.items.map((item, index) => (
            <OrderItemRow
              key={index}
              item={item}
              index={index}
              availableStocks={availableStocks}
              onStockChange={handleStockChange}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemoveItem}
              canRemove={newOrder.items.length > 1}
            />
          ))}

          <Button
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleAddItem}
            sx={{ mb: 2 }}
          >
            Add Item
          </Button>

          <Divider sx={{ my: 2 }} />

          {/* Order Total */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Typography variant="h6">
              Total: ₹{orderTotal.toFixed(2)}
            </Typography>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => handleCloseModal('create')}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmitOrder}
              disabled={!newOrder.customer || newOrder.items.some(item => !item.stock)}
            >
              Create Order
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* View Order Modal */}
      <Modal
        open={modals.view}
        onClose={() => handleCloseModal('view')}
      >
        <Box sx={stableModalStyle}>
          {selectedOrder && (
            <>
              <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
                Order Details - {selectedOrder.invoice_number}
              </Typography>
              
              {/* Order information display */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography><strong>Customer:</strong> {selectedOrder.customer_name}</Typography>
                  <Typography><strong>Order Date:</strong> {new Date(selectedOrder.order_date).toLocaleDateString()}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography><strong>Status:</strong> <StatusChip status={selectedOrder.status} /></Typography>
                  <Typography><strong>Total:</strong> ₹{selectedOrder.total_amount}</Typography>
                </Grid>
              </Grid>

              {/* Additional order details can be added here */}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={() => handleCloseModal('view')}>Close</Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default SalesPageOptimized;