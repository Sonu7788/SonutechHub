import Question from '../models/Question.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import { executeJavaCode } from '../utils/javaRunner.js';

// @route POST /api/execute/run
// Runs against visible test cases or custom input (Strictly Protected)
export const runCode = async (req, res) => {
  try {
    const { code, questionId, customInput } = req.body;
    const userId = req.user._id;

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Code cannot be empty' });
    }

    // Save working draft code for this user & question
    if (questionId) {
      await User.updateOne(
        { _id: userId, 'savedCodes.question': questionId },
        { 
          $set: { 
            'savedCodes.$.code': code,
            'savedCodes.$.updatedAt': new Date()
          } 
        }
      );
      // If not in savedCodes yet, push new entry
      await User.updateOne(
        { _id: userId, 'savedCodes.question': { $ne: questionId } },
        { 
          $push: { 
            savedCodes: { question: questionId, code, language: 'java', updatedAt: new Date() } 
          } 
        }
      );
    }

    // If custom input provided
    if (customInput !== undefined && customInput !== null && customInput !== '') {
      const result = await executeJavaCode(code, [], customInput);
      return res.json({
        success: true,
        isCustom: true,
        ...result
      });
    }

    // Otherwise run against question's sample/visible test cases
    let testCasesToRun = [];
    if (questionId) {
      const question = await Question.findById(questionId);
      if (question && question.testCases && question.testCases.length > 0) {
        // Run visible test cases for 'Run Code' button
        testCasesToRun = question.testCases.filter(tc => !tc.isHidden);
        if (testCasesToRun.length === 0) {
          testCasesToRun = question.testCases.slice(0, 2);
        }
      }
    }

    if (testCasesToRun.length === 0) {
      testCasesToRun = [{ input: '', expectedOutput: '', isHidden: false }];
    }

    const result = await executeJavaCode(code, testCasesToRun);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'Runtime Error',
      errorDetails: error.message
    });
  }
};

// @route POST /api/execute/submit
// Runs against ALL test cases (visible + hidden), records submission & updates user progress
export const submitCode = async (req, res) => {
  try {
    const { code, questionId } = req.body;
    const userId = req.user._id;

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Code cannot be empty' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const allTestCases = question.testCases || [];
    if (allTestCases.length === 0) {
      return res.status(400).json({ success: false, message: 'Question has no test cases configured' });
    }

    // Execute against all test cases
    const execResult = await executeJavaCode(code, allTestCases);

    // Create submission record with full code and execution metrics
    const submission = await Submission.create({
      user: userId,
      question: questionId,
      code,
      language: 'java',
      status: execResult.status,
      passedTestCases: execResult.passedCases || 0,
      totalTestCases: execResult.totalCases || allTestCases.length,
      executionTimeMs: execResult.executionTimeMs || 0,
      errorDetails: execResult.errorDetails || '',
      testResults: execResult.testResults || []
    });

    // Update user's latest saved code for this question
    await User.updateOne(
      { _id: userId, 'savedCodes.question': questionId },
      { 
        $set: { 
          'savedCodes.$.code': code,
          'savedCodes.$.updatedAt': new Date()
        } 
      }
    );
    await User.updateOne(
      { _id: userId, 'savedCodes.question': { $ne: questionId } },
      { 
        $push: { 
          savedCodes: { question: questionId, code, language: 'java', updatedAt: new Date() } 
        } 
      }
    );

    // If Accepted, add to user's solved list
    if (execResult.status === 'Accepted') {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { solvedQuestions: question._id }
      });
    }

    res.json({
      success: true,
      submissionId: submission._id,
      status: execResult.status,
      passed: execResult.passed,
      passedCases: execResult.passedCases,
      totalCases: execResult.totalCases,
      executionTimeMs: execResult.executionTimeMs,
      testResults: execResult.testResults,
      errorDetails: execResult.errorDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'Runtime Error',
      errorDetails: error.message
    });
  }
};
