package com.retail.app.controller;

import com.retail.app.dto.SupplierDTO;
import com.retail.app.entity.SupplierProduct;
import com.retail.app.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@CrossOrigin(origins = "*")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @GetMapping
    public ResponseEntity<List<SupplierDTO>> getAllSuppliers() {
        return ResponseEntity.ok(supplierService.getAllSuppliers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierDTO> getSupplierById(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.getSupplierById(id));
    }

    @PostMapping
    public ResponseEntity<SupplierDTO> createSupplier(@Valid @RequestBody SupplierDTO dto) {
        SupplierDTO created = supplierService.createSupplier(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierDTO> updateSupplier(@PathVariable Long id, @Valid @RequestBody SupplierDTO dto) {
        return ResponseEntity.ok(supplierService.updateSupplier(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/products")
    public ResponseEntity<List<SupplierProduct>> getSupplierProducts(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.getSupplierProducts(id));
    }

    @PostMapping("/{id}/products")
    public ResponseEntity<SupplierProduct> linkProductToSupplier(
            @PathVariable Long id,
            @RequestParam Long productId,
            @RequestParam(required = false) String supplierSku,
            @RequestParam(required = false) BigDecimal agreedCost,
            @RequestParam(required = false) Integer minOrderQty,
            @RequestParam(required = false) Integer leadTimeDays) {
        SupplierProduct sp = supplierService.linkProductToSupplier(id, productId, supplierSku, agreedCost, minOrderQty, leadTimeDays);
        return new ResponseEntity<>(sp, HttpStatus.CREATED);
    }
}
