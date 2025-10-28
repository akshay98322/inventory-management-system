import React, { useState, useCallback } from 'react';
import {
    Box, Button, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography, Modal, TextField, IconButton,
    CircularProgress, Alert, TableSortLabel
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import { getCompanies, createCompany, updateCompany, deleteCompany, Company } from '../services/companyService';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

type SortField = 'id' | 'name' | 'created_at' | 'updated_at';
type SortDirection = 'asc' | 'desc';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const CompaniesPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortField, setSortField] = useState<SortField>('id');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCompany, setCurrentCompany] = useState<Partial<Company> | null>(null);

    // Create ordering string from sort field and direction
    const ordering = sortDirection === 'desc' ? `-${sortField}` : sortField;

    // Fetch data with pagination
    const fetchCompaniesData = useCallback(async (page: number, search: string, ordering: string) => {
        return await getCompanies(page, search, ordering);
    }, []);

    const {
        data: companies,
        loading,
        hasMore,
        error,
        loadMore,
        refresh,
        totalCount
    } = useInfiniteScroll({
        fetchData: fetchCompaniesData,
        searchTerm,
        ordering,
        dependencies: []
    });

    const handleOpen = (company: Partial<Company> | null = null) => {
        if (company) {
            setIsEditing(true);
            setCurrentCompany(company);
        } else {
            setIsEditing(false);
            setCurrentCompany({ name: '' });
        }
        setOpen(true);
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

    const handleClose = () => {
        setOpen(false);
        setCurrentCompany(null);
    };

    const handleSave = async () => {
        if (!currentCompany || !currentCompany.name) return;

        try {
            if (isEditing && currentCompany.id) {
                await updateCompany(currentCompany.id, { name: currentCompany.name });
            } else {
                await createCompany({ name: currentCompany.name });
            }
            refresh();
            handleClose();
        } catch (error) {
            console.error("Failed to save company:", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this company?')) {
            try {
                await deleteCompany(id);
                refresh();
            } catch (error) {
                console.error("Failed to delete company:", error);
            }
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Manufacturers ({totalCount})</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
                    Add Manufacturer
                </Button>
            </Box>
            
            <Box sx={{ mb: 2 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search manufacturers..."
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

            <TableContainer component={Paper}>
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
                        {companies.map((company) => (
                            <TableRow key={company.id}>
                                <TableCell>{company.id}</TableCell>
                                <TableCell>{company.name}</TableCell>
                                <TableCell>{new Date(company.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>{new Date(company.updated_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpen(company)}><Edit /></IconButton>
                                    <IconButton onClick={() => handleDelete(company.id)}><Delete /></IconButton>
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
                            Load More ({companies.length} of {totalCount})
                        </Button>
                    </Box>
                )}
                
                {!hasMore && companies.length > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            All manufacturers loaded ({companies.length} of {totalCount})
                        </Typography>
                    </Box>
                )}
            </TableContainer>

            <Modal open={open} onClose={handleClose}>
                <Box sx={style}>
                    <Typography variant="h6" component="h2">
                        {isEditing ? 'Edit Company' : 'Add Company'}
                    </Typography>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Company Name"
                        value={currentCompany?.name || ''}
                        onChange={(e) => setCurrentCompany({ ...currentCompany, name: e.target.value })}
                    />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button onClick={handleSave} variant="contained" sx={{ ml: 1 }}>Save</Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

export default CompaniesPage;
