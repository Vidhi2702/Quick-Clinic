import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import apiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, roleModel } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      roleModel,
    });

    await user.save();
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    apiResponse(res, 201, userResponse, 'User created successfully');
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const filter = role ? { role } : {};
    
    const users = await User.find(filter)
      .select('-password')
      .populate('roleRef')
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const total = await User.countDocuments(filter);
    
    apiResponse(res, 200, {
      users,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: users.length,
        totalRecords: total
      }
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('roleRef');
      
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    apiResponse(res, 200, user);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const userId = req.params.id;
    
    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        throw new ApiError(409, 'Email already in use');
      }
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password').populate('roleRef');
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    apiResponse(res, 200, user, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    apiResponse(res, 200, null, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new ApiError(400, 'Current password is incorrect');
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();
    
    apiResponse(res, 200, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

export const userController = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
};