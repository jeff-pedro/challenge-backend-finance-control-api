import checkAPIs from 'express-validator';
import mongoose from 'mongoose';
import dataDuplicated from './dataDuplicated.js';

const { checkSchema, check, validationResult } = checkAPIs;

/*
* Middleware to validates if fields exists
*/
export const fieldsExist = [
  check('description', 'The description field is required').exists(),
  check('value', 'The value field is required').exists(),
  check('date', 'The date field is required').exists(),
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
    description: {
      in: ['body'],
      trim: true,
      isAlphanumeric: {
        if: ((_, { req }) => {
          if (req.body.description) {
            return true;
          }
          return false;
        }),
        options: [
          'pt-BR',
          { ignore: ' -' },
        ],
      },
      isNumeric: {
        negated: true,
      },
      errorMessage: 'The description must be a string',
    },
    value: {
      in: ['body'],
      isNumeric: {
        // if the field was provided...
        if: ((value, { req }) => {
          if (req.body.value) {
            return true;
          }
          return false;
        }),
        bail: true,
        errorMessage: 'The value must be a number',
      },
      isFloat: {
        options: { min: 0 },
        errorMessage: 'The value must not be zero or less',
      },
    },
    date: {
      in: ['body'],
      trim: true,
      isDate: {
        // if the field was provided...
        if: ((value, { req }) => {
          if (req.body.date) {
            return true;
          }
          return false;
        }),
      },
      errorMessage: 'The date must be yyyy-mm-dd format',
    },
  }),
  (req, res, next) => {
    // remove objects with empty values (work around)
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] === '') {
        delete req.body[key];
      }
    });

    // reject any requests without a body
    if (Object.keys(req.body).length === 0) {
      return res.status(422).json({ errors: { msg: 'Empty object' } });
    }

    // reject request that not pass in validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];

/*
* Middleware to validates MongoDB ObjectId
*/
export const validID = [
  check('id', 'Invalid id').custom((value) => mongoose.isValidObjectId(value)),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(404).json({ errors: errors.array() });
    } else {
      next();
    }
  },
];

export {
  dataDuplicated,
};
