package com.retail.app.service;

import com.retail.app.dto.SupplierDTO;
import com.retail.app.entity.Product;
import com.retail.app.entity.Supplier;
import com.retail.app.entity.SupplierProduct;
import com.retail.app.exception.BusinessValidationException;
import com.retail.app.exception.ResourceNotFoundException;
import com.retail.app.repository.ProductRepository;
import com.retail.app.repository.SupplierProductRepository;
import com.retail.app.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierProductRepository supplierProductRepository;
    private final ProductRepository productRepository;

    public SupplierService(SupplierRepository supplierRepository,
                           SupplierProductRepository supplierProductRepository,
                           ProductRepository productRepository) {
        this.supplierRepository = supplierRepository;
        this.supplierProductRepository = supplierProductRepository;
        this.productRepository = productRepository;
    }

    public List<SupplierDTO> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public SupplierDTO getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
        return mapToDTO(supplier);
    }

    @Transactional
    public SupplierDTO createSupplier(SupplierDTO dto) {
        String code = dto.getCode().toUpperCase().trim();
        if (supplierRepository.existsByCode(code)) {
            throw new BusinessValidationException("Supplier with code '" + code + "' already exists");
        }

        Supplier supplier = new Supplier();
        supplier.setCode(code);
        supplier.setName(dto.getName().trim());
        supplier.setContactPerson(dto.getContactPerson());
        supplier.setEmail(dto.getEmail());
        supplier.setPhone(dto.getPhone());
        supplier.setAddress(dto.getAddress());
        supplier.setCity(dto.getCity());
        supplier.setCountry(dto.getCountry());
        supplier.setPaymentTerms(dto.getPaymentTerms() != null ? dto.getPaymentTerms() : "NET_30");
        supplier.setAverageLeadTimeDays(dto.getAverageLeadTimeDays() != null ? dto.getAverageLeadTimeDays() : 7);
        supplier.setRating(dto.getRating() != null ? dto.getRating() : 5.0);
        supplier.setActive(dto.isActive());

        Supplier saved = supplierRepository.save(supplier);
        return mapToDTO(saved);
    }

    @Transactional
    public SupplierDTO updateSupplier(Long id, SupplierDTO dto) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));

        supplier.setName(dto.getName().trim());
        supplier.setContactPerson(dto.getContactPerson());
        supplier.setEmail(dto.getEmail());
        supplier.setPhone(dto.getPhone());
        supplier.setAddress(dto.getAddress());
        supplier.setCity(dto.getCity());
        supplier.setCountry(dto.getCountry());
        if (dto.getPaymentTerms() != null) supplier.setPaymentTerms(dto.getPaymentTerms());
        if (dto.getAverageLeadTimeDays() != null) supplier.setAverageLeadTimeDays(dto.getAverageLeadTimeDays());
        if (dto.getRating() != null) supplier.setRating(dto.getRating());
        supplier.setActive(dto.isActive());

        Supplier updated = supplierRepository.save(supplier);
        return mapToDTO(updated);
    }

    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
        supplier.setActive(false);
        supplierRepository.save(supplier);
    }

    @Transactional
    public SupplierProduct linkProductToSupplier(Long supplierId, Long productId, String supplierSku,
                                                 BigDecimal agreedCost, Integer minOrderQty, Integer leadTimeDays) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", supplierId));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        SupplierProduct sp = supplierProductRepository.findBySupplierIdAndProductId(supplierId, productId)
                .orElse(new SupplierProduct());

        sp.setSupplier(supplier);
        sp.setProduct(product);
        sp.setSupplierSku(supplierSku);
        sp.setAgreedCost(agreedCost != null ? agreedCost : product.getCostPrice());
        sp.setMinOrderQuantity(minOrderQty != null ? minOrderQty : 1);
        sp.setLeadTimeDays(leadTimeDays != null ? leadTimeDays : 7);

        return supplierProductRepository.save(sp);
    }

    public List<SupplierProduct> getSupplierProducts(Long supplierId) {
        return supplierProductRepository.findBySupplierId(supplierId);
    }

    public SupplierDTO mapToDTO(Supplier s) {
        SupplierDTO dto = new SupplierDTO();
        dto.setId(s.getId());
        dto.setCode(s.getCode());
        dto.setName(s.getName());
        dto.setContactPerson(s.getContactPerson());
        dto.setEmail(s.getEmail());
        dto.setPhone(s.getPhone());
        dto.setAddress(s.getAddress());
        dto.setCity(s.getCity());
        dto.setCountry(s.getCountry());
        dto.setPaymentTerms(s.getPaymentTerms());
        dto.setAverageLeadTimeDays(s.getAverageLeadTimeDays());
        dto.setRating(s.getRating());
        dto.setActive(s.isActive());
        return dto;
    }
}
