// routes/session.router.js
import express from 'express';
import passport from 'passport';
import {
  loginUser,
  logoutUser,
  githubLogin,
} from '../services/session.service.js';

const router = express.Router();

// Ruta de login de usuario
router.post(
  '/login',
  passport.authenticate('login', { session: false }),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(400).send('Login failed');
      }
      const token = loginUser(req.user);
      res.cookie('jwt', token, { httpOnly: true, secure: false });
      res.json({ token });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

// Ruta de logout de usuario
router.get('/logout', (req, res) => {
  try {
    logoutUser(res);
    res.redirect('/login');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Ruta para autenticarse con Github
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] }),
  async (req, res) => {}
);

// Callback de autenticación de Github
router.get(
  '/githubcallback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const token = githubLogin(req.user);
      res.cookie('jwt', token, { httpOnly: true, secure: false });
      res.redirect('/profile');
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

export default router;
