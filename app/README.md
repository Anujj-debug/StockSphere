# StockSphere: Retail Inventory Management System
> **Agile Capstone Case Study Backend**  
> Web-based Retail Inventory Management System delivered via Scrum/Agile across **8 Epics and 15 Sprints**.

---

## 📌 Project Overview

**StockSphere** is an enterprise-grade retail inventory management system designed for modern multi-channel retail operations. Built using **Java Spring Boot**, **Spring Data JPA**, **PostgreSQL**, and **Docker**, StockSphere coordinates product catalogs, distributed multi-warehouse inventory levels, supplier procurement lifecycles, and sales order fulfillment.

The project is structured according to **Agile/Scrum principles**, tracking 8 business epics across 15 sprints with role-based responsibilities mapped to standard Scrum and retail operations personnel.

---

## 🛠 Technology Stack

- **Backend Framework**: Java 17+ / Spring Boot
- **Data Persistence**: Spring Data JPA / Hibernate ORM
- **Primary Database**: PostgreSQL (Production & Docker)
- **Dev Database**: H2 In-Memory (Zero-setup instant local execution & testing)
- **API Architecture**: RESTful API with unified JSON error handling and CORS support
- **Containerization**: Docker & Docker Compose (Multi-stage build)
- **Frontend Target**: Angular (CORS pre-configured for `http://localhost:4200`)

---

## 📂 Standard Spring Boot Project Structure

