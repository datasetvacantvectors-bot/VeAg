import User from '../models/User.js';
import NameHistory from '../models/NameHistory.js';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

// Generate unique userId
const generateUserId = () => {
  return 'USER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Authenticate or create user
export const authenticateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, photoURL, firebaseUid } = req.body;

    // Check if user already exists by email
    let user = await User.findOne({ email });

    if (user) {
      // User exists, update photoURL if it has changed
      if (photoURL && user.photoURL !== photoURL) {
        user.photoURL = photoURL;
        await user.save();
      }

      const token = jwt.sign(
        { userId: user.userId, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Return existing user data with updated photoURL
      return res.status(200).json({
        message: 'User authenticated',
        token,
        userId: user.userId,
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          photoURL: user.photoURL,
          firebaseUid: user.firebaseUid
        }
      });
    }

    // Create new user if doesn't exist
    const userId = generateUserId();
    
    user = new User({
      userId,
      email,
      name,
      photoURL: photoURL || '',
      firebaseUid
    });

    await user.save();

    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      userId: user.userId,
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        photoURL: user.photoURL,
        firebaseUid: user.firebaseUid
      }
    });

  } catch (error) {
    // console.error('Error in authenticateUser:', error);
    res.status(500).json({ 
      message: 'Server error during authentication',
      error: error.message 
    });
  }
};

// Get user by userId
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Authorization check
    if (req.user.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden. You can only view your own profile.' });
    }

    const user = await User.findOne({ userId });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        photoURL: user.photoURL,
        firebaseUid: user.firebaseUid,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    // console.error('Error in getUserById:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Get user by email
export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    
    // Authorization check
    if (req.user.email !== email) {
      return res.status(403).json({ message: 'Forbidden. You can only view your own profile.' });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        photoURL: user.photoURL,
        firebaseUid: user.firebaseUid,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    // console.error('Error in getUserByEmail:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name } = req.body;

    // Authorization check
    if (req.user.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden. You can only update your own profile.' });
    }

    const user = await User.findOne({ userId });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow name updates
    if (name && name !== user.name) {
      // Store name change in history
      const nameHistory = new NameHistory({
        userId: user.userId,
        oldName: user.name,
        newName: name
      });
      
      await nameHistory.save();
      
      // Update user's name
      user.name = name;
      await user.save();
    }

    res.status(200).json({
      message: 'User profile updated successfully',
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        photoURL: user.photoURL,
        firebaseUid: user.firebaseUid
      }
    });

  } catch (error) {
    // console.error('Error in updateUserProfile:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Get name history for a user
export const getNameHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Authorization check
    if (req.user.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden. You can only view your own name history.' });
    }
    
    const totalItems = await NameHistory.countDocuments({ userId });
    const totalPages = Math.ceil(totalItems / limit);

    const history = await NameHistory.find({ userId })
      .sort({ changedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.status(200).json({
      history,
      currentPage: page,
      totalPages,
      totalItems
    });

  } catch (error) {
    // console.error('Error in getNameHistory:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Verify user token and return user
export const verifyUserToken = async (req, res) => {
  try {
    const { userId } = req.user;
    
    const user = await User.findOne({ userId });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      valid: true,
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        photoURL: user.photoURL,
        firebaseUid: user.firebaseUid
      }
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};
