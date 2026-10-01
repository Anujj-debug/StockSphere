package com.retail.app.repository;

import com.retail.app.entity.WarehouseLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseLocationRepository extends JpaRepository<WarehouseLocation, Long> {
    List<WarehouseLocation> findByWarehouseIdAndActiveTrue(Long warehouseId);
    Optional<WarehouseLocation> findByBarcode(String barcode);
    List<WarehouseLocation> findByWarehouseIdAndZone(Long warehouseId, String zone);
}
