package com.retail.app.repository;

import com.retail.app.entity.SalesOrder;
import com.retail.app.enums.SalesOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {
    Optional<SalesOrder> findByOrderNumber(String orderNumber);
    List<SalesOrder> findByStatus(SalesOrderStatus status);
    List<SalesOrder> findBySourceWarehouseId(Long warehouseId);
    List<SalesOrder> findAllByOrderByCreatedAtDesc();
    List<SalesOrder> findTop10ByOrderByCreatedAtDesc();
    long countByStatus(SalesOrderStatus status);

    @Query("SELECT COALESCE(SUM(so.totalAmount), 0) FROM SalesOrder so WHERE so.status NOT IN ('CANCELLED', 'RETURNED')")
    BigDecimal sumTotalSalesRevenue();
}
