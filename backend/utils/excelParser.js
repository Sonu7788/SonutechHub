import xlsx from 'xlsx';
import Category from '../models/Category.js';

/**
 * Generate a sample Excel workbook buffer for admin download
 */
export function generateSampleExcelBuffer() {
  const sampleData = [
    {
      "Title": "Two Sum",
      "Category": "Arrays",
      "Difficulty": "Easy",
      "Tags": "Array, Hash Table",
      "Description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. Return the answer as an integer array of two indices.",
      "Input Format": "[nums] on line 1, target on line 2 (or N on line 1, array elements on line 2, target on line 3)",
      "Output Format": "[index1, index2]",
      "Constraints": "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
      "Starter Code": "import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}",
      "Hints": "Use a HashMap to store values and their indices for O(N) lookup.",
      "Example 1 Input": "[2, 7, 11, 15]\n9",
      "Example 1 Output": "[0, 1]",
      "Example 1 Explanation": "Because nums[0] + nums[1] == 9, we return [0, 1].",
      "Example 2 Input": "[3, 2, 4]\n6",
      "Example 2 Output": "[1, 2]",
      "Example 2 Explanation": "Because nums[1] + nums[2] == 6, we return [1, 2].",
      "Test Case 1 Input": "[2, 7, 11, 15]\n9",
      "Test Case 1 Output": "[0, 1]",
      "Test Case 1 IsHidden": "FALSE",
      "Test Case 2 Input": "[3, 2, 4]\n6",
      "Test Case 2 Output": "[1, 2]",
      "Test Case 2 IsHidden": "FALSE",
      "Test Case 3 Input": "[3, 3]\n6",
      "Test Case 3 Output": "[0, 1]",
      "Test Case 3 IsHidden": "TRUE"
    },
    {
      "Title": "Valid Parentheses",
      "Category": "Stacks",
      "Difficulty": "Easy",
      "Tags": "String, Stack",
      "Description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if open brackets are closed by the same type of brackets and in the correct order.",
      "Input Format": "A single string s",
      "Output Format": "true or false",
      "Constraints": "1 <= s.length <= 10^4",
      "Starter Code": "import java.util.*;\n\nclass Solution {\n    public boolean isValid(String s) {\n        // Write your solution here\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(') stack.push(')');\n            else if (c == '{') stack.push('}');\n            else if (c == '[') stack.push(']');\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n}",
      "Hints": "Use a Stack to push expected closing brackets when an opening bracket is encountered.",
      "Example 1 Input": "\"()\"",
      "Example 1 Output": "true",
      "Example 1 Explanation": "The brackets open and close properly.",
      "Example 2 Input": "\"()[]{}\"",
      "Example 2 Output": "true",
      "Example 2 Explanation": "All bracket types are closed in correct order.",
      "Test Case 1 Input": "\"()\"",
      "Test Case 1 Output": "true",
      "Test Case 1 IsHidden": "FALSE",
      "Test Case 2 Input": "\"()[]{}\"",
      "Test Case 2 Output": "true",
      "Test Case 2 IsHidden": "FALSE",
      "Test Case 3 Input": "\"(]\"",
      "Test Case 3 Output": "false",
      "Test Case 3 IsHidden": "TRUE"
    }
  ];

  const worksheet = xlsx.utils.json_to_sheet(sampleData);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Questions");

  return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * Generate a slug from title
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

/**
 * Parse uploaded Excel or CSV buffer into Question objects
 */
export async function parseQuestionsFromBuffer(buffer) {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rows = xlsx.utils.sheet_to_json(worksheet, { defval: '' });

  if (!rows || rows.length === 0) {
    throw new Error('The uploaded file is empty or invalid.');
  }

  // Fetch all existing categories for mapping
  const existingCategories = await Category.find();
  const categoryMap = new Map();
  for (const cat of existingCategories) {
    categoryMap.set(cat.name.toLowerCase(), cat._id);
    categoryMap.set(cat.slug.toLowerCase(), cat._id);
  }

  const parsedQuestions = [];
  const errors = [];

  for (let idx = 0; idx < rows.length; idx++) {
    const row = rows[idx];
    const rowNum = idx + 2; // considering 1-based index + header

    // Find title
    const title = (row['Title'] || row['title'] || row['Question Title'] || row['name'] || '').toString().trim();
    if (!title) {
      errors.push(`Row ${rowNum}: Missing question title.`);
      continue;
    }

    // Category
    const categoryName = (row['Category'] || row['category'] || row['Topic'] || 'General').toString().trim();
    let categoryId = categoryMap.get(categoryName.toLowerCase());

    if (!categoryId) {
      // Auto-create category if missing
      try {
        const newCat = await Category.create({
          name: categoryName,
          slug: slugify(categoryName) || 'general-' + Date.now(),
          description: `DSA problems on ${categoryName}`
        });
        categoryId = newCat._id;
        categoryMap.set(categoryName.toLowerCase(), categoryId);
      } catch (err) {
        // Find again if race condition
        const existing = await Category.findOne({ name: new RegExp(`^${categoryName}$`, 'i') });
        if (existing) {
          categoryId = existing._id;
        } else {
          errors.push(`Row ${rowNum}: Could not assign category "${categoryName}".`);
          continue;
        }
      }
    }

    // Difficulty
    let difficulty = (row['Difficulty'] || row['difficulty'] || 'Easy').toString().trim();
    if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      difficulty = 'Easy';
    }

    // Tags
    const tagsRaw = (row['Tags'] || row['tags'] || '').toString();
    const tags = tagsRaw ? tagsRaw.split(/[,;|]/).map(t => t.trim()).filter(Boolean) : [];

    // Description, formats, constraints
    const description = (row['Description'] || row['description'] || row['Problem Statement'] || title).toString().trim();
    const inputFormat = (row['Input Format'] || row['inputFormat'] || row['Input'] || '').toString().trim();
    const outputFormat = (row['Output Format'] || row['outputFormat'] || row['Output'] || '').toString().trim();
    const constraints = (row['Constraints'] || row['constraints'] || '').toString().trim();

    // Starter code
    let starterCode = (row['Starter Code'] || row['starterCode'] || '').toString();
    if (!starterCode.trim()) {
      starterCode = `import java.util.*;

class Solution {
    public int solve(int[] nums) {
        // Write your solution here
        return 0;
    }
}`;
    }

    // Hints
    const hintsRaw = (row['Hints'] || row['hints'] || row['Hint'] || '').toString();
    const hints = hintsRaw ? hintsRaw.split(/[\n;]/).map(h => h.trim()).filter(Boolean) : [];

    // Examples
    const examples = [];
    // Check numbered columns (Example 1 Input, Example 2 Input...)
    for (let i = 1; i <= 5; i++) {
      const exIn = row[`Example ${i} Input`] || row[`exampleInput${i}`] || row[`Example ${i} in`];
      const exOut = row[`Example ${i} Output`] || row[`exampleOutput${i}`] || row[`Example ${i} out`];
      const exExp = row[`Example ${i} Explanation`] || row[`exampleExplanation${i}`] || '';

      if (exIn !== undefined && exIn !== '' && exOut !== undefined && exOut !== '') {
        examples.push({
          input: String(exIn).trim(),
          output: String(exOut).trim(),
          explanation: String(exExp).trim()
        });
      }
    }

    // Test Cases
    const testCases = [];
    // 1. Check numbered columns (Test Case 1 Input, Test Case 2 Input...)
    for (let i = 1; i <= 10; i++) {
      const tcIn = row[`Test Case ${i} Input`] || row[`testInput${i}`] || row[`TestCase ${i} Input`];
      const tcOut = row[`Test Case ${i} Output`] || row[`testOutput${i}`] || row[`TestCase ${i} Output`];
      const tcHid = row[`Test Case ${i} IsHidden`] || row[`testIsHidden${i}`] || row[`TestCase ${i} Hidden`];

      if (tcIn !== undefined && tcIn !== '' && tcOut !== undefined && tcOut !== '') {
        const isHidden = String(tcHid).toLowerCase() === 'true' || String(tcHid) === '1';
        testCases.push({
          input: String(tcIn).trim(),
          expectedOutput: String(tcOut).trim(),
          isHidden
        });
      }
    }

    // If testCases are still empty, use examples as testCases
    if (testCases.length === 0 && examples.length > 0) {
      examples.forEach((ex, i) => {
        testCases.push({
          input: ex.input,
          expectedOutput: ex.output,
          isHidden: i > 1
        });
      });
    }

    // Ensure at least 1 test case exists
    if (testCases.length === 0) {
      testCases.push({
        input: '0',
        expectedOutput: '0',
        isHidden: false
      });
    }

    parsedQuestions.push({
      title,
      slug: slugify(title) + '-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      category: categoryId,
      difficulty,
      tags,
      description,
      inputFormat,
      outputFormat,
      constraints,
      examples,
      testCases,
      starterCode,
      hints
    });
  }

  return { questions: parsedQuestions, errors };
}
