import express from "express";
import ExpenseController from "../controller/expenseController.js";

const router = express.Router();

router
    .get('/expenses', ExpenseController.findExpenses)
    .get('/expenses/:id', ExpenseController.findExpenseById)
    .post('/expenses', ExpenseController.createExpense)
    .put('/expenses/:id', ExpenseController.updateExpense)
    .delete('/expenses/:id', ExpenseController.deleteExpense)

export default router;
