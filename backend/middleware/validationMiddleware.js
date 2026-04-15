const { body, param, query, validationResult } = require('express-validator');

// Validation rules
const validationRules = {
  // User validation
  register: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters')
      .escape(),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('role')
      .optional()
      .isIn(['admin', 'client'])
      .withMessage('Role must be either admin or client')
  ],
  
  login: [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  // Booking validation
  createBooking: [
    body('eventType')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Event type must be between 2 and 50 characters')
      .escape(),
    body('eventDate')
      .isISO8601()
      .withMessage('Please provide a valid date')
      .toDate(),
    body('eventTime')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Please provide a valid time in HH:MM format'),
    body('venue')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Venue must be between 5 and 200 characters')
      .escape(),
    body('guestCount')
      .isInt({ min: 1, max: 10000 })
      .withMessage('Guest count must be between 1 and 10000'),
    body('packageType')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Package type must be between 2 and 100 characters')
      .escape(),
    body('totalAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Total amount must be a positive number')
  ],

  updateBooking: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Invalid booking ID'),
    ...validationRules.createBooking
  ],

  // Quotation validation
  createQuotation: [
    body('fullName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters')
      .escape(),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('contactNumber')
      .trim()
      .matches(/^[\+]?[0-9\s\-\(\)]{10,20}$/)
      .withMessage('Please provide a valid contact number'),
    body('eventType')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Event type must be between 2 and 50 characters')
      .escape(),
    body('preferredDate')
      .isISO8601()
      .withMessage('Please provide a valid date')
      .toDate(),
    body('guests')
      .isInt({ min: 1, max: 10000 })
      .withMessage('Number of guests must be between 1 and 10000'),
    body('venue')
      .optional()
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Venue must be between 5 and 200 characters')
      .escape()
  ],

  updateQuotation: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Invalid quotation ID'),
    ...validationRules.createQuotation
  ],

  // Payment validation
  createPayment: [
    body('bookingId')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Booking ID is required')
      .escape(),
    body('paymentType')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Payment type must be between 2 and 50 characters')
      .escape(),
    body('paymentMethod')
      .isIn(['cash', 'bank', 'gcash', 'paypal', 'credit_card'])
      .withMessage('Invalid payment method'),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0'),
    body('referenceNumber')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Reference number must be between 1 and 100 characters')
      .escape()
  ],

  updatePayment: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Invalid payment ID'),
    ...validationRules.createPayment
  ]
};

// Validation middleware
const validate = (rules) => {
  return async (req, res, next) => {
    await Promise.all(rules.map(rule => rule.run(req)));
    
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  };
};

module.exports = {
  validationRules,
  validate
};
