package com.retail.app.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class GoodsReceiptDTO {

    private String receivedBy;
    private String notes;

    @NotEmpty(message = "Items list cannot be empty for receiving goods")
    private List<GoodsReceiptItemDTO> items;

    public static class GoodsReceiptItemDTO {
        @NotNull(message = "Purchase order item ID is required")
        private Long poItemId;

        @NotNull(message = "Quantity received is required")
        @Min(value = 1, message = "Quantity received must be at least 1")
        private Integer quantityReceived;

        public GoodsReceiptItemDTO() {
        }

        public GoodsReceiptItemDTO(Long poItemId, Integer quantityReceived) {
            this.poItemId = poItemId;
            this.quantityReceived = quantityReceived;
        }

        public Long getPoItemId() {
            return poItemId;
        }

        public void setPoItemId(Long poItemId) {
            this.poItemId = poItemId;
        }

        public Integer getQuantityReceived() {
            return quantityReceived;
        }

        public void setQuantityReceived(Integer quantityReceived) {
            this.quantityReceived = quantityReceived;
        }
    }

    public GoodsReceiptDTO() {
    }

    public String getReceivedBy() {
        return receivedBy;
    }

    public void setReceivedBy(String receivedBy) {
        this.receivedBy = receivedBy;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<GoodsReceiptItemDTO> getItems() {
        return items;
    }

    public void setItems(List<GoodsReceiptItemDTO> items) {
        this.items = items;
    }
}
