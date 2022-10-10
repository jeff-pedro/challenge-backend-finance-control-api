import express from 'express';
import IncomeController from '../controller/incomeController.js';
import * as validate from '../validations/incomesValidate.js';
import Income from '../model/Income.js';

const router = express.Router();

router
  .get('/incomes', IncomeController.findIncomes)
  .get('/incomes/:id', validate.validID, IncomeController.findIncomeById)
  .get('/incomes/:year/:month', IncomeController.findIncomesByMonth)
  .post(
    '/incomes',
    validate.fieldsExist,
    validate.fieldsFormat,
    validate.dataDuplicated(Income),
    IncomeController.createIncome,
  )
  .put(
    '/incomes/:id',
    validate.validID,
    validate.fieldsFormat,
    validate.dataDuplicated(Income),
    IncomeController.updateIncome,
  )
  .delete('/incomes/:id', validate.validID, IncomeController.deleteIncome);

export default router;
