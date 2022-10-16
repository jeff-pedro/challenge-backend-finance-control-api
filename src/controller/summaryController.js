import Expenses from '../model/Expense.js';
import Incomes from '../model/Income.js';

export default class Summary {
  static async monthSummary(req, res) {
    const { year } = req.params;
    const { month } = req.params;

    // income summary results
    let incomeResults = await Incomes.aggregate(
      [
        {
          $match:
                {
                  $and: [
                    { $expr: { $eq: [{ $year: '$date' }, Number(year)] } },
                    { $expr: { $eq: [{ $month: '$date' }, Number(month)] } },
                  ],
                },
        },
        {
          $group: { _id: null, total: { $sum: '$value' } },
        },
      ],
    );

    // expense summary results
    let expenseResults = await Expenses.aggregate(
      [
        // stage 1: filter expenses registries by month and year
        {
          $match:
                    {
                      $and: [
                        { $expr: { $eq: [{ $year: '$date' }, Number(year)] } },
                        { $expr: { $eq: [{ $month: '$date' }, Number(month)] } },
                      ],
                    },
        },
        // stage 2
        {
          $facet:
                    {
                      // group by category and calculate total amount
                      totalByCategory: [{
                        $group: { _id: '$category', total: { $sum: '$value' } },
                      }],
                      // group all and calculate total amount on the month
                      totalAmount: [{
                        $group: { _id: null, total: { $sum: '$value' } },
                      }],
                    },
        },
      ],
    );

    // when receive empty data
    incomeResults = incomeResults.length ? incomeResults[0] : { total: 0 };

    if (expenseResults[0].totalAmount[0]) {
      expenseResults = {
        total: expenseResults[0].totalAmount[0].total,
        totalByCategory: expenseResults[0].totalByCategory,
      };
    } else {
      expenseResults = {
        total: 0,
        totalByCategory: 0,
      };
    }

    // final balance
    const balanceResult = incomeResults.total - expenseResults.total;

    // create a summary object
    const summary = {
      totalExpense: Number(expenseResults.total),
      totalIncome: Number(incomeResults.total),
      monthBalance: Number(balanceResult),
      totalExpenseByCategory: expenseResults.totalByCategory,
    };

    res.status(200).json(summary);
  }
}
