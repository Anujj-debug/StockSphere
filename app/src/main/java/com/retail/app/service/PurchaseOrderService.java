package com.retail.app.service;

import com.retail.app.dto.GoodsReceiptDTO;
import com.retail.app.dto.PurchaseOrderItemRequestDTO;
import com.retail.app.dto.PurchaseOrderRequestDTO;
import com.retail.app.dto.PurchaseOrderResponseDTO;
import com.retail.app.entity.*;
import com.retail.app.enums.PurchaseOrderStatus;
import com.retail.app.enums.TransactionType;
import com.retail.app.exception.BusinessValidationException;
import com.retail.app.exception.ResourceNotFoundException;
import com.retail.app.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final StockRepository stockRepository;
    private final InventoryService inventoryService;

    public PurchaseOrderService(PurchaseOrderRepository purchaseOrderRepository,
                                SupplierRepository supplierRepository,
                                WarehouseRepository warehouseRepository,
                                ProductRepository productRepository,
                                StockRepository stockRepository,
                                InventoryService inventoryService) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.supplierRepository = supplierRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
        this.stockRepository = stockRepository;
        this.inventoryService = inventoryService;
    }

    public List<PurchaseOrderResponseDTO> getAllPurchaseOrders(PurchaseOrderStatus status) {
        List<PurchaseOrder> list;
        if (status != null) {
            list = purchaseOrderRepository.findByStatus(status);
        } else {
            list = purchaseOrderRepository.findAllByOrderByCreatedAtDesc();
        }
        return list.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public PurchaseOrderResponseDTO getPurchaseOrderById(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", id));
        return mapToDTO(po);
    }

    @Transactional
    public PurchaseOrderResponseDTO createPurchaseOrder(PurchaseOrderRequestDTO dto) {
        Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", dto.getSupplierId()));
        Warehouse warehouse = warehouseRepository.findById(dto.getDestinationWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", dto.getDestinationWarehouseId()));

        String poNumber = "PO-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();

        PurchaseOrder po = new PurchaseOrder(
                poNumber, supplier, warehouse,
                dto.getOrderDate() != null ? dto.getOrderDate() : LocalDate.now(),
                dto.getExpectedDeliveryDate(),
                dto.getCreatedBy() != null ? dto.getCreatedBy() : "Procurement Officer",
                dto.getNotes()
        );

        for (PurchaseOrderItemRequestDTO itemDto : dto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemDto.getProductId()));

            PurchaseOrderItem item = new PurchaseOrderItem(
                    product, itemDto.getQuantityOrdered(), itemDto.getUnitCost()
            );
            po.addItem(item);
        }

        PurchaseOrder saved = purchaseOrderRepository.save(po);
        return mapToDTO(saved);
    }

    @Transactional
    public PurchaseOrderResponseDTO submitPurchaseOrder(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", id));

        if (po.getStatus() != PurchaseOrderStatus.DRAFT) {
            throw new BusinessValidationException("Only DRAFT purchase orders can be submitted");
        }

        po.setStatus(PurchaseOrderStatus.SUBMITTED);
        return mapToDTO(purchaseOrderRepository.save(po));
    }

    @Transactional
    public PurchaseOrderResponseDTO approvePurchaseOrder(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", id));

        if (po.getStatus() != PurchaseOrderStatus.SUBMITTED && po.getStatus() != PurchaseOrderStatus.DRAFT) {
            throw new BusinessValidationException("Only DRAFT or SUBMITTED purchase orders can be approved");
        }

        po.setStatus(PurchaseOrderStatus.APPROVED);
        return mapToDTO(purchaseOrderRepository.save(po));
    }

    @Transactional
    public PurchaseOrderResponseDTO receiveGoods(Long id, GoodsReceiptDTO receiptDto) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", id));

        if (po.getStatus() != PurchaseOrderStatus.APPROVED && po.getStatus() != PurchaseOrderStatus.PARTIALLY_RECEIVED) {
            throw new BusinessValidationException("Goods can only be received for APPROVED or PARTIALLY_RECEIVED purchase orders");
        }

        Warehouse warehouse = po.getDestinationWarehouse();

        for (GoodsReceiptDTO.GoodsReceiptItemDTO itemReceipt : receiptDto.getItems()) {
            PurchaseOrderItem poItem = po.getItems().stream()
                    .filter(i -> i.getId().equals(itemReceipt.getPoItemId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrderItem", "id", itemReceipt.getPoItemId()));

            int qtyToReceive = itemReceipt.getQuantityReceived();
            int remaining = poItem.getQuantityOrdered() - poItem.getQuantityReceived();
            if (qtyToReceive > remaining) {
                throw new BusinessValidationException(
                        "Cannot receive " + qtyToReceive + " units for product " + poItem.getProduct().getSku()
                                + ". Remaining to receive is " + remaining);
            }

            poItem.setQuantityReceived(poItem.getQuantityReceived() + qtyToReceive);

            // Update inventory stock on hand
            Stock stock = inventoryService.getOrCreateStock(poItem.getProduct(), warehouse);
            int before = stock.getQuantityOnHand();
            int after = before + qtyToReceive;
            stock.setQuantityOnHand(after);
            stockRepository.save(stock);

            // Update product weighted average cost price
            Product product = poItem.getProduct();
            BigDecimal totalOldValuation = product.getCostPrice().multiply(BigDecimal.valueOf(before));
            BigDecimal totalNewBatchValuation = poItem.getUnitCost().multiply(BigDecimal.valueOf(qtyToReceive));
            BigDecimal combinedValuation = totalOldValuation.add(totalNewBatchValuation);
            if (after > 0) {
                BigDecimal updatedAvgCost = combinedValuation.divide(BigDecimal.valueOf(after), 2, RoundingMode.HALF_UP);
                product.setCostPrice(updatedAvgCost);
                productRepository.save(product);
            }

            // Write immutable transaction record
            inventoryService.recordTransaction(
                    product, warehouse, TransactionType.PURCHASE_RECEIPT,
                    qtyToReceive, before, after, po.getPoNumber(),
                    receiptDto.getReceivedBy() != null ? receiptDto.getReceivedBy() : "Receiving Clerk",
                    "GRN against " + po.getPoNumber() + " | Supplier: " + po.getSupplier().getName()
            );
        }

        // Determine if fully or partially received
        boolean allFullyReceived = po.getItems().stream()
                .allMatch(i -> i.getQuantityReceived().equals(i.getQuantityOrdered()));

        po.setStatus(allFullyReceived ? PurchaseOrderStatus.RECEIVED : PurchaseOrderStatus.PARTIALLY_RECEIVED);
        return mapToDTO(purchaseOrderRepository.save(po));
    }

    @Transactional
    public PurchaseOrderResponseDTO cancelPurchaseOrder(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", id));

        if (po.getStatus() == PurchaseOrderStatus.RECEIVED) {
            throw new BusinessValidationException("Cannot cancel an already received purchase order");
        }

        po.setStatus(PurchaseOrderStatus.CANCELLED);
        return mapToDTO(purchaseOrderRepository.save(po));
    }

    public PurchaseOrderResponseDTO mapToDTO(PurchaseOrder po) {
        PurchaseOrderResponseDTO dto = new PurchaseOrderResponseDTO();
        dto.setId(po.getId());
        dto.setPoNumber(po.getPoNumber());
        dto.setSupplierId(po.getSupplier().getId());
        dto.setSupplierCode(po.getSupplier().getCode());
        dto.setSupplierName(po.getSupplier().getName());
        dto.setDestinationWarehouseId(po.getDestinationWarehouse().getId());
        dto.setDestinationWarehouseName(po.getDestinationWarehouse().getName());
        dto.setStatus(po.getStatus());
        dto.setOrderDate(po.getOrderDate());
        dto.setExpectedDeliveryDate(po.getExpectedDeliveryDate());
        dto.setTotalAmount(po.getTotalAmount());
        dto.setNotes(po.getNotes());
        dto.setCreatedBy(po.getCreatedBy());
        dto.setCreatedAt(po.getCreatedAt());
        dto.setUpdatedAt(po.getUpdatedAt());

        List<PurchaseOrderResponseDTO.PurchaseOrderItemResponseDTO> itemDTOs = po.getItems().stream().map(item -> {
            PurchaseOrderResponseDTO.PurchaseOrderItemResponseDTO iDto = new PurchaseOrderResponseDTO.PurchaseOrderItemResponseDTO();
            iDto.setId(item.getId());
            iDto.setProductId(item.getProduct().getId());
            iDto.setProductSku(item.getProduct().getSku());
            iDto.setProductName(item.getProduct().getName());
            iDto.setQuantityOrdered(item.getQuantityOrdered());
            iDto.setQuantityReceived(item.getQuantityReceived());
            iDto.setUnitCost(item.getUnitCost());
            iDto.setLineTotal(item.getLineTotal());
            return iDto;
        }).collect(Collectors.toList());

        dto.setItems(itemDTOs);
        return dto;
    }
}
