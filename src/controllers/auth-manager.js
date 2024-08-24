import jwt from 'jsonwebtoken';
import config from '../config/config.js';

const JWT_SECRET = config.jwt_secret;

export const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };
  console.log('JWT_SECRET used to sign:', JWT_SECRET); // Añadir este log para verificar el secreto usado
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  return token;
};
