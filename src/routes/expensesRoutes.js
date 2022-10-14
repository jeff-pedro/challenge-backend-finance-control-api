import express from 'express';
import ExpenseController from '../controller/expenseController.js';
import Expenses from '../model/Expense.js';
import * as validade from '../validations/expensesValidate.js';

const router = express.Router();

router
  .get('/expenses', ExpenseController.findExpenses)
  .get('/expenses/:id', validade.validID, ExpenseController.findExpenseById)
  .get('/expenses/:year/:month', ExpenseController.findExpenseByMonth)
  .post(
    '/expenses',
    validade.fieldsExist,
    validade.fieldsFormat,
    validade.dataDuplicated(Expenses),
    ExpenseController.createExpense,
  )
  .put(
    '/expenses/:id',
    validade.validID,
    validade.fieldsFormat,
    validade.dataDuplicated(Expenses),
    ExpenseController.updateExpense,
  )
  .delete('/expenses/:id', validade.validID, ExpenseController.deleteExpense);

export default router;
