const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      username,
      email,
      password,
      role: role || 'member'
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user.id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username) user.username = username;
    if (email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists && emailExists.id !== user.id) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    await user.save();

    res.json({
      _id: user.id,
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect old password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

