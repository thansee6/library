const { User } = require('../models');

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json({ data: users });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = isActive;
    await user.save();
    res.json({ message: 'User updated successfully', data: user });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { username, email, role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();
    res.json({ message: 'User updated successfully', data: user });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { getUsers, updateUserStatus, deleteUser, updateUser };
