import Expenses from "../model/Expense.js";
import Incomes from "../model/Income.js"
import Validation from "./Validation.js";

export default class IncomeController {

    static async findIncomes(req, res) {

        let { description } = req.query;

        if (description) {
            // find by description
            await Incomes.find({ 'description': description }, {}, (err, incomes) => {
                if (!err) {
                    res.status(200).json(incomes);
                } else {
                    res.status(400).json({ message: err.message })
                }
            }).clone();
        } else {
            // find all incomes
            await Incomes.find((err, incomes) => {
                if (!err) {
                    res.status(200).send(incomes);
                } else {
                    res.status(400).send({ message: err.message })
                }
            }).clone();
        }

    }

    static async findIncomeById(req, res) {

        const { id } = req.params;

        await Incomes.findById(id, (err, income) => {
            if (!err) {
                res.status(200).send(income);
            } else {
                res.status(400).send({ message: `${err.message} - "Income" with id:${id} was not found.` })
            }
        }).clone();
    }

    static async createIncome(req, res) {

        const data = req.body;
        const duplicated = await Validation.isDuplicated(data, Incomes);

        if (!duplicated) {
            // create an "income"
            let income = new Incomes(req.body)
            income.save((err) => {
                if (!err) {
                    res.status(201).json({ message: "Income has been created." })
                } else {
                    res.status(500).json({ message: err.message })
                }
            });
        } else {
            res.json({ message: "This data aldeady exists. Income hasn't been created." });
        }
    }

    static async updateIncome(req, res) {

        const { id } = req.params;
        const newData = req.body;

        const duplicated = await Validation.isDuplicated(newData, Incomes, id);

        if (!duplicated) {
            // update an "income"
            Incomes.findByIdAndUpdate(id, { $set: newData }, (err) => {
                if (!err) {
                    res.status(200).json({ message: "Income has been updated." })
                } else {
                    res.status(500).json({ message: `${err.message} - Error: income with id:${id} hasn't been updated.` });
                }
            });
        } else {
            res.json({ message: "This object already exists. For update change the properties' values." })
        }
    }

    static async deleteIncome(req, res) {

        const { id } = req.params;

        await Incomes.findByIdAndDelete(id, (err) => {
            if (!err) {
                res.status(200).send({ message: `Income with id:${id} has been deleted.` })
            } else {
                res.status(500).send({ message: `${err.message} - Error: expense with id:${id} hasn't deleted.` })
            }
        }).clone();
    }
}
