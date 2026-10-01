export type ProductStatus = 'ACTIVE' | 'DISCONTINUED' | 'OUT_OF_STOCK';

export interface Product {
  id?: number;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  categoryId: number;
  categoryName?: string;
  brandId?: number;
  brandName?: string;
  unitPrice: number;
  costPrice: number;
  weightKg?: number;
  taxPercent?: number;
  status: ProductStatus;
  minSafetyStock?: number;
  reorderPoint?: number;
  maxStock?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id?: number;
  code: string;
  name: string;
  description?: string;
  parentId?: number | null;
  parentName?: string | null;
  active: boolean;
}

export interface Brand {
  id?: number;
  code: string;
  name: string;
  country?: string;
  website?: string;
  active: boolean;
}
