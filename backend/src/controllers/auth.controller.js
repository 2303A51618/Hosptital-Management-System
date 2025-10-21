import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

const cookieOpts = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAMESITE,
  path: '/',
};

const signTokens = (userId) => {
  const access = jwt.sign({ id: userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
  const refresh = jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
  return { access, refresh };
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      res.status(409);
      throw new Error('Email already registered');
    }
    const user = await User.create({ name, email, password, role, phone });
    const { access, refresh } = signTokens(user._id);
    res
      .cookie('access_token', access, { ...cookieOpts, maxAge: 15 * 60 * 1000 })
      .cookie('refresh_token', refresh, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 })
      .status(201)
      .json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid credentials');
    }
    const { access, refresh } = signTokens(user._id);
    res
      .cookie('access_token', access, { ...cookieOpts, maxAge: 15 * 60 * 1000 })
      .cookie('refresh_token', refresh, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 })
      .json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res) => {
  res.json({ user: req.user });
};

export const logout = async (req, res) => {
  res
    .clearCookie('access_token', { path: '/' })
    .clearCookie('refresh_token', { path: '/' })
    .json({ message: 'Logged out' });
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) {
      res.status(401);
      throw new Error('No refresh token');
    }
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    const { access } = { access: jwt.sign({ id: decoded.id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN }) };
    res.cookie('access_token', access, { ...cookieOpts, maxAge: 15 * 60 * 1000 }).json({ ok: true });
  } catch (err) {
    next(err);
  }
};
