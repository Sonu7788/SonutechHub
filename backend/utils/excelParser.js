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
      "Description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nInput:\nFirst line contains integer N (size of array)\nSecond line contains N integers\nThird line contains integer target",
      "Input Format": "N on line 1, array elements on line 2, target on line 3",
      "Output Format": "Two indices separated by space",
      "Constraints": "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
      "Starter Code": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for(int i = 0; i < n; i++) nums[i] = sc.nextInt();\n        int target = sc.nextInt();\n        \n        // Write your solution here\n        Map<Integer, Integer> map = new HashMap<>();\n        for(int i = 0; i < n; i++) {\n            int complement = target - nums[i];\n            if(map.containsKey(complement)) {\n                System.out.println(map.get(complement) + \" \" + i);\n                return;\n            }\n            map.put(nums[i], i);\n        }\n    }\n}",
      "Hints": "Use a HashMap to store the numbers you have seen so far for O(N) time complexity.",
      "Example 1 Input": "4\n2 7 11 15\n9",
      "Example 1 Output": "0 1",
      "Example 1 Explanation": "nums[0] + nums[1] == 9, we return 0 1.",
      "Example 2 Input": "3\n3 2 4\n6",
      "Example 2 Output": "1 2",
      "Example 2 Explanation": "nums[1] + nums[2] == 6, we return 1 2.",
      "Test Case 1 Input": "4\n2 7 11 15\n9",
      "Test Case 1 Output": "0 1",
      "Test Case 1 IsHidden": "FALSE",
      "Test Case 2 Input": "3\n3 2 4\n6",
      "Test Case 2 Output": "1 2",
      "Test Case 2 IsHidden": "FALSE",
      "Test Case 3 Input": "2\n3 3\n6",
      "Test Case 3 Output": "0 1",
      "Test Case 3 IsHidden": "TRUE"
    },
    {
      "Title": "Reverse a String",
      "Category": "Strings",
      "Difficulty": "Easy",
      "Tags": "String, Two Pointers",
      "Description": "Write a Java program that takes a string as input and prints the reversed string.",
      "Input Format": "A single line containing string S",
      "Output Format": "Reversed string",
      "Constraints": "1 <= S.length <= 10^5",
      "Starter Code": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        \n        // Reverse and print\n        StringBuilder sb = new StringBuilder(s);\n        System.out.println(sb.reverse().toString());\n    }\n}",
      "Hints": "You can use StringBuilder.reverse() or two pointers.",
      "Example 1 Input": "hello",
      "Example 1 Output": "olleh",
      "Example 1 Explanation": "The reverse of hello is olleh.",
      "Example 2 Input": "Java",
      "Example 2 Output": "avaJ",
      "Example 2 Explanation": "The reverse of Java is avaJ.",
      "Test Case 1 Input": "hello",
      "Test Case 1 Output": "olleh",
      "Test Case 1 IsHidden": "FALSE",
      "Test Case 2 Input": "Java",
      "Test Case 2 Output": "avaJ",
      "Test Case 2 IsHidden": "FALSE",
      "Test Case 3 Input": "DSA Practice Platform",
      "Test Case 3 Output": "mroftalP ecitcarP ASD",
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

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Your code here
        
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
