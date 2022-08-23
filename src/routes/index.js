import express from "express";
import incomes from "./incomesRoutes.js";
import expenses from "./expensesRoutes.js";

const routes = (app) => {
    app.route('/').get((req, res) => {
        res.status(200).send("Personal Finance API");
    });

    app.use(
        express.json(),
        incomes,
        expenses
    );
}

export default routes;
