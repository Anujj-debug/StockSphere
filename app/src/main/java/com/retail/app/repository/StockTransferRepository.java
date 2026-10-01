package com.retail.app.repository;

import com.retail.app.entity.StockTransfer;
import com.retail.app.enums.StockTransferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockTransferRepository extends JpaRepository<StockTransfer, Long> {
    Optional<StockTransfer> findByTransferNumber(String transferNumber);
    List<StockTransfer> findByStatus(StockTransferStatus status);
    List<StockTransfer> findBySourceWarehouseId(Long warehouseId);
    List<StockTransfer> findByDestinationWarehouseId(Long warehouseId);
    List<StockTransfer> findAllByOrderByCreatedAtDesc();
    long countByStatus(StockTransferStatus status);
}
