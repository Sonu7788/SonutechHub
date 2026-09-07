import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'java'
  },
  status: {
    type: String,
    enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Compilation Error', 'Runtime Error'],
    required: true
  },
  passedTestCases: {
    type: Number,
    default: 0
  },
  totalTestCases: {
    type: Number,
    default: 0
  },
  executionTimeMs: {
    type: Number,
    default: 0
  },
  memoryKb: {
    type: Number,
    default: 0
  },
  errorDetails: {
    type: String,
    default: ''
  },
  testResults: [{
    caseIndex: Number,
    passed: Boolean,
    input: String,
    expectedOutput: String,
    actualOutput: String,
    error: String,
    executionTimeMs: Number,
    isHidden: Boolean
  }]
}, {
  timestamps: true
});

export default mongoose.model('Submission', submissionSchema);
