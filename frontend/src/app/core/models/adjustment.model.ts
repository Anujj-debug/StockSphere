export type AdjustmentReason =
  | 'CYCLE_COUNT'
  | 'DAMAGE'
  | 'SPOILAGE'
  | 'SHRINKAGE'
  | 'INTERNAL_USE'
  | 'RETURN_TO_VENDOR';

export interface StockAdjustmentRequest {
  warehouseId: number;
  productId: number;
  reason: AdjustmentReason;
  quantityDelta: number;
  notes?: string;
  adjustedBy?: string;
}

export interface StockAdjustmentResponse {
  id: number;
  adjustmentNumber: string;
  warehouseId: number;
  warehouseName: string;
  productId: number;
  productSku: string;
  productName: string;
  reason: AdjustmentReason;
  quantityDelta: number;
  previousQuantity: number;
  newQuantity: number;
  unitCost: number;
  totalValuationImpact: number;
  notes?: string;
  adjustedBy?: string;
  createdAt: string;
}
