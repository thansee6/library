const express = require('express');
const router = express.Router();
const { 
  getBooks, 
  getBook, 
  createBook, 
  updateBook, 
  deleteBook 
} = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getBooks)
  .post(protect, authorize('admin', 'librarian'), createBook);

router.route('/:id')
  .get(getBook)
  .put(protect, authorize('admin', 'librarian'), updateBook)
  .delete(protect, authorize('admin', 'librarian'), deleteBook);

module.exports = router;
