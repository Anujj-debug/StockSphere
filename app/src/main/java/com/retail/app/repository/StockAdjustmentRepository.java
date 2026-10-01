package com.retail.app.repository;

import com.retail.app.entity.StockAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface StockAdjustmentRepository extends JpaRepository<StockAdjustment, Long> {
    Optional<StockAdjustment> findByAdjustmentNumber(String adjustmentNumber);
    List<StockAdjustment> findByWarehouseIdOrderByCreatedAtDesc(Long warehouseId);
    List<StockAdjustment> findByProductIdOrderByCreatedAtDesc(Long productId);
    List<StockAdjustment> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COALESCE(SUM(sa.totalValuationImpact), 0) FROM StockAdjustment sa")
    BigDecimal sumTotalValuationImpact();
}
