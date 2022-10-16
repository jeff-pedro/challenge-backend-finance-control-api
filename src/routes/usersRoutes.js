import express from 'express';
import UserController from '../controller/userController.js';
import * as validate from '../helpers/usersValidate.js';

const router = express.Router();

router
  .get('/users', UserController.findUsers)
  .get(
    '/users/:id',
    validate.isValidId,
    UserController.findUserById,
  )
  .post(
    '/users',
    validate.fieldsExist,
    validate.fieldsFormat,
    validate.dataDuplicated,
    UserController.createUser,
  )
  .put(
    '/users/:id',
    validate.isValidId,
    validate.fieldsFormat,
    validate.dataDuplicated,
    UserController.updateUser,
  )
  .delete('/users/:id', UserController.deleteUser);

export default router;
