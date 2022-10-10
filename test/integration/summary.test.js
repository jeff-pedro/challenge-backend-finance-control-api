import Incomes from '../../src/model/Income.js';
import Expenses from '../../src/model/Expense.js';

process.env.NODE_ENV = 'test';

describe('Summary', () => {
  beforeEach(async () => {
    const income = new Incomes(
      {
        description: 'Salário',
        value: 5000,
        date: '2022-01-01',
      },
    );

    const expense = new Expenses(
      {
        description: 'Conta de Energia',
        category: 'Moradia',
        value: 200,
        date: '2022-01-05',
      },
    );

    await income.save();
    await expense.save();
  });

  afterEach(async () => {
    await Expenses.collection.drop();
    await Incomes.collection.drop();
  });

  describe('GET /summary/:year/:month', () => {
    it('should return an object with a summary about expenses and incomes', (done) => {
      const year = 2022;
      const month = 1;
      request
        .get(`/summary/${year}/${month}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('totalExpense');
          res.body.should.have.property('totalIncome');
          res.body.should.have.property('monthBalance');
          res.body.should.have.property('totalExpenseByCategory');
          res.body.totalExpenseByCategory.should.be.an('array');
          res.body.totalExpenseByCategory[0].should.have.property('_id');
          res.body.totalExpenseByCategory[0].should.have.property('total');
          done();
        });
    });

    it('should return an object with zered properties when no matching parameters are founded', (done) => {
      const year = 2000;
      const month = 1;
      request
        .get(`/summary/${year}/${month}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('totalExpense').eql(0);
          res.body.should.have.property('totalIncome').eql(0);
          res.body.should.have.property('monthBalance').eql(0);
          res.body.should.have.property('totalExpenseByCategory').eql(0);
          done();
        });
    });
  });
});
