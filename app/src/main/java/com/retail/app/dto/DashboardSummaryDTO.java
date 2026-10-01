package com.retail.app.dto;

import java.math.BigDecimal;
import java.util.Map;

public class DashboardSummaryDTO {

    private long totalProducts;
    private long activeProducts;
    private long totalWarehouses;
    private long totalStockUnitsOnHand;
    private BigDecimal totalInventoryValuation;
    private long lowStockCount;
    private long outOfStockCount;
    private long pendingSalesOrdersCount;
    private BigDecimal totalSalesRevenue;
    private long activePurchaseOrdersCount;
    private BigDecimal totalProcurementSpend;
    private long inTransitTransfersCount;
    private Map<String, BigDecimal> warehouseValuations;

    public DashboardSummaryDTO() {
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getActiveProducts() {
        return activeProducts;
    }

    public void setActiveProducts(long activeProducts) {
        this.activeProducts = activeProducts;
    }

    public long getTotalWarehouses() {
        return totalWarehouses;
    }

    public void setTotalWarehouses(long totalWarehouses) {
        this.totalWarehouses = totalWarehouses;
    }

    public long getTotalStockUnitsOnHand() {
        return totalStockUnitsOnHand;
    }

    public void setTotalStockUnitsOnHand(long totalStockUnitsOnHand) {
        this.totalStockUnitsOnHand = totalStockUnitsOnHand;
    }

    public BigDecimal getTotalInventoryValuation() {
        return totalInventoryValuation;
    }

    public void setTotalInventoryValuation(BigDecimal totalInventoryValuation) {
        this.totalInventoryValuation = totalInventoryValuation;
    }

    public long getLowStockCount() {
        return lowStockCount;
    }

    public void setLowStockCount(long lowStockCount) {
        this.lowStockCount = lowStockCount;
    }

    public long getOutOfStockCount() {
        return outOfStockCount;
    }

    public void setOutOfStockCount(long outOfStockCount) {
        this.outOfStockCount = outOfStockCount;
    }

    public long getPendingSalesOrdersCount() {
        return pendingSalesOrdersCount;
    }

    public void setPendingSalesOrdersCount(long pendingSalesOrdersCount) {
        this.pendingSalesOrdersCount = pendingSalesOrdersCount;
    }

    public BigDecimal getTotalSalesRevenue() {
        return totalSalesRevenue;
    }

    public void setTotalSalesRevenue(BigDecimal totalSalesRevenue) {
        this.totalSalesRevenue = totalSalesRevenue;
    }

    public long getActivePurchaseOrdersCount() {
        return activePurchaseOrdersCount;
    }

    public void setActivePurchaseOrdersCount(long activePurchaseOrdersCount) {
        this.activePurchaseOrdersCount = activePurchaseOrdersCount;
    }

    public BigDecimal getTotalProcurementSpend() {
        return totalProcurementSpend;
    }

    public void setTotalProcurementSpend(BigDecimal totalProcurementSpend) {
        this.totalProcurementSpend = totalProcurementSpend;
    }

    public long getInTransitTransfersCount() {
        return inTransitTransfersCount;
    }

    public void setInTransitTransfersCount(long inTransitTransfersCount) {
        this.inTransitTransfersCount = inTransitTransfersCount;
    }

    public Map<String, BigDecimal> getWarehouseValuations() {
        return warehouseValuations;
    }

    public void setWarehouseValuations(Map<String, BigDecimal> warehouseValuations) {
        this.warehouseValuations = warehouseValuations;
    }
}
