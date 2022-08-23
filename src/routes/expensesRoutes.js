import express from "express";
import ExpenseController from "../controller/expenseController.js";

const router = express.Router();

router
    .get('/despesas', ExpenseController.listAllExpenses)
    .get('/despesas/:id', ExpenseController.listExpenseById)
    .post('/despesas', ExpenseController.createExpense)
    .put('/despesas/:id', ExpenseController.updateExpense)
    .delete('/despesas/:id', ExpenseController.deleteExpense)

export default router;
