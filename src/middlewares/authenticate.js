import createError from 'http-errors';
import jwt from 'jsonwebtoken';
import Session from '../models/sessionModel.js';
import User from '../models/userModel.js';

const { ACCESS_TOKEN_SECRET } = process.env;

const authenticate = async (req, res, next) => {
  const authHeader = req.get('Authorization') || '';
  const [, token] = authHeader.split(' ');
  if (!token) {
    return next(createError(401, 'Not authorized'));
  }
  let payload;
  try {
    payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(createError(401, 'Access token expired'));
    }
    return next(createError(401, 'Invalid token'));
  }
  const session = await Session.findOne({ accessToken: token });
  if (!session) {
    return next(createError(401, 'Session not found'));
  }
  const user = await User.findById(payload.userId);
  if (!user) {
    return next(createError(401, 'User not found'));
  }
  req.user = user;
  req.sessionId = session._id;
  next();
};

export default authenticate;