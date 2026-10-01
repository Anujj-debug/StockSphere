export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'CANCELLED';

export interface PurchaseOrderItemRequest {
  productId: number;
  quantityOrdered: number;
  unitCost: number;
}

export interface PurchaseOrderRequest {
  supplierId: number;
  destinationWarehouseId: number;
  orderDate?: string;
  expectedDeliveryDate?: string;
  notes?: string;
  createdBy?: string;
  items: PurchaseOrderItemRequest[];
}

export interface PurchaseOrderItemResponse {
  id: number;
  productId: number;
  productSku: string;
  productName: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  lineTotal: number;
}

export interface PurchaseOrderResponse {
  id: number;
  poNumber: string;
  supplierId: number;
  supplierCode: string;
  supplierName: string;
  destinationWarehouseId: number;
  destinationWarehouseName: string;
  status: PurchaseOrderStatus;
  orderDate?: string;
  expectedDeliveryDate?: string;
  totalAmount: number;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
  items: PurchaseOrderItemResponse[];
}

export interface GoodsReceiptItem {
  poItemId: number;
  quantityReceived: number;
}

export interface GoodsReceipt {
  receivedBy?: string;
  notes?: string;
  items: GoodsReceiptItem[];
}
