package com.retail.app.service;

import com.retail.app.dto.SalesOrderItemRequestDTO;
import com.retail.app.dto.SalesOrderRequestDTO;
import com.retail.app.dto.SalesOrderResponseDTO;
import com.retail.app.entity.*;
import com.retail.app.enums.SalesOrderStatus;
import com.retail.app.enums.TransactionType;
import com.retail.app.exception.BusinessValidationException;
import com.retail.app.exception.InsufficientStockException;
import com.retail.app.exception.ResourceNotFoundException;
import com.retail.app.repository.ProductRepository;
import com.retail.app.repository.SalesOrderRepository;
import com.retail.app.repository.StockRepository;
import com.retail.app.repository.WarehouseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SalesOrderService {

    private final SalesOrderRepository salesOrderRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final StockRepository stockRepository;
    private final InventoryService inventoryService;

    public SalesOrderService(SalesOrderRepository salesOrderRepository,
                             WarehouseRepository warehouseRepository,
                             ProductRepository productRepository,
                             StockRepository stockRepository,
                             InventoryService inventoryService) {
        this.salesOrderRepository = salesOrderRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
        this.stockRepository = stockRepository;
        this.inventoryService = inventoryService;
    }

    public List<SalesOrderResponseDTO> getAllSalesOrders(SalesOrderStatus status) {
        List<SalesOrder> list;
        if (status != null) {
            list = salesOrderRepository.findByStatus(status);
        } else {
            list = salesOrderRepository.findAllByOrderByCreatedAtDesc();
        }
        return list.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public SalesOrderResponseDTO getSalesOrderById(Long id) {
        SalesOrder order = salesOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalesOrder", "id", id));
        return mapToDTO(order);
    }

    @Transactional
    public SalesOrderResponseDTO createSalesOrder(SalesOrderRequestDTO dto) {
        Warehouse warehouse = warehouseRepository.findById(dto.getSourceWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", dto.getSourceWarehouseId()));

        String orderNumber = "SO-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();

        SalesOrder order = new SalesOrder(
                orderNumber, dto.getCustomerName().trim(), dto.getCustomerEmail(),
                dto.getCustomerPhone(), dto.getShippingAddress(), warehouse,
                dto.getCreatedBy() != null ? dto.getCreatedBy() : "Store Associate",
                dto.getNotes()
        );

        for (SalesOrderItemRequestDTO itemDto : dto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemDto.getProductId()));

            Stock stock = inventoryService.getOrCreateStock(product, warehouse);
            if (stock.getAvailableQuantity() < itemDto.getQuantity()) {
                throw new InsufficientStockException(product.getSku(), itemDto.getQuantity(), stock.getAvailableQuantity());
            }

            // Reserve inventory immediately
            stock.setQuantityReserved(stock.getQuantityReserved() + itemDto.getQuantity());
            stockRepository.save(stock);

            BigDecimal price = itemDto.getUnitPrice() != null ? itemDto.getUnitPrice() : product.getUnitPrice();
            SalesOrderItem item = new SalesOrderItem(product, itemDto.getQuantity(), price);
            order.addItem(item);
        }

        SalesOrder saved = salesOrderRepository.save(order);
        return mapToDTO(saved);
    }

    @Transactional
    public SalesOrderResponseDTO allocateOrder(Long id) {
        SalesOrder order = salesOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalesOrder", "id", id));

        if (order.getStatus() != SalesOrderStatus.PENDING) {
            throw new BusinessValidationException("Only PENDING orders can be allocated. Current: " + order.getStatus());
        }

        for (SalesOrderItem item : order.getItems()) {
            item.setQuantityAllocated(item.getQuantityOrdered());
        }

        order.setStatus(SalesOrderStatus.ALLOCATED);
        return mapToDTO(salesOrderRepository.save(order));
    }

    @Transactional
    public SalesOrderResponseDTO pickOrder(Long id) {
        SalesOrder order = salesOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalesOrder", "id", id));

        if (order.getStatus() != SalesOrderStatus.ALLOCATED) {
            throw new BusinessValidationException("Only ALLOCATED orders can be picked. Current: " + order.getStatus());
        }

        order.setStatus(SalesOrderStatus.PICKED);
        return mapToDTO(salesOrderRepository.save(order));
    }

    @Transactional
    public SalesOrderResponseDTO packOrder(Long id) {
        SalesOrder order = salesOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalesOrder", "id", id));

        if (order.getStatus() != SalesOrderStatus.PICKED) {
            throw new BusinessValidationException("Only PICKED orders can be packed. Current: " + order.getStatus());
        }

        order.setStatus(SalesOrderStatus.PACKED);
        return mapToDTO(salesOrderRepository.save(order));
    }

    @Transactional
    public SalesOrderResponseDTO shipOrder(Long id) {
        SalesOrder order = salesOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalesOrder", "id", id));

        if (order.getStatus() != SalesOrderStatus.PACKED && order.getStatus() != SalesOrderStatus.ALLOCATED && order.getStatus() != SalesOrderStatus.PICKED) {
            throw new BusinessValidationException("Cannot ship order in status: " + order.getStatus());
        }

        Warehouse warehouse = order.getSourceWarehouse();

        for (SalesOrderItem item : order.getItems()) {
            Stock stock = stockRepository.findByProductIdAndWarehouseId(item.getProduct().getId(), warehouse.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Stock", "product", item.getProduct().getSku()));

            int qty = item.getQuantityOrdered();
            int before = stock.getQuantityOnHand();
            int after = before - qty;

            stock.setQuantityOnHand(after);
            stock.setQuantityReserved(Math.max(0, stock.getQuantityReserved() - qty));
            stockRepository.save(stock);

            item.setQuantityShipped(qty);

            // Record immutable ledger entry
            inventoryService.recordTransaction(
                    item.getProduct(), warehouse, TransactionType.SALES_FULFILLMENT,
                    -qty, before, after, order.getOrderNumber(),
                    "Fulfillment Staff", "Shipped to " + order.getCustomerName()
            );
        }

        order.setStatus(SalesOrderStatus.SHIPPED);
        return mapToDTO(salesOrderRepository.save(order));
    }

    @Transactional
    public SalesOrderResponseDTO deliverOrder(Long id) {
        SalesOrder order = salesOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalesOrder", "id", id));

        if (order.getStatus() != SalesOrderStatus.SHIPPED) {
            throw new BusinessValidationException("Only SHIPPED orders can be marked as DELIVERED");
        }

        order.setStatus(SalesOrderStatus.DELIVERED);
        return mapToDTO(salesOrderRepository.save(order));
    }

    @Transactional
    public SalesOrderResponseDTO cancelOrder(Long id) {
        SalesOrder order = salesOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalesOrder", "id", id));

        if (order.getStatus() == SalesOrderStatus.SHIPPED || order.getStatus() == SalesOrderStatus.DELIVERED) {
            throw new BusinessValidationException("Cannot cancel an order that has already been shipped or delivered");
        }

        // Release reserved inventory
        for (SalesOrderItem item : order.getItems()) {
            stockRepository.findByProductIdAndWarehouseId(item.getProduct().getId(), order.getSourceWarehouse().getId())
                    .ifPresent(stock -> {
                        stock.setQuantityReserved(Math.max(0, stock.getQuantityReserved() - item.getQuantityOrdered()));
                        stockRepository.save(stock);
                    });
        }

        order.setStatus(SalesOrderStatus.CANCELLED);
        return mapToDTO(salesOrderRepository.save(order));
    }

    public SalesOrderResponseDTO mapToDTO(SalesOrder order) {
        SalesOrderResponseDTO dto = new SalesOrderResponseDTO();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setCustomerName(order.getCustomerName());
        dto.setCustomerEmail(order.getCustomerEmail());
        dto.setCustomerPhone(order.getCustomerPhone());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setWarehouseId(order.getSourceWarehouse().getId());
        dto.setWarehouseName(order.getSourceWarehouse().getName());
        dto.setStatus(order.getStatus());
        dto.setOrderDate(order.getOrderDate());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setNotes(order.getNotes());
        dto.setCreatedBy(order.getCreatedBy());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        List<SalesOrderResponseDTO.SalesOrderItemResponseDTO> itemDTOs = order.getItems().stream().map(item -> {
            SalesOrderResponseDTO.SalesOrderItemResponseDTO iDto = new SalesOrderResponseDTO.SalesOrderItemResponseDTO();
            iDto.setId(item.getId());
            iDto.setProductId(item.getProduct().getId());
            iDto.setProductSku(item.getProduct().getSku());
            iDto.setProductName(item.getProduct().getName());
            iDto.setQuantityOrdered(item.getQuantityOrdered());
            iDto.setQuantityAllocated(item.getQuantityAllocated());
            iDto.setQuantityShipped(item.getQuantityShipped());
            iDto.setUnitPrice(item.getUnitPrice());
            iDto.setLineTotal(item.getLineTotal());
            return iDto;
        }).collect(Collectors.toList());

        dto.setItems(itemDTOs);
        return dto;
    }
}
