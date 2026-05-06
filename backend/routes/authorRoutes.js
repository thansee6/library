const express = require('express');
const router = express.Router();
const { 
  getAuthors, 
  createAuthor, 
  updateAuthor, 
  deleteAuthor 
} = require('../controllers/authorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAuthors)
  .post(protect, authorize('admin'), createAuthor);

router.route('/:id')
  .put(protect, authorize('admin'), updateAuthor)
  .delete(protect, authorize('admin'), deleteAuthor);

module.exports = router;
