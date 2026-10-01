package com.retail.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SupplierDTO {
    private Long id;

    @NotBlank(message = "Supplier code is required")
    @Size(max = 40, message = "Code must be at most 40 characters")
    private String code;

    @NotBlank(message = "Supplier name is required")
    @Size(max = 150, message = "Name must be at most 150 characters")
    private String name;

    private String contactPerson;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String country;
    private String paymentTerms;
    private Integer averageLeadTimeDays;
    private Double rating;
    private boolean active = true;

    public SupplierDTO() {
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

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getPaymentTerms() {
        return paymentTerms;
    }

    public void setPaymentTerms(String paymentTerms) {
        this.paymentTerms = paymentTerms;
    }

    public Integer getAverageLeadTimeDays() {
        return averageLeadTimeDays;
    }

    public void setAverageLeadTimeDays(Integer averageLeadTimeDays) {
        this.averageLeadTimeDays = averageLeadTimeDays;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
