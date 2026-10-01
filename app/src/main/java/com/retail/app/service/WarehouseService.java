package com.retail.app.service;

import com.retail.app.dto.WarehouseDTO;
import com.retail.app.dto.WarehouseLocationDTO;
import com.retail.app.entity.Product;
import com.retail.app.entity.Stock;
import com.retail.app.entity.Warehouse;
import com.retail.app.entity.WarehouseLocation;
import com.retail.app.enums.WarehouseType;
import com.retail.app.exception.BusinessValidationException;
import com.retail.app.exception.ResourceNotFoundException;
import com.retail.app.repository.ProductRepository;
import com.retail.app.repository.StockRepository;
import com.retail.app.repository.WarehouseLocationRepository;
import com.retail.app.repository.WarehouseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseLocationRepository locationRepository;
    private final ProductRepository productRepository;
    private final StockRepository stockRepository;

    public WarehouseService(WarehouseRepository warehouseRepository,
                            WarehouseLocationRepository locationRepository,
                            ProductRepository productRepository,
                            StockRepository stockRepository) {
        this.warehouseRepository = warehouseRepository;
        this.locationRepository = locationRepository;
        this.productRepository = productRepository;
        this.stockRepository = stockRepository;
    }

    public List<WarehouseDTO> getAllWarehouses() {
        return warehouseRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public WarehouseDTO getWarehouseById(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));
        return mapToDTO(warehouse);
    }

    @Transactional
    public WarehouseDTO createWarehouse(WarehouseDTO dto) {
        String code = dto.getCode().toUpperCase().trim();
        if (warehouseRepository.existsByCode(code)) {
            throw new BusinessValidationException("Warehouse with code '" + code + "' already exists");
        }

        Warehouse warehouse = new Warehouse();
        warehouse.setCode(code);
        warehouse.setName(dto.getName().trim());
        warehouse.setType(dto.getType() != null ? dto.getType() : WarehouseType.CENTRAL_DISTRIBUTION);
        warehouse.setAddressLine(dto.getAddressLine());
        warehouse.setCity(dto.getCity());
        warehouse.setState(dto.getState());
        warehouse.setPostalCode(dto.getPostalCode());
        warehouse.setCountry(dto.getCountry());
        warehouse.setContactPhone(dto.getContactPhone());
        warehouse.setCapacityUnits(dto.getCapacityUnits() != null ? dto.getCapacityUnits() : 50000);
        warehouse.setActive(dto.isActive());

        Warehouse saved = warehouseRepository.save(warehouse);

        // Auto-create initial stock entries for existing products
        List<Product> products = productRepository.findAll();
        for (Product product : products) {
            Stock stock = new Stock(product, saved, 0, product.getMinSafetyStock(), product.getReorderPoint(), product.getMaxStock());
            stockRepository.save(stock);
        }

        return mapToDTO(saved);
    }

    @Transactional
    public WarehouseDTO updateWarehouse(Long id, WarehouseDTO dto) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));

        warehouse.setName(dto.getName().trim());
        if (dto.getType() != null) warehouse.setType(dto.getType());
        warehouse.setAddressLine(dto.getAddressLine());
        warehouse.setCity(dto.getCity());
        warehouse.setState(dto.getState());
        warehouse.setPostalCode(dto.getPostalCode());
        warehouse.setCountry(dto.getCountry());
        warehouse.setContactPhone(dto.getContactPhone());
        if (dto.getCapacityUnits() != null) warehouse.setCapacityUnits(dto.getCapacityUnits());
        warehouse.setActive(dto.isActive());

        Warehouse updated = warehouseRepository.save(warehouse);
        return mapToDTO(updated);
    }

    @Transactional
    public void deleteWarehouse(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));
        warehouse.setActive(false);
        warehouseRepository.save(warehouse);
    }

    // Warehouse Location management
    public List<WarehouseLocationDTO> getLocationsByWarehouse(Long warehouseId) {
        if (!warehouseRepository.existsById(warehouseId)) {
            throw new ResourceNotFoundException("Warehouse", "id", warehouseId);
        }
        return locationRepository.findByWarehouseIdAndActiveTrue(warehouseId).stream()
                .map(this::mapLocationToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public WarehouseLocationDTO createLocation(WarehouseLocationDTO dto) {
        Warehouse warehouse = warehouseRepository.findById(dto.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", dto.getWarehouseId()));

        WarehouseLocation location = new WarehouseLocation();
        location.setWarehouse(warehouse);
        location.setZone(dto.getZone());
        location.setAisle(dto.getAisle());
        location.setRack(dto.getRack());
        location.setShelf(dto.getShelf());
        location.setBin(dto.getBin());

        String generatedBarcode = dto.getBarcode();
        if (generatedBarcode == null || generatedBarcode.trim().isEmpty()) {
            generatedBarcode = String.format("LOC-%s-%s-%s-%s",
                    warehouse.getCode(),
                    dto.getZone().replaceAll("\\s+", ""),
                    dto.getAisle() != null ? dto.getAisle() : "00",
                    dto.getBin() != null ? dto.getBin() : "00");
        }
        location.setBarcode(generatedBarcode);
        location.setActive(dto.isActive());

        WarehouseLocation saved = locationRepository.save(location);
        return mapLocationToDTO(saved);
    }

    public WarehouseDTO mapToDTO(Warehouse w) {
        WarehouseDTO dto = new WarehouseDTO();
        dto.setId(w.getId());
        dto.setCode(w.getCode());
        dto.setName(w.getName());
        dto.setType(w.getType());
        dto.setAddressLine(w.getAddressLine());
        dto.setCity(w.getCity());
        dto.setState(w.getState());
        dto.setPostalCode(w.getPostalCode());
        dto.setCountry(w.getCountry());
        dto.setContactPhone(w.getContactPhone());
        dto.setCapacityUnits(w.getCapacityUnits());
        dto.setActive(w.isActive());
        return dto;
    }

    public WarehouseLocationDTO mapLocationToDTO(WarehouseLocation loc) {
        WarehouseLocationDTO dto = new WarehouseLocationDTO();
        dto.setId(loc.getId());
        dto.setWarehouseId(loc.getWarehouse().getId());
        dto.setWarehouseName(loc.getWarehouse().getName());
        dto.setZone(loc.getZone());
        dto.setAisle(loc.getAisle());
        dto.setRack(loc.getRack());
        dto.setShelf(loc.getShelf());
        dto.setBin(loc.getBin());
        dto.setBarcode(loc.getBarcode());
        dto.setActive(loc.isActive());
        return dto;
    }
}
