import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { 
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  Inventory2 as StockIcon,
  LocalShipping as SupplierIcon,
  People as CustomersIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import dashboardService from '../services/dashboardService';
import { useOptimizedCallback, useStableReference } from '../hooks/usePerformance';

const MetricCard = React.memo(({ title, value, icon, color = 'primary' }) => {
  const stableProps = useStableReference({ title, value, icon, color });
  
  return (
    <Card sx={{ 
      borderRadius: 2, 
      boxShadow: 3,
      '&:hover': {
        boxShadow: 6,
        transform: 'translateY(-2px)',
        transition: 'all 0.3s ease-in-out'
      }
    }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ 
          p: 1, 
          borderRadius: 2, 
          bgcolor: `${stableProps.color}.light`,
          color: `${stableProps.color}.contrastText`,
          display: 'flex',
          alignItems: 'center'
        }}>
          {stableProps.icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography color="text.secondary" variant="body2" gutterBottom>
            {stableProps.title}
          </Typography>
          <Typography variant="h4" component="div" fontWeight="bold">
            {stableProps.value?.toLocaleString() || '0'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
});

const EmptyStockRow = React.memo(({ item }) => {
  const stableItem = useStableReference(item);
  
  return (
    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell component="th" scope="row">
        {stableItem.product_name}
      </TableCell>
      <TableCell>{stableItem.company_name}</TableCell>
      <TableCell>{stableItem.batch_number}</TableCell>
      <TableCell>{new Date(stableItem.expiry_date).toLocaleDateString()}</TableCell>
      <TableCell>₹{stableItem.sale_price.toFixed(2)}</TableCell>
      <TableCell>
        <Chip
          label="Out of Stock"
          color="error"
          size="small"
          icon={<WarningIcon />}
        />
      </TableCell>
    </TableRow>
  );
});

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboardData = useOptimizedCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardMetrics();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const metricCards = useMemo(() => {
    if (!dashboardData?.metrics) return [];
    
    const { metrics } = dashboardData;
    return [
      { 
        title: 'Total Manufacturers', 
        value: metrics.manufacturers_count, 
        icon: <BusinessIcon />,
        color: 'primary'
      },
      { 
        title: 'Total Products', 
        value: metrics.products_count, 
        icon: <InventoryIcon />,
        color: 'success'
      },
      { 
        title: 'Items in Stock', 
        value: metrics.stock_items_count, 
        icon: <StockIcon />,
        color: 'warning'
      },
      { 
        title: 'Total Suppliers', 
        value: metrics.suppliers_count, 
        icon: <SupplierIcon />,
        color: 'info'
      },
      { 
        title: 'Total Customers', 
        value: metrics.customers_count, 
        icon: <CustomersIcon />,
        color: 'secondary'
      },
    ];
  }, [dashboardData?.metrics]);

  const emptyStockItems = useMemo(() => {
    return dashboardData?.empty_stock_items || [];
  }, [dashboardData?.empty_stock_items]);

  const handleRetry = useOptimizedCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '50vh'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <button onClick={handleRetry} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
              Retry
            </button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Dashboard
      </Typography>
      
      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metricCards.map((metric, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
            <MetricCard {...metric} />
          </Grid>
        ))}
      </Grid>

      {/* Empty Stock Alert */}
      {emptyStockItems.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Stock Alert
          </Typography>
          You have {emptyStockItems.length} product{emptyStockItems.length > 1 ? 's' : ''} that are out of stock!
        </Alert>
      )}

      {/* Empty Stock Items Table */}
      <Typography variant="h5" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningIcon color="warning" />
        Empty Stock Items
        {emptyStockItems.length > 0 && (
          <Chip 
            label={emptyStockItems.length} 
            color="warning" 
            size="small"
          />
        )}
      </Typography>
      
      {emptyStockItems.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
          <Typography color="text.secondary">
            Great! No products are currently out of stock.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
          <Table sx={{ minWidth: 650 }} aria-label="empty stock items table">
            <TableHead>
              <TableRow>
                <TableCell><strong>PRODUCT NAME</strong></TableCell>
                <TableCell><strong>COMPANY</strong></TableCell>
                <TableCell><strong>BATCH NUMBER</strong></TableCell>
                <TableCell><strong>EXPIRY DATE</strong></TableCell>
                <TableCell><strong>SALE PRICE</strong></TableCell>
                <TableCell><strong>STATUS</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {emptyStockItems.map((item, index) => (
                <EmptyStockRow key={`${item.id}-${index}`} item={item} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default DashboardPage;