```
c:\Users\ASUS\Anujj\app\
├── Dockerfile                      # Multi-stage Docker container build
├── docker-compose.yml              # PostgreSQL + Spring Boot orchestration
├── pom.xml                         # Maven dependencies & build configuration
├── src/
│   ├── main/
│   │   ├── java/com/retail/app/
│   │   │   ├── AppApplication.java         # Spring Boot Entry Point
│   │   │   │
│   │   │   ├── config/                     # Configuration layer
│   │   │   │   ├── CorsConfig.java         # CORS for Angular integration
│   │   │   │   └── DataInitializer.java    # Realistic Retail Seed Data across 8 Epics
│   │   │   │
│   │   │   ├── controller/                 # REST Controllers
│   │   │   │   ├── AgileCaseStudyController.java # Epics, Sprints & Roles API
│   │   │   │   ├── BrandController.java          # Brand catalog endpoints
│   │   │   │   ├── CategoryController.java       # Category hierarchy endpoints
│   │   │   │   ├── DashboardController.java      # Executive KPI summary endpoints
│   │   │   │   ├── InventoryController.java      # Real-time stock & audit ledger
│   │   │   │   ├── ProductController.java        # Product master & SKU endpoints
│   │   │   │   ├── PurchaseOrderController.java  # Procurement & GRN receiving
│   │   │   │   ├── SalesOrderController.java     # Order fulfillment lifecycle
│   │   │   │   ├── StockAdjustmentController.java# Cycle counts & shrinkage
│   │   │   │   ├── StockTransferController.java  # Inter-warehouse transfers
│   │   │   │   ├── SupplierController.java       # Vendor master & pricing
│   │   │   │   └── UserController.java           # Agile team & retail users
│   │   │   │
│   │   │   ├── dto/                        # Request & Response Data Transfer Objects
│   │   │   │   ├── BrandDTO.java
│   │   │   │   ├── CategoryDTO.java
│   │   │   │   ├── DashboardSummaryDTO.java
│   │   │   │   ├── GoodsReceiptDTO.java
│   │   │   │   ├── ProductDTO.java
│   │   │   │   ├── PurchaseOrderRequestDTO.java
│   │   │   │   ├── PurchaseOrderResponseDTO.java
│   │   │   │   ├── SalesOrderRequestDTO.java
│   │   │   │   ├── SalesOrderResponseDTO.java
│   │   │   │   ├── SprintEpicDTO.java
│   │   │   │   ├── StockAdjustmentRequestDTO.java
│   │   │   │   ├── StockAdjustmentResponseDTO.java
│   │   │   │   ├── StockDTO.java
│   │   │   │   ├── StockTransferRequestDTO.java
│   │   │   │   ├── StockTransferResponseDTO.java
│   │   │   │   ├── SupplierDTO.java
│   │   │   │   └── UserDTO.java
│   │   │   │
│   │   │   ├── entity/                     # JPA Entities
│   │   │   │   ├── Brand.java
│   │   │   │   ├── Category.java
│   │   │   │   ├── InventoryTransaction.java # Immutable stock audit ledger
│   │   │   │   ├── Product.java
│   │   │   │   ├── PurchaseOrder.java
│   │   │   │   ├── PurchaseOrderItem.java
│   │   │   │   ├── SalesOrder.java
│   │   │   │   ├── SalesOrderItem.java
│   │   │   │   ├── SprintEpicLog.java         # Capstone traceability log
│   │   │   │   ├── Stock.java                # Multi-warehouse stock level
│   │   │   │   ├── StockAdjustment.java
│   │   │   │   ├── StockTransfer.java
│   │   │   │   ├── StockTransferItem.java
│   │   │   │   ├── Supplier.java
│   │   │   │   ├── SupplierProduct.java
│   │   │   │   ├── User.java
│   │   │   │   ├── Warehouse.java
│   │   │   │   └── WarehouseLocation.java
│   │   │   │
│   │   │   ├── enums/                      # Business Domain Enums
│   │   │   │   ├── AdjustmentReason.java
│   │   │   │   ├── ProductStatus.java
│   │   │   │   ├── PurchaseOrderStatus.java
│   │   │   │   ├── SalesOrderStatus.java
│   │   │   │   ├── StockTransferStatus.java
│   │   │   │   ├── TransactionType.java
│   │   │   │   ├── UserRole.java
│   │   │   │   └── WarehouseType.java
│   │   │   │
│   │   │   ├── exception/                  # Error Handling Layer
│   │   │   │   ├── BusinessValidationException.java
│   │   │   │   ├── ErrorResponse.java
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   ├── InsufficientStockException.java
│   │   │   │   └── ResourceNotFoundException.java
│   │   │   │
│   │   │   ├── repository/                 # Spring Data JPA Repositories
│   │   │   │   ├── BrandRepository.java
│   │   │   │   ├── CategoryRepository.java
│   │   │   │   ├── InventoryTransactionRepository.java
│   │   │   │   ├── ProductRepository.java
│   │   │   │   ├── PurchaseOrderRepository.java
│   │   │   │   ├── SalesOrderRepository.java
│   │   │   │   ├── SprintEpicLogRepository.java
│   │   │   │   ├── StockAdjustmentRepository.java
│   │   │   │   ├── StockRepository.java
│   │   │   │   ├── StockTransferRepository.java
│   │   │   │   ├── SupplierProductRepository.java
│   │   │   │   ├── SupplierRepository.java
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── WarehouseLocationRepository.java
│   │   │   │   └── WarehouseRepository.java
│   │   │   │
│   │   │   └── service/                    # Business Service Layer
│   │   │       ├── AgileTraceabilityService.java
│   │   │       ├── BrandService.java
│   │   │       ├── CategoryService.java
│   │   │       ├── DashboardAnalyticsService.java
│   │   │       ├── InventoryService.java
│   │   │       ├── ProductService.java
│   │   │       ├── PurchaseOrderService.java
│   │   │       ├── SalesOrderService.java
│   │   │       ├── StockAdjustmentService.java
│   │   │       ├── StockTransferService.java
│   │   │       ├── SupplierService.java
│   │   │       └── UserService.java
│   │   │
│   │   └── resources/
│   │       ├── application.properties           # Default in-memory H2 configuration
│   │       └── application-postgres.properties  # Production PostgreSQL configuration
│   │
│   └── test/java/com/retail/app/           # Unit & Integration Tests
│       ├── AppApplicationTests.java
│       ├── InventoryServiceTest.java
│       ├── ProductServiceTest.java
│       └── SalesOrderServiceTest.java
```

---

## 🚀 Agile Capstone Delivery: 8 Epics & 15 Sprints

