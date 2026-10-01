package com.retail.app.controller;

import com.retail.app.dto.StockDTO;
import com.retail.app.entity.InventoryTransaction;
import com.retail.app.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public ResponseEntity<List<StockDTO>> getAllStocks() {
        return ResponseEntity.ok(inventoryService.getAllStocks());
    }

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<StockDTO>> getStocksByWarehouse(@PathVariable Long warehouseId) {
        return ResponseEntity.ok(inventoryService.getStocksByWarehouse(warehouseId));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<StockDTO>> getStocksByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getStocksByProduct(productId));
    }

    @GetMapping("/stock")
    public ResponseEntity<StockDTO> getStock(
            @RequestParam Long warehouseId,
            @RequestParam Long productId) {
        return ResponseEntity.ok(inventoryService.getStock(warehouseId, productId));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<StockDTO>> getLowStockItems(@RequestParam(required = false) Long warehouseId) {
        return ResponseEntity.ok(inventoryService.getLowStockItems(warehouseId));
    }

    @GetMapping("/out-of-stock")
    public ResponseEntity<List<StockDTO>> getOutOfStockItems() {
        return ResponseEntity.ok(inventoryService.getOutOfStockItems());
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<InventoryTransaction>> getRecentTransactions() {
        return ResponseEntity.ok(inventoryService.getRecentTransactions());
    }

    @GetMapping("/transactions/product/{productId}")
    public ResponseEntity<List<InventoryTransaction>> getTransactionsByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getTransactionsByProduct(productId));
    }

    @GetMapping("/transactions/warehouse/{warehouseId}")
    public ResponseEntity<List<InventoryTransaction>> getTransactionsByWarehouse(@PathVariable Long warehouseId) {
        return ResponseEntity.ok(inventoryService.getTransactionsByWarehouse(warehouseId));
    }

    @PutMapping("/thresholds")
    public ResponseEntity<StockDTO> updateStockThresholds(
            @RequestParam Long warehouseId,
            @RequestParam Long productId,
            @RequestParam(required = false) Integer minLevel,
            @RequestParam(required = false) Integer reorderPoint,
            @RequestParam(required = false) Integer maxLevel) {
        return ResponseEntity.ok(inventoryService.updateStockThresholds(warehouseId, productId, minLevel, reorderPoint, maxLevel));
    }
}
