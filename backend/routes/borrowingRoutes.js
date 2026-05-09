const express = require('express');
const router = express.Router();
const { borrowBook, returnBook, getBorrowingHistory, getAllBorrowings, clearBorrowing, deleteBorrowing } = require('../controllers/borrowingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/borrow', protect, borrowBook);
router.post('/return/:id', protect, returnBook);
router.get('/history', protect, getBorrowingHistory);
router.get('/all', protect, authorize('admin'), getAllBorrowings);
router.post('/clear/:id', protect, authorize('admin'), clearBorrowing);
router.delete('/:id', protect, authorize('admin'), deleteBorrowing);

module.exports = router;
