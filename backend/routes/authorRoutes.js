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
  .post(protect, authorize('admin', 'librarian'), createAuthor);

router.route('/:id')
  .put(protect, authorize('admin', 'librarian'), updateAuthor)
  .delete(protect, authorize('admin', 'librarian'), deleteAuthor);

module.exports = router;
