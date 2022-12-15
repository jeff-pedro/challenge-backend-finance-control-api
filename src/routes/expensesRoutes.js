import express from 'express';
import ExpenseController from '../controller/expenseController.js';
import Expenses from '../model/Expense.js';
import * as validate from '../helpers/expensesValidate.js';
import authenticate from '../auth/middlewareAuth.js';

const router = express.Router();

router
  .get(
    '/expenses',
    authenticate.bearer,
    ExpenseController.findExpenses,
  )
  .get(
    '/expenses/:id',
    authenticate.bearer,
    validate.validID,
    ExpenseController.findExpenseById,
  )
  .get(
    '/expenses/:year/:month',
    authenticate.bearer,
    ExpenseController.findExpenseByMonth,
  )
  .post(
    '/expenses',
    authenticate.bearer,
    validate.fieldsExist,
    validate.fieldsFormat,
    validate.dataDuplicated(Expenses),
    ExpenseController.createExpense,
  )
  .put(
    '/expenses/:id',
    authenticate.bearer,
    validate.validID,
    validate.fieldsFormat,
    validate.dataDuplicated(Expenses),
    ExpenseController.updateExpense,
  )
  .delete(
    '/expenses/:id',
    authenticate.bearer,
    validate.validID,
    ExpenseController.deleteExpense,
  );

export default router;
