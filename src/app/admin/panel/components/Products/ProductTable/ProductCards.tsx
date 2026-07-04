import React from 'react';
import { Product } from '../../../types/product.types';

// Props interface for the ProductCard component
interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete,
}) => {
  // Handle row selection
  const handleSelect = () => {
    onSelect(product.id);
  };

  // Handle action clicks with optional callbacks
  const handleView = () => onView && onView(product.id);
  const handleEdit = () => onEdit && onEdit(product.id);
  const handleDelete = () => onDelete && onDelete(product.id);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4 flex flex-col gap-3 dir-rtl">
      {/* Header: Image and Selection */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleSelect}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
        />
        <img
          src={product.mainImage}
          alt={product.name}
          className="h-12 w-12 object-cover rounded"
        />
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">قیمت:</span>
          <span>
            {product.price.toLocaleString('fa-IR', { style: 'currency', currency: 'IRR' })}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">موجودی:</span>
          <span>{product.totalStock}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">وضعیت:</span>
          <span
            className={`px-2 py-1 rounded ${product.isActive ? 'bg-green-200' : 'bg-red-200'}`}
          >
            {product.isActive ? 'فعال' : 'غیرفعال'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleView}
          className="w-full text-blue-600 hover:bg-blue-50 py-2 rounded focus:outline-none"
        >
          نمایش
        </button>
        <button
          onClick={handleEdit}
          className="w-full text-green-600 hover:bg-green-50 py-2 rounded focus:outline-none"
        >
          ویرایش
        </button>
        <button
          onClick={handleDelete}
          className="w-full text-red-600 hover:bg-red-50 py-2 rounded focus:outline-none"
        >
          حذف
        </button>
      </div>
    </div>
  );
};

export default ProductCard;