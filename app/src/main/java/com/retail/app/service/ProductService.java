package com.retail.app.service;

import com.retail.app.dto.ProductDTO;
import com.retail.app.entity.Brand;
import com.retail.app.entity.Category;
import com.retail.app.entity.Product;
import com.retail.app.entity.Warehouse;
import com.retail.app.entity.Stock;
import com.retail.app.enums.ProductStatus;
import com.retail.app.exception.BusinessValidationException;
import com.retail.app.exception.ResourceNotFoundException;
import com.retail.app.repository.BrandRepository;
import com.retail.app.repository.CategoryRepository;
import com.retail.app.repository.ProductRepository;
import com.retail.app.repository.StockRepository;
import com.retail.app.repository.WarehouseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final WarehouseRepository warehouseRepository;
    private final StockRepository stockRepository;

    public ProductService(ProductRepository productRepository,
            CategoryRepository categoryRepository,
            BrandRepository brandRepository,
            WarehouseRepository warehouseRepository,
            StockRepository stockRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.warehouseRepository = warehouseRepository;
        this.stockRepository = stockRepository;
    }

    public List<ProductDTO> getAllProducts(Long categoryId, Long brandId, ProductStatus status, String search) {
        List<Product> products;
        if (search != null && !search.trim().isEmpty()) {
            products = productRepository.searchProducts(search.trim());
        } else if (categoryId != null) {
            products = productRepository.findByCategoryId(categoryId);
        } else if (brandId != null) {
            products = productRepository.findByBrandId(brandId);
        } else if (status != null) {
            products = productRepository.findByStatus(status);
        } else {
            products = productRepository.findAll();
        }

        return products.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return mapToDTO(product);
    }

    public ProductDTO getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "sku", sku));
        return mapToDTO(product);
    }

    @Transactional
    public ProductDTO createProduct(ProductDTO dto) {
        String sku = dto.getSku().toUpperCase().trim();
        if (productRepository.existsBySku(sku)) {
            throw new BusinessValidationException("Product with SKU '" + sku + "' already exists");
        }

        if (dto.getBarcode() != null && !dto.getBarcode().trim().isEmpty() &&
                productRepository.existsByBarcode(dto.getBarcode().trim())) {
            throw new BusinessValidationException("Product with barcode '" + dto.getBarcode() + "' already exists");
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId()));

        Brand brand = null;
        if (dto.getBrandId() != null) {
            brand = brandRepository.findById(dto.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", dto.getBrandId()));
        }

        Product product = new Product();
        product.setSku(sku);
        product.setBarcode(dto.getBarcode() != null ? dto.getBarcode().trim() : null);
        product.setName(dto.getName().trim());
        product.setDescription(dto.getDescription());
        product.setCategory(category);
        product.setBrand(brand);
        product.setUnitPrice(dto.getUnitPrice());
        product.setCostPrice(dto.getCostPrice());
        product.setWeightKg(dto.getWeightKg());
        product.setTaxPercent(dto.getTaxPercent());
        product.setStatus(dto.getStatus() != null ? dto.getStatus() : ProductStatus.ACTIVE);
        product.setMinSafetyStock(dto.getMinSafetyStock() != null ? dto.getMinSafetyStock() : 10);
        product.setReorderPoint(dto.getReorderPoint() != null ? dto.getReorderPoint() : 20);
        product.setMaxStock(dto.getMaxStock() != null ? dto.getMaxStock() : 500);

        Product saved = productRepository.save(product);

        // Auto-initialize stock records for active warehouses
        List<Warehouse> activeWarehouses = warehouseRepository.findByActiveTrue();
        for (Warehouse wh : activeWarehouses) {
            Stock stock = new Stock(saved, wh, 0, saved.getMinSafetyStock(), saved.getReorderPoint(), saved.getMaxStock());
            stockRepository.save(stock);
        }

        return mapToDTO(saved);
    }

    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (dto.getBarcode() != null && !dto.getBarcode().trim().isEmpty() &&
                !dto.getBarcode().equals(product.getBarcode()) &&
                productRepository.existsByBarcode(dto.getBarcode().trim())) {
            throw new BusinessValidationException("Barcode '" + dto.getBarcode() + "' is already assigned to another product");
        }

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId()));
            product.setCategory(category);
        }

        if (dto.getBrandId() != null) {
            Brand brand = brandRepository.findById(dto.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", dto.getBrandId()));
            product.setBrand(brand);
        } else {
            product.setBrand(null);
        }

        product.setName(dto.getName().trim());
        product.setBarcode(dto.getBarcode());
        product.setDescription(dto.getDescription());
        product.setUnitPrice(dto.getUnitPrice());
        product.setCostPrice(dto.getCostPrice());
        product.setWeightKg(dto.getWeightKg());
        if (dto.getTaxPercent() != null) product.setTaxPercent(dto.getTaxPercent());
        if (dto.getStatus() != null) product.setStatus(dto.getStatus());
        if (dto.getMinSafetyStock() != null) product.setMinSafetyStock(dto.getMinSafetyStock());
        if (dto.getReorderPoint() != null) product.setReorderPoint(dto.getReorderPoint());
        if (dto.getMaxStock() != null) product.setMaxStock(dto.getMaxStock());

        Product updated = productRepository.save(product);
        return mapToDTO(updated);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setStatus(ProductStatus.DISCONTINUED);
        productRepository.save(product);
    }

    public ProductDTO mapToDTO(Product p) {
        ProductDTO dto = new ProductDTO();
        dto.setId(p.getId());
        dto.setSku(p.getSku());
        dto.setBarcode(p.getBarcode());
        dto.setName(p.getName());
        dto.setDescription(p.getDescription());
        dto.setUnitPrice(p.getUnitPrice());
        dto.setCostPrice(p.getCostPrice());
        dto.setWeightKg(p.getWeightKg());
        dto.setTaxPercent(p.getTaxPercent());
        dto.setStatus(p.getStatus());
        dto.setMinSafetyStock(p.getMinSafetyStock());
        dto.setReorderPoint(p.getReorderPoint());
        dto.setMaxStock(p.getMaxStock());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());

        if (p.getCategory() != null) {
            dto.setCategoryId(p.getCategory().getId());
            dto.setCategoryName(p.getCategory().getName());
        }
        if (p.getBrand() != null) {
            dto.setBrandId(p.getBrand().getId());
            dto.setBrandName(p.getBrand().getName());
        }
        return dto;
    }
}
