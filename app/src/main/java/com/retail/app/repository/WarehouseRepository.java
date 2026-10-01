package com.retail.app.repository;

import com.retail.app.entity.Warehouse;
import com.retail.app.enums.WarehouseType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    Optional<Warehouse> findByCode(String code);
    List<Warehouse> findByActiveTrue();
    List<Warehouse> findByType(WarehouseType type);
    boolean existsByCode(String code);
}
