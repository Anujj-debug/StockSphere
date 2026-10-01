package com.retail.app.config;

import com.retail.app.entity.*;
import com.retail.app.enums.*;
import com.retail.app.repository.*;
import com.retail.app.service.InventoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final WarehouseRepository warehouseRepository;
    private final WarehouseLocationRepository locationRepository;
    private final ProductRepository productRepository;
    private final StockRepository stockRepository;
    private final SupplierRepository supplierRepository;
    private final SupplierProductRepository supplierProductRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final StockTransferRepository stockTransferRepository;
    private final StockAdjustmentRepository stockAdjustmentRepository;
    private final SprintEpicLogRepository sprintEpicLogRepository;
    private final InventoryService inventoryService;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           BrandRepository brandRepository,
                           WarehouseRepository warehouseRepository,
                           WarehouseLocationRepository locationRepository,
                           ProductRepository productRepository,
                           StockRepository stockRepository,
                           SupplierRepository supplierRepository,
                           SupplierProductRepository supplierProductRepository,
                           PurchaseOrderRepository purchaseOrderRepository,
                           SalesOrderRepository salesOrderRepository,
                           StockTransferRepository stockTransferRepository,
                           StockAdjustmentRepository stockAdjustmentRepository,
                           SprintEpicLogRepository sprintEpicLogRepository,
                           InventoryService inventoryService) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.warehouseRepository = warehouseRepository;
        this.locationRepository = locationRepository;
        this.productRepository = productRepository;
        this.stockRepository = stockRepository;
        this.supplierRepository = supplierRepository;
        this.supplierProductRepository = supplierProductRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.salesOrderRepository = salesOrderRepository;
        this.stockTransferRepository = stockTransferRepository;
        this.stockAdjustmentRepository = stockAdjustmentRepository;
        this.sprintEpicLogRepository = sprintEpicLogRepository;
        this.inventoryService = inventoryService;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping initial data load.");
            return;
        }

        log.info("Seeding StockSphere demo data (8 Epics, 15 Sprints retail case study)...");

        // 1. Seed Agile Team & Retail Users
        seedAgileUsers();

        // 2. Seed 8 Epics & 15 Sprints Traceability
        seedSprintEpicLogs();

        // 3. Seed Categories & Brands
        Category catElectronics = categoryRepository.save(new Category("CAT-ELEC", "Electronics", "Consumer electronics and computing", null));
        Category catAudio = categoryRepository.save(new Category("CAT-AUDIO", "Audio & Headphones", "Personal sound and acoustic gear", catElectronics));
        Category catWearables = categoryRepository.save(new Category("CAT-WEAR", "Wearable Technology", "Smart watches and fitness trackers", catElectronics));
        Category catApparel = categoryRepository.save(new Category("CAT-APPR", "Apparel & Footwear", "Sportswear, sneakers, and accessories", null));
        Category catHome = categoryRepository.save(new Category("CAT-HOME", "Home & Living", "Small appliances and lifestyle goods", null));

        Brand brandSony = brandRepository.save(new Brand("BRD-SONY", "Sony", "Japan", "https://sony.com"));
        Brand brandApple = brandRepository.save(new Brand("BRD-AAPL", "Apple", "USA", "https://apple.com"));
        Brand brandNike = brandRepository.save(new Brand("BRD-NIKE", "Nike", "USA", "https://nike.com"));
        Brand brandSamsung = brandRepository.save(new Brand("BRD-SMSNG", "Samsung", "South Korea", "https://samsung.com"));
        Brand brandPhilips = brandRepository.save(new Brand("BRD-PHIL", "Philips", "Netherlands", "https://philips.com"));

        // 4. Seed Warehouses & Bin Locations
        Warehouse whCentral = warehouseRepository.save(new Warehouse(
                "WH-CDC-01", "Central Distribution Center", WarehouseType.CENTRAL_DISTRIBUTION,
                "4500 Logistics Blvd", "Chicago", "IL", "60601", "USA", "+1-312-555-0101", 100000
        ));
        Warehouse whEast = warehouseRepository.save(new Warehouse(
                "WH-EC-02", "East Coast Fulfillment Hub", WarehouseType.REGIONAL_FULFILLMENT,
                "120 Portway Ave", "Newark", "NJ", "07101", "USA", "+1-973-555-0102", 60000
        ));
        Warehouse whWest = warehouseRepository.save(new Warehouse(
                "WH-WC-03", "West Coast Fulfillment Hub", WarehouseType.REGIONAL_FULFILLMENT,
                "880 Sierra Way", "Reno", "NV", "89501", "USA", "+1-775-555-0103", 50000
        ));
        Warehouse whStore = warehouseRepository.save(new Warehouse(
                "WH-RT-04", "Manhattan Retail Store Backroom", WarehouseType.RETAIL_STORE_BACKROOM,
                "750 5th Ave", "New York", "NY", "10019", "USA", "+1-212-555-0104", 10000
        ));

        // Warehouse Locations
        locationRepository.save(new WarehouseLocation(whCentral, "Zone A - Fast Pick", "Aisle 01", "Rack 01", "Shelf 01", "Bin 01", "LOC-CDC-A01-01"));
        locationRepository.save(new WarehouseLocation(whCentral, "Zone B - Bulk Storage", "Aisle 05", "Rack 03", "Shelf 02", "Bin 04", "LOC-CDC-B05-03"));
        locationRepository.save(new WarehouseLocation(whEast, "Zone A - Fast Pick", "Aisle 02", "Rack 01", "Shelf 01", "Bin 02", "LOC-EC-A02-01"));
        locationRepository.save(new WarehouseLocation(whWest, "Zone A - Fast Pick", "Aisle 01", "Rack 02", "Shelf 03", "Bin 01", "LOC-WC-A01-02"));

        // 5. Seed Products
        Product p1 = productRepository.save(new Product(
                "ELEC-HP-001", "880912345601", "Noise-Cancelling Wireless Headphones XM5",
                "Flagship wireless over-ear noise-cancelling headphones with 30-hour battery life.",
                catAudio, brandSony, BigDecimal.valueOf(399.99), BigDecimal.valueOf(240.00), 0.25, 15, 30
        ));

        Product p2 = productRepository.save(new Product(
                "WEAR-SW-002", "880912345602", "Smart Watch Ultra Pro",
                "Advanced GPS and cellular titanium smartwatch with health and fitness sensors.",
                catWearables, brandApple, BigDecimal.valueOf(799.00), BigDecimal.valueOf(520.00), 0.06, 10, 20
        ));

        Product p3 = productRepository.save(new Product(
                "ELEC-TV-003", "880912345603", "55-Inch 4K OLED Ultra-HD Smart TV",
                "Self-lit pixels, 120Hz refresh rate, Dolby Vision and Atmos built-in.",
                catElectronics, brandSamsung, BigDecimal.valueOf(1299.99), BigDecimal.valueOf(850.00), 18.5, 5, 10
        ));

        Product p4 = productRepository.save(new Product(
                "APPR-SH-004", "880912345604", "Air Zoom Pro Running Shoes (Size 10)",
                "High-performance marathon running shoes with responsive foam cushioning.",
                catApparel, brandNike, BigDecimal.valueOf(160.00), BigDecimal.valueOf(85.00), 0.8, 20, 40
        ));

        Product p5 = productRepository.save(new Product(
                "HOME-CF-005", "880912345605", "Bean-to-Cup Espresso Machine 5400",
                "Fully automatic espresso machine with intuitive touch display and LatteGo milk system.",
                catHome, brandPhilips, BigDecimal.valueOf(899.99), BigDecimal.valueOf(560.00), 8.0, 8, 15
        ));

        // 6. Seed Suppliers & Supplier-Product agreements
        Supplier supApex = supplierRepository.save(new Supplier(
                "SUP-APEX", "Apex Global Distribution Inc.", "Robert Chang", "rchang@apexglobal.com",
                "+1-415-555-8899", "1000 Tech Port Way", "San Francisco", "USA", "NET_30", 5, 4.9
        ));
        Supplier supOmni = supplierRepository.save(new Supplier(
                "SUP-OMNI", "OmniGear Logistics & Components", "Claire Dupont", "c.dupont@omnigear.com",
                "+1-206-555-7711", "55 Industrial Boulevard", "Seattle", "USA", "NET_45", 8, 4.7
        ));
        Supplier supVanguard = supplierRepository.save(new Supplier(
                "SUP-VANG", "Vanguard Consumer Goods LLC", "Marcus Bell", "mbell@vanguardcg.com",
                "+1-312-555-4422", "300 Commerce Way", "Chicago", "USA", "NET_15", 3, 4.8
        ));

        supplierProductRepository.save(new SupplierProduct(supApex, p1, "APEX-XM5", BigDecimal.valueOf(235.00), 10, 5));
        supplierProductRepository.save(new SupplierProduct(supApex, p2, "APEX-SW-ULT", BigDecimal.valueOf(510.00), 5, 4));
        supplierProductRepository.save(new SupplierProduct(supOmni, p3, "OMNI-TV-55", BigDecimal.valueOf(830.00), 2, 7));
        supplierProductRepository.save(new SupplierProduct(supVanguard, p4, "VANG-NIKE-RUN", BigDecimal.valueOf(82.00), 25, 3));
        supplierProductRepository.save(new SupplierProduct(supVanguard, p5, "VANG-PHIL-CF", BigDecimal.valueOf(550.00), 5, 5));

        // 7. Seed Real-time Stock across Multi-Warehouses
        seedStockLevels(List.of(p1, p2, p3, p4, p5), List.of(whCentral, whEast, whWest, whStore));

        // 8. Seed Sample Purchase Order (GRN received)
        PurchaseOrder po1 = new PurchaseOrder(
                "PO-20261001-0001", supApex, whCentral, LocalDate.now().minusDays(10),
                LocalDate.now().minusDays(3), "alex.proc", "Q4 Initial stock replenishment"
        );
        po1.setStatus(PurchaseOrderStatus.RECEIVED);
        PurchaseOrderItem po1Item1 = new PurchaseOrderItem(p1, 50, BigDecimal.valueOf(235.00));
        po1Item1.setQuantityReceived(50);
        po1.addItem(po1Item1);
        PurchaseOrderItem po1Item2 = new PurchaseOrderItem(p2, 30, BigDecimal.valueOf(510.00));
        po1Item2.setQuantityReceived(30);
        po1.addItem(po1Item2);
        purchaseOrderRepository.save(po1);

        // 9. Seed Sample In-Transit Stock Transfer
        StockTransfer tr1 = new StockTransfer(
                "TR-20261001-0001", whCentral, whStore, "marcus.inv",
                "Replenishing 5th Avenue retail backroom before weekend shopping surge"
        );
        tr1.setStatus(StockTransferStatus.IN_TRANSIT);
        tr1.setApprovedBy("marcus.inv");
        StockTransferItem tr1Item1 = new StockTransferItem(p1, 10);
        tr1Item1.setQuantityTransferred(10);
        tr1.addItem(tr1Item1);
        stockTransferRepository.save(tr1);

        // 10. Seed Sample Sales Orders
        SalesOrder so1 = new SalesOrder(
                "SO-20261001-0001", "Emma Watson", "emma.watson@example.com",
                "+1-212-555-9090", "124 Park Ave, New York, NY 10016",
                whCentral, "maya.sales", "Customer requested priority ground delivery"
        );
        so1.setStatus(SalesOrderStatus.DELIVERED);
        SalesOrderItem so1Item = new SalesOrderItem(p1, 2, BigDecimal.valueOf(399.99));
        so1Item.setQuantityAllocated(2);
        so1Item.setQuantityShipped(2);
        so1.addItem(so1Item);
        salesOrderRepository.save(so1);

        SalesOrder so2 = new SalesOrder(
                "SO-20261001-0002", "Lucas Vance", "lucas.v@example.com",
                "+1-415-555-7766", "78 Market St, San Francisco, CA 94105",
                whWest, "maya.sales", "Gift wrapped order"
        );
        so2.setStatus(SalesOrderStatus.ALLOCATED);
        SalesOrderItem so2Item = new SalesOrderItem(p2, 1, BigDecimal.valueOf(799.00));
        so2Item.setQuantityAllocated(1);
        so2.addItem(so2Item);
        salesOrderRepository.save(so2);

        // 11. Seed Sample Stock Adjustment (Audit)
        StockAdjustment adj = new StockAdjustment(
                "ADJ-20261001-0001", whCentral, p4, AdjustmentReason.CYCLE_COUNT,
                +5, 115, 120, p4.getCostPrice(),
                "Quarterly physical cycle count reconciled unrecorded carton", "marcus.inv"
        );
        stockAdjustmentRepository.save(adj);

        // 12. Seed Inventory Transaction Ledger entries
        inventoryService.recordTransaction(
                p1, whCentral, TransactionType.PURCHASE_RECEIPT, 50, 0, 50,
                po1.getPoNumber(), "elena.wh", "Initial stock reception"
        );
        inventoryService.recordTransaction(
                p1, whCentral, TransactionType.TRANSFER_OUT, -10, 50, 40,
                tr1.getTransferNumber(), "marcus.inv", "Dispatched to WH-RT-04"
        );
        inventoryService.recordTransaction(
                p1, whCentral, TransactionType.SALES_FULFILLMENT, -2, 40, 38,
                so1.getOrderNumber(), "elena.wh", "Fulfilled order SO-20261001-0001"
        );

        log.info("StockSphere data initialization completed successfully!");
    }

    private void seedAgileUsers() {
        userRepository.save(new User("sarah.po", "Sarah Jenkins", "sarah.po@stocksphere.retail", UserRole.PRODUCT_OWNER));
        userRepository.save(new User("david.sm", "David Kim", "david.sm@stocksphere.retail", UserRole.SCRUM_MASTER));
        userRepository.save(new User("marcus.inv", "Marcus Vance", "marcus.inv@stocksphere.retail", UserRole.INVENTORY_MANAGER));
        userRepository.save(new User("elena.wh", "Elena Rostova", "elena.wh@stocksphere.retail", UserRole.WAREHOUSE_STAFF));
        userRepository.save(new User("alex.proc", "Alex Rodriguez", "alex.proc@stocksphere.retail", UserRole.PURCHASING_OFFICER));
        userRepository.save(new User("maya.sales", "Maya Patel", "maya.sales@stocksphere.retail", UserRole.SALES_AGENT));
        userRepository.save(new User("admin", "System Administrator", "admin@stocksphere.retail", UserRole.ADMIN));
    }

    private void seedSprintEpicLogs() {
        // Epic 1: Product & Catalog Management
        sprintEpicLogRepository.save(new SprintEpicLog(
                1, "Product Catalog Management", 1, "Sprint 1: Category & Brand Foundations",
                UserRole.PRODUCT_OWNER, 8, "COMPLETED",
                "Designed multi-tier hierarchical category model, brand associations, and REST catalog endpoints."
        ));
        sprintEpicLogRepository.save(new SprintEpicLog(
                1, "Product Catalog Management", 2, "Sprint 2: Product Master, Barcodes & Pricing",
                UserRole.PRODUCT_OWNER, 13, "COMPLETED",
                "Implemented SKU generation, UPC/EAN barcode indexing, retail & cost pricing, and tax calculation rules."
        ));

        // Epic 2: Multi-Warehouse & Location Setup
        sprintEpicLogRepository.save(new SprintEpicLog(
                2, "Multi-Warehouse & Facility Management", 3, "Sprint 3: Warehouse Hierarchy & Topology",
                UserRole.SCRUM_MASTER, 8, "COMPLETED",
                "Created Central Distribution, Regional Hub, and Retail Backroom warehouse topology with address and capacity limits."
        ));
        sprintEpicLogRepository.save(new SprintEpicLog(
                2, "Multi-Warehouse & Facility Management", 4, "Sprint 4: Warehouse Zones, Aisles, Racks & Bins",
                UserRole.WAREHOUSE_STAFF, 8, "COMPLETED",
                "Added bin-level storage granularity (Zone, Aisle, Shelf, Bin) with barcode scanning verification."
        ));

        // Epic 3: Real-Time Stock Tracking
        sprintEpicLogRepository.save(new SprintEpicLog(
                3, "Real-Time Stock Tracking & Safety Stock", 5, "Sprint 5: Stock Levels & Availability Ledger",
                UserRole.INVENTORY_MANAGER, 13, "COMPLETED",
                "Implemented quantity-on-hand, quantity-reserved, and available-quantity calculations across all warehouses."
        ));
        sprintEpicLogRepository.save(new SprintEpicLog(
                3, "Real-Time Stock Tracking & Safety Stock", 6, "Sprint 6: Safety Stock & Automated Reorder Engine",
                UserRole.INVENTORY_MANAGER, 8, "COMPLETED",
                "Implemented dynamic reorder point thresholds, low-stock alerts, and out-of-stock notification endpoints."
        ));

        // Epic 4: Stock Movement & Adjustments
        sprintEpicLogRepository.save(new SprintEpicLog(
                4, "Stock Movement, Transfers & Adjustments", 7, "Sprint 7: Inter-Warehouse Stock Transfer Orders",
                UserRole.INVENTORY_MANAGER, 13, "COMPLETED",
                "Built full transfer lifecycle: Request, Source Stock Reservation, In-Transit Dispatch, and Destination GRN Receipt."
        ));
        sprintEpicLogRepository.save(new SprintEpicLog(
                4, "Stock Movement, Transfers & Adjustments", 8, "Sprint 8: Physical Cycle Count Audits & Write-Offs",
                UserRole.WAREHOUSE_STAFF, 8, "COMPLETED",
                "Engineered cycle counting audits, damage/shrinkage reason codes, financial valuation impacts, and immutable audit logs."
        ));

        // Epic 5: Supplier Management
        sprintEpicLogRepository.save(new SprintEpicLog(
                5, "Supplier & Vendor Management", 9, "Sprint 9: Vendor Profiles & Terms",
                UserRole.PURCHASING_OFFICER, 5, "COMPLETED",
                "Built vendor master directory with payment terms (NET_30/45), average lead times, and performance ratings."
        ));
        sprintEpicLogRepository.save(new SprintEpicLog(
                5, "Supplier & Vendor Management", 10, "Sprint 10: Supplier Catalog & Cost Agreements",
                UserRole.PURCHASING_OFFICER, 8, "COMPLETED",
                "Created Supplier-Product pricing matrix with vendor SKUs, negotiated cost prices, and minimum order quantities."
        ));

        // Epic 6: Procurement & Purchase Orders
        sprintEpicLogRepository.save(new SprintEpicLog(
                6, "Procurement & Purchase Orders", 11, "Sprint 11: Purchase Order Generation & Approvals",
                UserRole.PURCHASING_OFFICER, 13, "COMPLETED",
                "Implemented Purchase Order lifecycle: Draft, Approval, Automated Total Calculation, and Vendor Dispatch."
        ));
        sprintEpicLogRepository.save(new SprintEpicLog(
                6, "Procurement & Purchase Orders", 12, "Sprint 12: Goods Received Note (GRN) & Moving Average Costing",
                UserRole.WAREHOUSE_STAFF, 13, "COMPLETED",
                "Engineered warehouse receiving dock GRN flow with incremental stock updates and weighted moving average cost revaluation."
        ));

        // Epic 7: Order Fulfillment
        sprintEpicLogRepository.save(new SprintEpicLog(
                7, "Retail Order Fulfillment", 13, "Sprint 13: Sales Order Ingestion & Real-Time Stock Reservation",
                UserRole.SALES_AGENT, 13, "COMPLETED",
                "Created customer sales order ingestion with atomic multi-item stock reservation preventing overselling."
        ));
        sprintEpicLogRepository.save(new SprintEpicLog(
                7, "Retail Order Fulfillment", 14, "Sprint 14: Pick, Pack, Ship & Delivery Dispatch Lifecycle",
                UserRole.WAREHOUSE_STAFF, 13, "COMPLETED",
                "Built pick lists, packing slip confirmation, courier dispatch with stock deduction, and final delivery status."
        ));

        // Epic 8: Analytics & Audit Dashboard
        sprintEpicLogRepository.save(new SprintEpicLog(
                8, "Analytics, Audits & Executive Dashboard", 15, "Sprint 15: Inventory Valuation & Retail KPI Dashboard",
                UserRole.INVENTORY_MANAGER, 13, "COMPLETED",
                "Built executive dashboard aggregating total stock valuation, warehouse distribution, sales revenue, and procurement spend."
        ));
    }

    private void seedStockLevels(List<Product> products, List<Warehouse> warehouses) {
        Warehouse central = warehouses.get(0);
        Warehouse east = warehouses.get(1);
        Warehouse west = warehouses.get(2);
        Warehouse store = warehouses.get(3);

        // Product 1: Sony Headphones
        createStock(products.get(0), central, 120, 20, 30);
        createStock(products.get(0), east, 45, 10, 20);
        createStock(products.get(0), west, 35, 10, 20);
        createStock(products.get(0), store, 12, 5, 10);

        // Product 2: Apple Watch
        createStock(products.get(1), central, 80, 10, 20);
        createStock(products.get(1), east, 25, 5, 15);
        createStock(products.get(1), west, 30, 5, 15);
        createStock(products.get(1), store, 8, 3, 8); // Low stock alert!

        // Product 3: Samsung OLED TV
        createStock(products.get(2), central, 35, 5, 10);
        createStock(products.get(2), east, 12, 3, 6);
        createStock(products.get(2), west, 15, 3, 6);
        createStock(products.get(2), store, 3, 2, 4); // Low stock alert!

        // Product 4: Nike Shoes
        createStock(products.get(3), central, 200, 30, 50);
        createStock(products.get(3), east, 75, 15, 30);
        createStock(products.get(3), west, 60, 15, 30);
        createStock(products.get(3), store, 22, 10, 20);

        // Product 5: Philips Espresso Machine
        createStock(products.get(4), central, 50, 8, 15);
        createStock(products.get(4), east, 18, 5, 10);
        createStock(products.get(4), west, 16, 5, 10);
        createStock(products.get(4), store, 0, 3, 8); // Out of stock alert!
    }

    private void createStock(Product product, Warehouse warehouse, int qtyOnHand, int minLevel, int reorderPoint) {
        Stock s = new Stock(product, warehouse, qtyOnHand, minLevel, reorderPoint, 500);
        stockRepository.save(s);
    }
}
