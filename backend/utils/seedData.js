import User from '../models/User.js';
import Category from '../models/Category.js';
import Question from '../models/Question.js';
import Pattern from '../models/Pattern.js';

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

    // 2. Clean/Sanitize any existing question starter codes in MongoDB to function-based format
    await Question.updateOne(
      { title: 'Two Sum Problem' },
      {
        $set: {
          starterCode: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        
    }
}`
        }
      }
    );

    await Question.updateOne(
      { title: 'Valid Palindrome Checker' },
      {
        $set: {
          starterCode: `import java.util.*;

class Solution {
    public boolean isPalindrome(String s) {
        // Write your solution here
        
    }
}`
        }
      }
    );

    await Question.updateOne(
      { title: 'Binary Search Implementation' },
      {
        $set: {
          starterCode: `import java.util.*;

class Solution {
    public int search(int[] nums, int target) {
        // Write your solution here
        
    }
}`
        }
      }
    );

    await Question.updateOne(
      { title: 'Valid Parentheses' },
      {
        $set: {
          starterCode: `import java.util.*;

class Solution {
    public boolean isValid(String s) {
        // Write your solution here
        
    }
}`
        }
      }
    );

    await Question.updateOne(
      { title: 'Climbing Stairs' },
      {
        $set: {
          starterCode: `import java.util.*;

class Solution {
    public int climbStairs(int n) {
        // Write your solution here
        
    }
}`
        }
      }
    );

    // 3. Check if Categories exist
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

      console.log('Seeding initial questions with function-based templates...');
      const questionsData = [
        {
          title: 'Two Sum Problem',
          slug: 'two-sum-problem',
          category: arraysCat._id,
          difficulty: 'Easy',
          tags: ['Array', 'Hash Table', 'Two Pointers'],
          description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

Return the indices in any order.`,
          inputFormat: `nums = [2,7,11,15], target = 9`,
          outputFormat: `[0,1]`,
          constraints: `2 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9`,
          starterCode: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        
    }
}`,
          hints: ['Use a HashMap to lookup previously seen numbers in O(1) time.'],
          examples: [
            {
              input: `[2,7,11,15]\n9`,
              output: `[0,1]`,
              explanation: `nums[0] + nums[1] == 9, so return [0, 1].`
            },
            {
              input: `[3,2,4]\n6`,
              output: `[1,2]`,
              explanation: `nums[1] + nums[2] == 6, so return [1, 2].`
            }
          ],
          testCases: [
            { input: `[2,7,11,15]\n9`, expectedOutput: `[0,1]`, isHidden: false },
            { input: `[3,2,4]\n6`, expectedOutput: `[1,2]`, isHidden: false },
            { input: `[3,3]\n6`, expectedOutput: `[0,1]`, isHidden: true },
            { input: `[1,5,9,12,18]\n21`, expectedOutput: `[2,3]`, isHidden: true }
          ]
        },
        {
          title: 'Valid Palindrome Checker',
          slug: 'valid-palindrome-checker',
          category: stringsCat._id,
          difficulty: 'Easy',
          tags: ['String', 'Two Pointers'],
          description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.`,
          inputFormat: `s = "A man, a plan, a canal: Panama"`,
          outputFormat: `true or false`,
          constraints: `1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.`,
          starterCode: `import java.util.*;

class Solution {
    public boolean isPalindrome(String s) {
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

If \`target\` exists, then return its index. Otherwise, return \`-1\`.

You must write an algorithm with \`O(log n)\` runtime complexity.`,
          inputFormat: `nums = [-1,0,3,5,9,12], target = 9`,
          outputFormat: `4`,
          constraints: `1 <= nums.length <= 10^5\n-10^4 <= nums[i], target <= 10^4\nAll the integers in nums are unique.`,
          starterCode: `import java.util.*;

class Solution {
    public int search(int[] nums, int target) {
        // Write your solution here
        
    }
}`,
          hints: ['Calculate mid = left + (right - left) / 2 to prevent integer overflow.'],
          examples: [
            { input: `[-1,0,3,5,9,12]\n9`, output: `4`, explanation: `9 exists in nums and its index is 4.` },
            { input: `[-1,0,3,5,9,12]\n2`, output: `-1`, explanation: `2 does not exist in nums so return -1.` }
          ],
          testCases: [
            { input: `[-1,0,3,5,9,12]\n9`, expectedOutput: `4`, isHidden: false },
            { input: `[-1,0,3,5,9,12]\n2`, expectedOutput: `-1`, isHidden: false },
            { input: `[5]\n5`, expectedOutput: `0`, isHidden: true }
          ]
        },
        {
          title: 'Valid Parentheses',
          slug: 'valid-parentheses',
          category: stackCat._id,
          difficulty: 'Medium',
          tags: ['Stack', 'String'],
          description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

Return \`true\` or \`false\`.`,
          inputFormat: `s = "()[]{}"`,
          outputFormat: `true or false`,
          constraints: `1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.`,
          starterCode: `import java.util.*;

class Solution {
    public boolean isValid(String s) {
        // Write your solution here
        
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
          inputFormat: `n = 2`,
          outputFormat: `2`,
          constraints: `1 <= n <= 45`,
          starterCode: `import java.util.*;

class Solution {
    public int climbStairs(int n) {
        // Write your solution here
        
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

    // 4. Check if Patterns (Notes) exist
    const patternCount = await Pattern.countDocuments();
    if (patternCount === 0) {
      console.log('Seeding curated DSA Patterns & Notes...');
      const arraysCat = await Category.findOne({ slug: 'arrays' });
      const stringsCat = await Category.findOne({ slug: 'strings' });
      const listCat = await Category.findOne({ slug: 'linked-list' });
      const stackCat = await Category.findOne({ slug: 'stack-and-queue' });

      const patternsToSeed = [];

      if (arraysCat) {
        patternsToSeed.push({
          title: 'Two Pointers Technique',
          slug: 'two-pointers-technique',
          category: arraysCat._id,
          difficulty: 'Easy',
          description: `The **Two Pointers Technique** is one of the most powerful algorithmic patterns in Data Structures & Algorithms. It involves using two reference pointers that traverse a data structure (typically an array, string, or linked list) in tandem to solve a problem with reduced time or space complexity.

### Core Variations of Two Pointers:
1. **Opposite Direction (Left & Right)**: One pointer starts at the beginning (\`left = 0\`), and another at the end (\`right = n - 1\`). They move toward each other based on comparison conditions (e.g. sorted pair sum, palindromes, container with most water).
2. **Same Direction (Fast & Slow / Reader & Writer)**: Both pointers start at the beginning but move at different speeds or conditions (e.g. removing duplicates in-place, partitioning).
3. **Two Arrays / Sequences (Merge pointers)**: One pointer in array A and another in array B (e.g. merge sorted arrays, intersection).

### When to Use This Pattern:
- The input array is **sorted** (or can be sorted).
- You need to find a pair, triplet, or subarray satisfying a sum or difference constraint.
- You need to reverse, verify symmetry, or modify an array in-place with **O(1) space**.`,
          timeComplexity: 'O(N) instead of O(N^2)',
          spaceComplexity: 'O(1) Auxiliary Space',
          keyTakeaways: [
            'Always check if sorting the array first makes two pointers applicable in O(N log N) + O(N).',
            'In opposite direction pointers, increment left when sum is too small, decrement right when sum is too large.',
            'Watch out for out-of-bounds index errors when moving pointers inside while loops.'
          ],
          codeExamples: [
            {
              title: 'Example 1: Pair with Target Sum in a Sorted Array',
              problemDescription: 'Given a 1-indexed sorted array of integers `numbers` and an integer `target`, return indices of two numbers that add up to `target`.',
              language: 'java',
              code: `public class TwoSumSorted {
    public static int[] twoSum(int[] numbers, int target) {
        int left = 0;
        int right = numbers.length - 1;

        while (left < right) {
            int currentSum = numbers[left] + numbers[right];

            if (currentSum == target) {
                // Found the pair (returning 0-based indices)
                return new int[]{left, right};
            } else if (currentSum < target) {
                // Sum too small, move left pointer to increase sum
                left++;
            } else {
                // Sum too large, move right pointer to decrease sum
                right--;
            }
        }

        return new int[]{-1, -1}; // No pair found
    }
}`,
              explanation: `1. **Initialize pointers**: \`left = 0\` (smallest element) and \`right = numbers.length - 1\` (largest element).
2. **Evaluate sum**: Calculate \`currentSum = numbers[left] + numbers[right]\`.
3. **Decision tree**:
   - If \`currentSum == target\`, we found our matching pair!
   - If \`currentSum < target\`, because the array is sorted, any element paired with \`numbers[left]\` will also be smaller than \`target\`. Thus we must increment \`left++\`.
   - If \`currentSum > target\`, decrement \`right--\`.
4. **Time Complexity**: **O(N)** since each step moves at least one pointer closer, visiting each element at most once.
5. **Space Complexity**: **O(1)** constant memory.`
            },
            {
              title: 'Example 2: Valid Palindrome (Skip Non-Alphanumeric)',
              problemDescription: 'Verify if string reads the same forward and backward, ignoring punctuation and casing.',
              language: 'java',
              code: `public class ValidPalindrome {
    public static boolean isPalindrome(String s) {
        int left = 0;
        int right = s.length() - 1;

        while (left < right) {
            // Skip non-alphanumeric characters on left
            while (left < right && !Character.isLetterOrDigit(s.charAt(left))) {
                left++;
            }
            // Skip non-alphanumeric characters on right
            while (left < right && !Character.isLetterOrDigit(s.charAt(right))) {
                right--;
            }

            // Compare lowercased characters
            if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
                return false;
            }

            left++;
            right--;
        }

        return true;
    }
}`,
              explanation: `1. **Two pointers from outside inwards**: \`left = 0\` and \`right = s.length() - 1\`.
2. **Inner skipping loops**: Move \`left\` forward until it points to a valid letter or digit. Move \`right\` backward similarly.
3. **Character comparison**: If characters match, advance both (\`left++\`, \`right--\`). If they mismatch, return \`false\` immediately.
4. **Efficiency**: Zero extra memory allocation needed (no string filtering or reversal required).`
            },
            {
              title: 'Example 3: Remove Duplicates from Sorted Array in-place (Fast & Slow Pointers)',
              problemDescription: 'Remove duplicate numbers in-place such that each unique element appears once. Return new length.',
              language: 'java',
              code: `public class RemoveDuplicates {
    public static int removeDuplicates(int[] nums) {
        if (nums.length == 0) return 0;

        int slow = 0; // Points to last unique element written

        for (int fast = 1; fast < nums.length; fast++) {
            if (nums[fast] != nums[slow]) {
                slow++;
                nums[slow] = nums[fast]; // Write next unique element
            }
        }

        return slow + 1; // Length of unique subarray
    }
}`,
              explanation: `1. **Slow pointer (\`slow\`)**: Marks the boundary of processed unique elements.
2. **Fast pointer (\`fast\`)**: Scans through the rest of the array.
3. When \`nums[fast] != nums[slow]\`, a new unique element is discovered! We advance \`slow++\` and write the value.
4. **Time Complexity**: **O(N)** single pass.
5. **Space Complexity**: **O(1)** in-place modification.`
            }
          ],
          order: 1
        });

        patternsToSeed.push({
          title: 'Sliding Window Technique',
          slug: 'sliding-window-technique',
          category: arraysCat._id,
          difficulty: 'Medium',
          description: `The **Sliding Window Pattern** is used to perform operations on a specific window size of a given array or string (contiguous subarrays or substrings). Instead of recalculating the window from scratch in $O(K)$ or $O(N)$ for every position, it slides the window by adding the incoming element on the right and removing the outgoing element from the left in $O(1)$ time.

### Window Flavors:
1. **Fixed Size Window**: The size of the window $K$ is constant. Move \`right\` and \`left\` in lockstep.
2. **Dynamic / Variable Size Window**: The window expands by moving \`right++\` until a condition is broken, then shrinks by moving \`left++\` until valid again.

### When to Use:
- The problem asks for the longest/shortest/maximum/minimum contiguous subarray or substring.
- Target constraints like "at most K distinct characters", "sum equal to target", "no repeating characters".`,
          timeComplexity: 'O(N) single pass',
          spaceComplexity: 'O(1) or O(K) hash map',
          keyTakeaways: [
            'Calculate initial window of size K first for fixed-window problems.',
            'For dynamic window problems, use a while loop inside to contract left pointer when condition is violated.',
            'Use an int array int[128] or int[26] instead of HashMap for ASCII strings to maximize runtime speed.'
          ],
          codeExamples: [
            {
              title: 'Example 1: Maximum Sum Subarray of Size K (Fixed Window)',
              problemDescription: 'Given an array of integers and a number K, find the maximum sum of any contiguous subarray of size K.',
              language: 'java',
              code: `public class MaxSubarraySum {
    public static int findMaxSumSubArray(int k, int[] arr) {
        int maxSum = 0;
        int windowSum = 0;

        // Compute sum of first window of size k
        for (int i = 0; i < k; i++) {
            windowSum += arr[i];
        }
        maxSum = windowSum;

        // Slide the window across the remaining array
        for (int i = k; i < arr.length; i++) {
            // Add next element, subtract first element of previous window
            windowSum += arr[i] - arr[i - k];
            maxSum = Math.max(maxSum, windowSum);
        }

        return maxSum;
    }
}`,
              explanation: `1. **Initial sum**: Calculate sum of first \`k\` elements in $O(K)$.
2. **Slide across array**: For each subsequent index \`i\`, add \`arr[i]\` and subtract \`arr[i - k]\`.
3. **Avoids O(N*K) brute force**: Each slide takes **O(1)** time, making total runtime **O(N)**.`
            },
            {
              title: 'Example 2: Longest Substring Without Repeating Characters (Dynamic Window)',
              problemDescription: 'Find the length of the longest substring without repeating characters.',
              language: 'java',
              code: `import java.util.*;

public class LongestSubstring {
    public static int lengthOfLongestSubstring(String s) {
        int[] lastIndex = new int[128]; // Store last seen 1-based index of character
        int maxLen = 0;
        int left = 0;

        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);

            // If character was seen inside the current window, jump left pointer
            left = Math.max(left, lastIndex[c]);

            // Window length is right - left + 1
            maxLen = Math.max(maxLen, right - left + 1);

            // Store current index + 1 as 1-based index
            lastIndex[c] = right + 1;
        }

        return maxLen;
    }
}`,
              explanation: `1. **State tracking**: An integer array \`lastIndex[128]\` maps each ASCII char to its latest position.
2. **Expand window**: Move \`right\` from index 0 to \`s.length() - 1\`.
3. **Contract left when duplicate seen**: If \`s.charAt(right)\` was already seen at or after \`left\`, jump \`left = lastIndex[c]\`.
4. **Update max length**: \`maxLen = Math.max(maxLen, right - left + 1)\`.`
            }
          ],
          order: 2
        });
      }

      if (listCat) {
        patternsToSeed.push({
          title: 'Fast & Slow Pointers (Floyd\'s Tortoise & Hare)',
          slug: 'fast-and-slow-pointers',
          category: listCat._id,
          difficulty: 'Medium',
          description: `The **Fast & Slow Pointer Pattern** (also known as Floyd's Cycle Detection Algorithm) uses two pointers that move through a sequence or linked list at different speeds (usually slow moves 1 step, fast moves 2 steps).

### Common Applications:
1. **Cycle Detection**: If there is a loop, the fast pointer will eventually lap and meet the slow pointer.
2. **Find Middle Node of Linked List**: When fast pointer reaches the end, slow pointer will be right at the middle.
3. **Palindrome Linked List**: Find middle, reverse second half, and compare.`,
          timeComplexity: 'O(N) Time',
          spaceComplexity: 'O(1) Auxiliary Space',
          keyTakeaways: [
            'Ensure fast != null && fast.next != null check before advancing fast.next.next.',
            'For finding the middle node of an even-length list, decide if slow should stop at first or second middle.',
            'To find cycle start: when slow meets fast, reset slow to head; move both 1 step at a time until they meet.'
          ],
          codeExamples: [
            {
              title: 'Example 1: Middle of the Singly Linked List',
              problemDescription: 'Given the head of a singly linked list, return the middle node of the linked list.',
              language: 'java',
              code: `class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}

public class MiddleNodeFinder {
    public static ListNode middleNode(ListNode head) {
        ListNode slow = head;
        ListNode fast = head;

        while (fast != null && fast.next != null) {
            slow = slow.next;       // 1 step
            fast = fast.next.next;  // 2 steps
        }

        return slow; // Points to middle node
    }
}`,
              explanation: `1. Both \`slow\` and \`fast\` start at \`head\`.
2. In each iteration, \`slow\` moves 1 step and \`fast\` moves 2 steps.
3. When \`fast\` reaches the end of the list (\`fast == null\` or \`fast.next == null\`), \`slow\` has traveled exactly half the distance!
4. **Time**: **O(N)**, **Space**: **O(1)** without needing to count total nodes first.`
            }
          ],
          order: 3
        });
      }

      if (patternsToSeed.length > 0) {
        await Pattern.insertMany(patternsToSeed);
        console.log(`Successfully seeded ${patternsToSeed.length} curated DSA patterns & notes!`);
      }
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

