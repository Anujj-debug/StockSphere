package com.retail.app.service;

import com.retail.app.dto.DashboardSummaryDTO;
import com.retail.app.entity.Warehouse;
import com.retail.app.enums.ProductStatus;
import com.retail.app.enums.PurchaseOrderStatus;
import com.retail.app.enums.SalesOrderStatus;
import com.retail.app.enums.StockTransferStatus;
import com.retail.app.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardAnalyticsService {

    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final StockRepository stockRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final StockTransferRepository stockTransferRepository;

    public DashboardAnalyticsService(ProductRepository productRepository,
                                     WarehouseRepository warehouseRepository,
                                     StockRepository stockRepository,
                                     SalesOrderRepository salesOrderRepository,
                                     PurchaseOrderRepository purchaseOrderRepository,
                                     StockTransferRepository stockTransferRepository) {
        this.productRepository = productRepository;
        this.warehouseRepository = warehouseRepository;
        this.stockRepository = stockRepository;
        this.salesOrderRepository = salesOrderRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.stockTransferRepository = stockTransferRepository;
    }

    public DashboardSummaryDTO getDashboardSummary() {
        DashboardSummaryDTO summary = new DashboardSummaryDTO();

        summary.setTotalProducts(productRepository.count());
        summary.setActiveProducts(productRepository.countByStatus(ProductStatus.ACTIVE));
        summary.setTotalWarehouses(warehouseRepository.count());

        Long totalUnits = stockRepository.sumTotalUnitsOnHand();
        summary.setTotalStockUnitsOnHand(totalUnits != null ? totalUnits : 0L);

        BigDecimal totalValuation = stockRepository.calculateTotalStockValuation();
        summary.setTotalInventoryValuation(totalValuation != null ? totalValuation : BigDecimal.ZERO);

        summary.setLowStockCount(stockRepository.findLowStockItems().size());
        summary.setOutOfStockCount(stockRepository.findOutOfStockItems().size());

        summary.setPendingSalesOrdersCount(salesOrderRepository.countByStatus(SalesOrderStatus.PENDING)
                + salesOrderRepository.countByStatus(SalesOrderStatus.ALLOCATED));

        BigDecimal salesRevenue = salesOrderRepository.sumTotalSalesRevenue();
        summary.setTotalSalesRevenue(salesRevenue != null ? salesRevenue : BigDecimal.ZERO);

        summary.setActivePurchaseOrdersCount(purchaseOrderRepository.countByStatus(PurchaseOrderStatus.SUBMITTED)
                + purchaseOrderRepository.countByStatus(PurchaseOrderStatus.APPROVED)
                + purchaseOrderRepository.countByStatus(PurchaseOrderStatus.PARTIALLY_RECEIVED));

        BigDecimal procurementSpend = purchaseOrderRepository.sumTotalProcurementValue();
        summary.setTotalProcurementSpend(procurementSpend != null ? procurementSpend : BigDecimal.ZERO);

        summary.setInTransitTransfersCount(stockTransferRepository.countByStatus(StockTransferStatus.IN_TRANSIT));

        // Warehouse valuations
        List<Warehouse> warehouses = warehouseRepository.findByActiveTrue();
        Map<String, BigDecimal> valuations = new HashMap<>();
        for (Warehouse wh : warehouses) {
            BigDecimal val = stockRepository.calculateWarehouseStockValuation(wh.getId());
            valuations.put(wh.getName(), val != null ? val : BigDecimal.ZERO);
        }
        summary.setWarehouseValuations(valuations);

        return summary;
    }
}
