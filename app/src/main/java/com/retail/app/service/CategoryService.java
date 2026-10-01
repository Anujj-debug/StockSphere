package com.retail.app.service;

import com.retail.app.dto.BrandDTO;
import com.retail.app.dto.CategoryDTO;
import com.retail.app.entity.Brand;
import com.retail.app.entity.Category;
import com.retail.app.exception.BusinessValidationException;
import com.retail.app.exception.ResourceNotFoundException;
import com.retail.app.repository.BrandRepository;
import com.retail.app.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return mapToDTO(category);
    }

    @Transactional
    public CategoryDTO createCategory(CategoryDTO dto) {
        if (categoryRepository.existsByCode(dto.getCode())) {
            throw new BusinessValidationException("Category with code '" + dto.getCode() + "' already exists");
        }

        Category category = new Category();
        category.setCode(dto.getCode().toUpperCase().trim());
        category.setName(dto.getName().trim());
        category.setDescription(dto.getDescription());
        category.setActive(dto.isActive());

        if (dto.getParentId() != null) {
            Category parent = categoryRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent Category", "id", dto.getParentId()));
            category.setParent(parent);
        }

        Category saved = categoryRepository.save(category);
        return mapToDTO(saved);
    }

    @Transactional
    public CategoryDTO updateCategory(Long id, CategoryDTO dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        category.setName(dto.getName().trim());
        category.setDescription(dto.getDescription());
        category.setActive(dto.isActive());

        if (dto.getParentId() != null) {
            if (dto.getParentId().equals(id)) {
                throw new BusinessValidationException("A category cannot be its own parent");
            }
            Category parent = categoryRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent Category", "id", dto.getParentId()));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        Category updated = categoryRepository.save(category);
        return mapToDTO(updated);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        category.setActive(false);
        categoryRepository.save(category);
    }

    public CategoryDTO mapToDTO(Category entity) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(entity.getId());
        dto.setCode(entity.getCode());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setActive(entity.isActive());
        if (entity.getParent() != null) {
            dto.setParentId(entity.getParent().getId());
            dto.setParentName(entity.getParent().getName());
        }
        return dto;
    }
}