| Epic # | Epic Title | Sprint # | Sprint Name | Story Pts | Owner Role | Deliverables |
|:---:|:---|:---:|:---|:---:|:---|:---|
| **Epic 1** | **Product Catalog Management** | Sprint 1 | Category & Brand Hierarchy | 8 | Product Owner | Hierarchical Category entity, Brand entities, CRUD endpoints |
| | | Sprint 2 | Product Master & Pricing | 13 | Product Owner | SKU generation, UPC barcodes, retail pricing, tax rates, auto stock initializers |
| **Epic 2** | **Multi-Warehouse Setup** | Sprint 3 | Facility Topology | 8 | Scrum Master | Central Distribution, Regional Hubs, Retail Backrooms |
| | | Sprint 4 | Bin-Level Storage | 8 | Warehouse Staff | Zone, Aisle, Rack, Shelf, Bin coordinates & barcode tags |
| **Epic 3** | **Real-Time Stock Tracking** | Sprint 5 | Stock Levels & Availability | 13 | Inventory Mgr | On-hand, Reserved, Available stock calculus across warehouses |
| | | Sprint 6 | Automated Safety Reorder Engine | 8 | Inventory Mgr | Safety stock thresholds, low-stock query filters, out-of-stock alerts |
| **Epic 4** | **Stock Movements & Audits** | Sprint 7 | Inter-Warehouse Transfers | 13 | Inventory Mgr | Transfer order lifecycle (Request -> Reserve -> Dispatch -> Receive) |
| | | Sprint 8 | Physical Counts & Write-Offs | 8 | Warehouse Staff | Damage, spoilage, shrinkage adjustments, immutable ledger entries |
| **Epic 5** | **Supplier Management** | Sprint 9 | Vendor Master Directory | 5 | Purchasing Officer | Supplier contact, payment terms (NET_30/45), lead time & ratings |
| | | Sprint 10 | Supplier Catalog & Costing | 8 | Purchasing Officer | Supplier-product pricing matrix, vendor SKUs, minimum order quantities |
| **Epic 6** | **Procurement & POs** | Sprint 11 | Purchase Order Lifecycle | 13 | Purchasing Officer | Multi-item PO generation, line item calculations, approval workflows |
| | | Sprint 12 | Goods Received Note (GRN) | 13 | Warehouse Staff | Receiving dock GRN flow, incremental stock replenishment, moving average costing |
| **Epic 7** | **Order Fulfillment** | Sprint 13 | Order Ingestion & Reservation | 13 | Sales Agent | Atomic multi-item order placement with instant stock reservation |
| | | Sprint 14 | Pick, Pack & Dispatch | 13 | Warehouse Staff | Pick verification, packing slip confirmation, shipping deduction, delivery |
| **Epic 8** | **Analytics & Dashboard** | Sprint 15 | Valuation & KPI Dashboard | 13 | Inventory Mgr | Total inventory valuation, turnover, warehouse breakdown, financial KPIs |

---

## 👥 Agile & Retail Team Roles Matrix

1. **Product Owner (`sarah.po`)**: Owns product catalog vision, pricing policies, and backlog prioritization across all 8 epics.
2. **Scrum Master (`david.sm`)**: Facilitates 15 sprints, sprint planning, velocity tracking, and impediments removal.
3. **Inventory Manager (`marcus.inv`)**: Monitors stock health, authorizes inter-warehouse transfers, reconciles audits, and tracks stock valuation.
4. **Warehouse Staff (`elena.wh`)**: Executes warehouse pick/pack/ship operations, receives purchase orders (GRN), and logs cycle counts.
5. **Purchasing Officer (`alex.proc`)**: Negotiates supplier agreements, monitors vendor lead times, and issues purchase orders.
6. **Sales Agent (`maya.sales`)**: Places customer orders, verifies real-time product availability, and tracks fulfillment dispatch.

---

## 📡 Complete REST API Reference

### 1. Product & Catalog Management
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/products` | List all products (supports `?categoryId=`, `?brandId=`, `?status=`, `?search=`) |
| `GET` | `/api/products/{id}` | Get product details by ID |
| `GET` | `/api/products/sku/{sku}` | Get product details by SKU |
| `POST` | `/api/products` | Create product (auto-initializes stock in all active warehouses) |
| `PUT` | `/api/products/{id}` | Update product information |
| `DELETE`| `/api/products/{id}` | Deactivate / discontinue product |
| `GET` | `/api/categories` | List all product categories |
| `POST` | `/api/categories` | Create category (supports parent-child hierarchy) |
| `GET` | `/api/brands` | List all product brands |
| `POST` | `/api/brands` | Create new brand |

### 2. Multi-Warehouse & Bin Locations
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/warehouses` | List all warehouses (Central, Regional, Retail) |
| `GET` | `/api/warehouses/{id}` | Get warehouse details |
| `POST` | `/api/warehouses` | Create warehouse |
| `GET` | `/api/warehouses/{id}/locations` | List bin locations for warehouse |
| `POST` | `/api/warehouses/{id}/locations` | Add Zone, Aisle, Rack, Shelf, Bin coordinate |

