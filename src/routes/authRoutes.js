import { Router } from 'express';
import AuthController from '../controller/authController.js';
import * as validate from '../helpers/usersValidate.js';
import authenticate from '../auth/middlewareAuth.js';

const route = Router();

route
  .post(
    '/register',
    validate.fieldsFormat,
    AuthController.register,
  )
  .post(
    '/login',
    authenticate.local,
    AuthController.login,
  )
  .post(
    '/logout',
    [
      authenticate.refresh,
      authenticate.bearer,
    ],
    AuthController.logout,
  )
  .post(
    '/update_token',
    authenticate.refresh,
    AuthController.login,
  );

export default route;
