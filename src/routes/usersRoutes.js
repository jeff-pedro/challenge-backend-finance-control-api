import express from 'express';
import UserController from '../controller/userController.js';
import * as validate from '../helpers/usersValidate.js';
import authenticate from '../auth/middlewareAuth.js';

const router = express.Router();

router
  .get(
    '/users',
    authenticate.bearer,
    UserController.findUsers,
  )
  .get(
    '/users/:id',
    authenticate.bearer,
    validate.isValidId,
    UserController.findUserById,
  )
  .put(
    '/users/:id',
    authenticate.bearer,
    validate.isValidId,
    validate.fieldsFormat,
    validate.dataDuplicated,
    UserController.updateUser,
  )
  .delete(
    '/users/:id',
    authenticate.bearer,
    validate.isValidId,
    UserController.deleteUser,
  );

export default router;
