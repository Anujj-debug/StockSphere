package com.retail.app.controller;

import com.retail.app.dto.SalesOrderRequestDTO;
import com.retail.app.dto.SalesOrderResponseDTO;
import com.retail.app.enums.SalesOrderStatus;
import com.retail.app.service.SalesOrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales-orders")
@CrossOrigin(origins = "*")
public class SalesOrderController {

    private final SalesOrderService salesOrderService;

    public SalesOrderController(SalesOrderService salesOrderService) {
        this.salesOrderService = salesOrderService;
    }

    @GetMapping
    public ResponseEntity<List<SalesOrderResponseDTO>> getAllSalesOrders(
            @RequestParam(required = false) SalesOrderStatus status) {
        return ResponseEntity.ok(salesOrderService.getAllSalesOrders(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalesOrderResponseDTO> getSalesOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(salesOrderService.getSalesOrderById(id));
    }

    @PostMapping
    public ResponseEntity<SalesOrderResponseDTO> createSalesOrder(@Valid @RequestBody SalesOrderRequestDTO dto) {
        SalesOrderResponseDTO created = salesOrderService.createSalesOrder(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/allocate")
    public ResponseEntity<SalesOrderResponseDTO> allocateOrder(@PathVariable Long id) {
        return ResponseEntity.ok(salesOrderService.allocateOrder(id));
    }

    @PutMapping("/{id}/pick")
    public ResponseEntity<SalesOrderResponseDTO> pickOrder(@PathVariable Long id) {
        return ResponseEntity.ok(salesOrderService.pickOrder(id));
    }

    @PutMapping("/{id}/pack")
    public ResponseEntity<SalesOrderResponseDTO> packOrder(@PathVariable Long id) {
        return ResponseEntity.ok(salesOrderService.packOrder(id));
    }

    @PutMapping("/{id}/ship")
    public ResponseEntity<SalesOrderResponseDTO> shipOrder(@PathVariable Long id) {
        return ResponseEntity.ok(salesOrderService.shipOrder(id));
    }

    @PutMapping("/{id}/deliver")
    public ResponseEntity<SalesOrderResponseDTO> deliverOrder(@PathVariable Long id) {
        return ResponseEntity.ok(salesOrderService.deliverOrder(id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<SalesOrderResponseDTO> cancelOrder(@PathVariable Long id) {
        return ResponseEntity.ok(salesOrderService.cancelOrder(id));
    }
}
