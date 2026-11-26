import os
import sys
from PIL import Image
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCREENSHOTS_DIR = os.path.join(PROJECT_ROOT, "screenshots")
OUTPUT_PDF = os.path.join(PROJECT_ROOT, "StockSphere_Application_Pages.pdf")

PAGES_META = [
    {
        "filename": "01_dashboard.png",
        "title": "01. Executive Dashboard",
        "subtitle": "Multi-facility inventory valuation, throughput analytics, and operational metrics",
        "route": "http://localhost:4200/dashboard",
        "category": "Epic 1 • Real-Time Telemetry"
    },
    {
        "filename": "02_products_catalog.png",
        "title": "02. Product Catalog & Master SKU Inventory",
        "subtitle": "Master product SKUs, taxonomy tags, safety stock reorder levels, and unit pricing",
        "route": "http://localhost:4200/products (Tab: Products)",
        "category": "Epic 2 • Product Master"
    },
    {
        "filename": "03_products_categories.png",
        "title": "03. Product Categories & Taxonomy Hierarchy",
        "subtitle": "Hierarchical category classifications, SKU mapping, and department organization",
        "route": "http://localhost:4200/products (Tab: Categories)",
        "category": "Epic 2 • Taxonomy & Tree"
    },
    {
        "filename": "04_products_brands.png",
        "title": "04. Brand Partners & Manufacturers Directory",
        "subtitle": "Approved manufacturer catalog, brand partners, and SKU portfolio counts",
        "route": "http://localhost:4200/products (Tab: Brands)",
        "category": "Epic 2 • Brands & Vendors"
    },
    {
        "filename": "05_warehouses_network.png",
        "title": "05. Multi-Warehouse Network & Bin Coordinates",
        "subtitle": "Distribution centers, regional hubs, retail backrooms, and zone/shelf bin topology",
        "route": "http://localhost:4200/warehouses",
        "category": "Epic 3 • Warehouse Network"
    },
    {
        "filename": "06_inventory_stock_matrix.png",
        "title": "06. Real-Time Inventory Stock Levels Matrix",
        "subtitle": "Multi-facility on-hand quantities, allocated units, available stock, and safety flags",
        "route": "http://localhost:4200/inventory (Tab: Stock Matrix)",
        "category": "Epic 4 • Stock Ledger"
    },
    {
        "filename": "07_inventory_audit_ledger.png",
        "title": "07. Immutable Inventory Audit Ledger",
        "subtitle": "Complete chronological audit log of all receipts, transfers, and shrinkage write-offs",
        "route": "http://localhost:4200/inventory (Tab: Immutable Ledger)",
        "category": "Epic 4 • Audit & Compliance"
    },
    {
        "filename": "08_stock_transfers.png",
        "title": "08. Inter-Warehouse Stock Transfers",
        "subtitle": "Hub-to-hub inventory rebalancing workflows, transit authorization, and receipt verification",
        "route": "http://localhost:4200/transfers",
        "category": "Epic 5 • Logistics & Transfers"
    },
    {
        "filename": "09_cycle_counts_audits.png",
        "title": "09. Physical Cycle Counts & Discrepancy Audits",
        "subtitle": "Physical count reconciliation, shrinkage logging, and variance valuation tracking",
        "route": "http://localhost:4200/adjustments",
        "category": "Epic 6 • Cycle Counts"
    },
    {
        "filename": "10_procurement_purchase_orders.png",
        "title": "10. Procurement & Purchase Orders (PO)",
        "subtitle": "Supplier procurement lifecycle, PO approval workflows, and Goods Receipt Notes (GRN)",
        "route": "http://localhost:4200/procurement (Tab: Purchase Orders)",
        "category": "Epic 7 • Procurement"
    },
    {
        "filename": "11_procurement_suppliers.png",
        "title": "11. Supplier Management & Costing Matrix",
        "subtitle": "Vendor contact information, lead times, payment terms, and procurement history",
        "route": "http://localhost:4200/procurement (Tab: Suppliers)",
        "category": "Epic 7 • Vendor Directory"
    },
    {
        "filename": "12_sales_orders.png",
        "title": "12. Retail Sales Orders & Order Fulfillment",
        "subtitle": "Multi-channel sales orders, picking & packing verification, and delivery dispatch",
        "route": "http://localhost:4200/sales-orders",
        "category": "Epic 8 • Order Fulfillment"
    },
    {
        "filename": "13_agile_traceability_matrix.png",
        "title": "13. Agile Capability & Traceability Matrix",
        "subtitle": "8 Business Epics and 15 Development Sprints mapping user stories to implementation",
        "route": "http://localhost:4200/agile (Tab: Capability Matrix)",
        "category": "Agile Governance • 15 Sprints"
    },
    {
        "filename": "14_agile_roles_governance.png",
        "title": "14. Agile Governance & Role RACI Matrix",
        "subtitle": "Scrum team assignments, retail operations personnel, and operational responsibilities",
        "route": "http://localhost:4200/agile (Tab: Roles & Responsibilities)",
        "category": "Agile Governance • RACI"
    },
    {
        "filename": "15_agile_team_directory.png",
        "title": "15. Agile Personnel & Team Directory",
        "subtitle": "Active system users, security permissions, department assignments, and contact directory",
        "route": "http://localhost:4200/agile (Tab: Team Members)",
        "category": "Agile Governance • Directory"
    }
]

