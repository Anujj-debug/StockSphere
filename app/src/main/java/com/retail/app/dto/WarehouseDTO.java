package com.retail.app.dto;

import com.retail.app.enums.WarehouseType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class WarehouseDTO {
    private Long id;

    @NotBlank(message = "Warehouse code is required")
    @Size(max = 30, message = "Code must be at most 30 characters")
    private String code;

    @NotBlank(message = "Warehouse name is required")
    @Size(max = 120, message = "Name must be at most 120 characters")
    private String name;

    private WarehouseType type;
    private String addressLine;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private String contactPhone;
    private Integer capacityUnits;
    private boolean active = true;

    public WarehouseDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public WarehouseType getType() {
        return type;
    }

    public void setType(WarehouseType type) {
        this.type = type;
    }

    public String getAddressLine() {
        return addressLine;
    }

    public void setAddressLine(String addressLine) {
        this.addressLine = addressLine;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public Integer getCapacityUnits() {
        return capacityUnits;
    }

    public void setCapacityUnits(Integer capacityUnits) {
        this.capacityUnits = capacityUnits;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
