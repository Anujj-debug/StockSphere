package com.retail.app.entity;

import com.retail.app.enums.AdjustmentReason;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_adjustments")
public class StockAdjustment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "adjustment_number", nullable = false, unique = true, length = 40)
    private String adjustmentNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private AdjustmentReason reason;

    @Column(name = "quantity_delta", nullable = false)
    private Integer quantityDelta;

    @Column(name = "previous_quantity", nullable = false)
    private Integer previousQuantity;

    @Column(name = "new_quantity", nullable = false)
    private Integer newQuantity;

    @Column(name = "unit_cost", precision = 12, scale = 2)
    private BigDecimal unitCost;

    @Column(name = "total_valuation_impact", precision = 12, scale = 2)
    private BigDecimal totalValuationImpact;

    @Column(length = 255)
    private String notes;

    @Column(name = "adjusted_by", length = 100)
    private String adjustedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public StockAdjustment() {
    }

    public StockAdjustment(String adjustmentNumber, Warehouse warehouse, Product product,
                           AdjustmentReason reason, Integer quantityDelta, Integer previousQuantity,
                           Integer newQuantity, BigDecimal unitCost, String notes, String adjustedBy) {
        this.adjustmentNumber = adjustmentNumber;
        this.warehouse = warehouse;
        this.product = product;
        this.reason = reason;
        this.quantityDelta = quantityDelta;
        this.previousQuantity = previousQuantity;
        this.newQuantity = newQuantity;
        this.unitCost = unitCost;
        if (unitCost != null && quantityDelta != null) {
            this.totalValuationImpact = unitCost.multiply(BigDecimal.valueOf(quantityDelta));
        }
        this.notes = notes;
        this.adjustedBy = adjustedBy;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAdjustmentNumber() {
        return adjustmentNumber;
    }

    public void setAdjustmentNumber(String adjustmentNumber) {
        this.adjustmentNumber = adjustmentNumber;
    }

    public Warehouse getWarehouse() {
        return warehouse;
    }

    public void setWarehouse(Warehouse warehouse) {
        this.warehouse = warehouse;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public AdjustmentReason getReason() {
        return reason;
    }

    public void setReason(AdjustmentReason reason) {
        this.reason = reason;
    }

    public Integer getQuantityDelta() {
        return quantityDelta;
    }

    public void setQuantityDelta(Integer quantityDelta) {
        this.quantityDelta = quantityDelta;
    }

    public Integer getPreviousQuantity() {
        return previousQuantity;
    }

    public void setPreviousQuantity(Integer previousQuantity) {
        this.previousQuantity = previousQuantity;
    }

    public Integer getNewQuantity() {
        return newQuantity;
    }

    public void setNewQuantity(Integer newQuantity) {
        this.newQuantity = newQuantity;
    }

    public BigDecimal getUnitCost() {
        return unitCost;
    }

    public void setUnitCost(BigDecimal unitCost) {
        this.unitCost = unitCost;
    }

    public BigDecimal getTotalValuationImpact() {
        return totalValuationImpact;
    }

    public void setTotalValuationImpact(BigDecimal totalValuationImpact) {
        this.totalValuationImpact = totalValuationImpact;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getAdjustedBy() {
        return adjustedBy;
    }

    public void setAdjustedBy(String adjustedBy) {
        this.adjustedBy = adjustedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
