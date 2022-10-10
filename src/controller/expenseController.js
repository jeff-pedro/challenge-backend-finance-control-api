import Expenses from '../model/Expense.js';

class ExpenseController {
  static async findExpenses(req, res) {
    const { description } = req.query;

    if (description) {
      // find by description field
      await Expenses.find({ description }, {}, (err, expense) => {
        if (err) {
          res.status(422).json({ errors: { msg: err.message } });
        } else if (expense.length === 0) {
          res.status(404).json({ errors: { msg: 'No description found.' } });
        } else {
          res.status(200).json(expense);
        }
      }).clone();
    } else {
      // find all 'expenses'
      await Expenses.find((err, expenses) => {
        if (err) {
          res.status(400).json({ errors: { msg: err.message } });
        } else if (expenses.length === 0) {
          res.status(404).json({ errors: { msg: 'No expenses found.' } });
        } else {
          res.status(200).json(expenses);
        }
      }).clone();
    }
  }

  static async findExpenseById(req, res) {
    const { id } = req.params;
    await Expenses.findById(id, (err, expense) => {
      if (!err) {
        res.status(200).send(expense);
      } else {
        res.status(404).send({ errors: { msg: `${err.message} - Error: expense with id:${id} was not found.` } });
      }
    }).clone();
  }

  static findExpenseByMonth(req, res) {
    const { year } = req.params;
    const { month } = req.params;

    // finds all expenses in whith the year and month match the parameters passed
    Expenses.find({
      $and: [
        { $expr: { $eq: [{ $year: '$date' }, String(year)] } },
        { $expr: { $eq: [{ $month: '$date' }, String(month)] } },
      ],
    }, 'description category value date', (err, expenses) => {
      if (err) {
        res.status(400).json({ errors: { msg: err.message } });
      } else if (expenses.length === 0) {
        res.status(404).json({ errors: { msg: 'No expense found on this date.' } });
      } else {
        res.status(200).json(expenses);
      }
    });
  }

  static async createExpense(req, res) {
    const newExpense = new Expenses(req.body);

    newExpense.save((err, expense) => {
      if (!err) {
        res.status(201).json({ message: 'Expense was added.', expense });
      } else {
        res.status(422).json({ errors: { msg: err.message } });
      }
    });
  }

  static async updateExpense(req, res) {
    const { id } = req.params;
    const update = req.body;
    const options = { new: true };

    Expenses.findByIdAndUpdate(id, update, options, (err, expense) => {
      if (!err) {
        res.status(200).json({ message: 'Expense updated.', expense });
      } else {
        res.status(422).json({ errors: { msg: `${err.message} - Error: expense with id:${id} was not updated.` } });
      }
    });
  }

  static async deleteExpense(req, res) {
    const { id } = req.params;

    await Expenses.findByIdAndDelete(id, (err) => {
      if (!err) {
        res.status(200).send({ message: `Expense with id:${id} was deleted.` });
      } else {
        res.status(422).send({ errors: { msg: `${err.message} - Error: expense with id:${id} was not deleted.` } });
      }
    }).clone();
  }
}

export default ExpenseController;
