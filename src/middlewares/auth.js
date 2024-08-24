import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model.js';
import config from '../config/config.js';

const JWT_SECRET = config.jwt_secret;

import passport from 'passport';

export const authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  })(req, res, next);
};

/* export const authenticateJWT = async (req, res, next) => {
  const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];

  if (!token) {
    console.log('Access denied. No token provided.');
    return res.status(401).send('Access denied. No token provided.');
  }

  try {
    console.log('JWT_SECRET used to verify:', JWT_SECRET); 
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded:', decoded);

    const user = await UserModel.findById(decoded.id).lean();

    if (!user) {
      console.log('User not found.');
      return res.status(404).send('User not found');
    }

    req.user = user;
    console.log('User authenticated:', req.user);
    next();
  } catch (ex) {
    if (ex.name === 'TokenExpiredError') {
      console.log('Token expired at:', ex.expiredAt);
      return res.status(401).send('Token expired.');
    }
    console.log('Invalid token:', ex);
    res.status(400).send('Invalid token.');
  }
}; */

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    console.log('User is admin:', req.user);
    next();
  } else {
    console.log('Access denied: Only administrators can access this route.');
    res
      .status(403)
      .send('Access denied: Only administrators can access this route.');
  }
};

export const isPremium = (req, res, next) => {
  if (req.user && req.user.role === 'premium') {
    console.log('User is premium:', req.user);
    next();
  } else {
    console.log('Access denied: Only administrators can access this route.');
    res
      .status(403)
      .send('Access denied: Only administrators can access this route.');
  }
};

export const isUser = async (req, res, next) => {
  try {
    const userEmail = req.user.email;
    const user = await UserModel.findOne({ email: userEmail });
    if (user.role === 'user') {
      next(); // El usuario tiene el rol de usuario, continúa con la siguiente función middleware
    } else {
      res
        .status(403)
        .send('Access denied: Only regular users can access this route.');
    }
  } catch (error) {
    res.status(500).send('Internal server error');
  }
};

export const isAdminOrPremium = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'premium')) {
    console.log('User is admin or premium:', req.user);
    next();
  } else {
    console.log(
      'Access denied: Only administrators or premium users can access this route.'
    );
    res
      .status(403)
      .send(
        'Access denied: Only administrators or premium users can access this route.'
      );
  }
};
