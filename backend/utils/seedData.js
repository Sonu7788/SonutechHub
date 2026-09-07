import User from '../models/User.js';
import Category from '../models/Category.js';
import Question from '../models/Question.js';

export async function seedDatabase() {
  try {
    // 1. Check if Admin exists
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      console.log('Seeding initial admin & student accounts...');
      await User.create({
        name: 'Admin Instructor',
        email: 'admin@javadsa.com',
        password: 'admin123',
        role: 'admin'
      });
      await User.create({
        name: 'Demo Student',
        email: 'student@javadsa.com',
        password: 'student123',
        role: 'user'
      });
      console.log('Created Admin (admin@javadsa.com / admin123) and Student (student@javadsa.com / student123)');
    }

    // 2. Check if Categories exist
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log('Seeding DSA categories...');
      const categoriesData = [
        { name: 'Arrays', slug: 'arrays', description: 'Master 1D, 2D arrays, sliding window, two-pointer techniques', icon: 'LayoutGrid', color: '#3B82F6', order: 1 },
        { name: 'Strings', slug: 'strings', description: 'String manipulation, anagrams, palindromes, pattern searching', icon: 'FileText', color: '#EC4899', order: 2 },
        { name: 'Linked List', slug: 'linked-list', description: 'Singly, doubly, circular linked lists, fast & slow pointers', icon: 'GitCommit', color: '#8B5CF6', order: 3 },
        { name: 'Stack & Queue', slug: 'stack-and-queue', description: 'LIFO, FIFO, monotonic stacks, priority queues and deques', icon: 'Layers', color: '#F59E0B', order: 4 },
        { name: 'Binary Search', slug: 'binary-search', description: 'Logarithmic search on sorted arrays, search space reduction', icon: 'Search', color: '#10B981', order: 5 },
        { name: 'Trees & BST', slug: 'trees-and-bst', description: 'Binary trees, traversals (In/Pre/Post/Level), binary search trees', icon: 'Network', color: '#06B6D4', order: 6 },
        { name: 'Dynamic Programming', slug: 'dynamic-programming', description: 'Memoization, tabulation, knapsack, LCS, LIS problems', icon: 'Cpu', color: '#EF4444', order: 7 },
        { name: 'Graphs', slug: 'graphs', description: 'BFS, DFS, Dijkstra, Topological Sort, Disjoint Set Union', icon: 'Share2', color: '#6366F1', order: 8 }
      ];

      const createdCategories = await Category.insertMany(categoriesData);

      const arraysCat = createdCategories.find(c => c.slug === 'arrays');
      const stringsCat = createdCategories.find(c => c.slug === 'strings');
      const bsCat = createdCategories.find(c => c.slug === 'binary-search');
      const stackCat = createdCategories.find(c => c.slug === 'stack-and-queue');
      const dpCat = createdCategories.find(c => c.slug === 'dynamic-programming');

      // 3. Seed starter questions with clean boilerplates (NO pre-filled solutions)
      console.log('Seeding initial questions...');
      const questionsData = [
        {
          title: 'Two Sum Problem',
          slug: 'two-sum-problem',
          category: arraysCat._id,
          difficulty: 'Easy',
          tags: ['Array', 'Hash Table', 'Two Pointers'],
          description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

Print the indices separated by a single space in ascending order.`,
          inputFormat: `Line 1: Integer N (size of array)\nLine 2: N space-separated integers (nums)\nLine 3: Integer target`,
          outputFormat: `Two integers separated by space (indices 0-indexed)`,
          constraints: `2 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9`,
          starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }
        int target = sc.nextInt();
        
        // Write your solution here
        
    }
}`,
          hints: ['Use a HashMap to lookup previously seen numbers in O(1) time.'],
          examples: [
            {
              input: `4\n2 7 11 15\n9`,
              output: `0 1`,
              explanation: `nums[0] + nums[1] == 9, so output is 0 1.`
            },
            {
              input: `3\n3 2 4\n6`,
              output: `1 2`,
              explanation: `nums[1] + nums[2] == 6, so output is 1 2.`
            }
          ],
          testCases: [
            { input: `4\n2 7 11 15\n9`, expectedOutput: `0 1`, isHidden: false },
            { input: `3\n3 2 4\n6`, expectedOutput: `1 2`, isHidden: false },
            { input: `2\n3 3\n6`, expectedOutput: `0 1`, isHidden: true },
            { input: `5\n1 5 9 12 18\n21`, expectedOutput: `2 3`, isHidden: true }
          ]
        },
        {
          title: 'Valid Palindrome Checker',
          slug: 'valid-palindrome-checker',
          category: stringsCat._id,
          difficulty: 'Easy',
          tags: ['String', 'Two Pointers'],
          description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string \`s\`, print \`true\` if it is a palindrome, or \`false\` otherwise.`,
          inputFormat: `A single line containing the string S`,
          outputFormat: `Print "true" or "false" (lowercase)`,
          constraints: `1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.`,
          starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String s = sc.nextLine();
        
        // Write your solution here
        
    }
}`,
          hints: ['Filter alphanumeric characters and lowercase them first, then check with two pointers.'],
          examples: [
            {
              input: `A man, a plan, a canal: Panama`,
              output: `true`,
              explanation: `"amanaplanacanalpanama" is a palindrome.`
            },
            {
              input: `race a car`,
              output: `false`,
              explanation: `"raceacar" is not a palindrome.`
            }
          ],
          testCases: [
            { input: `A man, a plan, a canal: Panama`, expectedOutput: `true`, isHidden: false },
            { input: `race a car`, expectedOutput: `false`, isHidden: false },
            { input: ` `, expectedOutput: `true`, isHidden: true },
            { input: `0P`, expectedOutput: `false`, isHidden: true }
          ]
        },
        {
          title: 'Binary Search Implementation',
          slug: 'binary-search-implementation',
          category: bsCat._id,
          difficulty: 'Easy',
          tags: ['Binary Search', 'Array'],
          description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`.

If \`target\` exists, then print its index. Otherwise, print \`-1\`.

You must write an algorithm with \`O(log n)\` runtime complexity.`,
          inputFormat: `Line 1: Integer N\nLine 2: N sorted space-separated integers\nLine 3: Integer target`,
          outputFormat: `Index of target or -1`,
          constraints: `1 <= nums.length <= 10^5\n-10^4 <= nums[i], target <= 10^4\nAll the integers in nums are unique.`,
          starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }
        int target = sc.nextInt();
        
        // Write your binary search solution here
        
    }
}`,
          hints: ['Calculate mid = left + (right - left) / 2 to prevent integer overflow.'],
          examples: [
            { input: `6\n-1 0 3 5 9 12\n9`, output: `4`, explanation: `9 exists in nums and its index is 4.` },
            { input: `6\n-1 0 3 5 9 12\n2`, output: `-1`, explanation: `2 does not exist in nums so return -1.` }
          ],
          testCases: [
            { input: `6\n-1 0 3 5 9 12\n9`, expectedOutput: `4`, isHidden: false },
            { input: `6\n-1 0 3 5 9 12\n2`, expectedOutput: `-1`, isHidden: false },
            { input: `1\n5\n5`, expectedOutput: `0`, isHidden: true }
          ]
        },
        {
          title: 'Valid Parentheses',
          slug: 'valid-parentheses',
          category: stackCat._id,
          difficulty: 'Medium',
          tags: ['Stack', 'String'],
          description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

Print \`true\` or \`false\`.`,
          inputFormat: `Single line containing string s`,
          outputFormat: `true or false`,
          constraints: `1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.`,
          starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        
        // Write your stack solution here
        
    }
}`,
          hints: ['Use a Stack to push opening brackets and pop matching opening brackets on closing brackets.'],
          examples: [
            { input: `()`, output: `true`, explanation: `Valid pair.` },
            { input: `()[]{}`, output: `true`, explanation: `All pairs correctly matched.` },
            { input: `(]`, output: `false`, explanation: `Mismatched brackets.` }
          ],
          testCases: [
            { input: `()`, expectedOutput: `true`, isHidden: false },
            { input: `()[]{}`, expectedOutput: `true`, isHidden: false },
            { input: `(]`, expectedOutput: `false`, isHidden: false },
            { input: `([)]`, expectedOutput: `false`, isHidden: true }
          ]
        },
        {
          title: 'Climbing Stairs',
          slug: 'climbing-stairs',
          category: dpCat._id,
          difficulty: 'Easy',
          tags: ['Dynamic Programming', 'Math', 'Memoization'],
          description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
          inputFormat: `Single integer n`,
          outputFormat: `Number of distinct ways`,
          constraints: `1 <= n <= 45`,
          starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        
        // Write your DP solution here
        
    }
}`,
          hints: ['This problem follows the Fibonacci sequence: ways(n) = ways(n-1) + ways(n-2).'],
          examples: [
            { input: `2`, output: `2`, explanation: `1 step + 1 step, or 2 steps.` },
            { input: `3`, output: `3`, explanation: `1+1+1, 1+2, or 2+1.` }
          ],
          testCases: [
            { input: `2`, expectedOutput: `2`, isHidden: false },
            { input: `3`, expectedOutput: `3`, isHidden: false },
            { input: `5`, expectedOutput: `8`, isHidden: true }
          ]
        }
      ];

      await Question.insertMany(questionsData);
      console.log('Seeded starter questions with clean starter templates!');
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}
