import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Modal, TextField, Typography, IconButton,
  CircularProgress, Alert, TableSortLabel
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import { getProducts, createProduct, updateProduct, deleteProduct, Product } from '../services/productService';
import { getCompanies, getAllCompanies, Company } from '../services/companyService';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

type SortField = 'id' | 'name' | 'company__name' | 'created_at' | 'updated_at';
type SortDirection = 'asc' | 'desc';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const ProductsPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companySearch, setCompanySearch] = useState<string>('');
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState<boolean>(false);
  const companyDropdownRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});

  // Create ordering string from sort field and direction
  const ordering = sortDirection === 'desc' ? `-${sortField}` : sortField;

  // Fetch data with pagination
  const fetchProductsData = useCallback(async (page: number, search: string, ordering: string) => {
    return await getProducts(page, search, ordering);
  }, []);

  const {
    data: products,
    loading,
    hasMore,
    error,
    loadMore,
    refresh,
    totalCount
  } = useInfiniteScroll({
    fetchData: fetchProductsData,
    searchTerm,
    ordering,
    dependencies: []
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    // Filter companies based on search term
    if (companySearch.trim() === '') {
      setFilteredCompanies(companies);
    } else {
      const searchTerm = companySearch.toLowerCase().trim();
      const filtered = companies.filter(company => {
        const companyName = (company.name || '').toLowerCase();
        
        // Multiple search strategies for better matching
        const nameIncludes = companyName.includes(searchTerm);
        const nameStartsWith = companyName.startsWith(searchTerm);
        
        // Split search term and company name for word-based matching
        const searchWords = searchTerm.split(' ');
        const nameWords = companyName.split(' ');
        const wordsMatch = searchWords.some(searchWord => 
          nameWords.some(nameWord => nameWord.startsWith(searchWord))
        );
        
        return nameIncludes || nameStartsWith || wordsMatch;
      });
      
      console.log(`Company search term: "${searchTerm}", Total companies: ${companies.length}, Filtered: ${filtered.length}`);
      setFilteredCompanies(filtered);
    }
  }, [companies, companySearch]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (showCompanyDropdown && companyDropdownRef.current && !companyDropdownRef.current.contains(event.target as Node)) {
        setShowCompanyDropdown(false);
      }
    };

    if (showCompanyDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCompanyDropdown]);

  const fetchCompanies = async () => {
    try {
      // Fetch all companies for search functionality
      const allCompanies = await getAllCompanies();
      console.log('Fetched all companies:', allCompanies.length, 'Sample company:', allCompanies[0]);
      setCompanies(allCompanies);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      // Fallback to paginated fetch if getAllCompanies fails
      const data = await getCompanies();
      setCompanies(data.results);
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

  const handleOpen = (product?: Product) => {
    if (product) {
      setCurrentProduct(product);
      setIsEditing(true);
      // Set company search to the current company name for editing
      const company = companies.find(c => c.id === product.company);
      setCompanySearch(company?.name || '');
    } else {
      setCurrentProduct({});
      setIsEditing(false);
      setCompanySearch('');
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentProduct({});
    setIsEditing(false);
    setCompanySearch('');
    setShowCompanyDropdown(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setCurrentProduct({ ...currentProduct, [name as string]: value });
  };

  const handleCompanyChange = (e: any) => {
    const { name, value } = e.target;
    setCurrentProduct({ ...currentProduct, [name as string]: value });
  };

  const handleCompanySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanySearch(e.target.value);
    setShowCompanyDropdown(true);
  };

  const handleCompanySelect = (company: Company) => {
    setCurrentProduct({ ...currentProduct, company: company.id });
    setCompanySearch(company.name);
    setShowCompanyDropdown(false);
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && currentProduct.id) {
        await updateProduct(currentProduct.id, currentProduct);
      } else {
        await createProduct(currentProduct as Omit<Product, 'id'>);
      }
      refresh();
      handleClose();
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      refresh();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Products ({totalCount})</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add Product
        </Button>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search products by name or company..."
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

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
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
                  active={sortField === 'name'}
                  direction={sortField === 'name' ? sortDirection : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'company__name'}
                  direction={sortField === 'company__name' ? sortDirection : 'asc'}
                  onClick={() => handleSort('company__name')}
                >
                  Company
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'created_at'}
                  direction={sortField === 'created_at' ? sortDirection : 'asc'}
                  onClick={() => handleSort('created_at')}
                >
                  Created At
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'updated_at'}
                  direction={sortField === 'updated_at' ? sortDirection : 'asc'}
                  onClick={() => handleSort('updated_at')}
                >
                  Updated At
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.company_name || companies.find(c => c.id === product.company)?.name}</TableCell>
                <TableCell>{new Date(product.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(product.updated_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(product)}><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(product.id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
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
              Load More ({products.length} of {totalCount})
            </Button>
          </Box>
        )}
        
        {!hasMore && products.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              All products loaded ({products.length} of {totalCount})
            </Typography>
          </Box>
        )}
      </TableContainer>

      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography variant="h6">{isEditing ? 'Edit Product' : 'Add Product'}</Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Name"
            name="name"
            value={currentProduct.name || ''}
            onChange={handleChange}
          />
          <Box sx={{ position: 'relative' }} ref={companyDropdownRef}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Company"
              value={companySearch}
              onChange={handleCompanySearch}
              onFocus={() => setShowCompanyDropdown(true)}
              placeholder="Search and select company..."
              autoComplete="off"
            />
            {showCompanyDropdown && (
              <Paper
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  maxHeight: 300,
                  overflow: 'auto',
                  zIndex: 1300,
                  mt: 1
                }}
              >
                {filteredCompanies.length > 0 ? (
                  <>
                    <Box sx={{ p: 1, backgroundColor: 'primary.main', color: 'primary.contrastText' }}>
                      <Typography variant="caption">
                        {filteredCompanies.length} companies found
                      </Typography>
                    </Box>
                    {filteredCompanies.map((company) => (
                      <Box
                        key={company.id}
                        sx={{
                          p: 1.5,
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'action.hover'
                          },
                          borderBottom: '1px solid',
                          borderColor: 'divider'
                        }}
                        onClick={() => handleCompanySelect(company)}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {company.name}
                        </Typography>
                      </Box>
                    ))}
                  </>
                ) : (
                  <Box sx={{ p: 2, color: 'text.secondary', textAlign: 'center' }}>
                    <Typography variant="body2">
                      No companies found for "{companySearch}"
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}
          </Box>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
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

export default ProductsPage;