import checkAPIs from 'express-validator';
import mongoose from 'mongoose';
import Users from '../model/User.js';

const { checkSchema, check, validationResult } = checkAPIs;

/*
* Middleware to validates if fields exists
*/
export const fieldsExist = [
  check('username', 'The username field is required').exists(),
  check('email', 'The email field is required').exists(),
  check('password', 'The password field is required').exists(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
    } else {
      next();
    }
  },
];

/*
* Middleware to validates fields format
*/
export const fieldsFormat = [
  checkSchema({
    username: {
      trim: true,
      toLowerCase: true,
      optional: { options: { nullable: true } },
      isAlphanumeric: true,
      isNumeric: { negated: true },
      errorMessage: 'Username must be a string',
    },
    email: {
      optional: { options: { nullable: true } },
      trim: true,
      isEmail: true,
      errorMessage: 'Email must be a valid format',
    },
    password: {
      optional: { options: { nullable: true } },
      isLength: {
        options: { min: 7 },
        errorMessage: 'Password should be at least 7 chars long',
      },
    },
  }),
  (req, res, next) => {
    // reject any requests without a body
    if (Object.keys(req.body).length === 0) {
      return res.status(422).json({ errors: { msg: 'Empty object' } });
    }

    // reject request that not pass in validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    return next();
  },
];

/*
* Middleware to validates MongoDB ObjectID
*/
export const isValidId = [
  check('id', 'Invalid ID').custom((value) => mongoose.isValidObjectId(value)),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    return next();
  },
];

/*
* Middleware to validate before saving to database if data already exists
*/
export const dataDuplicated = [
  async (req, res, next) => {
    const { username, email } = req.body;

    const errors = [];

    // checks if username exist
    if (username) {
      const result = await Users.findOne({ username }, 'username').exec();

      if (result !== null) {
        errors.push({ msg: `username: '${username}' already exist` });
      }
    }
    // checks if email exist
    if (email) {
      const result = await Users.findOne({ email }, 'email').exec();

      if (result !== null) {
        errors.push({ msg: `email: '${email}' already exist` });
      }
    }

    if (errors.length !== 0) {
      res.status(422).json({ errors });
    } else {
      next();
    }
  },
];
