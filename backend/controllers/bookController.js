const { Book, Author, Category } = require('../models');
const { Op } = require('sequelize');

exports.getBooks = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      category, 
      author,
      sortBy = 'createdAt',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { isbn: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (category) where.categoryId = category;
    if (author) where.authorId = author;

    const { count, rows } = await Book.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, order]],
      include: [
        { model: Author, as: 'author', attributes: ['name', 'id'] },
        { model: Category, as: 'category', attributes: ['name', 'id'] }
      ]
    });

    res.json({
      success: true,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id, {
      include: [
        { model: Author, as: 'author' },
        { model: Category, as: 'category' }
      ]
    });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBook = async (req, res) => {
  try {
    const bookData = { ...req.body };
    if (req.file) {
      bookData.coverImage = `/uploads/books/${req.file.filename}`;
    }
   
    if (bookData.stock) {
      bookData.availableStock = bookData.stock;
    }
    const book = await Book.create(bookData);
    res.status(201).json({ success: true, data: book });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    
    const bookData = { ...req.body };
    if (req.file) {
      bookData.coverImage = `/uploads/books/${req.file.filename}`;
    }
    
    await book.update(bookData);
    res.json({ success: true, data: book });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    
    await book.destroy();
    res.json({ success: true, message: 'Book removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
