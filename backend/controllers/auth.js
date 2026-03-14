const User = require("../models/User");
const { generateToken, setTokenCookie, clearTokenCookie } = require("../utils/jwt");
const { encryptPayload } = require("../utils/crypto");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email is already registered." });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    const payload = { id: user._id, name: user.name, email: user.email };

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: encryptPayload(payload),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Registration failed. Please try again." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    const payload = { id: user._id, name: user.name, email: user.email };

    res.json({
      success: true,
      message: "Logged in successfully.",
      user: encryptPayload(payload),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
};

const logout = (req, res) => {
  clearTokenCookie(res);
  res.json({ success: true, message: "Logged out successfully." });
};

const getMe = (req, res) => {
  const payload = { id: req.user._id, name: req.user.name, email: req.user.email };
  res.json({
    success: true,
    user: encryptPayload(payload),
  });
};

module.exports = { register, login, logout, getMe };
