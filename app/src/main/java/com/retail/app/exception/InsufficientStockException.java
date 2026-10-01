package com.retail.app.exception;

public class InsufficientStockException extends RuntimeException {
    public InsufficientStockException(String message) {
        super(message);
    }

    public InsufficientStockException(String productSku, Integer requested, Integer available) {
        super(String.format("Insufficient stock for SKU '%s'. Requested: %d, Available: %d",
                productSku, requested, available));
    }
}
