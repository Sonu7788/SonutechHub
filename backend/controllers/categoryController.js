import Category from '../models/Category.js';
import Question from '../models/Question.js';

// Helper slug generator
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// @route GET /api/categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, createdAt: 1 });

    // Aggregate question counts and difficulty breakdown per category
    const questions = await Question.find({}, 'category difficulty');
    const statsMap = {};

    questions.forEach(q => {
      const catId = q.category.toString();
      if (!statsMap[catId]) {
        statsMap[catId] = { total: 0, easy: 0, medium: 0, hard: 0 };
      }
      statsMap[catId].total++;
      if (q.difficulty === 'Easy') statsMap[catId].easy++;
      if (q.difficulty === 'Medium') statsMap[catId].medium++;
      if (q.difficulty === 'Hard') statsMap[catId].hard++;
    });

    const enrichedCategories = categories.map(cat => ({
      ...cat.toObject(),
      questionStats: statsMap[cat._id.toString()] || { total: 0, easy: 0, medium: 0, hard: 0 }
    }));

    res.json({
      success: true,
      categories: enrichedCategories
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/categories/:idOrSlug
export const getCategory = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let category = null;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(idOrSlug);
    }
    if (!category) {
      category = await Category.findOne({ slug: idOrSlug });
    }

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const questions = await Question.find({ category: category._id })
      .select('-testCases')
      .sort({ order: 1, createdAt: 1 });

    res.json({
      success: true,
      category,
      questions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/categories (Admin only)
export const createCategory = async (req, res) => {
  try {
    const { name, description, icon, color, order } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const slug = slugify(name);
    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists' });
    }

    const category = await Category.create({
      name,
      slug,
      description: description || '',
      icon: icon || 'Code',
      color: color || '#3B82F6',
      order: order || 0
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/categories/:id (Admin only)
export const updateCategory = async (req, res) => {
  try {
    const { name, description, icon, color, order } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (name && name !== category.name) {
      category.name = name;
      category.slug = slugify(name);
    }
    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (color !== undefined) category.color = color;
    if (order !== undefined) category.order = order;

    await category.save();
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/categories/:id (Admin only)
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Optional: Delete or reassign questions
    await Question.deleteMany({ category: category._id });
    await category.deleteOne();

    res.json({ success: true, message: 'Category and its questions deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
