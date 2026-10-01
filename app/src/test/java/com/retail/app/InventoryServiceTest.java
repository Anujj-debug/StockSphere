package com.retail.app;

import com.retail.app.dto.StockDTO;
import com.retail.app.service.InventoryService;
import com.retail.app.service.WarehouseService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class InventoryServiceTest {

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private WarehouseService warehouseService;

    @Test
    @DisplayName("Should retrieve stocks across multi-warehouses and flag low stock items")
    void testStockRetrievalAndLowStock() {
        List<StockDTO> allStocks = inventoryService.getAllStocks();
        assertNotNull(allStocks);
        assertFalse(allStocks.isEmpty(), "Stocks should be pre-seeded");

        List<StockDTO> lowStockItems = inventoryService.getLowStockItems(null);
        assertNotNull(lowStockItems);
        assertTrue(lowStockItems.stream().anyMatch(StockDTO::isLowStock));

        List<StockDTO> outOfStockItems = inventoryService.getOutOfStockItems();
        assertNotNull(outOfStockItems);
        assertTrue(outOfStockItems.stream().anyMatch(StockDTO::isOutOfStock));
    }

    @Test
    @DisplayName("Should retrieve recent inventory transactions ledger")
    void testInventoryLedger() {
        var txns = inventoryService.getRecentTransactions();
        assertNotNull(txns);
        assertFalse(txns.isEmpty(), "Transactions ledger should have pre-seeded entries");
    }
}
