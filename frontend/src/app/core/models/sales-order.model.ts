export type SalesOrderStatus =
  | 'PENDING'
  | 'ALLOCATED'
  | 'PICKED'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface SalesOrderItemRequest {
  productId: number;
  quantity: number;
  unitPrice?: number;
}

export interface SalesOrderRequest {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress: string;
  sourceWarehouseId: number;
  notes?: string;
  createdBy?: string;
  items: SalesOrderItemRequest[];
}

export interface SalesOrderItemResponse {
  id: number;
  productId: number;
  productSku: string;
  productName: string;
  quantityOrdered: number;
  quantityAllocated: number;
  quantityShipped: number;
  unitPrice: number;
  lineTotal: number;
}

export interface SalesOrderResponse {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress: string;
  warehouseId: number;
  warehouseName: string;
  status: SalesOrderStatus;
  orderDate: string;
  totalAmount: number;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
  items: SalesOrderItemResponse[];
}
