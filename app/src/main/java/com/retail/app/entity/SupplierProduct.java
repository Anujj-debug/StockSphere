package com.retail.app.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(
    name = "supplier_products",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"supplier_id", "product_id"})
    }
)
public class SupplierProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "supplier_sku", length = 60)
    private String supplierSku;

    @Column(name = "agreed_cost", nullable = false, precision = 12, scale = 2)
    private BigDecimal agreedCost;

    @Column(name = "min_order_quantity", nullable = false)
    private Integer minOrderQuantity = 1;

    @Column(name = "lead_time_days")
    private Integer leadTimeDays = 7;

    public SupplierProduct() {
    }

    public SupplierProduct(Supplier supplier, Product product, String supplierSku,
                           BigDecimal agreedCost, Integer minOrderQuantity, Integer leadTimeDays) {
        this.supplier = supplier;
        this.product = product;
        this.supplierSku = supplierSku;
        this.agreedCost = agreedCost;
        this.minOrderQuantity = minOrderQuantity != null ? minOrderQuantity : 1;
        this.leadTimeDays = leadTimeDays != null ? leadTimeDays : 7;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Supplier getSupplier() {
        return supplier;
    }

    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public String getSupplierSku() {
        return supplierSku;
    }

    public void setSupplierSku(String supplierSku) {
        this.supplierSku = supplierSku;
    }

    public BigDecimal getAgreedCost() {
        return agreedCost;
    }

    public void setAgreedCost(BigDecimal agreedCost) {
        this.agreedCost = agreedCost;
    }

    public Integer getMinOrderQuantity() {
        return minOrderQuantity;
    }

    public void setMinOrderQuantity(Integer minOrderQuantity) {
        this.minOrderQuantity = minOrderQuantity;
    }

    public Integer getLeadTimeDays() {
        return leadTimeDays;
    }

    public void setLeadTimeDays(Integer leadTimeDays) {
        this.leadTimeDays = leadTimeDays;
    }
}
