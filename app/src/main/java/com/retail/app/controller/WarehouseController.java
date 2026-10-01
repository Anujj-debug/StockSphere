package com.retail.app.controller;

import com.retail.app.dto.WarehouseDTO;
import com.retail.app.dto.WarehouseLocationDTO;
import com.retail.app.service.WarehouseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouses")
@CrossOrigin(origins = "*")
public class WarehouseController {

    private final WarehouseService warehouseService;

    public WarehouseController(WarehouseService warehouseService) {
        this.warehouseService = warehouseService;
    }

    @GetMapping
    public ResponseEntity<List<WarehouseDTO>> getAllWarehouses() {
        return ResponseEntity.ok(warehouseService.getAllWarehouses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WarehouseDTO> getWarehouseById(@PathVariable Long id) {
        return ResponseEntity.ok(warehouseService.getWarehouseById(id));
    }

    @PostMapping
    public ResponseEntity<WarehouseDTO> createWarehouse(@Valid @RequestBody WarehouseDTO dto) {
        WarehouseDTO created = warehouseService.createWarehouse(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WarehouseDTO> updateWarehouse(@PathVariable Long id, @Valid @RequestBody WarehouseDTO dto) {
        return ResponseEntity.ok(warehouseService.updateWarehouse(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWarehouse(@PathVariable Long id) {
        warehouseService.deleteWarehouse(id);
        return ResponseEntity.noContent().build();
    }

    // Sub-resource: Locations (Zones, Aisles, Shelves, Bins)
    @GetMapping("/{warehouseId}/locations")
    public ResponseEntity<List<WarehouseLocationDTO>> getLocations(@PathVariable Long warehouseId) {
        return ResponseEntity.ok(warehouseService.getLocationsByWarehouse(warehouseId));
    }

    @PostMapping("/{warehouseId}/locations")
    public ResponseEntity<WarehouseLocationDTO> createLocation(@PathVariable Long warehouseId,
                                                               @Valid @RequestBody WarehouseLocationDTO dto) {
        dto.setWarehouseId(warehouseId);
        WarehouseLocationDTO created = warehouseService.createLocation(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
}
