/**
 * Artillery Load Test Runner
 *
 * This script provides a wrapper around Artillery to run load tests
 * with TypeScript support.
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Configure tests to run
// const loadTests = ['health-api.yml', 'currency-convert-api.yml'];
const loadTests = ['currency-convert-api.yml'];

// Check if we should generate a report
const shouldGenerateReport = process.argv.includes('--report');

// Directory of load test scenarios
const scenariosDir = path.join(__dirname, 'scenarios');

// Create reports directory if it doesn't exist
const reportsDir = path.join(__dirname, 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir);
}

/**
 * Run an Artillery load test
 */
async function runLoadTest(testFile: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const testPath = path.join(scenariosDir, testFile);

    // Ensure the test file exists
    if (!fs.existsSync(testPath)) {
      console.error(`Error: Test file not found: ${testPath}`);
      return reject(new Error(`Test file not found: ${testPath}`));
    }

    // Build Artillery command
    const args = ['run', testPath];

    // Add report output if needed
    const reportFileName = testFile.replace('.yml', '.json');
    const reportPath = path.join(reportsDir, reportFileName);

    if (shouldGenerateReport) {
      args.push('--output', reportPath);
    }

    console.info(`Running load test: ${testFile}`);

    // Run Artillery
    const artillery = spawn('artillery', args, {
      stdio: 'inherit',
      shell: true,
    });

    artillery.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Artillery exited with code ${code}`));
      }

      // Generate HTML report if needed
      if (shouldGenerateReport) {
        console.info(`Generating HTML report for ${testFile}`);
        const reportGenerate = spawn('artillery', ['report', reportPath], {
          stdio: 'inherit',
          shell: true,
        });

        reportGenerate.on('close', (reportCode) => {
          if (reportCode !== 0) {
            return reject(new Error(`Artillery report generation exited with code ${reportCode}`));
          }

          console.info(`Load test completed for ${testFile}`);
          resolve();
        });
      } else {
        console.info(`Load test completed for ${testFile}`);
        resolve();
      }
    });
  });
}

/**
 * Run all load tests
 */
async function runAllTests(): Promise<void> {
  console.info('Starting Artillery load tests...');

  for (const test of loadTests) {
    try {
      await runLoadTest(test);
    } catch (error) {
      console.error(`Error running test ${test}:`, error);
      process.exit(1);
    }
  }

  console.info('All load tests completed successfully');
}

// Run all tests
runAllTests().catch((error) => {
  console.error('Error running load tests:', error);
  process.exit(1);
});
