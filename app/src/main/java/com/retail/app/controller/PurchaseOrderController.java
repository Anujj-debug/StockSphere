package com.retail.app.controller;

import com.retail.app.dto.GoodsReceiptDTO;
import com.retail.app.dto.PurchaseOrderRequestDTO;
import com.retail.app.dto.PurchaseOrderResponseDTO;
import com.retail.app.enums.PurchaseOrderStatus;
import com.retail.app.service.PurchaseOrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
@CrossOrigin(origins = "*")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    public PurchaseOrderController(PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }

    @GetMapping
    public ResponseEntity<List<PurchaseOrderResponseDTO>> getAllPurchaseOrders(
            @RequestParam(required = false) PurchaseOrderStatus status) {
        return ResponseEntity.ok(purchaseOrderService.getAllPurchaseOrders(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderResponseDTO> getPurchaseOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.getPurchaseOrderById(id));
    }

    @PostMapping
    public ResponseEntity<PurchaseOrderResponseDTO> createPurchaseOrder(@Valid @RequestBody PurchaseOrderRequestDTO dto) {
        PurchaseOrderResponseDTO created = purchaseOrderService.createPurchaseOrder(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/submit")
    public ResponseEntity<PurchaseOrderResponseDTO> submitPurchaseOrder(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.submitPurchaseOrder(id));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<PurchaseOrderResponseDTO> approvePurchaseOrder(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.approvePurchaseOrder(id));
    }

    @PostMapping("/{id}/receive-goods")
    public ResponseEntity<PurchaseOrderResponseDTO> receiveGoods(
            @PathVariable Long id,
            @Valid @RequestBody GoodsReceiptDTO receiptDto) {
        return ResponseEntity.ok(purchaseOrderService.receiveGoods(id, receiptDto));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<PurchaseOrderResponseDTO> cancelPurchaseOrder(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.cancelPurchaseOrder(id));
    }
}
