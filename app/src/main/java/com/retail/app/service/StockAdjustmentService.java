package com.retail.app.service;

import com.retail.app.dto.StockAdjustmentRequestDTO;
import com.retail.app.dto.StockAdjustmentResponseDTO;
import com.retail.app.entity.Product;
import com.retail.app.entity.Stock;
import com.retail.app.entity.StockAdjustment;
import com.retail.app.entity.Warehouse;
import com.retail.app.enums.TransactionType;
import com.retail.app.exception.BusinessValidationException;
import com.retail.app.exception.ResourceNotFoundException;
import com.retail.app.repository.ProductRepository;
import com.retail.app.repository.StockAdjustmentRepository;
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
public class StockAdjustmentService {

    private final StockAdjustmentRepository adjustmentRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final StockRepository stockRepository;
    private final InventoryService inventoryService;

    public StockAdjustmentService(StockAdjustmentRepository adjustmentRepository,
                                  WarehouseRepository warehouseRepository,
                                  ProductRepository productRepository,
                                  StockRepository stockRepository,
                                  InventoryService inventoryService) {
        this.adjustmentRepository = adjustmentRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
        this.stockRepository = stockRepository;
        this.inventoryService = inventoryService;
    }

    public List<StockAdjustmentResponseDTO> getAllAdjustments() {
        return adjustmentRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public StockAdjustmentResponseDTO getAdjustmentById(Long id) {
        StockAdjustment adj = adjustmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StockAdjustment", "id", id));
        return mapToDTO(adj);
    }

    public List<StockAdjustmentResponseDTO> getAdjustmentsByWarehouse(Long warehouseId) {
        return adjustmentRepository.findByWarehouseIdOrderByCreatedAtDesc(warehouseId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public StockAdjustmentResponseDTO createAdjustment(StockAdjustmentRequestDTO dto) {
        Warehouse warehouse = warehouseRepository.findById(dto.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", dto.getWarehouseId()));

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", dto.getProductId()));

        Stock stock = inventoryService.getOrCreateStock(product, warehouse);

        int prevQty = stock.getQuantityOnHand();
        int delta = dto.getQuantityDelta();
        int newQty = prevQty + delta;

        if (newQty < 0) {
            throw new BusinessValidationException(
                    "Adjustment would result in negative stock. Current: " + prevQty + ", Delta: " + delta);
        }

        stock.setQuantityOnHand(newQty);
        stock.setLastAuditedAt(LocalDateTime.now());
        stockRepository.save(stock);

        String adjNumber = "ADJ-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();

        StockAdjustment adjustment = new StockAdjustment(
                adjNumber, warehouse, product, dto.getReason(),
                delta, prevQty, newQty, product.getCostPrice(),
                dto.getNotes(), dto.getAdjustedBy() != null ? dto.getAdjustedBy() : "Inventory Auditor"
        );

        StockAdjustment saved = adjustmentRepository.save(adjustment);

        // Record immutable ledger entry
        TransactionType txnType = delta >= 0 ? TransactionType.ADJUSTMENT_INCREASE : TransactionType.ADJUSTMENT_DECREASE;
        inventoryService.recordTransaction(
                product, warehouse, txnType, delta, prevQty, newQty,
                adjNumber, adjustment.getAdjustedBy(),
                "Reason: " + dto.getReason() + " | " + (dto.getNotes() != null ? dto.getNotes() : "")
        );

        return mapToDTO(saved);
    }

    public StockAdjustmentResponseDTO mapToDTO(StockAdjustment adj) {
        StockAdjustmentResponseDTO dto = new StockAdjustmentResponseDTO();
        dto.setId(adj.getId());
        dto.setAdjustmentNumber(adj.getAdjustmentNumber());
        dto.setWarehouseId(adj.getWarehouse().getId());
        dto.setWarehouseName(adj.getWarehouse().getName());
        dto.setProductId(adj.getProduct().getId());
        dto.setProductSku(adj.getProduct().getSku());
        dto.setProductName(adj.getProduct().getName());
        dto.setReason(adj.getReason());
        dto.setQuantityDelta(adj.getQuantityDelta());
        dto.setPreviousQuantity(adj.getPreviousQuantity());
        dto.setNewQuantity(adj.getNewQuantity());
        dto.setUnitCost(adj.getUnitCost());
        dto.setTotalValuationImpact(adj.getTotalValuationImpact());
        dto.setNotes(adj.getNotes());
        dto.setAdjustedBy(adj.getAdjustedBy());
        dto.setCreatedAt(adj.getCreatedAt());
        return dto;
    }
}
