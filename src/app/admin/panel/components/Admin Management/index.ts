// Export all components from the Admin Management folder
export { default as AdminManagement } from './AdminManagement';
export { default as AdminTable } from './AdminTable';
export { default as AdminEditModal } from './AdminEditModal';
export { default as AdminCreateForm } from './AdminCreateForm';
export { default as ConfirmDeleteModal } from './ConfirmDeleteModal';

// Also export the Admin interface for use throughout the application
export type { Admin } from './AdminManagement';
