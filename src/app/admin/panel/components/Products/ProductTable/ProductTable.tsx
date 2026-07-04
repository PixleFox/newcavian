import React, { useState, useMemo } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { Product } from '../../types/product.types';
import { Link } from 'next/link';

// Assuming Product type from Prisma schema
interface ProductTableProps {
  onSelect?: (selectedIds: string[]) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ onSelect }) => {
  const { products, isLoading, error } = useProducts(); // هوک برای دریافت محصولات
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // مرتب‌سازی محصولات
  const sortedProducts = useMemo(() => {
    if (!sortConfig || !products) return products;
    return [...products].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [products, sortConfig]);

  // صفحه‌بندی
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedProducts?.slice(indexOfFirstItem, indexOfLastItem) || [];
  const totalPages = Math.ceil((sortedProducts?.length || 0) / itemsPerPage);

  // مدیریت انتخاب ردیف‌ها
  const handleSelect = (id: string) => {
    const newSelected = selectedRows.includes(id)
      ? selectedRows.filter((rowId) => rowId !== id)
      : [...selectedRows, id];
    setSelectedRows(newSelected);
    if (onSelect) onSelect(newSelected);
  };

  const handleSelectAll = () => {
    const allIds = currentProducts.map((product) => product.id);
    const newSelected = selectedRows.length === allIds.length ? [] : allIds;
    setSelectedRows(newSelected);
    if (onSelect) onSelect(newSelected);
  };

  // مدیریت مرتب‌سازی
  const handleSort = (key: keyof Product) => {
    setSortConfig((prev) =>
      prev?.key === key && prev.direction === 'asc' ? { key, direction: 'desc' } : { key, direction: 'asc' }
    );
  };

  if (isLoading) return <div className="text-center py-4">در حال بارگذاری محصولات...</div>;
  if (error) return <div className="text-red-600 text-center py-4">خطا: {error}</div>;

  return (
    <div className="overflow-x-auto dir-rtl">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border-b text-right">
              <input
                type="checkbox"
                checked={selectedRows.length === currentProducts.length && currentProducts.length > 0}
                onChange={handleSelectAll}
              />
            </th>
            <th className="p-2 border-b cursor-pointer" onClick={() => handleSort('name')}>
              نام {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th className="p-2 border-b cursor-pointer" onClick={() => handleSort('price')}>
              قیمت {sortConfig?.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th className="p-2 border-b">کد محصول</th>
            <th className="p-2 border-b">نوع</th>
            <th className="p-2 border-b">دسته‌بندی</th>
            <th className="p-2 border-b cursor-pointer" onClick={() => handleSort('totalStock')}>
              موجودی {sortConfig?.key === 'totalStock' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th className="p-2 border-b">وضعیت</th>
            <th className="p-2 border-b">تصویر</th>
            <th className="p-2 border-b">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {currentProducts.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="p-2 border-b">
                <input
                  type="checkbox"
                  checked={selectedRows.includes(product.id)}
                  onChange={() => handleSelect(product.id)}
                />
              </td>
              <td className="p-2 border-b">{product.name}</td>
              <td className="p-2 border-b">{product.price.toLocaleString('fa-IR', { style: 'currency', currency: 'IRR' })}</td>
              <td className="p-2 border-b">{product.sku}</td>
              <td className="p-2 border-b">{product.type}</td>
              <td className="p-2 border-b">{product.category.name}</td>
              <td className="p-2 border-b">{product.totalStock}</td>
              <td className="p-2 border-b">
                <span className={`px-2 py-1 rounded ${product.isActive ? 'bg-green-200' : 'bg-red-200'}`}>
                  {product.isActive ? 'فعال' : 'غیرفعال'}
                </span>
              </td>
              <td className="p-2 border-b">
                <img src={product.mainImage} alt={product.name} className="h-10 w-10 object-cover" />
              </td>
              <td className="p-2 border-b space-x-2 space-x-reverse">
                <button className="text-blue-600 hover:underline">نمایش</button>
                <button className="text-green-600 hover:underline">ویرایش</button>
                <button className="text-red-600 hover:underline">حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* صفحه‌بندی */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          قبلی
        </button>
        <span>
          صفحه {currentPage} از {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          بعدی
        </button>
      </div>
    </div>
  );
};

export default ProductTable;