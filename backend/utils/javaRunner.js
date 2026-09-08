import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

/**
 * Driver template that uses Java Reflection to dynamically invoke
 * methods in `Solution` class and serialize return values cleanly.
 */
const DRIVER_CODE = `
import java.util.*;
import java.lang.reflect.*;

public class Main {
    public static void main(String[] args) {
        try {
            Scanner sc = new Scanner(System.in);
            StringBuilder fullInput = new StringBuilder();
            while (sc.hasNextLine()) {
                fullInput.append(sc.nextLine()).append("\\n");
            }
            String inputStr = fullInput.toString().trim();

            Solution solution = new Solution();

            Method targetMethod = null;
            Method[] methods = Solution.class.getDeclaredMethods();
            for (Method m : methods) {
                if (Modifier.isPublic(m.getModifiers()) && !m.isSynthetic() && !m.getName().equals("main")) {
                    targetMethod = m;
                    break;
                }
            }

            if (targetMethod == null) {
                System.err.println("Error: No public method found in Solution class.");
                System.exit(1);
            }

            targetMethod.setAccessible(true);
            Class<?>[] paramTypes = targetMethod.getParameterTypes();
            Object[] invokeArgs = parseArguments(inputStr, paramTypes);

            Object result = targetMethod.invoke(solution, invokeArgs);

            if (targetMethod.getReturnType().equals(Void.TYPE)) {
                if (invokeArgs.length > 0 && invokeArgs[0] != null && invokeArgs[0].getClass().isArray()) {
                    printResult(invokeArgs[0]);
                }
            } else {
                printResult(result);
            }
        } catch (InvocationTargetException ite) {
            Throwable cause = ite.getCause() != null ? ite.getCause() : ite;
            cause.printStackTrace(System.err);
            System.exit(1);
        } catch (Exception e) {
            e.printStackTrace(System.err);
            System.exit(1);
        }
    }

    private static Object[] parseArguments(String inputStr, Class<?>[] paramTypes) {
        Object[] args = new Object[paramTypes.length];
        if (paramTypes.length == 0) return args;

        List<String> tokens = extractTokens(inputStr);
        int tokenIdx = 0;

        for (int p = 0; p < paramTypes.length; p++) {
            Class<?> type = paramTypes[p];
            int remainingParams = paramTypes.length - 1 - p;

            if (type == int[].class || type == long[].class || type == double[].class || List.class.isAssignableFrom(type)) {
                if (tokenIdx >= tokens.size()) {
                    args[p] = createEmptyArrayOrList(type);
                    continue;
                }
                String current = tokens.get(tokenIdx);
                if (current.startsWith("[")) {
                    List<Long> nums = parseNumbersFromBracket(current);
                    tokenIdx++;
                    args[p] = convertNumberList(nums, type);
                } else {
                    int availableTokens = tokens.size() - tokenIdx;
                    boolean isLengthPrefixed = false;
                    int n = -1;
                    try {
                        n = Integer.parseInt(cleanNumber(current));
                        if (n >= 0 && availableTokens == 1 + n + remainingParams) {
                            isLengthPrefixed = true;
                        }
                    } catch (Exception ignored) {}

                    List<Long> nums = new ArrayList<>();
                    if (isLengthPrefixed) {
                        tokenIdx++; // Skip N
                        for (int i = 0; i < n && tokenIdx < tokens.size(); i++) {
                            try {
                                nums.add(Long.parseLong(cleanNumber(tokens.get(tokenIdx++))));
                            } catch (Exception e) {}
                        }
                    } else {
                        int tokensToConsume = Math.max(0, tokens.size() - tokenIdx - remainingParams);
                        for (int i = 0; i < tokensToConsume && tokenIdx < tokens.size(); i++) {
                            try {
                                nums.add(Long.parseLong(cleanNumber(tokens.get(tokenIdx++))));
                            } catch (Exception e) {}
                        }
                    }
                    args[p] = convertNumberList(nums, type);
                }
            } else if (type == String[].class) {
                if (tokenIdx >= tokens.size()) {
                    args[p] = new String[0];
                    continue;
                }
                String current = tokens.get(tokenIdx);
                if (current.startsWith("[")) {
                    List<String> items = parseStringsFromBracket(current);
                    tokenIdx++;
                    args[p] = items.toArray(new String[0]);
                } else {
                    int tokensToConsume = Math.max(0, tokens.size() - tokenIdx - remainingParams);
                    List<String> items = new ArrayList<>();
                    for (int i = 0; i < tokensToConsume && tokenIdx < tokens.size(); i++) {
                        items.add(tokens.get(tokenIdx++));
                    }
                    args[p] = items.toArray(new String[0]);
                }
            } else if (type == int.class || type == Integer.class) {
                if (tokenIdx < tokens.size()) {
                    args[p] = Integer.parseInt(cleanNumber(tokens.get(tokenIdx++)));
                } else {
                    args[p] = 0;
                }
            } else if (type == long.class || type == Long.class) {
                if (tokenIdx < tokens.size()) {
                    args[p] = Long.parseLong(cleanNumber(tokens.get(tokenIdx++)));
                } else {
                    args[p] = 0L;
                }
            } else if (type == double.class || type == Double.class) {
                if (tokenIdx < tokens.size()) {
                    args[p] = Double.parseDouble(cleanNumber(tokens.get(tokenIdx++)));
                } else {
                    args[p] = 0.0;
                }
            } else if (type == boolean.class || type == Boolean.class) {
                if (tokenIdx < tokens.size()) {
                    args[p] = Boolean.parseBoolean(tokens.get(tokenIdx++).toLowerCase());
                } else {
                    args[p] = false;
                }
            } else if (type == char.class || type == Character.class) {
                if (tokenIdx < tokens.size()) {
                    String s = tokens.get(tokenIdx++);
                    if (s.startsWith("'") && s.endsWith("'") && s.length() >= 3) {
                        args[p] = s.charAt(1);
                    } else {
                        args[p] = s.isEmpty() ? ' ' : s.charAt(0);
                    }
                } else {
                    args[p] = ' ';
                }
            } else if (type == String.class) {
                if (tokenIdx < tokens.size()) {
                    String s = tokens.get(tokenIdx++);
                    if (s.startsWith("\\"") && s.endsWith("\\"") && s.length() >= 2) {
                        args[p] = s.substring(1, s.length() - 1);
                    } else {
                        args[p] = s;
                    }
                } else {
                    args[p] = "";
                }
            }
        }

        return args;
    }

    private static List<String> extractTokens(String inputStr) {
        List<String> tokens = new ArrayList<>();
        if (inputStr == null || inputStr.trim().isEmpty()) return tokens;

        int i = 0;
        int len = inputStr.length();
        while (i < len) {
            char c = inputStr.charAt(i);
            if (Character.isWhitespace(c)) {
                i++;
                continue;
            }
            if (c == '[') {
                int start = i;
                int depth = 0;
                while (i < len) {
                    if (inputStr.charAt(i) == '[') depth++;
                    else if (inputStr.charAt(i) == ']') {
                        depth--;
                        if (depth == 0) {
                            i++;
                            break;
                        }
                    }
                    i++;
                }
                tokens.add(inputStr.substring(start, i).trim());
            } else if (c == '"') {
                int start = i;
                i++;
                while (i < len && inputStr.charAt(i) != '"') {
                    if (inputStr.charAt(i) == '\\\\' && i + 1 < len) i++;
                    i++;
                }
                if (i < len) i++;
                tokens.add(inputStr.substring(start, i));
            } else {
                int start = i;
                while (i < len && !Character.isWhitespace(inputStr.charAt(i)) && inputStr.charAt(i) != '[' && inputStr.charAt(i) != ']') {
                    i++;
                }
                tokens.add(inputStr.substring(start, i).trim());
            }
        }
        return tokens;
    }

    private static List<Long> parseNumbersFromBracket(String s) {
        List<Long> list = new ArrayList<>();
        String content = s.replace("[", "").replace("]", "").trim();
        if (content.isEmpty()) return list;
        String[] parts = content.split("[,\\\\s]+");
        for (String p : parts) {
            String c = cleanNumber(p);
            if (!c.isEmpty()) {
                try {
                    list.add(Long.parseLong(c));
                } catch (Exception ignored) {}
            }
        }
        return list;
    }

    private static List<String> parseStringsFromBracket(String s) {
        List<String> list = new ArrayList<>();
        String content = s.replace("[", "").replace("]", "").trim();
        if (content.isEmpty()) return list;
        String[] parts = content.split("[,\\\\s]+");
        for (String p : parts) {
            String c = p.replace("\\"", "").trim();
            if (!c.isEmpty()) list.add(c);
        }
        return list;
    }

    private static Object createEmptyArrayOrList(Class<?> type) {
        if (type == int[].class) return new int[0];
        if (type == long[].class) return new long[0];
        if (type == double[].class) return new double[0];
        return new ArrayList<Integer>();
    }

    private static Object convertNumberList(List<Long> nums, Class<?> type) {
        if (type == int[].class) {
            int[] arr = new int[nums.size()];
            for (int i = 0; i < nums.size(); i++) arr[i] = nums.get(i).intValue();
            return arr;
        } else if (type == long[].class) {
            long[] arr = new long[nums.size()];
            for (int i = 0; i < nums.size(); i++) arr[i] = nums.get(i);
            return arr;
        } else if (type == double[].class) {
            double[] arr = new double[nums.size()];
            for (int i = 0; i < nums.size(); i++) arr[i] = nums.get(i).doubleValue();
            return arr;
        } else if (List.class.isAssignableFrom(type)) {
            List<Integer> list = new ArrayList<>();
            for (Long n : nums) list.add(n.intValue());
            return list;
        }
        return new int[0];
    }

    private static String cleanNumber(String s) {
        return s.replaceAll("[^0-9\\\\-.]", "");
    }

    private static void printResult(Object res) {
        if (res == null) {
            System.out.println("null");
            return;
        }
        if (res instanceof int[]) {
            int[] arr = (int[]) res;
            System.out.print("[");
            for (int i = 0; i < arr.length; i++) {
                System.out.print(arr[i] + (i < arr.length - 1 ? "," : ""));
            }
            System.out.println("]");
        } else if (res instanceof long[]) {
            long[] arr = (long[]) res;
            System.out.print("[");
            for (int i = 0; i < arr.length; i++) {
                System.out.print(arr[i] + (i < arr.length - 1 ? "," : ""));
            }
            System.out.println("]");
        } else if (res instanceof String[]) {
            String[] arr = (String[]) res;
            System.out.print("[");
            for (int i = 0; i < arr.length; i++) {
                System.out.print("\\"" + arr[i] + "\\"" + (i < arr.length - 1 ? "," : ""));
            }
            System.out.println("]");
        } else if (res instanceof boolean[]) {
            boolean[] arr = (boolean[]) res;
            System.out.print("[");
            for (int i = 0; i < arr.length; i++) {
                System.out.print(arr[i] + (i < arr.length - 1 ? "," : ""));
            }
            System.out.println("]");
        } else if (res instanceof Collection) {
            System.out.println(res.toString().replaceAll("\\\\s+", ""));
        } else {
            System.out.println(res);
        }
    }
}
`;

