import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

/**
 * Extract public class name from Java code or fallback to 'Main'
 */
function extractClassName(code) {
  const match = code.match(/public\s+class\s+([A-Za-z0-9_$]+)/);
  if (match && match[1]) {
    return match[1];
  }
  // Check non-public class
  const matchAny = code.match(/class\s+([A-Za-z0-9_$]+)/);
  if (matchAny && matchAny[1]) {
    return matchAny[1];
  }
  return 'Main';
}

/**
 * Normalize code: if code doesn't contain a public class or main method wrapper,
 * check if we need to adjust class names or structure.
 */
function prepareJavaCode(code) {
  let className = extractClassName(code);
  return { code, className };
}

/**
 * Normalize string output for comparison (handles Windows \r\n and trailing spaces)
 */
function normalizeOutput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trimEnd();
}

/**
 * Execute a single test case
 */
function runSingleCase(tempDir, className, input, timeoutMs = 4000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';
    let isTimedOut = false;

    // Run java process with limits
    const runProcess = spawn('java', ['-cp', tempDir, '-Xmx256m', className]);

    const timer = setTimeout(() => {
      isTimedOut = true;
      runProcess.kill('SIGKILL');
      resolve({
        success: false,
        status: 'Time Limit Exceeded',
        stdout: stdout,
        error: 'Time Limit Exceeded (Execution exceeded ' + (timeoutMs / 1000) + 's)',
        executionTimeMs: timeoutMs
      });
    }, timeoutMs);

    if (input !== undefined && input !== null) {
      try {
        runProcess.stdin.write(String(input));
        if (!String(input).endsWith('\n')) {
          runProcess.stdin.write('\n');
        }
      } catch (err) {
        // ignore stdin write error if already closed
      }
    }
    runProcess.stdin.end();

    runProcess.stdout.on('data', (data) => {
      stdout += data.toString();
      if (stdout.length > 500000) { // output size limit
        runProcess.kill('SIGKILL');
      }
    });

    runProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    runProcess.on('close', (code) => {
      if (isTimedOut) return;
      clearTimeout(timer);
      const executionTimeMs = Date.now() - startTime;

      if (code !== 0 && stderr) {
        resolve({
          success: false,
          status: 'Runtime Error',
          stdout: stdout,
          error: stderr.trim(),
          executionTimeMs
        });
      } else {
        resolve({
          success: true,
          status: 'Success',
          stdout: stdout,
          error: stderr.trim(),
          executionTimeMs
        });
      }
    });

    runProcess.on('error', (err) => {
      if (isTimedOut) return;
      clearTimeout(timer);
      resolve({
        success: false,
        status: 'Runtime Error',
        stdout: stdout,
        error: err.message,
        executionTimeMs: Date.now() - startTime
      });
    });
  });
}

/**
 * Compile and run Java code against test cases
 * @param {string} rawCode - Source Java code
 * @param {Array<{input: string, expectedOutput: string, isHidden?: boolean}>} testCases
 * @param {string} customInput - Optional custom input for quick run
 */
export async function executeJavaCode(rawCode, testCases = [], customInput = null) {
  const runId = uuidv4();
  const tempDir = path.join(os.tmpdir(), 'javadsa_exec_' + runId);

  try {
    await fs.mkdir(tempDir, { recursive: true });
    const { code, className } = prepareJavaCode(rawCode);
    const sourceFilePath = path.join(tempDir, `${className}.java`);

    await fs.writeFile(sourceFilePath, code, 'utf8');

    // 1. Compile
    const compileResult = await new Promise((resolve) => {
      const javac = spawn('javac', ['-encoding', 'UTF-8', sourceFilePath]);
      let compileErr = '';

      javac.stderr.on('data', (data) => {
        compileErr += data.toString();
      });

      javac.on('close', (exitCode) => {
        if (exitCode !== 0) {
          resolve({
            success: false,
            status: 'Compilation Error',
            error: compileErr || 'Compilation failed with exit code ' + exitCode
          });
        } else {
          resolve({ success: true });
        }
      });

      javac.on('error', (err) => {
        resolve({
          success: false,
          status: 'Compilation Error',
          error: 'Failed to launch javac: ' + err.message + '. Please verify JDK is installed and in PATH.'
        });
      });
    });

    if (!compileResult.success) {
      return {
        status: 'Compilation Error',
        passed: false,
        errorDetails: compileResult.error,
        testResults: [],
        totalCases: testCases.length,
        passedCases: 0,
        executionTimeMs: 0
      };
    }

    // 2. Custom Input Mode (Run button with user input)
    if (customInput !== null && customInput !== undefined) {
      const execResult = await runSingleCase(tempDir, className, customInput);
      return {
        status: execResult.success ? 'Success' : execResult.status,
        passed: execResult.success,
        output: execResult.stdout,
        errorDetails: execResult.error,
        executionTimeMs: execResult.executionTimeMs,
        isCustom: true
      };
    }

    // 3. Test Cases Mode (Run against question test cases)
    const results = [];
    let allPassed = true;
    let overallStatus = 'Accepted';
    let totalTime = 0;
    let passedCases = 0;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const caseResult = await runSingleCase(tempDir, className, tc.input);
      totalTime += caseResult.executionTimeMs;

      const normalizedActual = normalizeOutput(caseResult.stdout);
      const normalizedExpected = normalizeOutput(tc.expectedOutput);
      const isMatch = caseResult.success && (normalizedActual === normalizedExpected);

      if (isMatch) {
        passedCases++;
      } else {
        allPassed = false;
        if (overallStatus === 'Accepted') {
          if (caseResult.status === 'Time Limit Exceeded') {
            overallStatus = 'Time Limit Exceeded';
          } else if (caseResult.status === 'Runtime Error') {
            overallStatus = 'Runtime Error';
          } else {
            overallStatus = 'Wrong Answer';
          }
        }
      }

      results.push({
        caseIndex: i + 1,
        passed: isMatch,
        status: isMatch ? 'Passed' : (caseResult.status === 'Success' ? 'Wrong Answer' : caseResult.status),
        input: tc.isHidden ? '[Hidden Test Case]' : tc.input,
        expectedOutput: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
        actualOutput: tc.isHidden && !isMatch ? '[Hidden Output on Failure]' : caseResult.stdout,
        error: caseResult.error,
        executionTimeMs: caseResult.executionTimeMs,
        isHidden: !!tc.isHidden
      });
    }

    return {
      status: allPassed ? 'Accepted' : overallStatus,
      passed: allPassed,
      passedCases,
      totalCases: testCases.length,
      executionTimeMs: totalTime,
      testResults: results,
      errorDetails: !allPassed ? (results.find(r => !r.passed)?.error || '') : ''
    };
  } catch (err) {
    return {
      status: 'Runtime Error',
      passed: false,
      errorDetails: err.message,
      testResults: [],
      totalCases: testCases.length,
      passedCases: 0,
      executionTimeMs: 0
    };
  } finally {
    // Cleanup temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupErr) {
      // ignore cleanup error
    }
  }
}
