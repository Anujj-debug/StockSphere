import { Product } from './product.model';
import { Warehouse } from './warehouse.model';

export type TransactionType =
  | 'INITIAL_STOCK'
  | 'PURCHASE_RECEIPT'
  | 'SALES_FULFILLMENT'
  | 'TRANSFER_OUT'
  | 'TRANSFER_IN'
  | 'ADJUSTMENT_POSITIVE'
  | 'ADJUSTMENT_NEGATIVE';

export interface Stock {
  id: number;
  productId: number;
  productSku: string;
  productName: string;
  productBarcode?: string;
  unitPrice: number;
  costPrice: number;
  warehouseId: number;
  warehouseCode: string;
  warehouseName: string;
  locationId?: number;
  locationBarcode?: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAllocated: number;
  availableQuantity: number;
  minStockLevel?: number;
  reorderPoint?: number;
  maxStockLevel?: number;
  lowStock: boolean;
  outOfStock: boolean;
  updatedAt?: string;
}

export interface InventoryTransaction {
  id: number;
  transactionNumber: string;
  product: Product;
  warehouse: Warehouse;
  type: TransactionType;
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  referenceNumber?: string;
  performedBy?: string;
  notes?: string;
  createdAt: string;
}

export interface StockThresholdUpdate {
  warehouseId: number;
  productId: number;
  minLevel?: number;
  reorderPoint?: number;
  maxLevel?: number;
}
