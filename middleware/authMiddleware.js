import jwt from 'jsonwebtoken';
import User from '../model/User.js';

// Verify JWT token middleware
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      role: user.role,
      hospital: user.hospital
    };

    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token'
      });
    }

    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Role-based authorization middleware
export const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Hospital-specific authorization (for admin/doctor/labAssistant)
export const authorizeHospital = async (req, res, next) => {
  try {
    const { hospitalId } = req.params;
    
    if (!req.user.hospital) {
      return res.status(403).json({
        success: false,
        message: 'User not associated with any hospital'
      });
    }

    if (req.user.hospital.toString() !== hospitalId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied for this hospital'
      });
    }

    next();

  } catch (error) {
    console.error('Hospital authorization error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Optional authentication (for public endpoints that can benefit from user context)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    const user = await User.findById(decoded.userId).select('-password');
    if (user) {
      req.user = {
        userId: decoded.userId,
        role: user.role,
        hospital: user.hospital
      };
    }

    next();

  } catch (error) {
    next();
  }
};