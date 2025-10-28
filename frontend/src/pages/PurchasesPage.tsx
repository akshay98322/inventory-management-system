import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Modal, Typography, TextField, IconButton, CircularProgress, Alert, TableSortLabel, Autocomplete
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { Add, Search } from '@mui/icons-material';
import { getPurchaseOrders, getPurchaseOrderById, createPurchaseOrder, updatePurchaseOrderStatus, updatePurchaseOrder, PurchaseOrder, CreatePurchaseOrderData } from '../services/purchaseService';
import { getCompanySettings, CompanySettings } from '../services/companySettingsService';
import { getSuppliers, Supplier } from '../services/supplierService';
import { getProducts, Product } from '../services/productService';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

type SortField = 'id' | 'supplier__name' | 'invoice_number' | 'order_date' | 'status' | 'total_amount' | 'created_at' | 'updated_at';
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

const PurchasesPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<Supplier[]>([]);
  const [productSearch, setProductSearch] = useState<string>('');
  const [supplierInputValue, setSupplierInputValue] = useState('');
  const [productInputValues, setProductInputValues] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [editOrder, setEditOrder] = useState<PurchaseOrder | null>(null);
  const [supplierLoading, setSupplierLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [newOrder, setNewOrder] = useState<{ 
    supplier: Supplier | null, 
    invoice_number: string,
    items: { 
      product: Product | null, 
      quantity: number,
      batch_number: string,
      expiry_date: string,
      purchase_price: number,
      sale_price: number,
      mrp: number,
      tax: number,
      hsn_code: string
    }[] 
  }>({
    supplier: null,
    invoice_number: '',
    items: [{ 
      product: null, 
      quantity: 1,
      batch_number: '',
      expiry_date: '',
      purchase_price: 0.01,
      sale_price: 0.01,
      mrp: 0.01,
      tax: 5.00,
      hsn_code: ''
    }]
  });

  // Create ordering string from sort field and direction
  const ordering = sortDirection === 'desc' ? `-${sortField}` : sortField;

  // Fetch data with pagination
  const fetchPurchaseOrdersData = useCallback(async (page: number, search: string, ordering: string) => {
    return await getPurchaseOrders(page, search, ordering);
  }, []);

  const {
    data: purchaseOrders = [],
    loading,
    hasMore, // eslint-disable-line @typescript-eslint/no-unused-vars
    error,
    loadMore, // eslint-disable-line @typescript-eslint/no-unused-vars
    refresh,
    totalCount
  } = useInfiniteScroll({
    fetchData: fetchPurchaseOrdersData,
    searchTerm,
    ordering,
    dependencies: []
  });

  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
  }, []);

  // Search suppliers dynamically
  useEffect(() => {
    const searchSuppliers = async () => {
      setSupplierLoading(true);
      try {
        // Use larger page size for search to get more results
        const data = await getSuppliers(1, supplierInputValue, 'name', 500);
        setSupplierOptions(data.results);
      } catch (error) {
        console.error('Error searching suppliers:', error);
      } finally {
        setSupplierLoading(false);
      }
    };

    if (supplierInputValue && supplierInputValue.length > 0) {
      const timeoutId = setTimeout(searchSuppliers, 300); // Debounce search
      return () => clearTimeout(timeoutId);
    } else {
      setSupplierOptions(suppliers);
      setSupplierLoading(false);
    }
  }, [supplierInputValue, suppliers]);

  const fetchSuppliers = async () => {
    const data = await getSuppliers(1, '', 'name', 500); // Load more suppliers initially
    setSuppliers(data.results);
    setSupplierOptions(data.results);
  };

  const fetchProducts = async () => {
    try {
      const data = await getProducts(1, '', 'name', 500); // Load more products initially
      setProducts(data.results);
      setFilteredProducts(data.results);
    } catch (error: any) {
      console.error('Error fetching initial products:', error);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // If clicking the same field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a different field, set new field and default to asc
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleOpen = () => {
    setOpen(true);
    // Initialize productInputValues array for the initial item
    setProductInputValues(['']);
    setProductSearch(''); // Reset search
  };
  const handleClose = () => {
    setOpen(false);
    setSupplierInputValue('');
    setProductInputValues([]);
    setProductSearch(''); // Reset product search
    setNewOrder({ 
      supplier: null, 
      invoice_number: '',
      items: [{ 
        product: null, 
        quantity: 1,
        batch_number: '',
        expiry_date: '',
        purchase_price: 0.01,
        sale_price: 0.01,
        mrp: 0.01,
        tax: 5.00,
        hsn_code: ''
      }] 
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const items = [...newOrder.items];
    items[index] = { ...items[index], [field]: value };
    setNewOrder({ ...newOrder, items });
  };

  // Simple product search function - similar to ProductsPage
  const searchProducts = useCallback(async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setFilteredProducts(products);
      setProductLoading(false);
      return;
    }

    setProductLoading(true);
    try {
      const data = await getProducts(1, searchTerm, 'name', 500);
      setFilteredProducts(data.results);
    } catch (error: any) {
      console.error('Error searching products:', error);
      setFilteredProducts(products); // Fallback to all products
    } finally {
      setProductLoading(false);
    }
  }, [products]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(productSearch);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [productSearch, searchProducts]);

  const removeItem = (index: number) => {
    if (newOrder.items.length > 1) {
      const items = newOrder.items.filter((_, i) => i !== index);
      const inputValues = productInputValues.filter((_, i) => i !== index);
      setNewOrder({ ...newOrder, items });
      setProductInputValues(inputValues);
    }
  };

  const addItem = () => {
    const newInputValues = [...productInputValues, ''];
    setProductInputValues(newInputValues);
    setNewOrder({ 
      ...newOrder, 
      items: [...newOrder.items, { 
        product: null, 
        quantity: 1,
        batch_number: '',
        expiry_date: '',
        purchase_price: 0.01,
        sale_price: 0.01,
        mrp: 0.01,
        tax: 5.00,
        hsn_code: ''
      }] 
    });
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!newOrder.supplier) {
        alert('Please select a supplier');
        return;
      }
      
      if (!newOrder.invoice_number.trim()) {
        alert('Please enter an invoice number');
        return;
      }
      
      if (newOrder.items.some(item => !item.product)) {
        alert('Please select a product for all items');
        return;
      }
      
      if (newOrder.items.some(item => !item.batch_number.trim())) {
        alert('Please enter batch number for all items');
        return;
      }
      
      if (newOrder.items.some(item => !item.expiry_date)) {
        alert('Please enter expiry date for all items');
        return;
      }

      const orderData: CreatePurchaseOrderData = {
        supplier: newOrder.supplier.id,
        invoice_number: newOrder.invoice_number,
        order_date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        items: newOrder.items.map(item => ({
          product: item.product!.id,
          quantity: item.quantity,
          batch_number: item.batch_number,
          expiry_date: item.expiry_date,
          purchase_price: item.purchase_price,
          sale_price: item.sale_price,
          mrp: item.mrp,
          tax: item.tax,
          hsn_code: item.hsn_code
        }))
      };

      console.log('Sending order data:', JSON.stringify(orderData, null, 2));
      await createPurchaseOrder(orderData);
      refresh();
      handleClose();
    } catch (err) {
      console.error('Error creating purchase order:', err);
      alert('Error creating purchase order. Please try again.');
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      console.log('Updating purchase order status:', id, status);
      const result = await updatePurchaseOrderStatus(id, status);
      console.log('Status update result:', result);
      refresh();
    } catch (error) {
      console.error('Error updating purchase order status:', error);
    }
  };

  const getSupplierName = (id: number) => suppliers.find(s => s.id === id)?.name || 'Unknown';

  // View Purchase Order
  const handleViewOrder = async (order: PurchaseOrder) => {
    try {
      // Fetch detailed order data with items
      const detailedOrder = await getPurchaseOrderById(order.id);
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

  // Edit Purchase Order
  const handleEditOrder = async (order: PurchaseOrder) => {
    try {
      // Fetch detailed order data with items
      const detailedOrder = await getPurchaseOrderById(order.id);
      setEditOrder(detailedOrder);
      setEditOpen(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      alert('Error loading order details');
    }
  };

  // Print Invoice
  const handlePrintInvoice = async (order: PurchaseOrder) => {
    try {
      // Fetch detailed order data and company settings
      const [detailedOrder, companyData] = await Promise.all([
        getPurchaseOrderById(order.id),
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
  const generateInvoice = (order: PurchaseOrder, company: CompanySettings) => {
    const supplier = suppliers.find(s => s.id === order.supplier);
    
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Purchase Invoice - ${order.invoice_number}</title>
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
          .company-details, .supplier-details { 
            width: 45%; 
          }
          .company-details h2, .supplier-details h2 { 
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
            <h2>To: ${company.company_name}</h2>
            ${company.owner_name ? `<p><strong>Owner:</strong> ${company.owner_name}</p>` : ''}
            ${company.email ? `<p><strong>Email:</strong> ${company.email}</p>` : ''}
            <p><strong>Phone:</strong> ${company.phone_number || 'N/A'}</p>
            <p><strong>Address:</strong><br>${company.address || 'N/A'}</p>
            <p><strong>Drug License:</strong> ${company.drug_license_number || 'N/A'}</p>
            <p><strong>GST Number:</strong> ${company.gst_number || 'N/A'}</p>
          </div>
          <div class="supplier-details">
            <h2>From: ${supplier?.name || 'Unknown Supplier'}</h2>
            <p><strong>Contact:</strong> ${supplier?.contact_person || 'N/A'}</p>
            <p><strong>Phone:</strong> ${supplier?.phone_number || 'N/A'}</p>
            <p><strong>Email:</strong> ${supplier?.email || 'N/A'}</p>
            <p><strong>Address:</strong><br>${supplier?.address || 'N/A'}</p>
            <p><strong>Drug License:</strong> ${supplier?.drug_license_number || 'N/A'}</p>
            <p><strong>GST Number:</strong> ${supplier?.gst_number || 'N/A'}</p>
          </div>
        </div>

        <div class="invoice-title">
          <h1>PURCHASE INVOICE</h1>
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
              <th>Purchase Price</th>
              <th>Sale Price</th>
              <th>MRP</th>
              <th>Tax %</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
            ${order.order_items?.map((item: any, index: number) => {
              const product = products.find(p => p.id === item.product);
              const manufacturer = product?.company_name || 'N/A';
              return `
              <tr>
                <td>${index + 1}</td>
                <td>${product?.name || `Product ID: ${item.product}`}</td>
                <td>${manufacturer}</td>
                <td>${item.hsn_code || 'N/A'}</td>
                <td>${item.batch_number}</td>
                <td>${item.expiry_date}</td>
                <td class="number">${item.quantity}</td>
                <td class="number">₹${parseFloat(item.purchase_price).toFixed(2)}</td>
                <td class="number">₹${parseFloat(item.sale_price).toFixed(2)}</td>
                <td class="number">₹${parseFloat(item.mrp).toFixed(2)}</td>
                <td class="number">${item.tax}%</td>
                <td class="number">₹${parseFloat(item.total_price).toFixed(2)}</td>
              </tr>
              `;
            }).join('') || '<tr><td colspan="12">No items found</td></tr>'}
          </tbody>
        </table>

        <div class="total-section">
          ${(() => {
            // Calculate tax breakup by tax percentage
            const taxBreakup: {[key: string]: number} = {};
            let subtotal = 0;

            order.order_items?.forEach((item: any) => {
              const itemSubtotal = parseFloat(item.total_price) / (1 + parseFloat(item.tax) / 100);
              const itemTaxAmount = parseFloat(item.total_price) - itemSubtotal;
              const taxRate = `${item.tax}%`;
              
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
          <p>This is a computer-generated invoice for Purchase Order #${order.id}</p>
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
      await updatePurchaseOrder(editOrder.id, {
        invoice_number: editOrder.invoice_number
      });
      
      // Refresh the purchase orders list
      refresh();
      handleEditClose();
      alert('Purchase order updated successfully!');
    } catch (error) {
      console.error('Error updating purchase order:', error);
      alert('Error updating purchase order. Please try again.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Purchase Orders ({totalCount})</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
          Create Purchase Order
        </Button>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by supplier, invoice number, status, or amount..."
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
                  active={sortField === 'supplier__name'}
                  direction={sortField === 'supplier__name' ? sortDirection : 'asc'}
                  onClick={() => handleSort('supplier__name')}
                >
                  Supplier
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
            {purchaseOrders.map((order: PurchaseOrder) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{getSupplierName(order.supplier)}</TableCell>
                <TableCell>{order.invoice_number}</TableCell>
                <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      backgroundColor: 
                        order.status === 'Completed' ? 'success.main' :
                        order.status === 'Pending' ? 'warning.main' :
                        order.status === 'Cancelled' ? 'error.main' : 'grey.300',
                      color: 
                        order.status === 'Completed' ? 'success.contrastText' :
                        order.status === 'Pending' ? 'warning.contrastText' :
                        order.status === 'Cancelled' ? 'error.contrastText' : 'text.primary'
                    }}
                  >
                    {order.status}
                  </Box>
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
                      color="primary"
                      onClick={() => handleEditOrder(order)}
                      disabled={order.status === 'Completed'}
                    >
                      Edit
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
        <Box sx={style}>
          <Typography variant="h6" gutterBottom>Create Purchase Order</Typography>
          
          {/* Supplier Selection */}
          <Autocomplete
            fullWidth
            options={supplierOptions}
            getOptionLabel={(option) => option.name}
            value={newOrder.supplier}
            onChange={(_, newValue) => setNewOrder({ ...newOrder, supplier: newValue })}
            inputValue={supplierInputValue}
            onInputChange={(_, newInputValue) => setSupplierInputValue(newInputValue)}
            filterOptions={(x) => x} // Disable client-side filtering since we're doing server-side search
            loading={supplierLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Supplier *"
                margin="normal"
                variant="outlined"
                placeholder="Type to search suppliers..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {supplierLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          {/* Invoice Number */}
          <TextField
            fullWidth
            label="Invoice Number *"
            value={newOrder.invoice_number}
            onChange={(e) => setNewOrder({ ...newOrder, invoice_number: e.target.value })}
            margin="normal"
            variant="outlined"
          />

          <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>Items</Typography>
          
          {newOrder.items.map((item, index) => (
            <Paper key={index} sx={{ p: 2, mb: 2, backgroundColor: 'grey.50' }}>
              {/* Product Selection */}
              <Autocomplete
                fullWidth
                options={filteredProducts}
                getOptionLabel={(option) => option.name}
                value={item.product}
                onChange={(_, newValue) => handleItemChange(index, 'product', newValue)}
                inputValue={productInputValues[index] || ''}
                onInputChange={(_, newInputValue) => {
                  const newInputValues = [...productInputValues];
                  newInputValues[index] = newInputValue;
                  setProductInputValues(newInputValues);
                  setProductSearch(newInputValue); // Update the search term
                }}
                filterOptions={(options) => options} // Disable client-side filtering
                loading={productLoading}
                noOptionsText={productSearch && productSearch.length >= 2 ? "No products found" : "Type at least 2 characters to search"}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Product *"
                    variant="outlined"
                    size="small"
                    sx={{ mb: 2 }}
                    placeholder="Type at least 2 characters to search..."
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {productLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />

              {/* Row 1: Quantity, Batch Number, Expiry Date */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  type="number"
                  label="Quantity *"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 1, step: 1 }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Batch Number *"
                  value={item.batch_number}
                  onChange={(e) => handleItemChange(index, 'batch_number', e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ flex: 1 }}
                />
                <TextField
                  type="date"
                  label="Expiry Date *"
                  value={item.expiry_date}
                  onChange={(e) => handleItemChange(index, 'expiry_date', e.target.value)}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                />
              </Box>

              {/* Row 2: Purchase Price, Sale Price, MRP */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  type="number"
                  label="Purchase Price *"
                  value={item.purchase_price}
                  onChange={(e) => handleItemChange(index, 'purchase_price', Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 0.01, step: 0.01 }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  type="number"
                  label="Sale Price *"
                  value={item.sale_price}
                  onChange={(e) => handleItemChange(index, 'sale_price', parseFloat(e.target.value) || 0)}
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 0, step: 0.01 }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  type="number"
                  label="MRP *"
                  value={item.mrp}
                  onChange={(e) => handleItemChange(index, 'mrp', parseFloat(e.target.value) || 0)}
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 0, step: 0.01 }}
                  sx={{ flex: 1 }}
                />
              </Box>

              {/* Row 3: Tax, HSN Code, Remove Button */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  type="number"
                  label="Tax (%)"
                  value={item.tax}
                  onChange={(e) => handleItemChange(index, 'tax', parseFloat(e.target.value) || 0)}
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="HSN Code"
                  value={item.hsn_code}
                  onChange={(e) => handleItemChange(index, 'hsn_code', e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ flex: 2 }}
                />
                <IconButton 
                  onClick={() => removeItem(index)} 
                  color="error"
                  disabled={newOrder.items.length === 1}
                  sx={{ ml: 1 }}
                >
                  <RemoveCircleOutlineIcon />
                </IconButton>
              </Box>
            </Paper>
          ))}

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
                  !newOrder.supplier || 
                  !newOrder.invoice_number.trim() || 
                  newOrder.items.some(item => 
                    !item.product || 
                    !item.batch_number.trim() || 
                    !item.expiry_date ||
                    item.quantity <= 0 ||
                    item.purchase_price <= 0
                  )
                }
              >
                Create Order
              </Button>
              {/* Helpful validation feedback */}
              {(
                !newOrder.supplier || 
                !newOrder.invoice_number.trim() || 
                newOrder.items.some(item => 
                  !item.product || 
                  !item.batch_number.trim() || 
                  !item.expiry_date ||
                  item.quantity <= 0 ||
                  item.purchase_price <= 0
                )
              ) && (
                <Box sx={{ mt: 1, fontSize: '0.8rem', color: 'text.secondary' }}>
                  <strong>Please complete:</strong>
                  {!newOrder.supplier && <span style={{color: 'red'}}> ✗ Supplier</span>}
                  {newOrder.supplier && <span style={{color: 'green'}}> ✓ Supplier</span>}
                  
                  {!newOrder.invoice_number.trim() && <span style={{color: 'red'}}> ✗ Invoice Number</span>}
                  {newOrder.invoice_number.trim() && <span style={{color: 'green'}}> ✓ Invoice Number</span>}
                  
                  {newOrder.items.some(item => !item.product) && <span style={{color: 'red'}}> ✗ Product Selection</span>}
                  {!newOrder.items.some(item => !item.product) && <span style={{color: 'green'}}> ✓ Product Selection</span>}
                  
                  {newOrder.items.some(item => !item.batch_number.trim()) && <span style={{color: 'red'}}> ✗ Batch Number</span>}
                  {!newOrder.items.some(item => !item.batch_number.trim()) && <span style={{color: 'green'}}> ✓ Batch Number</span>}
                  
                  {newOrder.items.some(item => !item.expiry_date) && <span style={{color: 'red'}}> ✗ Expiry Date</span>}
                  {!newOrder.items.some(item => !item.expiry_date) && <span style={{color: 'green'}}> ✓ Expiry Date</span>}
                  
                  {newOrder.items.some(item => item.quantity <= 0) && <span style={{color: 'red'}}> ✗ Valid Quantity</span>}
                  {!newOrder.items.some(item => item.quantity <= 0) && <span style={{color: 'green'}}> ✓ Valid Quantity</span>}
                  
                  {newOrder.items.some(item => item.purchase_price <= 0) && <span style={{color: 'red'}}> ✗ Purchase Price</span>}
                  {!newOrder.items.some(item => item.purchase_price <= 0) && <span style={{color: 'green'}}> ✓ Purchase Price</span>}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* View Purchase Order Modal */}
      <Modal open={viewOpen} onClose={handleViewClose}>
        <Box sx={style}>
          <Typography variant="h6" gutterBottom>View Purchase Order</Typography>
          
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
                  label="Supplier"
                  value={getSupplierName(selectedOrder.supplier)}
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
                  value={`$${selectedOrder.total_amount}`}
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
                          value={products.find(p => p.id === item.product)?.name || `Product ID: ${item.product}`}
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
                          value={item.batch_number}
                          size="small"
                          InputProps={{ readOnly: true }}
                        />
                        <TextField
                          label="Purchase Price"
                          value={`₹${item.purchase_price}`}
                          size="small"
                          InputProps={{ readOnly: true }}
                        />
                        <TextField
                          label="Sale Price"
                          value={`₹${item.sale_price}`}
                          size="small"
                          InputProps={{ readOnly: true }}
                        />
                        <TextField
                          label="MRP"
                          value={`₹${item.mrp}`}
                          size="small"
                          InputProps={{ readOnly: true }}
                        />
                        <TextField
                          label="Expiry Date"
                          value={item.expiry_date}
                          size="small"
                          InputProps={{ readOnly: true }}
                        />
                        <TextField
                          label="Tax %"
                          value={`${item.tax}%`}
                          size="small"
                          InputProps={{ readOnly: true }}
                        />
                        <TextField
                          label="HSN Code"
                          value={item.hsn_code || 'N/A'}
                          size="small"
                          InputProps={{ readOnly: true }}
                        />
                      </Box>
                      <TextField
                        label="Total Price"
                        value={`₹${item.total_price}`}
                        size="small"
                        fullWidth
                        sx={{ mt: 1 }}
                        InputProps={{ readOnly: true }}
                      />
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

      {/* Edit Purchase Order Modal */}
      <Modal open={editOpen} onClose={handleEditClose}>
        <Box sx={style}>
          <Typography variant="h6" gutterBottom>Edit Purchase Order</Typography>
          
          {editOrder && (
            <Box>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Note: Only pending orders can be edited. Completed orders cannot be modified.
              </Typography>
              
              {editOrder.status === 'Completed' ? (
                <Box>
                  <Typography color="error" sx={{ mb: 2 }}>
                    This order has been completed and cannot be edited.
                  </Typography>
                  <Button onClick={handleEditClose}>Close</Button>
                </Box>
              ) : (
                <Box>
                  {/* Basic Order Info */}
                  <Box sx={{ mb: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <TextField
                      label="Invoice Number"
                      value={editOrder.invoice_number}
                      variant="outlined"
                      size="small"
                      onChange={(e) => setEditOrder({...editOrder, invoice_number: e.target.value})}
                    />
                    <TextField
                      label="Status"
                      value={editOrder.status}
                      variant="outlined"
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                  </Box>

                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Note: To modify order items, please create a new order. Item editing will be available in future updates.
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                    <Button onClick={handleEditClose}>Cancel</Button>
                    <Button 
                      variant="contained" 
                      onClick={handleEditSubmit}
                    >
                      Save Changes
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default PurchasesPage;