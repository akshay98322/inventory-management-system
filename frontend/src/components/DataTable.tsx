import React, { useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Box,
  Typography,
  CircularProgress,
  Button
} from '@mui/material';

export interface Column<T> {
  id: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
  minWidth?: number;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  sortField?: keyof T;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: keyof T) => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
  totalCount?: number;
  emptyMessage?: string;
  rowKey: keyof T;
  onRowClick?: (row: T) => void;
}

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  sortField,
  sortDirection = 'asc',
  onSort,
  hasMore = false,
  onLoadMore,
  totalCount,
  emptyMessage = 'No data available',
  rowKey,
  onRowClick,
}: DataTableProps<T>) {
  
  const handleSort = useCallback((field: keyof T) => {
    if (onSort) {
      onSort(field);
    }
  }, [onSort]);

  const handleRowClick = useCallback((row: T) => {
    if (onRowClick) {
      onRowClick(row);
    }
  }, [onRowClick]);

  const memoizedRows = useMemo(() => 
    data.map((row) => (
      <TableRow 
        key={String(row[rowKey])}
        onClick={() => handleRowClick(row)}
        sx={{
          cursor: onRowClick ? 'pointer' : 'default',
          '&:hover': onRowClick ? {
            backgroundColor: 'action.hover'
          } : undefined
        }}
      >
        {columns.map((column) => (
          <TableCell 
            key={String(column.id)}
            align={column.align || 'left'}
            sx={{ minWidth: column.minWidth }}
          >
            {column.render 
              ? column.render(row[column.id], row)
              : String(row[column.id] || '-')
            }
          </TableCell>
        ))}
      </TableRow>
    )),
    [data, columns, rowKey, handleRowClick, onRowClick]
  );

  const memoizedHeader = useMemo(() => (
    <TableHead>
      <TableRow>
        {columns.map((column) => (
          <TableCell 
            key={String(column.id)}
            align={column.align || 'left'}
            sx={{ minWidth: column.minWidth }}
          >
            {column.sortable && onSort ? (
              <TableSortLabel
                active={sortField === column.id}
                direction={sortField === column.id ? sortDirection : 'asc'}
                onClick={() => handleSort(column.id)}
              >
                {column.label}
              </TableSortLabel>
            ) : (
              column.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  ), [columns, sortField, sortDirection, handleSort, onSort]);

  return (
    <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
      <Table sx={{ minWidth: 650 }}>
        {memoizedHeader}
        <TableBody>
          {data.length === 0 && !loading ? (
            <TableRow>
              <TableCell 
                colSpan={columns.length} 
                align="center"
                sx={{ py: 4 }}
              >
                <Typography color="text.secondary">
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            memoizedRows
          )}
        </TableBody>
      </Table>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress />
        </Box>
      )}
      
      {!loading && hasMore && onLoadMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <Button onClick={onLoadMore} variant="outlined">
            Load More ({data.length} of {totalCount || 0})
          </Button>
        </Box>
      )}
      
      {!hasMore && data.length > 0 && totalCount && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            All items loaded ({data.length} of {totalCount})
          </Typography>
        </Box>
      )}
    </TableContainer>
  );
}

export default React.memo(DataTable) as typeof DataTable;