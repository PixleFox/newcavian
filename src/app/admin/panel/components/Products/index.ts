// src/app/admin/panel/components/Products/index.ts

// Main container component for the Products module
export { default as Products } from './Products';

// ProductTable and related components (exposing only the main table component)
export { default as ProductTable } from './components/ProductTable/ProductTable';

// ProductForm and its sections (exposing only the main form component for simplicity)
export { default as ProductForm } from './components/ProductForm/ProductForm';

// ProductFilters components (exposing all filter-related components for flexibility)
export { default as SearchBar } from './components/ProductFilters/SearchBar';
export { default as StatusFilter } from './components/ProductFilters/StatusFilter';
export { default as CategoryFilter } from './components/ProductFilters/CategoryFilter';
export { default as PriceRangeFilter } from './components/ProductFilters/PriceRangeFilter';
export { default as SortDropdown } from './components/ProductFilters/SortDropdown';

// Modals (exposing all modals as they’re likely to be used independently)
export { default as DeleteProductModal } from './components/Modals/DeleteProductModal';
export { default as QuickViewModal } from './components/Modals/QuickViewModal';
export { default as VariantModal } from './components/Modals/VariantModal';

// Common shared components (exposing all for reusability across the module)
export { default as ImageUploader } from './components/common/ImageUploader';
export { default as RichTextEditor } from './components/common/RichTextEditor';
export { default as StatusBadge } from './components/common/StatusBadge';

// Hooks (exposing all hooks for data fetching, form handling, and image uploads)
export * from './hooks';

// Utilities (exposing all utility functions for product and validation logic)
export * from './utils';

// Types (exposing all type definitions for type safety across the app)
export * from './types';