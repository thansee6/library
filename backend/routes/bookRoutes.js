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
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(getBooks)
  .post(protect, authorize('admin'), upload.single('coverImage'), createBook);

router.route('/:id')
  .get(getBook)
  .put(protect, authorize('admin'), upload.single('coverImage'), updateBook)
  .delete(protect, authorize('admin'), deleteBook);

module.exports = router;
