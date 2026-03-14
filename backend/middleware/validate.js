const { body, validationResult } = require("express-validator");

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const registerValidation = [
  body("name").trim().isLength({ min: 2, max: 50 }).withMessage("Name must be 2–50 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  handleValidation,
];

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidation,
];

const taskValidation = [
  body("title").trim().isLength({ min: 3, max: 100 }).withMessage("Title must be 3–100 characters"),
  body("description").optional().trim().isLength({ max: 1000 }).withMessage("Description cannot exceed 1000 characters"),
  body("status").optional().isIn(["todo", "in-progress", "done"]).withMessage("Status must be todo, in-progress, or done"),
  handleValidation,
];

const taskUpdateValidation = [
  body("title").optional().trim().isLength({ min: 3, max: 100 }).withMessage("Title must be 3–100 characters"),
  body("description").optional().trim().isLength({ max: 1000 }).withMessage("Description cannot exceed 1000 characters"),
  body("status").optional().isIn(["todo", "in-progress", "done"]).withMessage("Status must be todo, in-progress, or done"),
  handleValidation,
];

module.exports = { registerValidation, loginValidation, taskValidation, taskUpdateValidation };
