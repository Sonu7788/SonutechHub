import Pattern from '../models/Pattern.js';
import Category from '../models/Category.js';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// @route GET /api/patterns
export const getAllPatterns = async (req, res) => {
  try {
    const { category, search, difficulty } = req.query;
    const filter = { isPublished: true };

    if (category && category !== 'all') {
      // Find category by slug or id
      const catObj = await Category.findOne({
        $or: [{ slug: category.toLowerCase() }, { _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }]
      });
      if (catObj) {
        filter.category = catObj._id;
      }
    }

    if (difficulty && difficulty !== 'All') {
      filter.difficulty = difficulty;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const patterns = await Pattern.find(filter)
      .populate('category', 'name slug color icon')
      .sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      count: patterns.length,
      patterns
    });
  } catch (error) {
    console.error('Error fetching patterns:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/patterns/:idOrSlug
export const getPatternByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug.toLowerCase() };
    const pattern = await Pattern.findOne(query).populate('category', 'name slug color icon');

    if (!pattern) {
      return res.status(404).json({ success: false, message: 'Pattern not found' });
    }

    // Fetch related patterns in same category
    const relatedPatterns = await Pattern.find({
      category: pattern.category._id,
      _id: { $ne: pattern._id },
      isPublished: true
    }).select('title slug difficulty timeComplexity');

    res.json({
      success: true,
      pattern,
      relatedPatterns
    });
  } catch (error) {
    console.error('Error fetching pattern:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/patterns (Admin only)
export const createPattern = async (req, res) => {
  try {
    const {
      title,
      category,
      difficulty,
      description,
      timeComplexity,
      spaceComplexity,
      keyTakeaways,
      codeExamples,
      order,
      isPublished
    } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, and description are required.'
      });
    }

    // Verify category exists
    const catObj = await Category.findById(category);
    if (!catObj) {
      return res.status(400).json({ success: false, message: 'Invalid category specified.' });
    }

    let slug = slugify(title);
    // Ensure slug uniqueness
    const existing = await Pattern.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const pattern = await Pattern.create({
      title: title.trim(),
      slug,
      category,
      difficulty: difficulty || 'All Levels',
      description,
      timeComplexity: timeComplexity || 'O(N)',
      spaceComplexity: spaceComplexity || 'O(1)',
      keyTakeaways: Array.isArray(keyTakeaways) ? keyTakeaways : [],
      codeExamples: Array.isArray(codeExamples) ? codeExamples : [],
      order: order ? parseInt(order, 10) : 0,
      isPublished: isPublished !== undefined ? isPublished : true
    });

    const populated = await Pattern.findById(pattern._id).populate('category', 'name slug color icon');

    res.status(201).json({
      success: true,
      message: 'Pattern note created successfully',
      pattern: populated
    });
  } catch (error) {
    console.error('Error creating pattern:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/patterns/:id (Admin only)
export const updatePattern = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      difficulty,
      description,
      timeComplexity,
      spaceComplexity,
      keyTakeaways,
      codeExamples,
      order,
      isPublished
    } = req.body;

    const pattern = await Pattern.findById(id);
    if (!pattern) {
      return res.status(404).json({ success: false, message: 'Pattern not found' });
    }

    if (title && title.trim() !== pattern.title) {
      pattern.title = title.trim();
      pattern.slug = slugify(title);
    }

    if (category) {
      const catObj = await Category.findById(category);
      if (!catObj) {
        return res.status(400).json({ success: false, message: 'Invalid category specified.' });
      }
      pattern.category = category;
    }

    if (difficulty !== undefined) pattern.difficulty = difficulty;
    if (description !== undefined) pattern.description = description;
    if (timeComplexity !== undefined) pattern.timeComplexity = timeComplexity;
    if (spaceComplexity !== undefined) pattern.spaceComplexity = spaceComplexity;
    if (keyTakeaways !== undefined) pattern.keyTakeaways = keyTakeaways;
    if (codeExamples !== undefined) pattern.codeExamples = codeExamples;
    if (order !== undefined) pattern.order = parseInt(order, 10);
    if (isPublished !== undefined) pattern.isPublished = isPublished;

    await pattern.save();

    const updated = await Pattern.findById(pattern._id).populate('category', 'name slug color icon');

    res.json({
      success: true,
      message: 'Pattern note updated successfully',
      pattern: updated
    });
  } catch (error) {
    console.error('Error updating pattern:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/patterns/:id (Admin only)
export const deletePattern = async (req, res) => {
  try {
    const { id } = req.params;
    const pattern = await Pattern.findByIdAndDelete(id);

    if (!pattern) {
      return res.status(404).json({ success: false, message: 'Pattern not found' });
    }

    res.json({
      success: true,
      message: 'Pattern note deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting pattern:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
