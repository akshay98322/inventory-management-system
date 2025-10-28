import React, { useState, useCallback } from 'react';
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Modal, TextField, Typography, IconButton, TableSortLabel, CircularProgress, Alert
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier, Supplier } from '../services/supplierService';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

type SortField = 'id' | 'name' | 'contact_person' | 'phone_number' | 'email' | 'address' | 'drug_license_number' | 'gst_number' | 'created_at' | 'updated_at';
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

const SuppliersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Partial<Supplier>>({});

  // Create ordering string from sort field and direction
  const ordering = sortDirection === 'desc' ? `-${sortField}` : sortField;

  // Fetch data with pagination
  const fetchSuppliersData = useCallback(async (page: number, search: string, ordering: string) => {
    return await getSuppliers(page, search, ordering);
  }, []);

  const {
    data: suppliers,
    loading,
    hasMore,
    error,
    loadMore,
    refresh,
    totalCount
  } = useInfiniteScroll({
    fetchData: fetchSuppliersData,
    searchTerm,
    ordering,
    dependencies: []
  });

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

  const handleOpen = (supplier?: Supplier) => {
    if (supplier) {
      setCurrentSupplier(supplier);
      setIsEditing(true);
    } else {
      setCurrentSupplier({});
      setIsEditing(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentSupplier({});
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentSupplier({ ...currentSupplier, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && currentSupplier.id) {
        await updateSupplier(currentSupplier.id, currentSupplier);
      } else {
        await createSupplier(currentSupplier as Omit<Supplier, 'id' | 'created_at' | 'updated_at'>);
      }
      refresh();
      handleClose();
    } catch (error) {
      console.error('Failed to save supplier:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await deleteSupplier(id);
        refresh();
      } catch (error) {
        console.error('Failed to delete supplier:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Suppliers ({totalCount})</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add Supplier
        </Button>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search suppliers by name, contact person, phone, email, address, license, or GST number..."
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
                  active={sortField === 'contact_person'}
                  direction={sortField === 'contact_person' ? sortDirection : 'asc'}
                  onClick={() => handleSort('contact_person')}
                >
                  Contact Person
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'phone_number'}
                  direction={sortField === 'phone_number' ? sortDirection : 'asc'}
                  onClick={() => handleSort('phone_number')}
                >
                  Phone
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'email'}
                  direction={sortField === 'email' ? sortDirection : 'asc'}
                  onClick={() => handleSort('email')}
                >
                  Email
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'address'}
                  direction={sortField === 'address' ? sortDirection : 'asc'}
                  onClick={() => handleSort('address')}
                >
                  Address
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'drug_license_number'}
                  direction={sortField === 'drug_license_number' ? sortDirection : 'asc'}
                  onClick={() => handleSort('drug_license_number')}
                >
                  Drug License
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'gst_number'}
                  direction={sortField === 'gst_number' ? sortDirection : 'asc'}
                  onClick={() => handleSort('gst_number')}
                >
                  GST Number
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>{supplier.id}</TableCell>
                <TableCell>{supplier.name}</TableCell>
                <TableCell>{supplier.contact_person}</TableCell>
                <TableCell>{supplier.phone_number}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {supplier.address}
                </TableCell>
                <TableCell>{supplier.drug_license_number}</TableCell>
                <TableCell>{supplier.gst_number}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(supplier)}><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(supplier.id)}><Delete /></IconButton>
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
              Load More ({suppliers.length} of {totalCount})
            </Button>
          </Box>
        )}
        
        {!hasMore && suppliers.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              All suppliers loaded ({suppliers.length} of {totalCount})
            </Typography>
          </Box>
        )}
      </TableContainer>

      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {isEditing ? 'Edit Supplier' : 'Add Supplier'}
          </Typography>
          
          <TextField
            margin="normal"
            required
            fullWidth
            label="Name"
            name="name"
            value={currentSupplier.name || ''}
            onChange={handleChange}
          />
          
          <TextField
            margin="normal"
            fullWidth
            label="Contact Person"
            name="contact_person"
            value={currentSupplier.contact_person || ''}
            onChange={handleChange}
          />
          
          <TextField
            margin="normal"
            fullWidth
            label="Phone Number"
            name="phone_number"
            value={currentSupplier.phone_number || ''}
            onChange={handleChange}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={currentSupplier.email || ''}
            onChange={handleChange}
          />
          
          <TextField
            margin="normal"
            fullWidth
            label="Address"
            name="address"
            multiline
            rows={3}
            value={currentSupplier.address || ''}
            onChange={handleChange}
          />
          
          <TextField
            margin="normal"
            fullWidth
            label="Drug License Number"
            name="drug_license_number"
            value={currentSupplier.drug_license_number || ''}
            onChange={handleChange}
          />
          
          <TextField
            margin="normal"
            fullWidth
            label="GST Number"
            name="gst_number"
            value={currentSupplier.gst_number || ''}
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

export default SuppliersPage;
