import express from "express";
import IncomeController from "../controller/incomeController.js";

const router = express.Router();

router
    .get('/receitas', IncomeController.listAllIncomes)
    .get('/receitas/:id', IncomeController.listIncomeById)
    .post('/receitas', IncomeController.createIncome)
    .put('/receitas/:id', IncomeController.updateIncome)
    .delete('/receitas/:id', IncomeController.deleteIncome)

export default router;
