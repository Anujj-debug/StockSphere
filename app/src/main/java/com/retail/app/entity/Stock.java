package com.retail.app.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "stocks",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"product_id", "warehouse_id"})
    }
)
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private WarehouseLocation defaultLocation;

    @Column(name = "quantity_on_hand", nullable = false)
    private Integer quantityOnHand = 0;

    @Column(name = "quantity_reserved", nullable = false)
    private Integer quantityReserved = 0;

    @Column(name = "quantity_allocated", nullable = false)
    private Integer quantityAllocated = 0;

    @Column(name = "min_stock_level", nullable = false)
    private Integer minStockLevel = 10;

    @Column(name = "reorder_point", nullable = false)
    private Integer reorderPoint = 20;

    @Column(name = "max_stock_level", nullable = false)
    private Integer maxStockLevel = 500;

    @Column(name = "last_audited_at")
    private LocalDateTime lastAuditedAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Stock() {
    }

    public Stock(Product product, Warehouse warehouse, Integer quantityOnHand,
                 Integer minStockLevel, Integer reorderPoint, Integer maxStockLevel) {
        this.product = product;
        this.warehouse = warehouse;
        this.quantityOnHand = quantityOnHand != null ? quantityOnHand : 0;
        this.quantityReserved = 0;
        this.quantityAllocated = 0;
        this.minStockLevel = minStockLevel != null ? minStockLevel : 10;
        this.reorderPoint = reorderPoint != null ? reorderPoint : 20;
        this.maxStockLevel = maxStockLevel != null ? maxStockLevel : 500;
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    @PreUpdate
    protected void onPersistOrUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Integer getAvailableQuantity() {
        return Math.max(0, (quantityOnHand != null ? quantityOnHand : 0) - (quantityReserved != null ? quantityReserved : 0));
    }

    public boolean isLowStock() {
        return getAvailableQuantity() <= (reorderPoint != null ? reorderPoint : 0);
    }

    public boolean isOutOfStock() {
        return (quantityOnHand == null || quantityOnHand <= 0);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Warehouse getWarehouse() {
        return warehouse;
    }

    public void setWarehouse(Warehouse warehouse) {
        this.warehouse = warehouse;
    }

    public WarehouseLocation getDefaultLocation() {
        return defaultLocation;
    }

    public void setDefaultLocation(WarehouseLocation defaultLocation) {
        this.defaultLocation = defaultLocation;
    }

    public Integer getQuantityOnHand() {
        return quantityOnHand;
    }

    public void setQuantityOnHand(Integer quantityOnHand) {
        this.quantityOnHand = quantityOnHand;
    }

    public Integer getQuantityReserved() {
        return quantityReserved;
    }

    public void setQuantityReserved(Integer quantityReserved) {
        this.quantityReserved = quantityReserved;
    }

    public Integer getQuantityAllocated() {
        return quantityAllocated;
    }

    public void setQuantityAllocated(Integer quantityAllocated) {
        this.quantityAllocated = quantityAllocated;
    }

    public Integer getMinStockLevel() {
        return minStockLevel;
    }

    public void setMinStockLevel(Integer minStockLevel) {
        this.minStockLevel = minStockLevel;
    }

    public Integer getReorderPoint() {
        return reorderPoint;
    }

    public void setReorderPoint(Integer reorderPoint) {
        this.reorderPoint = reorderPoint;
    }

    public Integer getMaxStockLevel() {
        return maxStockLevel;
    }

    public void setMaxStockLevel(Integer maxStockLevel) {
        this.maxStockLevel = maxStockLevel;
    }

    public LocalDateTime getLastAuditedAt() {
        return lastAuditedAt;
    }

    public void setLastAuditedAt(LocalDateTime lastAuditedAt) {
        this.lastAuditedAt = lastAuditedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
