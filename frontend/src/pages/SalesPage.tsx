import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Modal, Typography, TextField, IconButton, CircularProgress, Alert, TableSortLabel, Autocomplete
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { Add, Search } from '@mui/icons-material';
import { getSaleOrders, getSaleOrderById, createSaleOrder, updateSaleOrderStatus, updateSaleOrder, SaleOrder, CreateSaleOrderData } from '../services/saleService';
import { getCompanySettings, CompanySettings } from '../services/companySettingsService';
import { getCustomers, Customer } from '../services/customerService';
import { getStockItems, Stock } from '../services/stockService';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useOptimizedCallback, useStableReference } from '../hooks/usePerformance';
import { useDebouncedValue } from '../hooks/useDebounceValue';

type SortField = 'id' | 'customer__name' | 'invoice_number' | 'order_date' | 'status' | 'total_amount' | 'created_at' | 'updated_at';
type SortDirection = 'asc' | 'desc';

const style = {
  position: 'absolute' as 'absolute',
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
  const getStatusColor = useCallback((status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return { bg: 'success.main', text: 'success.contrastText' };
      case 'pending': return { bg: 'warning.main', text: 'warning.contrastText' };
      case 'cancelled': return { bg: 'error.main', text: 'error.contrastText' };
      default: return { bg: 'grey.300', text: 'text.primary' };
    }
  }, []);

  const colors = useMemo(() => getStatusColor(status), [status, getStatusColor]);

  return (
    <Box
      sx={{
        px: 1,
        py: 0.5,
        borderRadius: 1,
        backgroundColor: colors.bg,
        color: colors.text,
        display: 'inline-block',
        fontSize: '0.875rem'
      }}
    >
      {status}
    </Box>
  );
});

StatusChip.displayName = 'StatusChip';

// Memoized order item component
interface OrderItemRowProps {
  item: { stock: Stock | null; quantity: number };
  index: number;
  stockInputValue: string;
  stockLoading: boolean;
  filteredStocks: Stock[];
  newOrderItems: { stock: Stock | null; quantity: number }[];
  onItemChange: (index: number, field: 'stock' | 'quantity', value: any) => void;
  onStockInputChange: (index: number, value: string) => void;
  onRemoveItem: (index: number) => void;
  onStockSearchChange: (value: string) => void;
}

