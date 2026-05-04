const express = require('express');
const router = express.Router();
const { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getCategories)
  .post(protect, authorize('admin', 'librarian'), createCategory);

router.route('/:id')
  .put(protect, authorize('admin', 'librarian'), updateCategory)
  .delete(protect, authorize('admin', 'librarian'), deleteCategory);

module.exports = router;
