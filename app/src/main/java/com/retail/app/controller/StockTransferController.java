package com.retail.app.controller;

import com.retail.app.dto.StockTransferRequestDTO;
import com.retail.app.dto.StockTransferResponseDTO;
import com.retail.app.enums.StockTransferStatus;
import com.retail.app.service.StockTransferService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transfers")
@CrossOrigin(origins = "*")
public class StockTransferController {

    private final StockTransferService transferService;

    public StockTransferController(StockTransferService transferService) {
        this.transferService = transferService;
    }

    @GetMapping
    public ResponseEntity<List<StockTransferResponseDTO>> getAllTransfers(
            @RequestParam(required = false) StockTransferStatus status) {
        return ResponseEntity.ok(transferService.getAllTransfers(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StockTransferResponseDTO> getTransferById(@PathVariable Long id) {
        return ResponseEntity.ok(transferService.getTransferById(id));
    }

    @PostMapping
    public ResponseEntity<StockTransferResponseDTO> requestTransfer(@Valid @RequestBody StockTransferRequestDTO dto) {
        StockTransferResponseDTO created = transferService.requestTransfer(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<StockTransferResponseDTO> approveTransfer(
            @PathVariable Long id,
            @RequestParam(required = false) String approvedBy) {
        return ResponseEntity.ok(transferService.approveTransfer(id, approvedBy));
    }

    @PutMapping("/{id}/dispatch")
    public ResponseEntity<StockTransferResponseDTO> dispatchTransfer(@PathVariable Long id) {
        return ResponseEntity.ok(transferService.dispatchTransfer(id));
    }

    @PutMapping("/{id}/receive")
    public ResponseEntity<StockTransferResponseDTO> receiveTransfer(@PathVariable Long id) {
        return ResponseEntity.ok(transferService.receiveTransfer(id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<StockTransferResponseDTO> cancelTransfer(@PathVariable Long id) {
        return ResponseEntity.ok(transferService.cancelTransfer(id));
    }
}
