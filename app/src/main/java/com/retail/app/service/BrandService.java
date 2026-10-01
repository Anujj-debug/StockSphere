package com.retail.app.service;

import com.retail.app.dto.BrandDTO;
import com.retail.app.entity.Brand;
import com.retail.app.exception.BusinessValidationException;
import com.retail.app.exception.ResourceNotFoundException;
import com.retail.app.repository.BrandRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BrandService {

    private final BrandRepository brandRepository;

    public BrandService(BrandRepository brandRepository) {
        this.brandRepository = brandRepository;
    }

    public List<BrandDTO> getAllBrands() {
        return brandRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public BrandDTO getBrandById(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", id));
        return mapToDTO(brand);
    }

    @Transactional
    public BrandDTO createBrand(BrandDTO dto) {
        if (brandRepository.existsByCode(dto.getCode())) {
            throw new BusinessValidationException("Brand with code '" + dto.getCode() + "' already exists");
        }

        Brand brand = new Brand();
        brand.setCode(dto.getCode().toUpperCase().trim());
        brand.setName(dto.getName().trim());
        brand.setCountry(dto.getCountry());
        brand.setWebsite(dto.getWebsite());
        brand.setActive(dto.isActive());

        Brand saved = brandRepository.save(brand);
        return mapToDTO(saved);
    }

    @Transactional
    public BrandDTO updateBrand(Long id, BrandDTO dto) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", id));

        brand.setName(dto.getName().trim());
        brand.setCountry(dto.getCountry());
        brand.setWebsite(dto.getWebsite());
        brand.setActive(dto.isActive());

        Brand updated = brandRepository.save(brand);
        return mapToDTO(updated);
    }

    @Transactional
    public void deleteBrand(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", id));
        brand.setActive(false);
        brandRepository.save(brand);
    }

    public BrandDTO mapToDTO(Brand entity) {
        BrandDTO dto = new BrandDTO();
        dto.setId(entity.getId());
        dto.setCode(entity.getCode());
        dto.setName(entity.getName());
        dto.setCountry(entity.getCountry());
        dto.setWebsite(entity.getWebsite());
        dto.setActive(entity.isActive());
        return dto;
    }
}
