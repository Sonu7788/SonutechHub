import mongoose from 'mongoose';

const codeExampleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Example title is required'],
    trim: true
  },
  problemDescription: {
    type: String,
    default: ''
  },
  code: {
    type: String,
    required: [true, 'Example code is required']
  },
  language: {
    type: String,
    default: 'java'
  },
  explanation: {
    type: String,
    required: [true, 'Example explanation is required']
  }
}, { _id: true });

const patternSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Pattern title is required'],
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
    required: [true, 'Category reference is required']
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'All Levels'],
    default: 'All Levels'
  },
  description: {
    type: String,
    required: [true, 'Pattern description/intuition is required']
  },
  timeComplexity: {
    type: String,
    default: 'O(N)'
  },
  spaceComplexity: {
    type: String,
    default: 'O(1)'
  },
  keyTakeaways: [{
    type: String
  }],
  codeExamples: [codeExampleSchema],
  order: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Pattern', patternSchema);
