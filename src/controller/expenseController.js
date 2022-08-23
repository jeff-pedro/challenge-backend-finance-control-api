import Expenses from "../model/Expense.js"
import Validation from "./Validation.js";

class ExpenseController {

    static async listAllExpenses(req, res) {
        await Expenses.find((err, expenses) => {
            if (!err) {
                res.status(200).send(expenses);
            } else {
                res.status(400).send({ message: err.message });
            }
        }).clone();
    }

    static async listExpenseById(req, res) {
        const { id } = req.params;
        await Expenses.findById(id, (err, expense) => {
            if (!err) {
                res.status(200).send(expense);
            } else {
                res.status(400).send({ message: `${err.message} - Error: expense with id:${id} was not found.` });
            }
        }).clone();
    }

    static async createExpense(req, res) {

        const data = req.body;
        const duplicated = await Validation.isDuplicated(data, Expenses);

        if (!duplicated) {
            let expense = new Expenses(data);
            // create an "expense"
            expense.save((err) => {
                if (!err) {
                    res.status(201).json({ message: "Expense has been created." });
                } else {
                    res.status(500).json({ message: err.message });
                }
            });
        } else {
            res.json({ message: "This data aldeady exists. Expense hasn't been created." })
        }
    }

    static async updateExpense(req, res) {
        const { id } = req.params;
        const newData = req.body;

        let duplicated = await Validation.isDuplicated(newData, Expenses, id)

        if (!duplicated) {
            // update an "expense"
            await Expenses.findByIdAndUpdate(id, { $set: newData }, (err) => {
                if (!err) {
                    res.status(200).json({ message: `Expense has been updated.` });
                } else {
                    res.status(500).json({ message: `${err.message} - Error: expense with id:${id} hasn't been updated.` });
                }
            }).clone();
        } else {
            res.json({ message: "This object already exists. For update change the properties' values." })
        }
    }

    static async deleteExpense(req, res) {
        const { id } = req.params;
        await Expenses.findByIdAndDelete(id, (err) => {
            if (!err) {
                res.status(200).send({ message: `Expense with id:${id} has been deleted.` })
            } else {
                res.status(500).send({ message: `${err.message} - Error: expense with id:${id} hasn't deleted.` });
            }
        }).clone();
    }
}

export default ExpenseController;