const OrderItemRow = React.memo<OrderItemRowProps>(({
  item,
  index,
  stockInputValue,
  stockLoading,
  filteredStocks,
  newOrderItems,
  onItemChange,
  onStockInputChange,
  onRemoveItem,
  onStockSearchChange
}) => {
  const handleStockChange = useOptimizedCallback((newValue: Stock | null) => {
    onItemChange(index, 'stock', newValue);
    // Auto-adjust quantity if it exceeds available stock
    if (newValue && item.quantity > newValue.quantity) {
      onItemChange(index, 'quantity', Math.min(item.quantity, newValue.quantity));
    }
  }, [index, onItemChange, item.quantity]);

  const handleQuantityChange = useOptimizedCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(parseInt(e.target.value) || 1, item.stock?.quantity || 1));
    onItemChange(index, 'quantity', value);
  }, [index, onItemChange, item.stock?.quantity]);

  const handleStockInputChange = useOptimizedCallback((newInputValue: string) => {
    onStockInputChange(index, newInputValue);
    onStockSearchChange(newInputValue);
  }, [index, onStockInputChange, onStockSearchChange]);

  const handleRemove = useOptimizedCallback(() => {
    onRemoveItem(index);
  }, [index, onRemoveItem]);

  const canRemove = newOrderItems.length > 1;

  return (
    <Paper key={index} sx={{ p: 2, mb: 2, backgroundColor: 'grey.50' }}>
      {/* Stock Selection */}
      <Autocomplete
        fullWidth
        options={filteredStocks}
        getOptionLabel={(option) => `${option.product_name} (Batch: ${option.batch_number}, Available: ${option.quantity})`}
        value={item.stock}
        onChange={(_, newValue) => handleStockChange(newValue)}
        inputValue={stockInputValue}
        onInputChange={(_, newInputValue) => handleStockInputChange(newInputValue)}
        filterOptions={(options) => options} // Disable client-side filtering
        loading={stockLoading}
        noOptionsText={stockInputValue && stockInputValue.length >= 2 ? "No stocks found" : "Type at least 2 characters to search"}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Stock Item *"
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
            placeholder="Type at least 2 characters to search..."
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {stockLoading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      {/* Stock Details Display */}
      {item.stock && (
        <Box sx={{ mb: 2, p: 1, backgroundColor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2">
            <strong>Product:</strong> {item.stock.product_name} | 
            <strong> Batch:</strong> {item.stock.batch_number} | 
            <strong> Expiry:</strong> {item.stock.expiry_date} | 
            <strong> Available:</strong> {item.stock.quantity} | 
            <strong> Sale Price:</strong> ₹{item.stock.sale_price} | 
            <strong> MRP:</strong> ₹{item.stock.mrp}
          </Typography>
        </Box>
      )}

      {/* Quantity and Remove Button */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          type="number"
          label="Quantity *"
          value={item.quantity}
          onChange={handleQuantityChange}
          variant="outlined"
          size="small"
          inputProps={{ 
            min: 1, 
            max: item.stock?.quantity || 1,
            step: 1 
          }}
          sx={{ flex: 1 }}
          helperText={item.stock ? `Max available: ${item.stock.quantity}` : ''}
        />
        <IconButton 
          onClick={handleRemove} 
          color="error"
          disabled={!canRemove}
          sx={{ ml: 1 }}
        >
          <RemoveCircleOutlineIcon />
        </IconButton>
      </Box>
    </Paper>
  );
});

OrderItemRow.displayName = 'OrderItemRow';

const SalesPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [customerOptions, setCustomerOptions] = useState<Customer[]>([]);
  const [stockSearch, setStockSearch] = useState<string>('');
  const [customerInputValue, setCustomerInputValue] = useState('');
  const [stockInputValues, setStockInputValues] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SaleOrder | null>(null);
  const [editOrder, setEditOrder] = useState<SaleOrder | null>(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [stockLoading, setStockLoading] = useState(false);
  const [newOrder, setNewOrder] = useState<{ 
    customer: Customer | null, 
    items: { 
      stock: Stock | null, 
      quantity: number
    }[] 
  }>({
    customer: null,
    items: [{ 
      stock: null, 
      quantity: 1
    }]
  });

  // Debounced search values
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);
  const debouncedCustomerSearch = useDebouncedValue(customerInputValue, 300);
  const debouncedStockSearch = useDebouncedValue(stockSearch, 300);

  // Create ordering string from sort field and direction
  const ordering = useMemo(() => 
    sortDirection === 'desc' ? `-${sortField}` : sortField,
    [sortField, sortDirection]
  );

  // Fetch data with pagination
  const fetchSaleOrdersData = useCallback(async (page: number, search: string, ordering: string) => {
    return await getSaleOrders(page, search, ordering);
  }, []);

  const {
    data: saleOrders = [],
    loading,
    hasMore, // eslint-disable-line @typescript-eslint/no-unused-vars
    error,
    loadMore, // eslint-disable-line @typescript-eslint/no-unused-vars
    refresh,
    totalCount
  } = useInfiniteScroll({
    fetchData: fetchSaleOrdersData,
    searchTerm: debouncedSearchTerm,
    ordering,
    dependencies: []
  });

  useEffect(() => {
    fetchCustomers();
    fetchStocks();
  }, []);

  // Search customers dynamically
  useEffect(() => {
    const searchCustomers = async () => {
      setCustomerLoading(true);
      try {
        // Use larger page size for search to get more results
        const data = await getCustomers(1, customerInputValue, 'name', 500);
        setCustomerOptions(data.results);
      } catch (error) {
        console.error('Error searching customers:', error);
      } finally {
        setCustomerLoading(false);
      }
    };

    if (customerInputValue && customerInputValue.length > 0) {
      const timeoutId = setTimeout(searchCustomers, 300); // Debounce search
      return () => clearTimeout(timeoutId);
    } else {
      setCustomerOptions(customers);
      setCustomerLoading(false);
    }
  }, [customerInputValue, customers]);

  // Memoized available stocks calculation
  const availableStocks = useMemo(() => 
    stocks.filter(stock => stock.quantity > 0),
    [stocks]
  );

  // Memoized stable modal style
  const stableModalStyle = useStableReference(style);

  // Memoized order total calculation
  const orderTotal = useMemo(() => 
    newOrder.items.reduce((total, item) => 
      total + (item.stock?.sale_price || 0) * item.quantity, 0
    ),
    [newOrder.items]
  );

  // Memoized customer name lookup
  const getCustomerName = useOptimizedCallback((id: number) => 
    customers.find(c => c.id === id)?.name || 'Unknown',
    [customers]
  );

  // Optimized fetch functions
  const fetchCustomers = useOptimizedCallback(async () => {
    const data = await getCustomers(1, '', 'name', 500); // Load more customers initially
    setCustomers(data.results);
    setCustomerOptions(data.results);
  }, []);

  const fetchStocks = useOptimizedCallback(async () => {
    try {
      const data = await getStockItems(1, '', 'product_name'); // Load stocks with product name ordering
      // All stocks are loaded, filtering will be done with useMemo
      setStocks(data.results);
      setFilteredStocks(data.results.filter(stock => stock.quantity > 0));
    } catch (error: any) {
      console.error('Error fetching initial stocks:', error);
    }
  }, []);

  const handleSort = useOptimizedCallback((field: SortField) => {
    if (sortField === field) {
      // If clicking the same field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a different field, set new field and default to asc
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

  const handleOpen = useOptimizedCallback(() => {
    setOpen(true);
    // Initialize stockInputValues array for the initial item
    setStockInputValues(['']);
    setStockSearch(''); // Reset search
  }, []);
  
  const handleClose = useOptimizedCallback(() => {
    setOpen(false);
    setCustomerInputValue('');
    setStockInputValues([]);
    setStockSearch(''); // Reset stock search
    setNewOrder({ 
      customer: null,
      items: [{ 
        stock: null, 
        quantity: 1
      }] 
    });
  }, []);

  // Optimized item management functions
  const handleItemChange = useOptimizedCallback((index: number, field: string, value: any) => {
    const items = [...newOrder.items];
    items[index] = { ...items[index], [field]: value };
    setNewOrder({ ...newOrder, items });
  }, [newOrder]);

  const handleStockInputChange = useOptimizedCallback((index: number, value: string) => {
    const newInputValues = [...stockInputValues];
    newInputValues[index] = value;
    setStockInputValues(newInputValues);
  }, [stockInputValues]);

  const removeItem = useOptimizedCallback((index: number) => {
    if (newOrder.items.length > 1) {
      const items = newOrder.items.filter((_, i) => i !== index);
      const inputValues = stockInputValues.filter((_, i) => i !== index);
      setNewOrder({ ...newOrder, items });
      setStockInputValues(inputValues);
    }
  }, [newOrder, stockInputValues]);

  const addItem = useOptimizedCallback(() => {
    const newInputValues = [...stockInputValues, ''];
    setStockInputValues(newInputValues);
    setNewOrder({ 
      ...newOrder, 
      items: [...newOrder.items, { 
        stock: null, 
        quantity: 1
      }] 
    });
  }, [newOrder, stockInputValues]);

  // Simple stock search function - similar to ProductsPage
  const searchStocks = useCallback(async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      // Always filter to show only stocks with quantity > 0
      const availableStocks = stocks.filter(stock => stock.quantity > 0);
      setFilteredStocks(availableStocks);
      setStockLoading(false);
      return;
    }

    setStockLoading(true);
    try {
      const data = await getStockItems(1, searchTerm, 'product_name');
      // Filter only stocks with available quantity > 0
      const availableStocks = data.results.filter(stock => stock.quantity > 0);
      setFilteredStocks(availableStocks);
    } catch (error: any) {
      console.error('Error searching stocks:', error);
      // Fallback to available stocks only (filter out zero quantity)
      const availableStocks = stocks.filter(stock => stock.quantity > 0);
      setFilteredStocks(availableStocks);
    } finally {
      setStockLoading(false);
    }
  }, [stocks]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchStocks(stockSearch);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [stockSearch, searchStocks]);

  const handleSubmit = useOptimizedCallback(async () => {
    try {
      // Validate required fields
      if (!newOrder.customer) {
        alert('Please select a customer');
        return;
      }
      
      if (newOrder.items.some(item => !item.stock)) {
        alert('Please select a stock item for all items');
        return;
      }
      
      // Validate stock availability
      for (const item of newOrder.items) {
        if (item.stock && (item.stock.quantity <= 0 || item.quantity > item.stock.quantity)) {
          alert(`Insufficient stock for ${item.stock.product_name}. Available: ${item.stock.quantity}, Requested: ${item.quantity}`);
          return;
        }
      }

      const orderData: CreateSaleOrderData = {
        customer: newOrder.customer.id,
        items: newOrder.items.map(item => ({
          stock: item.stock!.id,
          quantity: item.quantity
        }))
      };

      console.log('Sending sale order data:', JSON.stringify(orderData, null, 2));
      await createSaleOrder(orderData);
      refresh();
      handleClose();
    } catch (err) {
      console.error('Error creating sale order:', err);
      alert('Error creating sale order. Please try again.');
    }
  }, [newOrder, refresh, handleClose]);

  const handleStatusChange = useOptimizedCallback(async (id: number, status: string) => {
    try {
      console.log('Updating sale order status:', id, status);
      const result = await updateSaleOrderStatus(id, status);
      console.log('Status update result:', result);
      refresh();
    } catch (error) {
      console.error('Error updating sale order status:', error);
    }
  }, [refresh]);

  // View Sale Order
  const handleViewOrder = async (order: SaleOrder) => {
    try {
      // Fetch detailed order data with items
      const detailedOrder = await getSaleOrderById(order.id);
      setSelectedOrder(detailedOrder);
      setViewOpen(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      alert('Error loading order details');
    }
  };

  const handleViewClose = () => {
    setViewOpen(false);
    setSelectedOrder(null);
  };

  // Edit Sale Order
  const handleEditOrder = async (order: SaleOrder) => {
    try {
      // Fetch detailed order data with items
      const detailedOrder = await getSaleOrderById(order.id);
      setEditOrder(detailedOrder);
      setEditOpen(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      alert('Error loading order details');
    }
  };

  // Print Invoice
  const handlePrintInvoice = async (order: SaleOrder) => {
    try {
      // Fetch detailed order data and company settings
      const [detailedOrder, companyData] = await Promise.all([
        getSaleOrderById(order.id),
        getCompanySettings()
      ]);
      
      // Generate and print invoice
      generateInvoice(detailedOrder, companyData);
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Error generating invoice');
    }
  };

  // Generate Invoice HTML and Print
  const generateInvoice = (order: SaleOrder, company: CompanySettings) => {
    const customer = customers.find(c => c.id === order.customer);
    
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sale Invoice - ${order.invoice_number}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            font-size: 12px;
            line-height: 1.4;
          }
          .invoice-header { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .company-details, .customer-details { 
            width: 45%; 
          }
          .company-details h2, .customer-details h2 { 
            margin: 0 0 10px 0; 
            color: #333;
            font-size: 16px;
          }
          .invoice-title { 
            text-align: center; 
            margin-bottom: 30px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 15px;
          }
          .invoice-title h1 { 
            margin: 0; 
            color: #333;
            font-size: 24px;
          }
          .invoice-info { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 30px;
          }
          .invoice-info div { 
            width: 30%; 
          }
          .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px;
          }
          .items-table th, .items-table td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left;
            font-size: 11px;
          }
          .items-table th { 
            background-color: #f5f5f5; 
            font-weight: bold;
          }
          .items-table td.number { 
            text-align: right; 
          }
          .total-section { 
            float: right; 
            width: 300px;
            border: 1px solid #ddd;
            padding: 15px;
            background-color: #f9f9f9;
          }
          .total-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 5px;
          }
          .total-row.final { 
            font-weight: bold; 
            font-size: 14px;
            border-top: 1px solid #333;
            padding-top: 5px;
            margin-top: 10px;
          }
          .footer {
            clear: both;
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 15px;
          }
          @media print {
            body { margin: 0; padding: 15px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div class="company-details">
            <h2>From: ${company.company_name}</h2>
            ${company.owner_name ? `<p><strong>Owner:</strong> ${company.owner_name}</p>` : ''}
            ${company.email ? `<p><strong>Email:</strong> ${company.email}</p>` : ''}
            <p><strong>Phone:</strong> ${company.phone_number || 'N/A'}</p>
            <p><strong>Address:</strong><br>${company.address || 'N/A'}</p>
            <p><strong>Drug License:</strong> ${company.drug_license_number || 'N/A'}</p>
            <p><strong>GST Number:</strong> ${company.gst_number || 'N/A'}</p>
          </div>
          <div class="customer-details">
            <h2>To: ${customer?.name || 'Unknown Customer'}</h2>
            <p><strong>Contact:</strong> ${customer?.contact_person || 'N/A'}</p>
            <p><strong>Phone:</strong> ${customer?.phone_number || 'N/A'}</p>
            <p><strong>Email:</strong> ${customer?.email || 'N/A'}</p>
            <p><strong>Address:</strong><br>${customer?.address || 'N/A'}</p>
            <p><strong>Drug License:</strong> ${customer?.drug_license_number || 'N/A'}</p>
            <p><strong>GST Number:</strong> ${customer?.gst_number || 'N/A'}</p>
          </div>
        </div>

        <div class="invoice-title">
          <h1>SALE INVOICE</h1>
        </div>

        <div class="invoice-info">
          <div>
            <strong>Invoice Number:</strong><br>
            ${order.invoice_number}
          </div>
          <div>
            <strong>Order Date:</strong><br>
            ${new Date(order.order_date).toLocaleDateString()}
          </div>
          <div>
            <strong>Status:</strong><br>
            ${order.status}
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Product Name</th>
              <th>Manufacturer</th>
              <th>HSN Code</th>
              <th>Batch No.</th>
              <th>Expiry Date</th>
              <th>Qty</th>
              <th>Sale Price</th>
              <th>MRP</th>
              <th>Tax %</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
            ${order.order_items?.map((item: any, index: number) => {
              return `
              <tr>
                <td>${index + 1}</td>
                <td>${item.product || 'Unknown Product'}</td>
                <td>${item.stock_details?.company_name || 'N/A'}</td>
                <td>${item.hsn_code || 'N/A'}</td>
                <td>${item.batch_number}</td>
                <td>${item.expiry_date}</td>
                <td class="number">${item.quantity}</td>
                <td class="number">₹${parseFloat(item.sale_price || '0').toFixed(2)}</td>
                <td class="number">₹${parseFloat(item.mrp || '0').toFixed(2)}</td>
                <td class="number">${item.tax || 0}%</td>
                <td class="number">₹${parseFloat(item.total_price).toFixed(2)}</td>
              </tr>
              `;
            }).join('') || '<tr><td colspan="11">No items found</td></tr>'}
          </tbody>
        </table>

        <div class="total-section">
          ${(() => {
            // Calculate tax breakup by tax percentage
            const taxBreakup: {[key: string]: number} = {};
            let subtotal = 0;

            order.order_items?.forEach((item: any) => {
              const itemSubtotal = parseFloat(item.total_price) / (1 + parseFloat(item.tax || '0') / 100);
              const itemTaxAmount = parseFloat(item.total_price) - itemSubtotal;
              const taxRate = `${item.tax || 0}%`;
              
              subtotal += itemSubtotal;
              
              if (taxBreakup[taxRate]) {
                taxBreakup[taxRate] += itemTaxAmount;
              } else {
                taxBreakup[taxRate] = itemTaxAmount;
              }
            });

            let taxRows = '';
            Object.entries(taxBreakup).forEach(([taxRate, amount]) => {
              taxRows += `
                <div class="total-row">
                  <span>Tax (${taxRate}):</span>
                  <span>₹${amount.toFixed(2)}</span>
                </div>
              `;
            });

            return `
              <div class="total-row">
                <span>Subtotal:</span>
                <span>₹${subtotal.toFixed(2)}</span>
              </div>
              ${taxRows}
              <div class="total-row final">
                <span>Total Amount:</span>
                <span>₹${parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
            `;
          })()}
        </div>

        <div class="footer">
          <p>This is a computer-generated invoice for Sale Order #${order.id}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    }
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditOrder(null);
  };

  const handleEditSubmit = async () => {
    if (!editOrder) return;
    
    try {
      await updateSaleOrder(editOrder.id, {
        // Note: For sales, we typically don't allow editing much after creation
        // This is a placeholder for future enhancements
      });
      
      // Refresh the sale orders list
      refresh();
      handleEditClose();
      alert('Sale order updated successfully!');
    } catch (error) {
      console.error('Error updating sale order:', error);
      alert('Error updating sale order. Please try again.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Sale Orders ({totalCount})</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
          Create Sale Order
        </Button>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by customer, invoice number, status, or amount..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ mt: 2, overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'id'}
                  direction={sortField === 'id' ? sortDirection : 'asc'}
                  onClick={() => handleSort('id')}
                >
                  Order ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'customer__name'}
                  direction={sortField === 'customer__name' ? sortDirection : 'asc'}
                  onClick={() => handleSort('customer__name')}
                >
                  Customer
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'invoice_number'}
                  direction={sortField === 'invoice_number' ? sortDirection : 'asc'}
                  onClick={() => handleSort('invoice_number')}
                >
                  Invoice Number
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'order_date'}
                  direction={sortField === 'order_date' ? sortDirection : 'asc'}
                  onClick={() => handleSort('order_date')}
                >
                  Order Date
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'status'}
                  direction={sortField === 'status' ? sortDirection : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'total_amount'}
                  direction={sortField === 'total_amount' ? sortDirection : 'asc'}
                  onClick={() => handleSort('total_amount')}
                >
                  Total Amount
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {saleOrders.map((order: SaleOrder) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{getCustomerName(order.customer)}</TableCell>
                <TableCell>{order.invoice_number}</TableCell>
                <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <StatusChip status={order.status} />
                </TableCell>
                <TableCell>₹{parseFloat(order.total_amount || '0').toFixed(2)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="info"
                      onClick={() => handleViewOrder(order)}
                    >
                      View
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="secondary"
                      onClick={() => handlePrintInvoice(order)}
                    >
                      Print
                    </Button>
                    {order.status === 'Pending' && (
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="success"
                        onClick={() => handleStatusChange(order.id, 'Completed')}
                      >
                        Complete
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      )}

      <Modal open={open} onClose={handleClose}>
        <Box sx={stableModalStyle}>
          <Typography variant="h6" gutterBottom>Create Sale Order</Typography>
          
          {/* Customer Selection */}
          <Autocomplete
            fullWidth
            options={customerOptions}
            getOptionLabel={(option) => option.name}
            value={newOrder.customer}
            onChange={(_, newValue) => setNewOrder({ ...newOrder, customer: newValue })}
            inputValue={customerInputValue}
            onInputChange={(_, newInputValue) => setCustomerInputValue(newInputValue)}
            filterOptions={(x) => x} // Disable client-side filtering since we're doing server-side search
            loading={customerLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Customer *"
                margin="normal"
                variant="outlined"
                placeholder="Type to search customers..."
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

          <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>Items</Typography>
          
          {newOrder.items.map((item, index) => (
            <OrderItemRow
              key={index}
              item={item}
              index={index}
              stockInputValue={stockInputValues[index] || ''}
              stockLoading={stockLoading}
              filteredStocks={filteredStocks}
              newOrderItems={newOrder.items}
              onItemChange={handleItemChange}
              onStockInputChange={handleStockInputChange}
              onRemoveItem={removeItem}
              onStockSearchChange={setStockSearch}
            />
          ))}

          {/* Order Total Display */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="h6">
              Total: ₹{orderTotal.toFixed(2)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button 
              startIcon={<AddCircleOutlineIcon />} 
              onClick={addItem}
              variant="outlined"
            >
              Add Item
            </Button>
            
            <Box>
              <Button onClick={handleClose} sx={{ mr: 2 }}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                variant="contained"
                disabled={
                  !newOrder.customer || 
                  newOrder.items.some(item => 
                    !item.stock || 
                    item.quantity <= 0 ||
                    (item.stock && item.quantity > item.stock.quantity)
                  )
                }
              >
                Create Order
              </Button>
              {/* Helpful validation feedback */}
              {(
                !newOrder.customer || 
                newOrder.items.some(item => 
                  !item.stock || 
                  item.quantity <= 0 ||
                  (item.stock && item.quantity > item.stock.quantity)
                )
              ) && (
                <Box sx={{ mt: 1, fontSize: '0.8rem', color: 'text.secondary' }}>
                  <strong>Please complete:</strong>
                  {!newOrder.customer && <span style={{color: 'red'}}> ✗ Customer</span>}
                  {newOrder.customer && <span style={{color: 'green'}}> ✓ Customer</span>}
                  
                  {newOrder.items.some(item => !item.stock) && <span style={{color: 'red'}}> ✗ Stock Selection</span>}
                  {!newOrder.items.some(item => !item.stock) && <span style={{color: 'green'}}> ✓ Stock Selection</span>}
                  
                  {newOrder.items.some(item => item.quantity <= 0) && <span style={{color: 'red'}}> ✗ Valid Quantity</span>}
                  {!newOrder.items.some(item => item.quantity <= 0) && <span style={{color: 'green'}}> ✓ Valid Quantity</span>}
                  
                  {newOrder.items.some(item => item.stock && item.quantity > item.stock.quantity) && <span style={{color: 'red'}}> ✗ Stock Availability</span>}
                  {!newOrder.items.some(item => item.stock && item.quantity > item.stock.quantity) && <span style={{color: 'green'}}> ✓ Stock Availability</span>}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* View Sale Order Modal */}
      <Modal open={viewOpen} onClose={handleViewClose}>
        <Box sx={stableModalStyle}>
          <Typography variant="h6" gutterBottom>View Sale Order</Typography>
          
          {selectedOrder && (
            <Box>
              <Box sx={{ mb: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label="Order ID"
                  value={selectedOrder.id}
                  variant="outlined"
                  size="small"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Invoice Number"
                  value={selectedOrder.invoice_number}
                  variant="outlined"
                  size="small"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Customer"
                  value={getCustomerName(selectedOrder.customer)}
                  variant="outlined"
                  size="small"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Order Date"
                  value={new Date(selectedOrder.order_date).toLocaleDateString()}
                  variant="outlined"
                  size="small"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Status"
                  value={selectedOrder.status}
                  variant="outlined"
                  size="small"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Total Amount"
                  value={`₹${selectedOrder.total_amount}`}
                  variant="outlined"
                  size="small"
                  InputProps={{ readOnly: true }}
                />
              </Box>

              {/* Order Items */}
              <Typography variant="h6" sx={{ mb: 1 }}>Order Items</Typography>
              {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {selectedOrder.order_items.map((item: any, index: number) => (
                    <Box key={index} sx={{ 
                      border: 1, 
                      borderColor: 'divider', 
                      borderRadius: 1, 
                      p: 2, 
                      mb: 1,
                      backgroundColor: 'background.paper'
                    }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                        <TextField
                          label="Product"
                          value={item.product || 'Unknown Product'}
                          size="small"
                          InputProps={{ readOnly: true }}
                        />
                        <TextField
                          label="Quantity"
                          value={item.quantity}
                          size="small"
                          InputProps={{ readOnly: true }}
                        />
                        <TextField
                          label="Batch Number"
                          value={item.batch_number || 'N/A'}
                          size="small"
                          InputProps={{ readOnly: true }}
                        />
                        <TextField
                          label="Sale Price"
                          value={`₹${item.sale_price || 0}`}
                          size="small"
                          InputProps={{ readOnly: true }}
                        />
                        <TextField
                          label="MRP"
                          value={`₹${item.mrp || 0}`}
                          size="small"
                          InputProps={{ readOnly: true }}
                        />
                        <TextField
                          label="Expiry Date"
                          value={item.expiry_date || 'N/A'}
                          size="small"
                          InputProps={{ readOnly: true }}
                        />
                        <TextField
                          label="Tax %"
                          value={`${item.tax || 0}%`}
                          size="small"
                          InputProps={{ readOnly: true }}
                        />
                        <TextField
                          label="HSN Code"
                          value={item.hsn_code || 'N/A'}
                          size="small"
                          InputProps={{ readOnly: true }}
                        />
                        <TextField
                          label="Total Price"
                          value={`₹${item.total_price}`}
                          size="small"
                          InputProps={{ readOnly: true }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">No items found for this order.</Typography>
              )}

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={handleViewClose}>Close</Button>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default SalesPage;