const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

const sendAuth = (res, statusCode, user, created) => {
  const body = {
    success: true,
    token: generateToken(user._id),
    user: publicUser(user),
  };

  if (typeof created === 'boolean') {
    body.created = created;
  }

  res.status(statusCode).json(body);
};

const googleDisplayName = (payload) => {
  const source = (payload.name || payload.given_name || payload.email.split('@')[0] || 'User').trim();
  const clipped = source.slice(0, 50);
  return clipped.length >= 2 ? clipped : `${clipped} User`.slice(0, 50);
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });

  if (existing) {
    throw new ApiError(409, 'An account with this email already exists', [
      { field: 'email', message: 'An account with this email already exists' },
    ]);
  }

  const user = await User.create({ name, email, password });
  sendAuth(res, 201, user);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.password) {
    throw new ApiError(401, 'This account uses Google. Continue with Google to sign in.');
  }

  if (!(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  sendAuth(res, 200, user);
});

const googleAuth = asyncHandler(async (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new ApiError(500, 'Google sign-in is not configured');
  }

  const googleClient = new OAuth2Client(clientId);
  let payload;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: req.body.credential,
      audience: clientId,
    });
    payload = ticket.getPayload();
  } catch {
    throw new ApiError(401, 'Google sign-in failed. Please try again.');
  }

  if (!payload?.email || payload.email_verified !== true) {
    throw new ApiError(401, 'Google did not provide a verified email');
  }

  const email = payload.email.toLowerCase();
  const byGoogle = await User.findOne({ googleId: payload.sub });
  const byEmail = await User.findOne({ email });

  if (byGoogle && byEmail && String(byGoogle._id) !== String(byEmail._id)) {
    throw new ApiError(409, 'This Google account is already linked to another user');
  }

  const existing = byGoogle || byEmail;

  if (existing) {
    if (existing.googleId && existing.googleId !== payload.sub) {
      throw new ApiError(409, 'This email is already linked to a different Google account');
    }
    if (!existing.googleId) {
      existing.googleId = payload.sub;
      await existing.save();
    }
    sendAuth(res, 200, existing, false);
    return;
  }

  const user = await User.create({
    name: googleDisplayName(payload),
    email,
    googleId: payload.sub,
  });

  sendAuth(res, 201, user, true);
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: publicUser(req.user),
  });
});

module.exports = { register, login, googleAuth, getMe };
