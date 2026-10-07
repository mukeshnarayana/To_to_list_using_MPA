const jwt = require('jsonwebtoken');
const User = require('../models/users');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'supersecret_jwt_key_todo_app',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};


const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    //const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      statuscode: 200,
      message: "user account created successfully",
      // user: {
      //   _id: user._id,
      //   name: user.name,
      //   email: user.email,
      //   createdAt: user.createdAt,
      //   updatedAt: user.updatedAt,
      // },
      // token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: error.message || 'Server error during signup' });
  }
};


const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user and explicitly select password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      // user: {
      //   _id: user._id,
      //   name: user.name,
      //   email: user.email,
      //   createdAt: user.createdAt,
      //   updatedAt: user.updatedAt,
      // },
      success: true,
      statuscode: 200,
      message: "user login successfully",
      token
    });
  } catch (error) {
    console.error('Signin error:', error);
    return res.status(500).json({ message: error.message || 'Server error during signin' });
  }
};


const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: error.message || 'Server error fetching user profile' });
  }
};

module.exports = {
  signup,
  signin,
  getMe,
};
