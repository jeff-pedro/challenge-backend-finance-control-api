import express from "express";
import IncomeController from "../controller/incomeController.js";

const router = express.Router();

router
    .get('/incomes', IncomeController.findIncomes)
    .get('/incomes/:id', IncomeController.findIncomeById)
    .get('/incomes/:year/:month', IncomeController.findIncomesByMonth)
    .post('/incomes', IncomeController.createIncome)
    .put('/incomes/:id', IncomeController.updateIncome)
    .delete('/incomes/:id', IncomeController.deleteIncome)

export default router;
