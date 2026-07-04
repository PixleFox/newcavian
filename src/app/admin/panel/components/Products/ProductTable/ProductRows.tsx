import React from 'react';
import { Product } from '../../../types/product.types';

// Props interface for the ProductRow component
interface ProductRowProps {
  product: Product;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const ProductRow: React.FC<ProductRowProps> = ({
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
    <tr className="hover:bg-gray-50 transition-colors duration-200">
      <td className="p-2 border-b">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleSelect}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="p-2 border-b">{product.name}</td>
      <td className="p-2 border-b">
        {product.price.toLocaleString('fa-IR', { style: 'currency', currency: 'IRR' })}
      </td>
      <td className="p-2 border-b">{product.sku}</td>
      <td className="p-2 border-b">{product.type}</td>
      <td className="p-2 border-b">{product.category.name}</td>
      <td className="p-2 border-b">{product.totalStock}</td>
      <td className="p-2 border-b">
        <span
          className={`px-2 py-1 rounded ${product.isActive ? 'bg-green-200' : 'bg-red-200'}`}
        >
          {product.isActive ? 'فعال' : 'غیرفعال'}
        </span>
      </td>
      <td className="p-2 border-b">
        <img
          src={product.mainImage}
          alt={product.name}
          className="h-10 w-10 object-cover rounded"
        />
      </td>
      <td className="p-2 border-b space-x-2 space-x-reverse">
        <button
          onClick={handleView}
          className="text-blue-600 hover:underline focus:outline-none"
        >
          نمایش
        </button>
        <button
          onClick={handleEdit}
          className="text-green-600 hover:underline focus:outline-none"
        >
          ویرایش
        </button>
        <button
          onClick={handleDelete}
          className="text-red-600 hover:underline focus:outline-none"
        >
          حذف
        </button>
      </td>
    </tr>
  );
};

export default ProductRow;