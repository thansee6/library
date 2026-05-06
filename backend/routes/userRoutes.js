const express = require('express');
const router = express.Router();
const { getUsers, updateUserStatus, deleteUser, updateUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getUsers);

router.route('/:id/status')
  .put(updateUserStatus);

router.route('/:id')
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
