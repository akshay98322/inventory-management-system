import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollProps<T> {
  fetchData: (page: number, search: string, ordering: string) => Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
  }>;
  searchTerm: string;
  ordering: string;
  dependencies?: any[];
}

interface UseInfiniteScrollReturn<T> {
  data: T[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  refresh: () => void;
  totalCount: number;
}

export function useInfiniteScroll<T>({
  fetchData,
  searchTerm,
  ordering,
  dependencies = []
}: UseInfiniteScrollProps<T>): UseInfiniteScrollReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadData = useCallback(async (pageNum: number, search: string, append: boolean = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchData(pageNum, search, ordering);
      
      if (append) {
        setData(prev => [...prev, ...response.results]);
      } else {
        setData(response.results);
      }
      
      setTotalCount(response.count);
      setHasMore(response.next !== null);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchData, loading, ordering]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadData(page + 1, searchTerm, true);
    }
  }, [hasMore, loading, page, searchTerm, loadData]);

  const refresh = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    loadData(1, searchTerm, false);
  }, [searchTerm, loadData]);

  // Initial load and dependency changes
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  // Handle search with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setData([]);
      setPage(1);
      setHasMore(true);
      setError(null);
      loadData(1, searchTerm, false);
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, ordering]);

  return {
    data,
    loading,
    hasMore,
    error,
    loadMore,
    refresh,
    totalCount
  };
}