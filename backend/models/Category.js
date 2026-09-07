import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'Code' // Lucide icon name
  },
  color: {
    type: String,
    default: '#3B82F6' // hex color
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Category', categorySchema);
