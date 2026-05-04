const { Author } = require('../models');

exports.getAuthors = async (req, res) => {
  try {
    const authors = await Author.findAll({ order: [['name', 'ASC']] });
    res.json({ success: true, data: authors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAuthor = async (req, res) => {
  try {
    const author = await Author.create(req.body);
    res.status(201).json({ success: true, data: author });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateAuthor = async (req, res) => {
  try {
    const author = await Author.findByPk(req.params.id);
    if (!author) return res.status(404).json({ success: false, message: 'Author not found' });
    await author.update(req.body);
    res.json({ success: true, data: author });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteAuthor = async (req, res) => {
  try {
    const author = await Author.findByPk(req.params.id);
    if (!author) return res.status(404).json({ success: false, message: 'Author not found' });
    await author.destroy();
    res.json({ success: true, message: 'Author removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