/**
 * Extract public class name from Java code or fallback to 'Main'
 */
function extractClassName(code) {
  const match = code.match(/public\s+class\s+([A-Za-z0-9_$]+)/);
  if (match && match[1]) {
    return match[1];
  }
  const matchAny = code.match(/class\s+([A-Za-z0-9_$]+)/);
  if (matchAny && matchAny[1]) {
    return matchAny[1];
  }
  return 'Main';
}

/**
 * Check whether code is function-based (class Solution) or has a main method
 */
function isFunctionBased(code) {
  const hasMain = /public\s+static\s+void\s+main\s*\(/.test(code);
  return !hasMain;
}

/**
 * Normalize string output for comparison (handles Windows \r\n, array brackets, and spaces)
 */
function normalizeOutput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\[/g, ' ')
    .replace(/\]/g, ' ')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
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
 * Compile and run Java code against test cases (supports both LeetCode Function style and Main style)
 * @param {string} rawCode - Source Java code
 * @param {Array<{input: string, expectedOutput: string, isHidden?: boolean}>} testCases
 * @param {string} customInput - Optional custom input for quick run
 */
export async function executeJavaCode(rawCode, testCases = [], customInput = null) {
  const runId = uuidv4();
  const tempDir = path.join(os.tmpdir(), 'javadsa_exec_' + runId);

  try {
    await fs.mkdir(tempDir, { recursive: true });

    const functionStyle = isFunctionBased(rawCode);
    let mainClassName = 'Main';
    const filesToCompile = [];

    if (functionStyle) {
      // Function-based LeetCode style: write Solution.java and Main.java driver
      const solutionFilePath = path.join(tempDir, 'Solution.java');
      const driverFilePath = path.join(tempDir, 'Main.java');

      await fs.writeFile(solutionFilePath, rawCode, 'utf8');
      await fs.writeFile(driverFilePath, DRIVER_CODE, 'utf8');

      filesToCompile.push(solutionFilePath, driverFilePath);
      mainClassName = 'Main';
    } else {
      // Standard Main style
      const className = extractClassName(rawCode);
      const sourceFilePath = path.join(tempDir, `${className}.java`);
      await fs.writeFile(sourceFilePath, rawCode, 'utf8');
      filesToCompile.push(sourceFilePath);
      mainClassName = className;
    }

    // 1. Compile all source files
    const compileResult = await new Promise((resolve) => {
      const javac = spawn('javac', ['-encoding', 'UTF-8', '-cp', tempDir, ...filesToCompile]);
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
          error: 'Failed to launch javac: ' + err.message + '. Please verify OpenJDK is installed in PATH.'
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
      const execResult = await runSingleCase(tempDir, mainClassName, customInput);
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
      const caseResult = await runSingleCase(tempDir, mainClassName, tc.input);
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

