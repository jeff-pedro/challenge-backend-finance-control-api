import { Router } from 'express';
import Summary from '../controller/summaryController.js';
import authenticate from '../auth/middlewareAuth.js';

const router = Router();

router
  .get(
    '/summary/:year/:month',
    authenticate.bearer,
    Summary.monthSummary,
  );

export default router;
