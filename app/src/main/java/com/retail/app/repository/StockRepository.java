package com.retail.app.repository;

import com.retail.app.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {

    Optional<Stock> findByProductIdAndWarehouseId(Long productId, Long warehouseId);

    List<Stock> findByWarehouseId(Long warehouseId);

    List<Stock> findByProductId(Long productId);

    @Query("SELECT s FROM Stock s WHERE (s.quantityOnHand - s.quantityReserved) <= s.reorderPoint")
    List<Stock> findLowStockItems();

    @Query("SELECT s FROM Stock s WHERE s.warehouse.id = :warehouseId AND (s.quantityOnHand - s.quantityReserved) <= s.reorderPoint")
    List<Stock> findLowStockItemsByWarehouse(@Param("warehouseId") Long warehouseId);

    @Query("SELECT s FROM Stock s WHERE s.quantityOnHand <= 0")
    List<Stock> findOutOfStockItems();

    @Query("SELECT COALESCE(SUM(s.quantityOnHand), 0) FROM Stock s")
    Long sumTotalUnitsOnHand();

    @Query("SELECT COALESCE(SUM(s.quantityOnHand * s.product.costPrice), 0) FROM Stock s")
    BigDecimal calculateTotalStockValuation();

    @Query("SELECT COALESCE(SUM(s.quantityOnHand * s.product.costPrice), 0) FROM Stock s WHERE s.warehouse.id = :warehouseId")
    BigDecimal calculateWarehouseStockValuation(@Param("warehouseId") Long warehouseId);
}
