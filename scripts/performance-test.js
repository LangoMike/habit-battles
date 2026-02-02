const puppeteer = require('puppeteer');
const fs = require('fs');

class PerformanceTestRunner {
  constructor() {
    this.results = [];
    this.browser = null;
    this.pages = [];
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for CI/CD
      defaultViewport: { width: 1280, height: 720 }
    });
  }

  async createTestPage() {
    const page = await this.browser.newPage();
    
    // Enable performance monitoring
    await page.setCacheEnabled(false);
    
    // Listen for console messages from the performance tracker
    page.on('console', msg => {
      if (msg.text().includes('Performance:')) {
        console.log('Performance metric:', msg.text());
      }
    });

    return page;
  }

  async loginUser(page, email, password) {
    await page.goto('http://localhost:3000/login');
    
    // Wait for login form
    await page.waitForSelector('input[type="email"]');
    
    // Fill login form
    await page.type('input[type="email"]', email);
    await page.type('input[type="password"]', password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard');
  }

  async measureCheckInPerformance(page, habitName) {
    // Navigate to habits page
    await page.goto('http://localhost:3000/habits');
    await page.waitForSelector('button:has-text("Check in")');
    
    // Find the habit and click check in
    const checkInButton = await page.$(`xpath=//div[contains(text(), "${habitName}")]/..//button[contains(text(), "Check in")]`);
    
    if (!checkInButton) {
      throw new Error(`Habit "${habitName}" not found`);
    }

    // Start performance measurement
    const startTime = Date.now();
    
    // Click check in
    await checkInButton.click();
    
    // Wait for UI update (check mark appears)
    await page.waitForSelector('text= Today', { timeout: 5000 });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    return duration;
  }

  async runPerformanceTest(testConfig) {
    console.log(`Starting performance test: ${testConfig.name}`);
    
    const page = await this.createTestPage();
    this.pages.push(page);
    
    try {
      // Login
      await this.loginUser(page, testConfig.email, testConfig.password);
      
      // Measure multiple check-ins
      const measurements = [];
      for (let i = 0; i < testConfig.iterations; i++) {
        console.log(`  Iteration ${i + 1}/${testConfig.iterations}`);
        
        const duration = await this.measureCheckInPerformance(page, testConfig.habitName);
        measurements.push(duration);
        
        // Wait a bit between measurements
        await page.waitForTimeout(1000);
      }
      
      // Calculate metrics
      const sorted = measurements.sort((a, b) => a - b);
      const median = sorted[Math.floor(measurements.length / 2)];
      const p95 = sorted[Math.floor(measurements.length * 0.95)];
      const mean = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      
      const result = {
        testName: testConfig.name,
        measurements,
        median,
        p95,
        mean,
        min: Math.min(...measurements),
        max: Math.max(...measurements),
        count: measurements.length
      };
      
      this.results.push(result);
      
      console.log(`   Test completed:`);
      console.log(`     Median: ${median}ms`);
      console.log(`     P95: ${p95}ms`);
      console.log(`     Mean: ${mean.toFixed(1)}ms`);
      
    } catch (error) {
      console.error(`   Test failed: ${error.message}`);
    }
  }

  async runAllTests() {
    const testConfigs = [
      {
        name: "Single User - 10 Check-ins",
        email: "testuser1@example.com",
        password: "password123",
        habitName: "Exercise",
        iterations: 10
      },
      {
        name: "Single User - 20 Check-ins",
        email: "testuser1@example.com", 
        password: "password123",
        habitName: "Exercise",
        iterations: 20
      },
      {
        name: "Concurrent Users - 5 each",
        email: "testuser2@example.com",
        password: "password123", 
        habitName: "Reading",
        iterations: 5
      }
    ];

    for (const config of testConfigs) {
      await this.runPerformanceTest(config);
    }
  }

  generateReport() {
    console.log('\n PERFORMANCE TEST REPORT');
    console.log('=' .repeat(50));
    
    this.results.forEach(result => {
      console.log(`\n${result.testName}:`);
      console.log(`  Measurements: ${result.count}`);
      console.log(`  Median: ${result.median}ms ${result.median < 220 ? '' : ''} (target: <220ms)`);
      console.log(`  P95: ${result.p95}ms ${result.p95 < 1000 ? '' : ''} (target: <1000ms)`);
      console.log(`  Mean: ${result.mean.toFixed(1)}ms`);
      console.log(`  Range: ${result.min}ms - ${result.max}ms`);
    });
    
    // Overall summary
    const allMeasurements = this.results.flatMap(r => r.measurements);
    const overallMedian = allMeasurements.sort((a, b) => a - b)[Math.floor(allMeasurements.length / 2)];
    const overallP95 = allMeasurements.sort((a, b) => a - b)[Math.floor(allMeasurements.length * 0.95)];
    
    console.log('\n OVERALL SUMMARY:');
    console.log(`  Total Measurements: ${allMeasurements.length}`);
    console.log(`  Overall Median: ${overallMedian}ms ${overallMedian < 220 ? '' : ''}`);
    console.log(`  Overall P95: ${overallP95}ms ${overallP95 < 1000 ? '' : ''}`);
    
    // Save detailed results
    const reportData = {
      timestamp: new Date().toISOString(),
      results: this.results,
      overall: {
        totalMeasurements: allMeasurements.length,
        median: overallMedian,
        p95: overallP95
      }
    };
    
    fs.writeFileSync('performance-test-results.json', JSON.stringify(reportData, null, 2));
    console.log('\n Detailed results saved to: performance-test-results.json');
  }

  async cleanup() {
    for (const page of this.pages) {
      await page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }
}

async function main() {
  const runner = new PerformanceTestRunner();
  
  try {
    await runner.initialize();
    await runner.runAllTests();
    runner.generateReport();
  } catch (error) {
    console.error('Test execution failed:', error);
  } finally {
    await runner.cleanup();
  }
}

if (require.main === module) {
  main();
}

module.exports = PerformanceTestRunner;
