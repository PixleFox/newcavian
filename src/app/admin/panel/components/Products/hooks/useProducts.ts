import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product, ProductListResponse, ProductFilterParams } from '../types';
import { api } from '@/lib/axios';
import { showSuccessToast, showErrorToast } from '@/components/ui/toast';

const PRODUCTS_QUERY_KEY = 'products';

export const useProducts = (initialFilters: Partial<ProductFilterParams> = {}) => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<Partial<ProductFilterParams>>({
    page: 1,
    limit: 10,
    ...initialFilters,
  });

  // Fetch products with filters
  const {
    data: productsData,
    isLoading,
    error,
    refetch,
  } = useQuery<ProductListResponse, Error>(
    [PRODUCTS_QUERY_KEY, filters],
    async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          params.append(key, String(value));
        }
      });

      const { data } = await api.get(`/api/admin/products?${params.toString()}`);
      return data;
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  // Fetch a single product
  const fetchProduct = useCallback(
    async (id: string) => {
      const { data } = await api.get(`/api/admin/products/${id}`);
      return data;
    },
    []
  );

  // Create product mutation
  const createProduct = useMutation(
    async (productData: FormData) => {
      const { data } = await api.post('/api/admin/products', productData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([PRODUCTS_QUERY_KEY]);
        showSuccessToast('محصول با موفقیت ایجاد شد');
      },
      onError: (error: any) => {
        showErrorToast(error.response?.data?.message || 'خطا در ایجاد محصول');
      },
    }
  );

  // Update product mutation
  const updateProduct = useMutation(
    async ({ id, data }: { id: string; data: FormData }) => {
      const { data: response } = await api.put(`/api/admin/products/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([PRODUCTS_QUERY_KEY]);
        showSuccessToast('محصول با موفقیت به‌روزرسانی شد');
      },
      onError: (error: any) => {
        showErrorToast(error.response?.data?.message || 'خطا در به‌روزرسانی محصول');
      },
    }
  );

  // Delete product mutation
  const deleteProduct = useMutation(
    async (id: string) => {
      await api.delete(`/api/admin/products/${id}`);
      return id;
    },
    {
      onSuccess: (id) => {
        queryClient.setQueryData<ProductListResponse>([PRODUCTS_QUERY_KEY], (old) => ({
          ...old!,
          data: old?.data.filter((p) => p.id !== id) || [],
          total: (old?.total || 1) - 1,
        }));
        showSuccessToast('محصول با موفقیت حذف شد');
      },
      onError: (error: any) => {
        showErrorToast(error.response?.data?.message || 'خطا در حذف محصول');
      },
    }
  );

  // Toggle product status
  const toggleProductStatus = useMutation(
    async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data } = await api.patch(`/api/admin/products/${id}/status`, { isActive });
      return data;
    },
    {
      onSuccess: (_, { id, isActive }) => {
        queryClient.setQueryData<ProductListResponse>([PRODUCTS_QUERY_KEY], (old) => ({
          ...old!,
          data:
            old?.data.map((p) =>
              p.id === id ? { ...p, isActive, status: isActive ? 'active' : 'archived' } : p
            ) || [],
        }));
        showSuccessToast(`محصول ${isActive ? 'فعال' : 'غیرفعال'} شد`);
      },
      onError: (error: any) => {
        showErrorToast(error.response?.data?.message || 'خطا در تغییر وضعیت محصول');
      },
    }
  );

  // Update filters
  const updateFilters = (newFilters: Partial<ProductFilterParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  // Handle sorting
  const handleSort = (sortBy: string) => {
    const [field, order] = sortBy.split(':');
    updateFilters({ sortBy: field, sortOrder: order as 'asc' | 'desc' });
  };

  return {
    products: productsData?.data || [],
    pagination: {
      page: productsData?.page || 1,
      limit: productsData?.limit || 10,
      total: productsData?.total || 0,
      totalPages: productsData?.totalPages || 1,
    },
    filters,
    isLoading,
    error,
    refetch,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    updateFilters,
    handlePageChange,
    handleSort,
  };
};