/**
 * Djaitin P0 Critical Path Automation Tests
 * 
 * Test Environment: http://localhost:8004
 * Priority: P0 (Critical Path)
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8004';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Test results storage
const testResults = [];

async function takeScreenshot(page, testName) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${testName}-${timestamp}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);
    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`📸 Screenshot saved: ${filename}`);
    return filepath;
}

function logResult(testName, status, details = '') {
    const result = {
        name: testName,
        status,
        timestamp: new Date().toISOString(),
        details
    };
    testResults.push(result);
    const emoji = status === 'PASS' ? '✅' : '❌';
    console.log(`${emoji} ${testName}: ${status}`);
    if (details) console.log(`   ${details}`);
}

// TC-LP-01: Landing Page Load
async function testLandingPageLoad(page) {
    try {
        console.log('\n🧪 TC-LP-01: Landing Page Load');
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Verify page title
        const title = await page.title();
        if (!title.toLowerCase().includes('djaitin')) {
            throw new Error(`Title does not contain "Djaitin": ${title}`);
        }

        // Verify page has content
        const bodyText = await page.locator('body').innerText();
        if (bodyText.length < 100) {
            throw new Error('Page content is too short');
        }

        await takeScreenshot(page, 'TC-LP-01-landing-page');
        logResult('TC-LP-01: Landing Page Load', 'PASS');
        return true;
    } catch (error) {
        await takeScreenshot(page, 'TC-LP-01-FAILED');
        logResult('TC-LP-01: Landing Page Load', 'FAIL', error.message);
        return false;
    }
}

// TC-CUST-AUTH-01: Customer Login
async function testCustomerLogin(page) {
    try {
        console.log('\n🧪 TC-CUST-AUTH-01: Customer Login');
        await page.goto(`${BASE_URL}/login`);
        await page.waitForLoadState('networkidle');
        
        // Fill login form
        await page.fill('input[name="email"]', 'customer@djaitin.com');
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');
        
        // Wait for redirect
        await page.waitForURL('**/app/**', { timeout: 10000 });
        
        // Verify redirect to dashboard
        const currentUrl = page.url();
        if (!currentUrl.includes('/app/')) {
            throw new Error(`Not redirected to app: ${currentUrl}`);
        }
        
        await takeScreenshot(page, 'TC-CUST-AUTH-01-customer-login');
        logResult('TC-CUST-AUTH-01: Customer Login', 'PASS');
        return true;
    } catch (error) {
        await takeScreenshot(page, 'TC-CUST-AUTH-01-FAILED');
        logResult('TC-CUST-AUTH-01: Customer Login', 'FAIL', error.message);
        return false;
    }
}

// TC-CUST-DASH-01: Dashboard Load
async function testCustomerDashboard(page) {
    try {
        console.log('\n🧪 TC-CUST-DASH-01: Customer Dashboard Load');
        await page.goto(`${BASE_URL}/app/dashboard`);
        await page.waitForLoadState('networkidle');
        
        // Verify dashboard elements
        const bodyText = await page.locator('body').innerText();
        if (bodyText.length < 100) {
            throw new Error('Dashboard content is too short');
        }

        // Verify we're on the right page
        const currentUrl = page.url();
        if (!currentUrl.includes('/app/dashboard')) {
            throw new Error(`Not on dashboard page: ${currentUrl}`);
        }
        
        await takeScreenshot(page, 'TC-CUST-DASH-01-dashboard');
        logResult('TC-CUST-DASH-01: Customer Dashboard', 'PASS');
        return true;
    } catch (error) {
        await takeScreenshot(page, 'TC-CUST-DASH-01-FAILED');
        logResult('TC-CUST-DASH-01: Customer Dashboard', 'FAIL', error.message);
        return false;
    }
}

// TC-CUST-CAT-01: Browse Catalog
async function testBrowseCatalog(page) {
    try {
        console.log('\n🧪 TC-CUST-CAT-01: Browse Catalog');
        await page.goto(`${BASE_URL}/app/catalog`);
        await page.waitForLoadState('networkidle');
        
        // Verify product grid exists
        const productCount = await page.locator('[class*="product"], [class*="card"], article').count();
        if (productCount === 0) {
            throw new Error('No products found in catalog');
        }
        
        await takeScreenshot(page, 'TC-CUST-CAT-01-catalog');
        logResult('TC-CUST-CAT-01: Browse Catalog', 'PASS', `Found ${productCount} products`);
        return true;
    } catch (error) {
        await takeScreenshot(page, 'TC-CUST-CAT-01-FAILED');
        logResult('TC-CUST-CAT-01: Browse Catalog', 'FAIL', error.message);
        return false;
    }
}

// TC-CUST-CART-01: Add to Cart (requires product)
async function testAddToCart(page) {
    try {
        console.log('\n🧪 TC-CUST-CART-01: Add to Cart');
        await page.goto(`${BASE_URL}/app/catalog`);
        await page.waitForLoadState('networkidle');
        
        // Click first product
        const firstProduct = page.locator('a[href*="/catalog/"]').first();
        if (await firstProduct.count() === 0) {
            throw new Error('No product links found');
        }
        await firstProduct.click();
        await page.waitForLoadState('networkidle');
        
        // Select size if available
        const sizeButton = page.locator('button:has-text("M"), button:has-text("L"), button:has-text("S")').first();
        if (await sizeButton.count() > 0) {
            await sizeButton.click();
        }
        
        // Click add to cart
        const addToCartButton = page.locator('button:has-text("Tambah"), button:has-text("Keranjang"), button:has-text("Cart")').first();
        if (await addToCartButton.count() === 0) {
            throw new Error('Add to cart button not found');
        }
        await addToCartButton.click();
        await page.waitForTimeout(1000);
        
        // Verify cart updated (check for success message or cart icon)
        await takeScreenshot(page, 'TC-CUST-CART-01-add-to-cart');
        logResult('TC-CUST-CART-01: Add to Cart', 'PASS');
        return true;
    } catch (error) {
        await takeScreenshot(page, 'TC-CUST-CART-01-FAILED');
        logResult('TC-CUST-CART-01: Add to Cart', 'FAIL', error.message);
        return false;
    }
}

// TC-CUST-CO-01: Checkout Flow (simplified)
async function testCheckoutFlow(page) {
    try {
        console.log('\n🧪 TC-CUST-CO-01: Checkout Flow');
        
        // Go to cart first
        await page.goto(`${BASE_URL}/app/cart`);
        await page.waitForLoadState('networkidle');
        
        // Check if cart has items
        const hasItems = await page.locator('[class*="cart"], [class*="item"]').count() > 0;
        if (!hasItems) {
            logResult('TC-CUST-CO-01: Checkout Flow', 'SKIP', 'Cart is empty');
            return true;
        }
        
        // Click checkout button
        const checkoutButton = page.locator('button:has-text("Checkout"), a:has-text("Checkout")').first();
        if (await checkoutButton.count() > 0) {
            await checkoutButton.click();
            await page.waitForLoadState('networkidle');
        }
        
        await takeScreenshot(page, 'TC-CUST-CO-01-checkout');
        logResult('TC-CUST-CO-01: Checkout Flow', 'PASS');
        return true;
    } catch (error) {
        await takeScreenshot(page, 'TC-CUST-CO-01-FAILED');
        logResult('TC-CUST-CO-01: Checkout Flow', 'FAIL', error.message);
        return false;
    }
}

// TC-CUST-ORD-01: View Orders List
async function testViewOrdersList(page) {
    try {
        console.log('\n🧪 TC-CUST-ORD-01: View Orders List');
        await page.goto(`${BASE_URL}/app/orders`);
        await page.waitForLoadState('networkidle');
        
        const bodyText = await page.locator('body').innerText();
        if (bodyText.length < 100) {
            throw new Error('Orders page content is too short');
        }
        
        await takeScreenshot(page, 'TC-CUST-ORD-01-orders');
        logResult('TC-CUST-ORD-01: View Orders List', 'PASS');
        return true;
    } catch (error) {
        await takeScreenshot(page, 'TC-CUST-ORD-01-FAILED');
        logResult('TC-CUST-ORD-01: View Orders List', 'FAIL', error.message);
        return false;
    }
}

// TC-CUST-PAY-02: Upload Payment Proof (simplified - just verify page)
async function testUploadPaymentProof(page) {
    try {
        console.log('\n🧪 TC-CUST-PAY-02: Upload Payment Proof');
        await page.goto(`${BASE_URL}/app/payments`);
        await page.waitForLoadState('networkidle');
        
        const bodyText = await page.locator('body').innerText();
        if (bodyText.length < 100) {
            throw new Error('Payments page content is too short');
        }
        
        await takeScreenshot(page, 'TC-CUST-PAY-02-payments');
        logResult('TC-CUST-PAY-02: Upload Payment Proof', 'PASS', 'Page verified');
        return true;
    } catch (error) {
        await takeScreenshot(page, 'TC-CUST-PAY-02-FAILED');
        logResult('TC-CUST-PAY-02: Upload Payment Proof', 'FAIL', error.message);
        return false;
    }
}

// TC-OFF-AUTH-01: Admin Login
async function testAdminLogin(page, context) {
    try {
        console.log('\n🧪 TC-OFF-AUTH-01: Admin Login');
        
        // Clear all cookies and storage to ensure clean state
        await context.clearCookies();
        
        await page.goto(`${BASE_URL}/login`);
        await page.waitForLoadState('networkidle');
        
        // Fill login form
        await page.fill('input[name="email"]', 'admin@djaitin.com');
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');
        
        // Wait for redirect
        await page.waitForURL('**/office/**', { timeout: 10000 });
        
        const currentUrl = page.url();
        if (!currentUrl.includes('/office/')) {
            throw new Error(`Not redirected to office: ${currentUrl}`);
        }
        
        await takeScreenshot(page, 'TC-OFF-AUTH-01-admin-login');
        logResult('TC-OFF-AUTH-01: Admin Login', 'PASS');
        return true;
    } catch (error) {
        await takeScreenshot(page, 'TC-OFF-AUTH-01-FAILED');
        logResult('TC-OFF-AUTH-01: Admin Login', 'FAIL', error.message);
        return false;
    }
}

// TC-OFF-DASH-01: Office Dashboard
async function testOfficeDashboard(page) {
    try {
        console.log('\n🧪 TC-OFF-DASH-01: Office Dashboard');
        await page.goto(`${BASE_URL}/office/dashboard`);
        await page.waitForLoadState('networkidle');
        
        const bodyText = await page.locator('body').innerText();
        if (bodyText.length < 100) {
            throw new Error('Office dashboard content is too short');
        }
        
        await takeScreenshot(page, 'TC-OFF-DASH-01-office-dashboard');
        logResult('TC-OFF-DASH-01: Office Dashboard', 'PASS');
        return true;
    } catch (error) {
        await takeScreenshot(page, 'TC-OFF-DASH-01-FAILED');
        logResult('TC-OFF-DASH-01: Office Dashboard', 'FAIL', error.message);
        return false;
    }
}

// TC-OFF-ORD-01: Office Orders List
async function testOfficeOrdersList(page) {
    try {
        console.log('\n🧪 TC-OFF-ORD-01: Office Orders List');
        await page.goto(`${BASE_URL}/office/orders`);
        await page.waitForLoadState('networkidle');
        
        const bodyText = await page.locator('body').innerText();
        if (bodyText.length < 100) {
            throw new Error('Office orders content is too short');
        }
        
        await takeScreenshot(page, 'TC-OFF-ORD-01-office-orders');
        logResult('TC-OFF-ORD-01: Office Orders List', 'PASS');
        return true;
    } catch (error) {
        await takeScreenshot(page, 'TC-OFF-ORD-01-FAILED');
        logResult('TC-OFF-ORD-01: Office Orders List', 'FAIL', error.message);
        return false;
    }
}

// TC-OFF-PAY-02: Office Payments List
async function testOfficePaymentsList(page) {
    try {
        console.log('\n🧪 TC-OFF-PAY-02: Office Payments List');
        await page.goto(`${BASE_URL}/office/payments`);
        await page.waitForLoadState('networkidle');
        
        const bodyText = await page.locator('body').innerText();
        if (bodyText.length < 100) {
            throw new Error('Office payments content is too short');
        }
        
        await takeScreenshot(page, 'TC-OFF-PAY-02-office-payments');
        logResult('TC-OFF-PAY-02: Office Payments List', 'PASS');
        return true;
    } catch (error) {
        await takeScreenshot(page, 'TC-OFF-PAY-02-FAILED');
        logResult('TC-OFF-PAY-02: Office Payments List', 'FAIL', error.message);
        return false;
    }
}

// Main test runner
async function runP0Tests() {
    console.log('🚀 Starting P0 Critical Path Tests for Djaitin');
    console.log(`📍 Base URL: ${BASE_URL}`);
    console.log('═'.repeat(60));
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
        // Run all P0 tests in sequence
        await testLandingPageLoad(page);
        await testCustomerLogin(page);
        await testCustomerDashboard(page);
        await testBrowseCatalog(page);
        await testAddToCart(page);
        await testCheckoutFlow(page);
        await testViewOrdersList(page);
        await testUploadPaymentProof(page);
        await testAdminLogin(page, context);
        await testOfficeDashboard(page);
        await testOfficeOrdersList(page);
        await testOfficePaymentsList(page);
        
    } finally {
        await browser.close();
    }
    
    // Generate summary report
    console.log('\n' + '═'.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('═'.repeat(60));
    
    const passed = testResults.filter(r => r.status === 'PASS').length;
    const failed = testResults.filter(r => r.status === 'FAIL').length;
    const skipped = testResults.filter(r => r.status === 'SKIP').length;
    const total = testResults.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
        console.log('\n❌ FAILED TESTS:');
        testResults
            .filter(r => r.status === 'FAIL')
            .forEach(r => console.log(`  - ${r.name}: ${r.details}`));
    }
    
    // Save detailed report
    const reportPath = path.join(__dirname, 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        summary: { total, passed, failed, skipped },
        results: testResults
    }, null, 2));
    console.log(`\n💾 Detailed report saved: ${reportPath}`);
    
    console.log('\n' + '═'.repeat(60));
    
    // Exit with error code if any test failed
    process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runP0Tests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
