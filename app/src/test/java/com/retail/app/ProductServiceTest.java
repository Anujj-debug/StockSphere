package com.retail.app;

import com.retail.app.dto.ProductDTO;
import com.retail.app.enums.ProductStatus;
import com.retail.app.service.CategoryService;
import com.retail.app.service.ProductService;
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
class ProductServiceTest {

    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryService categoryService;

    @Test
    @DisplayName("Should list all seeded products and search by SKU")
    void testProductListingAndSearch() {
        List<ProductDTO> products = productService.getAllProducts(null, null, null, null);
        assertNotNull(products);
        assertTrue(products.size() >= 5, "Initial seed should have at least 5 products");

        List<ProductDTO> searchResults = productService.getAllProducts(null, null, null, "Headphones");
        assertFalse(searchResults.isEmpty());
        assertEquals("ELEC-HP-001", searchResults.get(0).getSku());
    }

    @Test
    @DisplayName("Should create new product and auto-initialize stock records")
    void testCreateProduct() {
        Long categoryId = categoryService.getAllCategories().get(0).getId();

        ProductDTO dto = new ProductDTO();
        dto.setSku("TEST-PROD-999");
        dto.setBarcode("999123456789");
        dto.setName("Test Smart Gadget");
        dto.setDescription("Testing product creation flow");
        dto.setCategoryId(categoryId);
        dto.setUnitPrice(BigDecimal.valueOf(99.99));
        dto.setCostPrice(BigDecimal.valueOf(50.00));
        dto.setMinSafetyStock(5);
        dto.setReorderPoint(15);
        dto.setMaxStock(200);

        ProductDTO created = productService.createProduct(dto);
        assertNotNull(created.getId());
        assertEquals("TEST-PROD-999", created.getSku());
        assertEquals(ProductStatus.ACTIVE, created.getStatus());
    }
}
