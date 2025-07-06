import dotenv from 'dotenv';
dotenv.config();
import createError from 'http-errors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Session from '../models/sessionModel.js';

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;
const ACCESS_EXPIRES = 15 * 60 * 1000; 
const REFRESH_EXPIRES = 30 * 24 * 60 * 60 * 1000; 

export const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw createError(409, 'Email in use');
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });
  return user;
};

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
  const accessTokenValidUntil = new Date(Date.now() + ACCESS_EXPIRES);
  const refreshTokenValidUntil = new Date(Date.now() + REFRESH_EXPIRES);
  return { accessToken, refreshToken, accessTokenValidUntil, refreshTokenValidUntil };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw createError(401, 'Email or password is wrong');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw createError(401, 'Email or password is wrong');
  }

  await Session.deleteMany({ userId: user._id });
  const tokens = generateTokens(user._id.toString());
  const session = await Session.create({ userId: user._id, ...tokens });
  return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, sessionId: session._id };
};

export const refreshSession = async (oldRefreshToken) => {
  if (!oldRefreshToken) {
    throw createError(401, 'No refresh token');
  }
  let payload;
  try {
    payload = jwt.verify(oldRefreshToken, REFRESH_TOKEN_SECRET);
  } catch {
    throw createError(401, 'Invalid refresh token');
  }
  const existingSession = await Session.findOne({ refreshToken: oldRefreshToken });
  if (!existingSession) {
    throw createError(401, 'Session not found');
  }
  await Session.deleteOne({ _id: existingSession._id });
  const tokens = generateTokens(payload.userId);
  const session = await Session.create({ userId: payload.userId, ...tokens });
  return { accessToken: tokens.accessToken, newRefreshToken: tokens.refreshToken, sessionId: session._id };
};

export const logoutUser = async (refreshToken) => {
  if (refreshToken) {
    await Session.deleteOne({ refreshToken });
  }
};
