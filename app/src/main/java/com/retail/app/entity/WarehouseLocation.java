package com.retail.app.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "warehouse_locations")
public class WarehouseLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @Column(nullable = false, length = 30)
    private String zone;

    @Column(length = 20)
    private String aisle;

    @Column(length = 20)
    private String rack;

    @Column(length = 20)
    private String shelf;

    @Column(length = 20)
    private String bin;

    @Column(length = 60, unique = true)
    private String barcode;

    @Column(nullable = false)
    private boolean active = true;

    public WarehouseLocation() {
    }

    public WarehouseLocation(Warehouse warehouse, String zone, String aisle, String rack,
                             String shelf, String bin, String barcode) {
        this.warehouse = warehouse;
        this.zone = zone;
        this.aisle = aisle;
        this.rack = rack;
        this.shelf = shelf;
        this.bin = bin;
        this.barcode = barcode;
        this.active = true;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Warehouse getWarehouse() {
        return warehouse;
    }

    public void setWarehouse(Warehouse warehouse) {
        this.warehouse = warehouse;
    }

    public String getZone() {
        return zone;
    }

    public void setZone(String zone) {
        this.zone = zone;
    }

    public String getAisle() {
        return aisle;
    }

    public void setAisle(String aisle) {
        this.aisle = aisle;
    }

    public String getRack() {
        return rack;
    }

    public void setRack(String rack) {
        this.rack = rack;
    }

    public String getShelf() {
        return shelf;
    }

    public void setShelf(String shelf) {
        this.shelf = shelf;
    }

    public String getBin() {
        return bin;
    }

    public void setBin(String bin) {
        this.bin = bin;
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
