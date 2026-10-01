package com.retail.app.controller;

import com.retail.app.dto.StockAdjustmentRequestDTO;
import com.retail.app.dto.StockAdjustmentResponseDTO;
import com.retail.app.service.StockAdjustmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/adjustments")
@CrossOrigin(origins = "*")
public class StockAdjustmentController {

    private final StockAdjustmentService adjustmentService;

    public StockAdjustmentController(StockAdjustmentService adjustmentService) {
        this.adjustmentService = adjustmentService;
    }

    @GetMapping
    public ResponseEntity<List<StockAdjustmentResponseDTO>> getAllAdjustments() {
        return ResponseEntity.ok(adjustmentService.getAllAdjustments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StockAdjustmentResponseDTO> getAdjustmentById(@PathVariable Long id) {
        return ResponseEntity.ok(adjustmentService.getAdjustmentById(id));
    }

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<StockAdjustmentResponseDTO>> getAdjustmentsByWarehouse(@PathVariable Long warehouseId) {
        return ResponseEntity.ok(adjustmentService.getAdjustmentsByWarehouse(warehouseId));
    }

    @PostMapping
    public ResponseEntity<StockAdjustmentResponseDTO> createAdjustment(
            @Valid @RequestBody StockAdjustmentRequestDTO dto) {
        StockAdjustmentResponseDTO created = adjustmentService.createAdjustment(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
}
