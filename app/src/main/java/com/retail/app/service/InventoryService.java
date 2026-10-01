package com.retail.app.service;

import com.retail.app.dto.StockDTO;
import com.retail.app.entity.InventoryTransaction;
import com.retail.app.entity.Product;
import com.retail.app.entity.Stock;
import com.retail.app.entity.Warehouse;
import com.retail.app.enums.TransactionType;
import com.retail.app.exception.ResourceNotFoundException;
import com.retail.app.repository.InventoryTransactionRepository;
import com.retail.app.repository.ProductRepository;
import com.retail.app.repository.StockRepository;
import com.retail.app.repository.WarehouseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    private final StockRepository stockRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryTransactionRepository transactionRepository;

    public InventoryService(StockRepository stockRepository,
                            ProductRepository productRepository,
                            WarehouseRepository warehouseRepository,
                            InventoryTransactionRepository transactionRepository) {
        this.stockRepository = stockRepository;
        this.productRepository = productRepository;
        this.warehouseRepository = warehouseRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<StockDTO> getAllStocks() {
        return stockRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<StockDTO> getStocksByWarehouse(Long warehouseId) {
        if (!warehouseRepository.existsById(warehouseId)) {
            throw new ResourceNotFoundException("Warehouse", "id", warehouseId);
        }
        return stockRepository.findByWarehouseId(warehouseId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<StockDTO> getStocksByProduct(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product", "id", productId);
        }
        return stockRepository.findByProductId(productId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public StockDTO getStock(Long warehouseId, Long productId) {
        Stock stock = stockRepository.findByProductIdAndWarehouseId(productId, warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Stock not found for Product ID " + productId + " at Warehouse ID " + warehouseId));
        return mapToDTO(stock);
    }

    public List<StockDTO> getLowStockItems(Long warehouseId) {
        List<Stock> stocks;
        if (warehouseId != null) {
            stocks = stockRepository.findLowStockItemsByWarehouse(warehouseId);
        } else {
            stocks = stockRepository.findLowStockItems();
        }
        return stocks.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<StockDTO> getOutOfStockItems() {
        return stockRepository.findOutOfStockItems().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public Stock getOrCreateStock(Product product, Warehouse warehouse) {
        return stockRepository.findByProductIdAndWarehouseId(product.getId(), warehouse.getId())
                .orElseGet(() -> {
                    Stock newStock = new Stock(product, warehouse, 0,
                            product.getMinSafetyStock(), product.getReorderPoint(), product.getMaxStock());
                    return stockRepository.save(newStock);
                });
    }

    @Transactional
    public InventoryTransaction recordTransaction(Product product, Warehouse warehouse, TransactionType type,
                                                  int quantityChange, int qtyBefore, int qtyAfter,
                                                  String referenceNumber, String performedBy, String notes) {
        String txnNumber = "TXN-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        InventoryTransaction txn = new InventoryTransaction(
                txnNumber, product, warehouse, type, quantityChange,
                qtyBefore, qtyAfter, referenceNumber, performedBy, notes
        );
        return transactionRepository.save(txn);
    }

    public List<InventoryTransaction> getRecentTransactions() {
        return transactionRepository.findTop50ByOrderByCreatedAtDesc();
    }

    public List<InventoryTransaction> getTransactionsByProduct(Long productId) {
        return transactionRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    public List<InventoryTransaction> getTransactionsByWarehouse(Long warehouseId) {
        return transactionRepository.findByWarehouseIdOrderByCreatedAtDesc(warehouseId);
    }

    @Transactional
    public StockDTO updateStockThresholds(Long warehouseId, Long productId, Integer minLevel, Integer reorderPoint, Integer maxLevel) {
        Stock stock = stockRepository.findByProductIdAndWarehouseId(productId, warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock", "productId + warehouseId", productId + " / " + warehouseId));

        if (minLevel != null) stock.setMinStockLevel(minLevel);
        if (reorderPoint != null) stock.setReorderPoint(reorderPoint);
        if (maxLevel != null) stock.setMaxStockLevel(maxLevel);

        Stock updated = stockRepository.save(stock);
        return mapToDTO(updated);
    }

    public StockDTO mapToDTO(Stock s) {
        StockDTO dto = new StockDTO();
        dto.setId(s.getId());
        dto.setProductId(s.getProduct().getId());
        dto.setProductSku(s.getProduct().getSku());
        dto.setProductName(s.getProduct().getName());
        dto.setProductBarcode(s.getProduct().getBarcode());
        dto.setUnitPrice(s.getProduct().getUnitPrice());
        dto.setCostPrice(s.getProduct().getCostPrice());

        dto.setWarehouseId(s.getWarehouse().getId());
        dto.setWarehouseCode(s.getWarehouse().getCode());
        dto.setWarehouseName(s.getWarehouse().getName());

        if (s.getDefaultLocation() != null) {
            dto.setLocationId(s.getDefaultLocation().getId());
            dto.setLocationBarcode(s.getDefaultLocation().getBarcode());
        }

        dto.setQuantityOnHand(s.getQuantityOnHand());
        dto.setQuantityReserved(s.getQuantityReserved());
        dto.setQuantityAllocated(s.getQuantityAllocated());
        dto.setAvailableQuantity(s.getAvailableQuantity());

        dto.setMinStockLevel(s.getMinStockLevel());
        dto.setReorderPoint(s.getReorderPoint());
        dto.setMaxStockLevel(s.getMaxStockLevel());

        dto.setLowStock(s.isLowStock());
        dto.setOutOfStock(s.isOutOfStock());
        dto.setUpdatedAt(s.getUpdatedAt());

        return dto;
    }
}
