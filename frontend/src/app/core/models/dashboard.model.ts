export interface DashboardSummary {
  totalProducts: number;
  activeProducts: number;
  totalWarehouses: number;
  totalStockUnitsOnHand: number;
  totalInventoryValuation: number;
  lowStockCount: number;
  outOfStockCount: number;
  pendingSalesOrdersCount: number;
  totalSalesRevenue: number;
  activePurchaseOrdersCount: number;
  totalProcurementSpend: number;
  inTransitTransfersCount: number;
  warehouseValuations: Record<string, number>;
}
