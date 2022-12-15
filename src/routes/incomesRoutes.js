import express from 'express';
import IncomeController from '../controller/incomeController.js';
import * as validate from '../helpers/incomesValidate.js';
import authenticate from '../auth/middlewareAuth.js';
import Income from '../model/Income.js';

const router = express.Router();

router
  .get(
    '/incomes',
    authenticate.bearer,
    IncomeController.findIncomes,
  )
  .get(
    '/incomes/:id',
    authenticate.bearer,
    validate.validID,
    IncomeController.findIncomeById,
  )
  .get(
    '/incomes/:year/:month',
    authenticate.bearer,
    IncomeController.findIncomesByMonth,
  )
  .post(
    '/incomes',
    authenticate.bearer,
    validate.fieldsExist,
    validate.fieldsFormat,
    validate.dataDuplicated(Income),
    IncomeController.createIncome,
  )
  .put(
    '/incomes/:id',
    authenticate.bearer,
    validate.validID,
    validate.fieldsFormat,
    validate.dataDuplicated(Income),
    IncomeController.updateIncome,
  )
  .delete(
    '/incomes/:id',
    authenticate.bearer,
    validate.validID,
    IncomeController.deleteIncome,
  );

export default router;
