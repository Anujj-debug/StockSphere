package com.retail.app.service;

import com.retail.app.dto.StockTransferItemRequestDTO;
import com.retail.app.dto.StockTransferRequestDTO;
import com.retail.app.dto.StockTransferResponseDTO;
import com.retail.app.entity.*;
import com.retail.app.enums.StockTransferStatus;
import com.retail.app.enums.TransactionType;
import com.retail.app.exception.BusinessValidationException;
import com.retail.app.exception.InsufficientStockException;
import com.retail.app.exception.ResourceNotFoundException;
import com.retail.app.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StockTransferService {

    private final StockTransferRepository transferRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final StockRepository stockRepository;
    private final InventoryService inventoryService;

    public StockTransferService(StockTransferRepository transferRepository,
                                WarehouseRepository warehouseRepository,
                                ProductRepository productRepository,
                                StockRepository stockRepository,
                                InventoryService inventoryService) {
        this.transferRepository = transferRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
        this.stockRepository = stockRepository;
        this.inventoryService = inventoryService;
    }

    public List<StockTransferResponseDTO> getAllTransfers(StockTransferStatus status) {
        List<StockTransfer> list;
        if (status != null) {
            list = transferRepository.findByStatus(status);
        } else {
            list = transferRepository.findAllByOrderByCreatedAtDesc();
        }
        return list.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public StockTransferResponseDTO getTransferById(Long id) {
        StockTransfer transfer = transferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StockTransfer", "id", id));
        return mapToDTO(transfer);
    }

    @Transactional
    public StockTransferResponseDTO requestTransfer(StockTransferRequestDTO dto) {
        if (dto.getSourceWarehouseId().equals(dto.getDestinationWarehouseId())) {
            throw new BusinessValidationException("Source and destination warehouses cannot be the same");
        }

        Warehouse source = warehouseRepository.findById(dto.getSourceWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Source Warehouse", "id", dto.getSourceWarehouseId()));
        Warehouse destination = warehouseRepository.findById(dto.getDestinationWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Destination Warehouse", "id", dto.getDestinationWarehouseId()));

        String transferNumber = "TR-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();

        StockTransfer transfer = new StockTransfer(
                transferNumber, source, destination,
                dto.getRequestedBy() != null ? dto.getRequestedBy() : "System",
                dto.getNotes()
        );

        for (StockTransferItemRequestDTO itemDto : dto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemDto.getProductId()));

            Stock sourceStock = inventoryService.getOrCreateStock(product, source);
            if (sourceStock.getAvailableQuantity() < itemDto.getQuantity()) {
                throw new InsufficientStockException(product.getSku(), itemDto.getQuantity(), sourceStock.getAvailableQuantity());
            }

            // Reserve stock at source
            sourceStock.setQuantityReserved(sourceStock.getQuantityReserved() + itemDto.getQuantity());
            stockRepository.save(sourceStock);

            StockTransferItem item = new StockTransferItem(product, itemDto.getQuantity());
            transfer.addItem(item);
        }

        StockTransfer saved = transferRepository.save(transfer);
        return mapToDTO(saved);
    }

    @Transactional
    public StockTransferResponseDTO approveTransfer(Long transferId, String approvedBy) {
        StockTransfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("StockTransfer", "id", transferId));

        if (transfer.getStatus() != StockTransferStatus.REQUESTED) {
            throw new BusinessValidationException("Only transfers in REQUESTED status can be approved. Current status: " + transfer.getStatus());
        }

        transfer.setStatus(StockTransferStatus.APPROVED);
        transfer.setApprovedBy(approvedBy != null ? approvedBy : "Manager");
        return mapToDTO(transferRepository.save(transfer));
    }

    @Transactional
    public StockTransferResponseDTO dispatchTransfer(Long transferId) {
        StockTransfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("StockTransfer", "id", transferId));

        if (transfer.getStatus() != StockTransferStatus.APPROVED && transfer.getStatus() != StockTransferStatus.REQUESTED) {
            throw new BusinessValidationException("Cannot dispatch transfer in status: " + transfer.getStatus());
        }

        for (StockTransferItem item : transfer.getItems()) {
            Stock sourceStock = stockRepository.findByProductIdAndWarehouseId(
                    item.getProduct().getId(), transfer.getSourceWarehouse().getId()
            ).orElseThrow(() -> new ResourceNotFoundException("Source Stock", "product", item.getProduct().getSku()));

            int qty = item.getQuantityRequested();
            int before = sourceStock.getQuantityOnHand();
            int after = before - qty;

            sourceStock.setQuantityOnHand(after);
            sourceStock.setQuantityReserved(Math.max(0, sourceStock.getQuantityReserved() - qty));
            stockRepository.save(sourceStock);

            item.setQuantityTransferred(qty);

            // Record immutable ledger entry
            inventoryService.recordTransaction(
                    item.getProduct(), transfer.getSourceWarehouse(), TransactionType.TRANSFER_OUT,
                    -qty, before, after, transfer.getTransferNumber(),
                    transfer.getApprovedBy(), "Dispatched for transfer to " + transfer.getDestinationWarehouse().getName()
            );
        }

        transfer.setStatus(StockTransferStatus.IN_TRANSIT);
        return mapToDTO(transferRepository.save(transfer));
    }

    @Transactional
    public StockTransferResponseDTO receiveTransfer(Long transferId) {
        StockTransfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("StockTransfer", "id", transferId));

        if (transfer.getStatus() != StockTransferStatus.IN_TRANSIT) {
            throw new BusinessValidationException("Only IN_TRANSIT transfers can be received. Current status: " + transfer.getStatus());
        }

        for (StockTransferItem item : transfer.getItems()) {
            Stock destStock = inventoryService.getOrCreateStock(item.getProduct(), transfer.getDestinationWarehouse());

            int qty = item.getQuantityTransferred() != null && item.getQuantityTransferred() > 0 ?
                    item.getQuantityTransferred() : item.getQuantityRequested();
            int before = destStock.getQuantityOnHand();
            int after = before + qty;

            destStock.setQuantityOnHand(after);
            stockRepository.save(destStock);

            item.setQuantityReceived(qty);

            // Record immutable ledger entry
            inventoryService.recordTransaction(
                    item.getProduct(), transfer.getDestinationWarehouse(), TransactionType.TRANSFER_IN,
                    qty, before, after, transfer.getTransferNumber(),
                    "Warehouse Staff", "Received from " + transfer.getSourceWarehouse().getName()
            );
        }

        transfer.setStatus(StockTransferStatus.COMPLETED);
        transfer.setCompletedAt(LocalDateTime.now());
        return mapToDTO(transferRepository.save(transfer));
    }

    @Transactional
    public StockTransferResponseDTO cancelTransfer(Long transferId) {
        StockTransfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("StockTransfer", "id", transferId));

        if (transfer.getStatus() == StockTransferStatus.COMPLETED || transfer.getStatus() == StockTransferStatus.IN_TRANSIT) {
            throw new BusinessValidationException("Cannot cancel transfer in " + transfer.getStatus() + " status");
        }

        // Release reserved stock at source
        for (StockTransferItem item : transfer.getItems()) {
            stockRepository.findByProductIdAndWarehouseId(
                    item.getProduct().getId(), transfer.getSourceWarehouse().getId()
            ).ifPresent(sourceStock -> {
                sourceStock.setQuantityReserved(Math.max(0, sourceStock.getQuantityReserved() - item.getQuantityRequested()));
                stockRepository.save(sourceStock);
            });
        }

        transfer.setStatus(StockTransferStatus.CANCELLED);
        return mapToDTO(transferRepository.save(transfer));
    }

    public StockTransferResponseDTO mapToDTO(StockTransfer transfer) {
        StockTransferResponseDTO dto = new StockTransferResponseDTO();
        dto.setId(transfer.getId());
        dto.setTransferNumber(transfer.getTransferNumber());
        dto.setSourceWarehouseId(transfer.getSourceWarehouse().getId());
        dto.setSourceWarehouseName(transfer.getSourceWarehouse().getName());
        dto.setDestinationWarehouseId(transfer.getDestinationWarehouse().getId());
        dto.setDestinationWarehouseName(transfer.getDestinationWarehouse().getName());
        dto.setStatus(transfer.getStatus());
        dto.setRequestedBy(transfer.getRequestedBy());
        dto.setApprovedBy(transfer.getApprovedBy());
        dto.setNotes(transfer.getNotes());
        dto.setCreatedAt(transfer.getCreatedAt());
        dto.setCompletedAt(transfer.getCompletedAt());

        List<StockTransferResponseDTO.StockTransferItemResponseDTO> itemDTOs = transfer.getItems().stream().map(item -> {
            StockTransferResponseDTO.StockTransferItemResponseDTO iDto = new StockTransferResponseDTO.StockTransferItemResponseDTO();
            iDto.setId(item.getId());
            iDto.setProductId(item.getProduct().getId());
            iDto.setProductSku(item.getProduct().getSku());
            iDto.setProductName(item.getProduct().getName());
            iDto.setQuantityRequested(item.getQuantityRequested());
            iDto.setQuantityTransferred(item.getQuantityTransferred());
            iDto.setQuantityReceived(item.getQuantityReceived());
            return iDto;
        }).collect(Collectors.toList());

        dto.setItems(itemDTOs);
        return dto;
    }
}
