import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

const LIST_NODE_CODE = `
public class ListNode {
    public int val;
    public ListNode next;
    public ListNode() {}
    public ListNode(int val) { this.val = val; }
    public ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
`;

const TREE_NODE_CODE = `
public class TreeNode {
    public int val;
    public TreeNode left;
    public TreeNode right;
    public TreeNode() {}
    public TreeNode(int val) { this.val = val; }
    public TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}
`;

const DRIVER_CODE = "import java.util.*;\nimport java.lang.reflect.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        try {\n            Scanner sc = new Scanner(System.in);\n            StringBuilder fullInput = new StringBuilder();\n            while (sc.hasNextLine()) {\n                fullInput.append(sc.nextLine()).append(\"\\n\");\n            }\n            String inputStr = fullInput.toString().trim();\n\n            Solution solution = new Solution();\n\n            Method targetMethod = null;\n            Method[] methods = Solution.class.getDeclaredMethods();\n            for (Method m : methods) {\n                if (Modifier.isPublic(m.getModifiers()) && !m.isSynthetic() && !m.getName().equals(\"main\")) {\n                    targetMethod = m;\n                    break;\n                }\n            }\n\n            if (targetMethod == null) {\n                System.err.println(\"Error: No public method found in Solution class.\");\n                System.exit(1);\n            }\n\n            targetMethod.setAccessible(true);\n            Class<?>[] paramTypes = targetMethod.getParameterTypes();\n            Object[] invokeArgs = parseArguments(inputStr, paramTypes);\n\n            Object result = targetMethod.invoke(solution, invokeArgs);\n\n            if (targetMethod.getReturnType().equals(Void.TYPE)) {\n                if (invokeArgs.length > 0 && invokeArgs[0] != null) {\n                    printResult(invokeArgs[0]);\n                }\n            } else {\n                printResult(result);\n            }\n        } catch (InvocationTargetException ite) {\n            Throwable cause = ite.getCause() != null ? ite.getCause() : ite;\n            cause.printStackTrace(System.err);\n            System.exit(1);\n        } catch (Exception e) {\n            e.printStackTrace(System.err);\n            System.exit(1);\n        }\n    }\n\n    private static Object[] parseArguments(String inputStr, Class<?>[] paramTypes) throws Exception {\n        Object[] args = new Object[paramTypes.length];\n        if (paramTypes.length == 0) return args;\n\n        List<String> tokens = extractTokens(inputStr);\n        int tokenIdx = 0;\n\n        for (int p = 0; p < paramTypes.length; p++) {\n            Class<?> type = paramTypes[p];\n            int remainingParams = paramTypes.length - 1 - p;\n\n            // 1. ListNode Support\n            if (type.getSimpleName().equals(\"ListNode\")) {\n                if (tokenIdx >= tokens.size()) {\n                    args[p] = null;\n                    continue;\n                }\n                String current = tokens.get(tokenIdx++);\n                args[p] = parseListNode(current, type);\n            }\n            // 2. TreeNode Support\n            else if (type.getSimpleName().equals(\"TreeNode\")) {\n                if (tokenIdx >= tokens.size()) {\n                    args[p] = null;\n                    continue;\n                }\n                String current = tokens.get(tokenIdx++);\n                args[p] = parseTreeNode(current, type);\n            }\n            // 3. 2D Int Array (int[][])\n            else if (type == int[][].class) {\n                if (tokenIdx >= tokens.size()) {\n                    args[p] = new int[0][0];\n                    continue;\n                }\n                String current = tokens.get(tokenIdx++);\n                args[p] = parseInt2DArray(current);\n            }\n            // 4. 2D Char Array (char[][])\n            else if (type == char[][].class) {\n                if (tokenIdx >= tokens.size()) {\n                    args[p] = new char[0][0];\n                    continue;\n                }\n                String current = tokens.get(tokenIdx++);\n                args[p] = parseChar2DArray(current);\n            }\n            // 5. 2D String Array (String[][])\n            else if (type == String[][].class) {\n                if (tokenIdx >= tokens.size()) {\n                    args[p] = new String[0][0];\n                    continue;\n                }\n                String current = tokens.get(tokenIdx++);\n                args[p] = parseString2DArray(current);\n            }\n            // 6. 1D Array (int[], long[], double[], List)\n            else if (type == int[].class || type == long[].class || type == double[].class || List.class.isAssignableFrom(type)) {\n                if (tokenIdx >= tokens.size()) {\n                    args[p] = createEmptyArrayOrList(type);\n                    continue;\n                }\n                String current = tokens.get(tokenIdx);\n                if (current.startsWith(\"[\")) {\n                    List<Long> nums = parseNumbersFromBracket(current);\n                    tokenIdx++;\n                    args[p] = convertNumberList(nums, type);\n                } else {\n                    int availableTokens = tokens.size() - tokenIdx;\n                    boolean isLengthPrefixed = false;\n                    int n = -1;\n                    try {\n                        n = Integer.parseInt(cleanNumber(current));\n                        if (n >= 0 && availableTokens == 1 + n + remainingParams) {\n                            isLengthPrefixed = true;\n                        }\n                    } catch (Exception ignored) {}\n\n                    List<Long> nums = new ArrayList<>();\n                    if (isLengthPrefixed) {\n                        tokenIdx++; // Skip N\n                        for (int i = 0; i < n && tokenIdx < tokens.size(); i++) {\n                            try {\n                                nums.add(Long.parseLong(cleanNumber(tokens.get(tokenIdx++))));\n                            } catch (Exception e) {}\n                        }\n                    } else {\n                        int tokensToConsume = Math.max(0, tokens.size() - tokenIdx - remainingParams);\n                        for (int i = 0; i < tokensToConsume && tokenIdx < tokens.size(); i++) {\n                            try {\n                                nums.add(Long.parseLong(cleanNumber(tokens.get(tokenIdx++))));\n                            } catch (Exception e) {}\n                        }\n                    }\n                    args[p] = convertNumberList(nums, type);\n                }\n            }\n            // 7. 1D String Array (String[])\n            else if (type == String[].class) {\n                if (tokenIdx >= tokens.size()) {\n                    args[p] = new String[0];\n                    continue;\n                }\n                String current = tokens.get(tokenIdx);\n                if (current.startsWith(\"[\")) {\n                    List<String> items = parseStringsFromBracket(current);\n                    tokenIdx++;\n                    args[p] = items.toArray(new String[0]);\n                } else {\n                    int tokensToConsume = Math.max(0, tokens.size() - tokenIdx - remainingParams);\n                    List<String> items = new ArrayList<>();\n                    for (int i = 0; i < tokensToConsume && tokenIdx < tokens.size(); i++) {\n                        items.add(tokens.get(tokenIdx++));\n                    }\n                    args[p] = items.toArray(new String[0]);\n                }\n            }\n            // 8. 1D Char Array (char[])\n            else if (type == char[].class) {\n                if (tokenIdx >= tokens.size()) {\n                    args[p] = new char[0];\n                    continue;\n                }\n                String current = tokens.get(tokenIdx++);\n                if (current.startsWith(\"[\")) {\n                    List<String> items = parseStringsFromBracket(current);\n                    char[] ca = new char[items.size()];\n                    for (int i = 0; i < items.size(); i++) ca[i] = items.get(i).isEmpty() ? ' ' : items.get(i).charAt(0);\n                    args[p] = ca;\n                } else {\n                    args[p] = current.replace(\"\\\"\", \"\").toCharArray();\n                }\n            }\n            // 9. Primitives\n            else if (type == int.class || type == Integer.class) {\n                if (tokenIdx < tokens.size()) {\n                    args[p] = Integer.parseInt(cleanNumber(tokens.get(tokenIdx++)));\n                } else {\n                    args[p] = 0;\n                }\n            } else if (type == long.class || type == Long.class) {\n                if (tokenIdx < tokens.size()) {\n                    args[p] = Long.parseLong(cleanNumber(tokens.get(tokenIdx++)));\n                } else {\n                    args[p] = 0L;\n                }\n            } else if (type == double.class || type == Double.class) {\n                if (tokenIdx < tokens.size()) {\n                    args[p] = Double.parseDouble(cleanNumber(tokens.get(tokenIdx++)));\n                } else {\n                    args[p] = 0.0;\n                }\n            } else if (type == boolean.class || type == Boolean.class) {\n                if (tokenIdx < tokens.size()) {\n                    args[p] = Boolean.parseBoolean(tokens.get(tokenIdx++).toLowerCase());\n                } else {\n                    args[p] = false;\n                }\n            } else if (type == char.class || type == Character.class) {\n                if (tokenIdx < tokens.size()) {\n                    String s = tokens.get(tokenIdx++);\n                    if (s.startsWith(\"'\") && s.endsWith(\"'\") && s.length() >= 3) {\n                        args[p] = s.charAt(1);\n                    } else {\n                        args[p] = s.isEmpty() ? ' ' : s.charAt(0);\n                    }\n                } else {\n                    args[p] = ' ';\n                }\n            } else if (type == String.class) {\n                if (tokenIdx < tokens.size()) {\n                    String s = tokens.get(tokenIdx++);\n                    if (s.startsWith(\"\\\"\") && s.endsWith(\"\\\"\") && s.length() >= 2) {\n                        args[p] = s.substring(1, s.length() - 1);\n                    } else {\n                        args[p] = s;\n                    }\n                } else {\n                    args[p] = \"\";\n                }\n            }\n        }\n\n        return args;\n    }\n\n    private static List<String> extractTokens(String inputStr) {\n        List<String> tokens = new ArrayList<>();\n        if (inputStr == null || inputStr.trim().isEmpty()) return tokens;\n\n        int i = 0;\n        int len = inputStr.length();\n        while (i < len) {\n            char c = inputStr.charAt(i);\n            if (Character.isWhitespace(c)) {\n                i++;\n                continue;\n            }\n            if (c == '[') {\n                int start = i;\n                int depth = 0;\n                while (i < len) {\n                    if (inputStr.charAt(i) == '[') depth++;\n                    else if (inputStr.charAt(i) == ']') {\n                        depth--;\n                        if (depth == 0) {\n                            i++;\n                            break;\n                        }\n                    }\n                    i++;\n                }\n                tokens.add(inputStr.substring(start, i).trim());\n            } else if (c == '\"') {\n                int start = i;\n                i++;\n                while (i < len && inputStr.charAt(i) != '\"') {\n                    if (inputStr.charAt(i) == '\\\\' && i + 1 < len) i++;\n                    i++;\n                }\n                if (i < len) i++;\n                tokens.add(inputStr.substring(start, i));\n            } else {\n                int start = i;\n                while (i < len && !Character.isWhitespace(inputStr.charAt(i)) && inputStr.charAt(i) != '[' && inputStr.charAt(i) != ']') {\n                    i++;\n                }\n                tokens.add(inputStr.substring(start, i).trim());\n            }\n        }\n        return tokens;\n    }\n\n    private static Object parseListNode(String token, Class<?> listNodeType) throws Exception {\n        List<Long> nums = parseNumbersFromBracket(token);\n        if (nums.isEmpty() && !token.startsWith(\"[\")) {\n            String[] parts = token.split(\"[,\\\\s\\\\->]+\");\n            for (String p : parts) {\n                String c = cleanNumber(p);\n                if (!c.isEmpty()) {\n                    try { nums.add(Long.parseLong(c)); } catch (Exception ignored) {}\n                }\n            }\n        }\n        if (nums.isEmpty()) return null;\n\n        Constructor<?> ctor = listNodeType.getConstructor(int.class);\n        Field nextField = listNodeType.getField(\"next\");\n\n        Object head = null;\n        Object tail = null;\n        for (Long n : nums) {\n            Object node = ctor.newInstance(n.intValue());\n            if (head == null) {\n                head = node;\n                tail = node;\n            } else {\n                nextField.set(tail, node);\n                tail = node;\n            }\n        }\n        return head;\n    }\n\n    private static Object parseTreeNode(String token, Class<?> treeNodeType) throws Exception {\n        String content = token.replace(\"[\", \"\").replace(\"]\", \"\").trim();\n        if (content.isEmpty()) return null;\n        String[] parts = content.split(\"[,\\\\s]+\");\n        List<String> items = new ArrayList<>();\n        for (String p : parts) {\n            String s = p.trim();\n            if (!s.isEmpty()) items.add(s);\n        }\n        if (items.isEmpty() || items.get(0).equalsIgnoreCase(\"null\")) return null;\n\n        Constructor<?> ctor = treeNodeType.getConstructor(int.class);\n        Field leftField = treeNodeType.getField(\"left\");\n        Field rightField = treeNodeType.getField(\"right\");\n\n        Object root = ctor.newInstance(Integer.parseInt(cleanNumber(items.get(0))));\n        Queue<Object> queue = new LinkedList<>();\n        queue.offer(root);\n\n        int idx = 1;\n        while (!queue.isEmpty() && idx < items.size()) {\n            Object curr = queue.poll();\n            if (idx < items.size()) {\n                String leftStr = items.get(idx++);\n                if (!leftStr.equalsIgnoreCase(\"null\") && !cleanNumber(leftStr).isEmpty()) {\n                    Object leftNode = ctor.newInstance(Integer.parseInt(cleanNumber(leftStr)));\n                    leftField.set(curr, leftNode);\n                    queue.offer(leftNode);\n                }\n            }\n            if (idx < items.size()) {\n                String rightStr = items.get(idx++);\n                if (!rightStr.equalsIgnoreCase(\"null\") && !cleanNumber(rightStr).isEmpty()) {\n                    Object rightNode = ctor.newInstance(Integer.parseInt(cleanNumber(rightStr)));\n                    rightField.set(curr, rightNode);\n                    queue.offer(rightNode);\n                }\n            }\n        }\n        return root;\n    }\n\n    private static int[][] parseInt2DArray(String token) {\n        if (token.startsWith(\"[[\")) {\n            List<int[]> rows = new ArrayList<>();\n            int i = 0;\n            int len = token.length();\n            while (i < len) {\n                if (token.charAt(i) == '[' && i + 1 < len && token.charAt(i + 1) != '[') {\n                    int start = i;\n                    while (i < len && token.charAt(i) != ']') i++;\n                    if (i < len) i++;\n                    String rowStr = token.substring(start, i);\n                    List<Long> nums = parseNumbersFromBracket(rowStr);\n                    int[] row = new int[nums.size()];\n                    for (int j = 0; j < nums.size(); j++) row[j] = nums.get(j).intValue();\n                    rows.add(row);\n                } else {\n                    i++;\n                }\n            }\n            return rows.toArray(new int[0][]);\n        } else {\n            List<String> parts = extractTokens(token);\n            if (parts.size() >= 2) {\n                try {\n                    int R = Integer.parseInt(cleanNumber(parts.get(0)));\n                    int C = Integer.parseInt(cleanNumber(parts.get(1)));\n                    if (R > 0 && C > 0 && parts.size() >= 2 + R * C) {\n                        int[][] mat = new int[R][C];\n                        int idx = 2;\n                        for (int r = 0; r < R; r++) {\n                            for (int c = 0; c < C; c++) {\n                                mat[r][c] = Integer.parseInt(cleanNumber(parts.get(idx++)));\n                            }\n                        }\n                        return mat;\n                    }\n                } catch (Exception ignored) {}\n            }\n            return new int[0][0];\n        }\n    }\n\n    private static char[][] parseChar2DArray(String token) {\n        if (token.startsWith(\"[[\")) {\n            List<char[]> rows = new ArrayList<>();\n            int i = 0;\n            int len = token.length();\n            while (i < len) {\n                if (token.charAt(i) == '[' && i + 1 < len && token.charAt(i + 1) != '[') {\n                    int start = i;\n                    while (i < len && token.charAt(i) != ']') i++;\n                    if (i < len) i++;\n                    String rowStr = token.substring(start, i);\n                    List<String> items = parseStringsFromBracket(rowStr);\n                    char[] row = new char[items.size()];\n                    for (int j = 0; j < items.size(); j++) {\n                        String s = items.get(j);\n                        row[j] = s.isEmpty() ? ' ' : s.charAt(0);\n                    }\n                    rows.add(row);\n                } else {\n                    i++;\n                }\n            }\n            return rows.toArray(new char[0][]);\n        }\n        return new char[0][0];\n    }\n\n    private static String[][] parseString2DArray(String token) {\n        if (token.startsWith(\"[[\")) {\n            List<String[]> rows = new ArrayList<>();\n            int i = 0;\n            int len = token.length();\n            while (i < len) {\n                if (token.charAt(i) == '[' && i + 1 < len && token.charAt(i + 1) != '[') {\n                    int start = i;\n                    while (i < len && token.charAt(i) != ']') i++;\n                    if (i < len) i++;\n                    String rowStr = token.substring(start, i);\n                    List<String> items = parseStringsFromBracket(rowStr);\n                    rows.add(items.toArray(new String[0]));\n                } else {\n                    i++;\n                }\n            }\n            return rows.toArray(new String[0][]);\n        }\n        return new String[0][0];\n    }\n\n    private static void printListNode(Object head) {\n        if (head == null) {\n            System.out.println(\"[]\");\n            return;\n        }\n        try {\n            Class<?> clazz = head.getClass();\n            Field valField = clazz.getField(\"val\");\n            Field nextField = clazz.getField(\"next\");\n\n            List<Object> values = new ArrayList<>();\n            Set<Object> visited = Collections.newSetFromMap(new IdentityHashMap<>());\n\n            Object curr = head;\n            while (curr != null && values.size() < 10000) {\n                if (visited.contains(curr)) {\n                    break;\n                }\n                visited.add(curr);\n                values.add(valField.get(curr));\n                curr = nextField.get(curr);\n            }\n\n            System.out.print(\"[\");\n            for (int i = 0; i < values.size(); i++) {\n                System.out.print(values.get(i) + (i < values.size() - 1 ? \",\" : \"\"));\n            }\n            System.out.println(\"]\");\n        } catch (Exception e) {\n            System.out.println(head);\n        }\n    }\n\n    private static void printTreeNode(Object root) {\n        if (root == null) {\n            System.out.println(\"[]\");\n            return;\n        }\n        try {\n            Class<?> clazz = root.getClass();\n            Field valField = clazz.getField(\"val\");\n            Field leftField = clazz.getField(\"left\");\n            Field rightField = clazz.getField(\"right\");\n\n            List<String> res = new ArrayList<>();\n            Queue<Object> queue = new LinkedList<>();\n            queue.offer(root);\n\n            while (!queue.isEmpty()) {\n                Object curr = queue.poll();\n                if (curr == null) {\n                    res.add(\"null\");\n                } else {\n                    res.add(String.valueOf(valField.get(curr)));\n                    queue.offer(leftField.get(curr));\n                    queue.offer(rightField.get(curr));\n                }\n            }\n\n            int lastNonNull = res.size() - 1;\n            while (lastNonNull >= 0 && res.get(lastNonNull).equals(\"null\")) {\n                lastNonNull--;\n            }\n\n            System.out.print(\"[\");\n            for (int i = 0; i <= lastNonNull; i++) {\n                System.out.print(res.get(i) + (i < lastNonNull ? \",\" : \"\"));\n            }\n            System.out.println(\"]\");\n        } catch (Exception e) {\n            System.out.println(root);\n        }\n    }\n\n    private static List<Long> parseNumbersFromBracket(String s) {\n        List<Long> list = new ArrayList<>();\n        String content = s.replace(\"[\", \"\").replace(\"]\", \"\").trim();\n        if (content.isEmpty()) return list;\n        String[] parts = content.split(\"[,\\\\s]+\");\n        for (String p : parts) {\n            String c = cleanNumber(p);\n            if (!c.isEmpty()) {\n                try {\n                    list.add(Long.parseLong(c));\n                } catch (Exception ignored) {}\n            }\n        }\n        return list;\n    }\n\n    private static List<String> parseStringsFromBracket(String s) {\n        List<String> list = new ArrayList<>();\n        String content = s.replace(\"[\", \"\").replace(\"]\", \"\").trim();\n        if (content.isEmpty()) return list;\n        String[] parts = content.split(\"[,\\\\s]+\");\n        for (String p : parts) {\n            String c = p.replace(\"\\\"\", \"\").trim();\n            if (!c.isEmpty()) list.add(c);\n        }\n        return list;\n    }\n\n    private static Object createEmptyArrayOrList(Class<?> type) {\n        if (type == int[].class) return new int[0];\n        if (type == long[].class) return new long[0];\n        if (type == double[].class) return new double[0];\n        return new ArrayList<Integer>();\n    }\n\n    private static Object convertNumberList(List<Long> nums, Class<?> type) {\n        if (type == int[].class) {\n            int[] arr = new int[nums.size()];\n            for (int i = 0; i < nums.size(); i++) arr[i] = nums.get(i).intValue();\n            return arr;\n        } else if (type == long[].class) {\n            long[] arr = new long[nums.size()];\n            for (int i = 0; i < nums.size(); i++) arr[i] = nums.get(i);\n            return arr;\n        } else if (type == double[].class) {\n            double[] arr = new double[nums.size()];\n            for (int i = 0; i < nums.size(); i++) arr[i] = nums.get(i).doubleValue();\n            return arr;\n        } else if (List.class.isAssignableFrom(type)) {\n            List<Integer> list = new ArrayList<>();\n            for (Long n : nums) list.add(n.intValue());\n            return list;\n        }\n        return new int[0];\n    }\n\n    private static String cleanNumber(String s) {\n        return s.replaceAll(\"[^0-9\\\\-.]\", \"\");\n    }\n\n    private static void printResult(Object res) {\n        if (res == null) {\n            System.out.println(\"[]\");\n            return;\n        }\n        // ListNode\n        if (res.getClass().getSimpleName().equals(\"ListNode\")) {\n            printListNode(res);\n            return;\n        }\n        // TreeNode\n        if (res.getClass().getSimpleName().equals(\"TreeNode\")) {\n            printTreeNode(res);\n            return;\n        }\n        // 2D int[][]\n        if (res instanceof int[][]) {\n            int[][] mat = (int[][]) res;\n            System.out.print(\"[\");\n            for (int i = 0; i < mat.length; i++) {\n                System.out.print(\"[\");\n                for (int j = 0; j < mat[i].length; j++) {\n                    System.out.print(mat[i][j] + (j < mat[i].length - 1 ? \",\" : \"\"));\n                }\n                System.out.print(\"]\" + (i < mat.length - 1 ? \",\" : \"\"));\n            }\n            System.out.println(\"]\");\n            return;\n        }\n        // 2D char[][]\n        if (res instanceof char[][]) {\n            char[][] mat = (char[][]) res;\n            System.out.print(\"[\");\n            for (int i = 0; i < mat.length; i++) {\n                System.out.print(\"[\");\n                for (int j = 0; j < mat[i].length; j++) {\n                    System.out.print(\"\\\"\" + mat[i][j] + \"\\\"\" + (j < mat[i].length - 1 ? \",\" : \"\"));\n                }\n                System.out.print(\"]\" + (i < mat.length - 1 ? \",\" : \"\"));\n            }\n            System.out.println(\"]\");\n            return;\n        }\n        // 2D String[][]\n        if (res instanceof String[][]) {\n            String[][] mat = (String[][]) res;\n            System.out.print(\"[\");\n            for (int i = 0; i < mat.length; i++) {\n                System.out.print(\"[\");\n                for (int j = 0; j < mat[i].length; j++) {\n                    System.out.print(\"\\\"\" + mat[i][j] + \"\\\"\" + (j < mat[i].length - 1 ? \",\" : \"\"));\n                }\n                System.out.print(\"]\" + (i < mat.length - 1 ? \",\" : \"\"));\n            }\n            System.out.println(\"]\");\n            return;\n        }\n        // 1D int[]\n        if (res instanceof int[]) {\n            int[] arr = (int[]) res;\n            System.out.print(\"[\");\n            for (int i = 0; i < arr.length; i++) {\n                System.out.print(arr[i] + (i < arr.length - 1 ? \",\" : \"\"));\n            }\n            System.out.println(\"]\");\n            return;\n        }\n        // 1D long[]\n        if (res instanceof long[]) {\n            long[] arr = (long[]) res;\n            System.out.print(\"[\");\n            for (int i = 0; i < arr.length; i++) {\n                System.out.print(arr[i] + (i < arr.length - 1 ? \",\" : \"\"));\n            }\n            System.out.println(\"]\");\n            return;\n        }\n        // 1D char[]\n        if (res instanceof char[]) {\n            char[] arr = (char[]) res;\n            System.out.print(\"[\");\n            for (int i = 0; i < arr.length; i++) {\n                System.out.print(\"\\\"\" + arr[i] + \"\\\"\" + (i < arr.length - 1 ? \",\" : \"\"));\n            }\n            System.out.println(\"]\");\n            return;\n        }\n        // 1D String[]\n        if (res instanceof String[]) {\n            String[] arr = (String[]) res;\n            System.out.print(\"[\");\n            for (int i = 0; i < arr.length; i++) {\n                System.out.print(\"\\\"\" + arr[i] + \"\\\"\" + (i < arr.length - 1 ? \",\" : \"\"));\n            }\n            System.out.println(\"]\");\n            return;\n        }\n        // 1D boolean[]\n        if (res instanceof boolean[]) {\n            boolean[] arr = (boolean[]) res;\n            System.out.print(\"[\");\n            for (int i = 0; i < arr.length; i++) {\n                System.out.print(arr[i] + (i < arr.length - 1 ? \",\" : \"\"));\n            }\n            System.out.println(\"]\");\n            return;\n        }\n        // Collection / List\n        if (res instanceof Collection) {\n            System.out.println(res.toString().replaceAll(\"\\\\s+\", \"\"));\n            return;\n        }\n        System.out.println(res);\n    }\n}\n";

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
    .replace(/->/g, ' ')
    .replace(/"/g, '')
    .replace(/'/g, '')
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
      if (stdout.length > 500000) {
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

      // Auto-inject ListNode and TreeNode if not already declared in user Solution code
      if (!/\bclass\s+ListNode\b/.test(rawCode)) {
        const listNodeFilePath = path.join(tempDir, 'ListNode.java');
        await fs.writeFile(listNodeFilePath, LIST_NODE_CODE, 'utf8');
        filesToCompile.push(listNodeFilePath);
      }
      if (!/\bclass\s+TreeNode\b/.test(rawCode)) {
        const treeNodeFilePath = path.join(tempDir, 'TreeNode.java');
        await fs.writeFile(treeNodeFilePath, TREE_NODE_CODE, 'utf8');
        filesToCompile.push(treeNodeFilePath);
      }

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
          overallStatus = caseResult.status === 'Success' ? 'Wrong Answer' : caseResult.status;
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
