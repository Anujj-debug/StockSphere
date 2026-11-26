const path = require('path');
const fs = require('fs');
const puppeteer = require(path.resolve(__dirname, '..', 'frontend', 'node_modules', 'puppeteer-core'));

const SCREENS = [
  {
    id: '01_dashboard',
    title: 'Executive Dashboard',
    subtitle: 'Multi-facility valuation, inventory KPI cards, throughput metrics, and audit ledger',
    url: 'http://localhost:4200/dashboard'
  },
  {
    id: '02_products_catalog',
    title: 'Products Catalog (Master SKU Inventory)',
    subtitle: 'Master product SKUs, taxonomy tags, safety stock reorder levels, and unit pricing',
    url: 'http://localhost:4200/products',
    tabText: 'Products ('
  },
  {
    id: '03_products_categories',
    title: 'Product Categories & Taxonomy Hierarchy',
    subtitle: 'Hierarchical category classifications, SKU mapping, and department organization',
    url: 'http://localhost:4200/products',
    tabText: 'Categories ('
  },
  {
    id: '04_products_brands',
    title: 'Brand Partners & Manufacturers Directory',
    subtitle: 'Approved manufacturer catalog, brand partners, and SKU portfolio counts',
    url: 'http://localhost:4200/products',
    tabText: 'Brands ('
  },
  {
    id: '05_warehouses_network',
    title: 'Multi-Warehouse Network & Bin Coordinates',
    subtitle: 'Distribution centers, regional hubs, retail backrooms, and zone/shelf bin topology',
    url: 'http://localhost:4200/warehouses'
  },
  {
    id: '06_inventory_stock_matrix',
    title: 'Real-Time Inventory Stock Matrix',
    subtitle: 'Multi-facility on-hand quantities, allocated units, available stock, and safety flags',
    url: 'http://localhost:4200/inventory',
    tabText: 'Stock Matrix ('
  },
  {
    id: '07_inventory_audit_ledger',
    title: 'Immutable Inventory Audit Ledger',
    subtitle: 'Complete chronological audit log of all receipts, transfers, and shrinkage write-offs',
    url: 'http://localhost:4200/inventory',
    tabText: 'Immutable Ledger ('
  },
  {
    id: '08_stock_transfers',
    title: 'Inter-Warehouse Stock Transfers',
    subtitle: 'Hub-to-hub inventory rebalancing workflows, transit authorization, and receipt verification',
    url: 'http://localhost:4200/transfers'
  },
  {
    id: '09_cycle_counts_audits',
    title: 'Cycle Counts & Discrepancy Audits',
    subtitle: 'Physical count reconciliation, shrinkage logging, and variance valuation tracking',
    url: 'http://localhost:4200/adjustments'
  },
  {
    id: '10_procurement_purchase_orders',
    title: 'Procurement & Purchase Orders (PO)',
    subtitle: 'Supplier procurement lifecycle, PO approval workflows, and Goods Receipt Notes (GRN)',
    url: 'http://localhost:4200/procurement',
    tabText: 'Purchase Orders ('
  },
  {
    id: '11_procurement_suppliers',
    title: 'Supplier Management & Costing Matrix',
    subtitle: 'Vendor contact information, lead times, payment terms, and procurement history',
    url: 'http://localhost:4200/procurement',
    tabText: 'Suppliers & Costing Matrix ('
  },
  {
    id: '12_sales_orders',
    title: 'Retail Sales Orders & Order Fulfillment',
    subtitle: 'Multi-channel sales orders, picking & packing verification, and delivery dispatch',
    url: 'http://localhost:4200/sales-orders'
  },
  {
    id: '13_agile_traceability_matrix',
    title: 'Agile Capability & Traceability Matrix',
    subtitle: '8 Business Epics and 15 Development Sprints mapping user stories to implementation',
    url: 'http://localhost:4200/agile',
    tabText: 'Capability Matrix ('
  },
  {
    id: '14_agile_roles_governance',
    title: 'Agile Governance & Role RACI Matrix',
    subtitle: 'Scrum team assignments, retail operations personnel, and operational responsibilities',
    url: 'http://localhost:4200/agile',
    tabText: 'Roles & Responsibilities'
  },
  {
    id: '15_agile_team_directory',
    title: 'Agile Personnel & Team Directory',
    subtitle: 'Active system users, security permissions, department assignments, and contact directory',
    url: 'http://localhost:4200/agile',
    tabText: 'Team Members ('
  }
];

async function captureAll() {
  const outputDir = path.resolve(__dirname, '..', 'screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Starting capture of ${SCREENS.length} project pages and views...`);

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
    defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 2 }
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

  for (let i = 0; i < SCREENS.length; i++) {
    const screen = SCREENS[i];
    console.log(`[${i + 1}/${SCREENS.length}] Capturing: ${screen.title} (${screen.url})...`);

    // Navigate
    await page.goto(screen.url, { waitUntil: 'networkidle0', timeout: 20000 });
    await new Promise(r => setTimeout(r, 1200));

    // If a tab needs to be clicked
    if (screen.tabText) {
      await page.evaluate((text) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent && b.textContent.includes(text));
        if (btn) btn.click();
      }, screen.tabText);
      await new Promise(r => setTimeout(r, 1000));
    }

    // Auto-expand warehouse bin table if on warehouses page
    if (screen.id === '05_warehouses_network') {
      await page.evaluate(() => {
        // click first warehouse card if not selected
        const cards = document.querySelectorAll('.grid > div.cursor-pointer');
        if (cards && cards.length > 0) {
          cards[0].click();
        }
      });
      await new Promise(r => setTimeout(r, 800));
    }

    // Keep uniform 1920x1080 for all pages for consistent landscape aspect ratio
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
    await new Promise(r => setTimeout(r, 400));

    const filename = `${screen.id}.png`;
    const destPath = path.join(outputDir, filename);
    await page.screenshot({ path: destPath });
    console.log(`  -> Saved ${filename} (Viewport: 1920x1080 HD)`);
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

captureAll().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
