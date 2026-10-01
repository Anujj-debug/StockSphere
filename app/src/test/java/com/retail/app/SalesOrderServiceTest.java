package com.retail.app;

import com.retail.app.dto.ProductDTO;
import com.retail.app.dto.SalesOrderItemRequestDTO;
import com.retail.app.dto.SalesOrderRequestDTO;
import com.retail.app.dto.SalesOrderResponseDTO;
import com.retail.app.dto.WarehouseDTO;
import com.retail.app.enums.SalesOrderStatus;
import com.retail.app.service.ProductService;
import com.retail.app.service.SalesOrderService;
import com.retail.app.service.WarehouseService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class SalesOrderServiceTest {

    @Autowired
    private SalesOrderService salesOrderService;

    @Autowired
    private ProductService productService;

    @Autowired
    private WarehouseService warehouseService;

    @Test
    @DisplayName("Should create sales order and progress through fulfillment lifecycle")
    void testOrderFulfillmentLifecycle() {
        WarehouseDTO wh = warehouseService.getAllWarehouses().get(0);
        ProductDTO product = productService.getAllProducts(null, null, null, null).get(0);

        SalesOrderRequestDTO req = new SalesOrderRequestDTO();
        req.setCustomerName("John Doe");
        req.setCustomerEmail("john.doe@example.com");
        req.setShippingAddress("123 Main St, Springfield, IL");
        req.setSourceWarehouseId(wh.getId());
        req.setItems(List.of(new SalesOrderItemRequestDTO(product.getId(), 2, product.getUnitPrice())));

        SalesOrderResponseDTO created = salesOrderService.createSalesOrder(req);
        assertNotNull(created.getId());
        assertEquals(SalesOrderStatus.PENDING, created.getStatus());

        // Allocate
        SalesOrderResponseDTO allocated = salesOrderService.allocateOrder(created.getId());
        assertEquals(SalesOrderStatus.ALLOCATED, allocated.getStatus());

        // Pick
        SalesOrderResponseDTO picked = salesOrderService.pickOrder(created.getId());
        assertEquals(SalesOrderStatus.PICKED, picked.getStatus());

        // Pack
        SalesOrderResponseDTO packed = salesOrderService.packOrder(created.getId());
        assertEquals(SalesOrderStatus.PACKED, packed.getStatus());

        // Ship
        SalesOrderResponseDTO shipped = salesOrderService.shipOrder(created.getId());
        assertEquals(SalesOrderStatus.SHIPPED, shipped.getStatus());

        // Deliver
        SalesOrderResponseDTO delivered = salesOrderService.deliverOrder(created.getId());
        assertEquals(SalesOrderStatus.DELIVERED, delivered.getStatus());
    }
}