### 3. Inventory & Audit Ledger
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/inventory` | Real-time stock levels across all facilities |
| `GET` | `/api/inventory/warehouse/{warehouseId}` | Stock levels at specific warehouse |
| `GET` | `/api/inventory/product/{productId}` | Stock distribution for a product |
| `GET` | `/api/inventory/stock?warehouseId={w}&productId={p}` | Specific stock record with availability |
| `GET` | `/api/inventory/low-stock` | Items where `availableQty <= reorderPoint` |
| `GET` | `/api/inventory/out-of-stock` | Items with zero stock on hand |
| `GET` | `/api/inventory/transactions` | Full immutable transaction ledger (recent 50) |
| `PUT` | `/api/inventory/thresholds` | Update safety stock & reorder points |

### 4. Inter-Warehouse Stock Transfers
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/transfers` | List transfers (filter by `?status=`) |
| `POST` | `/api/transfers` | Request transfer (validates and reserves source stock) |
| `PUT` | `/api/transfers/{id}/approve` | Manager approves transfer |
| `PUT` | `/api/transfers/{id}/dispatch` | Dispatch items (`TRANSFER_OUT` ledger entry, sets `IN_TRANSIT`) |
| `PUT` | `/api/transfers/{id}/receive` | Destination dock receives items (`TRANSFER_IN` ledger entry) |
| `PUT` | `/api/transfers/{id}/cancel` | Cancel transfer and release reserved stock |

### 5. Stock Adjustments & Physical Audits
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/adjustments` | List all adjustments and audit write-offs |
| `POST` | `/api/adjustments` | Record cycle count, damage, or shrinkage adjustment |

### 6. Suppliers & Procurement (PO & GRN)
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/suppliers` | List all suppliers |
| `POST` | `/api/suppliers` | Add supplier profile |
| `POST` | `/api/suppliers/{id}/products` | Map supplier SKU and agreed cost |
| `GET` | `/api/purchase-orders` | List purchase orders |
| `POST` | `/api/purchase-orders` | Create purchase order (DRAFT) |
| `PUT` | `/api/purchase-orders/{id}/submit` | Submit purchase order to vendor |
| `PUT` | `/api/purchase-orders/{id}/approve` | Approve purchase order |
| `POST` | `/api/purchase-orders/{id}/receive-goods` | **Goods Received Note (GRN)**: receive items, restock warehouse, update moving average unit cost |
| `PUT` | `/api/purchase-orders/{id}/cancel` | Cancel purchase order |

### 7. Sales Order Fulfillment
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/sales-orders` | List sales orders (filter by `?status=`) |
| `POST` | `/api/sales-orders` | Create customer order (reserves inventory atomically) |
| `PUT` | `/api/sales-orders/{id}/allocate` | Allocate inventory |
| `PUT` | `/api/sales-orders/{id}/pick` | Mark order picked in warehouse |
| `PUT` | `/api/sales-orders/{id}/pack` | Mark order packed |
| `PUT` | `/api/sales-orders/{id}/ship` | Ship order (deducts stock, logs `SALES_FULFILLMENT` txn) |
| `PUT` | `/api/sales-orders/{id}/deliver` | Mark order delivered to customer |
| `PUT` | `/api/sales-orders/{id}/cancel` | Cancel order and release reserved stock |

### 8. Analytics & Agile Case Study
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/dashboard/summary` | Executive metrics (total valuation, revenue, spend, alerts) |
| `GET` | `/api/agile/sprints-epics` | Full 8 Epics & 15 Sprints breakdown with story points |
| `GET` | `/api/agile/roles` | Agile team roles and operational responsibilities |
| `GET` | `/api/users` | List agile team members and retail users |

---

## ⚡ How to Run

### Option 1: Instant Quick Start (In-Memory H2 — Zero Setup)
Run directly from your terminal:
```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux / Mac
./mvnw spring-boot:run
```
- Backend runs at: `http://localhost:8080`
- Pre-seeded data will be automatically populated!
- Embedded H2 Console is accessible at: `http://localhost:8080/h2-console`
  - **JDBC URL**: `jdbc:h2:mem:stockspheredb`
  - **Username**: `sa`
  - **Password**: *(leave blank)*

---

### Option 2: Docker Compose (PostgreSQL + Spring Boot Backend)
To run the full stack containerized with PostgreSQL 16:
```bash
docker-compose up --build
```
This automatically boots:
- PostgreSQL on port `5432` with a persistent volume (`stocksphere_db`)
- Spring Boot Backend on port `8080` connected to PostgreSQL

---

### Option 3: Local PostgreSQL (Without Docker)
1. Ensure your PostgreSQL server is running and create the database:
   ```sql
   CREATE DATABASE stocksphere_db;
   ```
2. Start the application with the `postgres` profile:
   ```bash
   .\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=postgres
   ```
   *(Or set environment variables `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`)*

---

## 🧪 Testing

Run all unit and integration tests:
```bash
.\mvnw.cmd test
```
Build executable production JAR:
```bash
.\mvnw.cmd package
```
The output JAR is generated at `target/app-0.0.1-SNAPSHOT.jar`.
