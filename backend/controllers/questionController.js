import Question from '../models/Question.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import { parseQuestionsFromBuffer, generateSampleExcelBuffer } from '../utils/excelParser.js';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// @route GET /api/questions
export const getQuestions = async (req, res) => {
  try {
    const { category, difficulty, search, tag, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        filter.category = category;
      } else {
        const cat = await Category.findOne({ slug: category });
        if (cat) filter.category = cat._id;
      }
    }

    if (difficulty && difficulty !== 'All') {
      filter.difficulty = difficulty;
    }

    if (tag) {
      filter.tags = tag;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .populate('category', 'name slug color icon')
        .select('-testCases')
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Question.countDocuments(filter)
    ]);

    res.json({
      success: true,
      count: questions.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      questions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/questions/:idOrSlug
export const getQuestion = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let question = null;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      question = await Question.findById(idOrSlug).populate('category', 'name slug color icon');
    }
    if (!question) {
      question = await Question.findOne({ slug: idOrSlug }).populate('category', 'name slug color icon');
    }

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const isUserAdmin = req.user && req.user.role === 'admin';
    const questionObj = question.toObject();

    if (!isUserAdmin) {
      questionObj.testCases = questionObj.testCases.filter(tc => !tc.isHidden);
    }

    // Retrieve user's saved code if logged in
    let savedCode = null;
    if (req.user) {
      const user = await User.findById(req.user._id);
      const savedEntry = user?.savedCodes?.find(s => s.question.toString() === question._id.toString());
      if (savedEntry) {
        savedCode = savedEntry.code;
      }
    }
    questionObj.savedCode = savedCode;

    res.json({
      success: true,
      question: questionObj
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/questions (Admin only)
export const createQuestion = async (req, res) => {
  try {
    const {
      title,
      category,
      difficulty,
      tags,
      description,
      inputFormat,
      outputFormat,
      constraints,
      examples,
      testCases,
      starterCode,
      hints
    } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ success: false, message: 'Title, Category, and Description are required' });
    }

    const slug = slugify(title) + '-' + Date.now().toString(36);

    const question = await Question.create({
      title,
      slug,
      category,
      difficulty: difficulty || 'Easy',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      description,
      inputFormat: inputFormat || '',
      outputFormat: outputFormat || '',
      constraints: constraints || '',
      examples: examples || [],
      testCases: testCases || [],
      starterCode: starterCode || undefined,
      hints: Array.isArray(hints) ? hints : (hints ? hints.split(',').map(h => h.trim()) : [])
    });

    res.status(201).json({ success: true, question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/questions/:id (Admin only)
export const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const {
      title,
      category,
      difficulty,
      tags,
      description,
      inputFormat,
      outputFormat,
      constraints,
      examples,
      testCases,
      starterCode,
      hints,
      order
    } = req.body;

    if (title && title !== question.title) {
      question.title = title;
      question.slug = slugify(title) + '-' + question._id.toString().substring(18);
    }

    if (category) question.category = category;
    if (difficulty) question.difficulty = difficulty;
    if (tags !== undefined) question.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    if (description !== undefined) question.description = description;
    if (inputFormat !== undefined) question.inputFormat = inputFormat;
    if (outputFormat !== undefined) question.outputFormat = outputFormat;
    if (constraints !== undefined) question.constraints = constraints;
    if (examples !== undefined) question.examples = examples;
    if (testCases !== undefined) question.testCases = testCases;
    if (starterCode !== undefined) question.starterCode = starterCode;
    if (hints !== undefined) question.hints = Array.isArray(hints) ? hints : hints.split(',').map(h => h.trim());
    if (order !== undefined) question.order = order;

    await question.save();
    res.json({ success: true, question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/questions/:id (Admin only)
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    await question.deleteOne();
    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/questions/bulk-upload (Admin only)
export const bulkUploadQuestions = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel or CSV file' });
    }

    const { questions, errors } = await parseQuestionsFromBuffer(req.file.buffer);

    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid questions found in file.',
        errors
      });
    }

    const inserted = await Question.insertMany(questions);

    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${inserted.length} question(s)!`,
      count: inserted.length,
      errors: errors.length > 0 ? errors : undefined,
      questions: inserted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/questions/template
export const downloadTemplate = async (req, res) => {
  try {
    const buffer = generateSampleExcelBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=dsa_questions_template.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
