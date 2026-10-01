export type StockTransferStatus = 'REQUESTED' | 'APPROVED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';

export interface StockTransferItemRequest {
  productId: number;
  quantity: number;
}

export interface StockTransferRequest {
  sourceWarehouseId: number;
  destinationWarehouseId: number;
  notes?: string;
  requestedBy?: string;
  items: StockTransferItemRequest[];
}

export interface StockTransferItemResponse {
  id: number;
  productId: number;
  productSku: string;
  productName: string;
  quantityRequested: number;
  quantityTransferred?: number;
  quantityReceived?: number;
}

export interface StockTransferResponse {
  id: number;
  transferNumber: string;
  sourceWarehouseId: number;
  sourceWarehouseName: string;
  destinationWarehouseId: number;
  destinationWarehouseName: string;
  status: StockTransferStatus;
  requestedBy?: string;
  approvedBy?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  items: StockTransferItemResponse[];
}
