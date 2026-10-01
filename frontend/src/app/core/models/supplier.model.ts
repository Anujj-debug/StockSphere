import { Product } from './product.model';

export interface Supplier {
  id?: number;
  code: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  paymentTerms?: string;
  averageLeadTimeDays?: number;
  rating?: number;
  active: boolean;
}

export interface SupplierProduct {
  id?: number;
  supplier: Supplier;
  product: Product;
  supplierSku?: string;
  agreedCost: number;
  minOrderQuantity: number;
  leadTimeDays: number;
}
