import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Modal, TextField, Typography, IconButton, TableSortLabel, CircularProgress, Alert,
  FormControlLabel, Checkbox, Chip
} from '@mui/material';
import { Add, Edit, Delete, Search, Warning } from '@mui/icons-material';
import { getStockItems, createStock, updateStock, deleteStock, Stock } from '../services/stockService';
import { getProducts, Product } from '../services/productService';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

type SortField = 'id' | 'product__name' | 'product__company__name' | 'batch_number' | 'expiry_date' | 'quantity' | 'purchase_price' | 'sale_price' | 'mrp' | 'tax' | 'hsn_code' | 'total_price' | 'created_at' | 'updated_at';
type SortDirection = 'asc' | 'desc';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflow: 'auto',
};

const StockPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  const [productSearch, setProductSearch] = useState<string>('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStock, setCurrentStock] = useState<Partial<Stock>>({});
  const [hideZeroQuantity, setHideZeroQuantity] = useState(false);

  // Create ordering string from sort field and direction
  const ordering = sortDirection === 'desc' ? `-${sortField}` : sortField;

  // Fetch data with pagination
  const fetchStockData = useCallback(async (page: number, search: string, ordering: string) => {
    return await getStockItems(page, search, ordering);
  }, []);

  const {
    data: stockItems = [], // Add default empty array
    loading,
    hasMore,
    error,
    loadMore,
    refresh,
    totalCount
  } = useInfiniteScroll({
    fetchData: fetchStockData,
    searchTerm,
    ordering,
    dependencies: []
  });

  // Filter stock items based on hideZeroQuantity setting
  const filteredStockItems = hideZeroQuantity 
    ? stockItems.filter(stock => stock.quantity > 0) 
    : stockItems;

  // Count zero quantity items for display
  const zeroQuantityCount = stockItems.filter(stock => stock.quantity === 0).length;

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Filter products based on search term
    if (productSearch.trim() === '') {
      setFilteredProducts(products);
    } else {
      const searchTerm = productSearch.toLowerCase().trim();
      const filtered = products.filter(product => {
        const productName = (product.name || '').toLowerCase();
        const companyName = (product.company_name || '').toLowerCase();
        
        // Multiple search strategies for better matching
        const nameIncludes = productName.includes(searchTerm);
        const nameStartsWith = productName.startsWith(searchTerm);
        const companyIncludes = companyName.includes(searchTerm);
        const companyStartsWith = companyName.startsWith(searchTerm);
        
        // Split search term and product name for word-based matching
        const searchWords = searchTerm.split(' ');
        const nameWords = productName.split(' ');
        const wordsMatch = searchWords.some(searchWord => 
          nameWords.some(nameWord => nameWord.startsWith(searchWord))
        );
        
        return nameIncludes || nameStartsWith || companyIncludes || companyStartsWith || wordsMatch;
      });
      
      console.log(`Search term: "${searchTerm}", Total products: ${products.length}, Filtered: ${filtered.length}`);
      setFilteredProducts(filtered);
    }
  }, [products, productSearch]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (showProductDropdown && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProductDropdown(false);
      }
    };

    if (showProductDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProductDropdown]);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      // Fetch all products for search functionality
      let allProducts: Product[] = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const data = await getProducts(page);
        allProducts = [...allProducts, ...data.results];
        hasMore = data.next !== null;
        page++;
      }
      
      console.log('Fetched all products:', allProducts.length, 'Sample product:', allProducts[0]);
      setProducts(allProducts);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setProductsLoading(false);
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

  const handleOpen = (stock?: Stock) => {
    if (stock) {
      setCurrentStock(stock);
      setIsEditing(true);
      // Set product search to the current product name for editing
      const product = products.find(p => p.id === stock.product);
      setProductSearch(product?.name || '');
    } else {
      setCurrentStock({});
      setIsEditing(false);
      setProductSearch('');
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentStock({});
    setIsEditing(false);
    setProductSearch('');
    setShowProductDropdown(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Convert numeric fields to proper types
    if (['quantity', 'purchase_price', 'sale_price', 'mrp', 'tax'].includes(name)) {
      setCurrentStock({ ...currentStock, [name]: parseFloat(value) || 0 });
    } else if (name === 'product') {
      setCurrentStock({ ...currentStock, [name]: parseInt(value) || 0 });
    } else {
      setCurrentStock({ ...currentStock, [name]: value });
    }
  };

  const handleProductSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductSearch(e.target.value);
    setShowProductDropdown(true);
  };

  const handleProductSelect = (product: Product) => {
    setCurrentStock({ ...currentStock, product: product.id });
    setProductSearch(product.name);
    setShowProductDropdown(false);
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!currentStock.product || !currentStock.batch_number || !currentStock.expiry_date || 
          !currentStock.quantity || !currentStock.purchase_price || !currentStock.sale_price || 
          !currentStock.mrp || currentStock.tax === undefined) {
        alert('Please fill in all required fields');
        return;
      }

      // Validate quantity is positive
      if (currentStock.quantity <= 0) {
        alert('Quantity must be greater than 0');
        return;
      }

      console.log('Submitting stock data:', currentStock);
      
      if (isEditing && currentStock.id) {
        await updateStock(currentStock.id, currentStock);
      } else {
        await createStock(currentStock as Omit<Stock, 'id' | 'created_at' | 'updated_at' | 'total_price' | 'product_name' | 'company_name'>);
      }
      refresh();
      handleClose();
    } catch (error: any) {
      console.error('Failed to save stock:', error);
      alert(`Failed to save stock: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this stock item?')) {
      try {
        await deleteStock(id);
        refresh();
      } catch (error) {
        console.error('Failed to delete stock:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          Stock Inventory ({hideZeroQuantity ? filteredStockItems.length : totalCount})
          {hideZeroQuantity && zeroQuantityCount > 0 && (
            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({zeroQuantityCount} out-of-stock hidden)
            </Typography>
          )}
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add Stock
        </Button>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search stock by product name, manufacturer, batch number, HSN code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />
          }}
        />
        
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={hideZeroQuantity}
                onChange={(e) => setHideZeroQuantity(e.target.checked)}
                color="primary"
              />
            }
            label="Hide out-of-stock items"
          />
          {zeroQuantityCount > 0 && (
            <Chip
              icon={<Warning />}
              label={`${zeroQuantityCount} out-of-stock items`}
              color="warning"
              variant="outlined"
              size="small"
            />
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ mt: 2, overflowX: 'auto' }}>
        <Table sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'id'}
                  direction={sortField === 'id' ? sortDirection : 'asc'}
                  onClick={() => handleSort('id')}
                >
                  ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'product__name'}
                  direction={sortField === 'product__name' ? sortDirection : 'asc'}
                  onClick={() => handleSort('product__name')}
                >
                  Product
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'product__company__name'}
                  direction={sortField === 'product__company__name' ? sortDirection : 'asc'}
                  onClick={() => handleSort('product__company__name')}
                >
                  Manufacturer
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'batch_number'}
                  direction={sortField === 'batch_number' ? sortDirection : 'asc'}
                  onClick={() => handleSort('batch_number')}
                >
                  Batch Number
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'expiry_date'}
                  direction={sortField === 'expiry_date' ? sortDirection : 'asc'}
                  onClick={() => handleSort('expiry_date')}
                >
                  Expiry Date
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'quantity'}
                  direction={sortField === 'quantity' ? sortDirection : 'asc'}
                  onClick={() => handleSort('quantity')}
                >
                  Quantity
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'purchase_price'}
                  direction={sortField === 'purchase_price' ? sortDirection : 'asc'}
                  onClick={() => handleSort('purchase_price')}
                >
                  Purchase Price
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'sale_price'}
                  direction={sortField === 'sale_price' ? sortDirection : 'asc'}
                  onClick={() => handleSort('sale_price')}
                >
                  Sale Price
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'mrp'}
                  direction={sortField === 'mrp' ? sortDirection : 'asc'}
                  onClick={() => handleSort('mrp')}
                >
                  MRP
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'tax'}
                  direction={sortField === 'tax' ? sortDirection : 'asc'}
                  onClick={() => handleSort('tax')}
                >
                  Tax (%)
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'hsn_code'}
                  direction={sortField === 'hsn_code' ? sortDirection : 'asc'}
                  onClick={() => handleSort('hsn_code')}
                >
                  HSN Code
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'total_price'}
                  direction={sortField === 'total_price' ? sortDirection : 'asc'}
                  onClick={() => handleSort('total_price')}
                >
                  Total Price
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(filteredStockItems || []).map((stock) => {
              const isOutOfStock = stock.quantity === 0;
              const isLowStock = stock.quantity > 0 && stock.quantity <= 5;
              
              return (
                <TableRow 
                  key={stock.id}
                  sx={{
                    backgroundColor: isOutOfStock 
                      ? 'error.light' 
                      : isLowStock 
                        ? 'warning.light' 
                        : 'inherit',
                    opacity: isOutOfStock ? 0.7 : 1,
                    '&:hover': {
                      backgroundColor: isOutOfStock 
                        ? 'error.main' 
                        : isLowStock 
                          ? 'warning.main' 
                          : 'action.hover',
                    }
                  }}
                >
                  <TableCell>{stock.id}</TableCell>
                  <TableCell>{stock.product_name || products.find(p => p.id === stock.product)?.name || 'Unknown'}</TableCell>
                  <TableCell>{stock.company_name || products.find(p => p.id === stock.product)?.company_name || 'Unknown'}</TableCell>
                  <TableCell>{stock.batch_number}</TableCell>
                  <TableCell>{new Date(stock.expiry_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{stock.quantity}</span>
                      {isOutOfStock && (
                        <Chip 
                          label="OUT OF STOCK" 
                          color="error" 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                      {isLowStock && (
                        <Chip 
                          label="LOW STOCK" 
                          color="warning" 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>₹{stock.purchase_price}</TableCell>
                  <TableCell>₹{stock.sale_price}</TableCell>
                  <TableCell>₹{stock.mrp}</TableCell>
                  <TableCell>{stock.tax}%</TableCell>
                  <TableCell>{stock.hsn_code}</TableCell>
                  <TableCell>₹{stock.total_price}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(stock)}><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(stock.id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        )}
        
        {!loading && hasMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Button onClick={loadMore} variant="outlined">
              Load More ({(filteredStockItems || []).length} displayed of {totalCount || 0} total)
            </Button>
          </Box>
        )}
        
        {!hasMore && (stockItems || []).length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {hideZeroQuantity 
                ? `Showing ${(filteredStockItems || []).length} available items (${zeroQuantityCount} out-of-stock hidden)`
                : `All stock items loaded (${(stockItems || []).length} of ${totalCount || 0})`
              }
            </Typography>
          </Box>
        )}
      </TableContainer>

      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {isEditing ? 'Edit Stock' : 'Add Stock'}
          </Typography>
          
          <Box sx={{ position: 'relative' }} ref={dropdownRef}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Product"
              value={productSearch}
              onChange={handleProductSearch}
              onFocus={() => setShowProductDropdown(true)}
              placeholder={productsLoading ? "Loading products..." : "Search and select product..."}
              autoComplete="off"
              disabled={productsLoading}
            />
            {showProductDropdown && (
              <Paper
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  maxHeight: 300, // Increased height to show more results
                  overflow: 'auto',
                  zIndex: 1300,
                  mt: 1
                }}
              >
                {productsLoading ? (
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Loading products...
                    </Typography>
                  </Box>
                ) : filteredProducts.length > 0 ? (
                  <>
                    <Box sx={{ p: 1, backgroundColor: 'primary.main', color: 'primary.contrastText' }}>
                      <Typography variant="caption">
                        {filteredProducts.length} products found
                      </Typography>
                    </Box>
                    {filteredProducts.map((product) => (
                      <Box
                        key={product.id}
                        sx={{
                          p: 1.5,
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'action.hover'
                          },
                          borderBottom: '1px solid',
                          borderColor: 'divider'
                        }}
                        onClick={() => handleProductSelect(product)}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.company_name || 'Unknown Company'}
                        </Typography>
                      </Box>
                    ))}
                  </>
                ) : (
                  <Box sx={{ p: 2, color: 'text.secondary', textAlign: 'center' }}>
                    <Typography variant="body2">
                      No products found for "{productSearch}"
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}
          </Box>
          
          <TextField
            margin="normal"
            required
            fullWidth
            label="Batch Number"
            name="batch_number"
            value={currentStock.batch_number || ''}
            onChange={handleChange}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            label="Expiry Date"
            name="expiry_date"
            type="date"
            value={currentStock.expiry_date || ''}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            label="Quantity"
            name="quantity"
            type="number"
            inputProps={{ min: 1, step: 1 }}
            value={currentStock.quantity || ''}
            onChange={handleChange}
            helperText="Must be greater than 0"
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            label="Purchase Price"
            name="purchase_price"
            type="number"
            inputProps={{ step: "0.01" }}
            value={currentStock.purchase_price || ''}
            onChange={handleChange}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            label="Sale Price"
            name="sale_price"
            type="number"
            inputProps={{ step: "0.01" }}
            value={currentStock.sale_price || ''}
            onChange={handleChange}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            label="MRP"
            name="mrp"
            type="number"
            inputProps={{ step: "0.01" }}
            value={currentStock.mrp || ''}
            onChange={handleChange}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            label="Tax (%)"
            name="tax"
            type="number"
            inputProps={{ step: "0.01" }}
            value={currentStock.tax || ''}
            onChange={handleChange}
          />
          
          <TextField
            margin="normal"
            fullWidth
            label="HSN Code"
            name="hsn_code"
            value={currentStock.hsn_code || ''}
            onChange={handleChange}
          />
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose} sx={{ mr: 1 }}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default StockPage;
