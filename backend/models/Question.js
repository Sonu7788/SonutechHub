import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String, default: '' }
}, { _id: false });

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false }
}, { _id: false });

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Question title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  tags: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  inputFormat: {
    type: String,
    default: ''
  },
  outputFormat: {
    type: String,
    default: ''
  },
  constraints: {
    type: String,
    default: ''
  },
  examples: [exampleSchema],
  testCases: [testCaseSchema],
  starterCode: {
    type: String,
    default: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Read input from standard input
        
        // Your code here
        
    }
}`
  },
  driverCode: {
    type: String,
    default: '' // optional wrapper
  },
  hints: [{
    type: String
  }],
  order: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Question', questionSchema);