def build_pdf():
    print(f"Building high-definition PDF deliverable: {OUTPUT_PDF}")
    page_w, page_h = landscape(A4) # 841.89 x 595.27
    c = canvas.Canvas(OUTPUT_PDF, pagesize=(page_w, page_h))
    c.setTitle("StockSphere - Retail Inventory Management System Pages")
    c.setAuthor("StockSphere Project Team")
    c.setSubject("Visual Project Page Documentation - All 15 System Views")

    total_pages = len(PAGES_META)

    for idx, meta in enumerate(PAGES_META):
        img_path = os.path.join(SCREENSHOTS_DIR, meta["filename"])
        if not os.path.exists(img_path):
            print(f"Warning: Screenshot file not found: {img_path}")
            continue

        page_num = idx + 1
        print(f"Rendering PDF Page [{page_num}/{total_pages}]: {meta['title']}...")

        # 1. Background Fill (Subtle off-white slate)
        c.setFillColor(colors.HexColor("#F8FAFC"))
        c.rect(0, 0, page_w, page_h, fill=1, stroke=0)

        # 2. Header Bar Area (white card header)
        c.setFillColor(colors.HexColor("#FFFFFF"))
        c.rect(0, page_h - 62, page_w, 62, fill=1, stroke=0)

        # Top border accent line (Deep Slate)
        c.setFillColor(colors.HexColor("#0F172A"))
        c.rect(0, page_h - 3, page_w, 3, fill=1, stroke=0)

        # Bottom header line
        c.setStrokeColor(colors.HexColor("#E2E8F0"))
        c.setLineWidth(1)
        c.line(0, page_h - 62, page_w, page_h - 62)

        # Header Badge: "StockSphere"
        badge_x = 24
        badge_y = page_h - 44
        c.setFillColor(colors.HexColor("#0F172A"))
        c.roundRect(badge_x, badge_y, 76, 20, 4, fill=1, stroke=0)
        c.setFillColor(colors.HexColor("#FFFFFF"))
        c.setFont("Helvetica-Bold", 8.5)
        c.drawCentredString(badge_x + 38, badge_y + 6, "StockSphere")

        # Category Tag Badge
        cat_badge_x = badge_x + 84
        c.setFillColor(colors.HexColor("#EEF2F6"))
        c.setStrokeColor(colors.HexColor("#CBD5E1"))
        c.setLineWidth(0.8)
        c.roundRect(cat_badge_x, badge_y, 115, 20, 4, fill=1, stroke=1)
        c.setFillColor(colors.HexColor("#334155"))
        c.setFont("Helvetica-Bold", 7.5)
        c.drawCentredString(cat_badge_x + 57.5, badge_y + 6, meta["category"])

        # Page Title
        c.setFillColor(colors.HexColor("#0F172A"))
        c.setFont("Helvetica-Bold", 12.5)
        c.drawString(cat_badge_x + 125, badge_y + 6, meta["title"])

        # Subtitle
        c.setFillColor(colors.HexColor("#64748B"))
        c.setFont("Helvetica", 7.5)
        c.drawString(badge_x, page_h - 56, meta["subtitle"])

        # URL Route Badge (Right side)
        route_text = meta["route"]
        c.setFont("Helvetica", 7.5)
        route_w = c.stringWidth(route_text, "Helvetica", 7.5) + 16
        route_x = page_w - 24 - route_w
        c.setFillColor(colors.HexColor("#F1F5F9"))
        c.setStrokeColor(colors.HexColor("#CBD5E1"))
        c.roundRect(route_x, badge_y, route_w, 20, 4, fill=1, stroke=1)
        c.setFillColor(colors.HexColor("#2563EB"))
        c.drawString(route_x + 8, badge_y + 6, route_text)

        # 3. Main Screenshot Placement
        # Calculate bounding box
        margin_x = 24
        bottom_limit = 32
        top_limit = page_h - 68
        avail_w = page_w - (2 * margin_x) # 841.89 - 48 = 793.89
        avail_h = top_limit - bottom_limit # (595.27 - 68) - 32 = 495.27

        # Open image to get natural aspect ratio
        img = Image.open(img_path)
        img_w, img_h = img.size
        img_aspect = img_w / float(img_h)

        # Fit within avail_w and avail_h
        target_w = avail_w
        target_h = target_w / img_aspect

        if target_h > avail_h:
            target_h = avail_h
            target_w = target_h * img_aspect

        # Center horizontally and vertically within available area
        img_x = margin_x + (avail_w - target_w) / 2.0
        img_y = bottom_limit + (avail_h - target_h) / 2.0

        # Subtle card shadow / border frame behind screenshot
        c.setFillColor(colors.HexColor("#E2E8F0"))
        c.roundRect(img_x - 1.5, img_y - 1.5, target_w + 3, target_h + 3, 3, fill=1, stroke=0)
        c.setFillColor(colors.HexColor("#CBD5E1"))
        c.roundRect(img_x - 0.75, img_y - 0.75, target_w + 1.5, target_h + 1.5, 2, fill=1, stroke=0)

        # Draw the image
        c.drawImage(img_path, img_x, img_y, width=target_w, height=target_h, preserveAspectRatio=True)

        # 4. Footer Bar
        c.setStrokeColor(colors.HexColor("#E2E8F0"))
        c.setLineWidth(1)
        c.line(margin_x, 24, page_w - margin_x, 24)

        c.setFillColor(colors.HexColor("#64748B"))
        c.setFont("Helvetica", 7.5)
        c.drawString(margin_x, 12, "StockSphere — Enterprise Retail Inventory Management System • Agile Deliverables")

        c.setFillColor(colors.HexColor("#94A3B8"))
        c.drawCentredString(page_w / 2.0, 12, "Live System Architecture • Zero-Friction Instant Startup")

        c.setFillColor(colors.HexColor("#0F172A"))
        c.setFont("Helvetica-Bold", 8)
        page_str = f"Page {page_num} of {total_pages}"
        c.drawRightString(page_w - margin_x, 12, page_str)

        c.showPage()

    c.save()
    file_size_mb = os.path.getsize(OUTPUT_PDF) / (1024 * 1024)
    print(f"SUCCESS: Generated {OUTPUT_PDF} ({file_size_mb:.2f} MB, {total_pages} Pages)")

if __name__ == "__main__":
    build_pdf()
