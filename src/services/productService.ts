import { 
  Product, 
  ProductFormData, 
  ProductListResponse, 
  ProductResponse, 
  ProductStatsResponse,
  ProductVariant
} from '@/types/product';

const API_BASE_URL = '/api/admin/products';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || 'خطایی در ارتباط با سرور رخ داده است');
    (error as any).status = response.status;
    (error as any).code = data.errorCode;
    throw error;
  }
  return data;
}

// Helper function to append form data
function appendFormData(formData: FormData, key: string, value: any, parentKey = ''): void {
  const formKey = parentKey ? `${parentKey}[${key}]` : key;
  
  if (value === null || value === undefined) {
    return;
  }

  if (value instanceof File) {
    formData.append(formKey, value);
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (item instanceof File) {
        formData.append(`${formKey}[${index}]`, item);
      } else if (typeof item === 'object') {
        Object.entries(item).forEach(([itemKey, itemValue]) => {
          appendFormData(formData, itemKey, itemValue, `${formKey}[${index}]`);
        });
      } else if (item !== null && item !== undefined) {
        formData.append(`${formKey}[${index}]`, String(item));
      }
    });
  } else if (typeof value === 'object') {
    Object.entries(value).forEach(([childKey, childValue]) => {
      appendFormData(formData, childKey, childValue, formKey);
    });
  } else {
    formData.append(formKey, String(value));
  }
}

// Get all products with pagination and filtering
export const getProducts = async ({
  page = 1,
  limit = 10,
  search = '',
  category = '',
  status = '',
  sortBy = 'createdAt',
  sortOrder = 'desc',
}: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}): Promise<ProductListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(category && { category }),
    ...(status && { status }),
    sortBy,
    sortOrder,
  });

  const response = await fetch(`${API_BASE_URL}?${params.toString()}`, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    },
  });
  
  return handleResponse<ProductListResponse>(response);
};

// Get a single product by ID
export const getProductById = async (id: string): Promise<ProductResponse> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    },
  });
  return handleResponse<ProductResponse>(response);
};

// Create a new product
export const createProduct = async (productData: ProductFormData): Promise<ProductResponse> => {
  const formData = new FormData();
  
  // Handle variants separately to ensure proper formatting
  const { variants, ...restData } = productData;
  
  // Append all non-variant data
  Object.entries(restData).forEach(([key, value]) => {
    appendFormData(formData, key, value);
  });
  
  // Append variants if they exist
  if (variants && variants.length > 0) {
    variants.forEach((variant, index) => {
      Object.entries(variant).forEach(([vKey, vValue]) => {
        if (vValue !== undefined && vValue !== null) {
          formData.append(`variants[${index}][${vKey}]`, String(vValue));
        }
      });
    });
  }

  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  return handleResponse<ProductResponse>(response);
};

// Update a product
export const updateProduct = async (
  id: string, 
  productData: Partial<ProductFormData>
): Promise<ProductResponse> => {
  const formData = new FormData();
  
  // Handle variants separately to ensure proper formatting
  const { variants, ...restData } = productData;
  
  // Append all non-variant data
  Object.entries(restData).forEach(([key, value]) => {
    if (value !== undefined) {
      appendFormData(formData, key, value);
    }
  });
  
  // Append variants if they exist
  if (variants && variants.length > 0) {
    variants.forEach((variant, index) => {
      Object.entries(variant).forEach(([vKey, vValue]) => {
        if (vValue !== undefined && vValue !== null) {
          formData.append(`variants[${index}][${vKey}]`, 
            vValue instanceof File ? vValue : String(vValue)
          );
        }
      });
    });
  }

  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    body: formData,
    credentials: 'include',
  });

  return handleResponse<ProductResponse>(response);
};

// Delete a product
export const deleteProduct = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse<{ success: boolean; message: string }>(response);
};

// Get product statistics
export const getProductStats = async (): Promise<ProductStatsResponse> => {
  const response = await fetch(`${API_BASE_URL}/stats`, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    },
  });
  return handleResponse<ProductStatsResponse>(response);
};

// Toggle product status (active/inactive)
export const toggleProductStatus = async (
  id: string, 
  isActive: boolean
): Promise<ProductResponse> => {
  const response = await fetch(`${API_BASE_URL}/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isActive }),
    credentials: 'include',
  });
  return handleResponse<ProductResponse>(response);
};
