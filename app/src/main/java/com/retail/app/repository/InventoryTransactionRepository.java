package com.retail.app.repository;

import com.retail.app.entity.InventoryTransaction;
import com.retail.app.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    List<InventoryTransaction> findByProductIdOrderByCreatedAtDesc(Long productId);
    List<InventoryTransaction> findByWarehouseIdOrderByCreatedAtDesc(Long warehouseId);
    List<InventoryTransaction> findByTypeOrderByCreatedAtDesc(TransactionType type);
    List<InventoryTransaction> findTop50ByOrderByCreatedAtDesc();
    List<InventoryTransaction> findByReferenceNumber(String referenceNumber);
}
