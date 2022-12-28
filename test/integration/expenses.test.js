process.env.NODE_ENV = 'test';

import Expenses from '../../src/model/Expense.js';
import Users from '../../src/model/User.js';

const defaultUser = {
  username: 'admin',
  email: 'admin@admin.com',
  password: 'password123',
};

let accessToken;
let id;

describe('Expenses', () => {
  beforeEach(async () => {
    const expenses = await Expenses.create([
      {
        description: 'Conta de Energia',
        category: 'Moradia',
        value: 200,
        date: '2022-01-05',
      },
      {
        description: 'Convênio',
        category: 'Saúde',
        value: 150,
        date: '2022-01-05',
      },
    ]);

    id = String(expenses[0]._id);
  });

  beforeEach((done) => {
    // register
    Users.register(
      new Users(defaultUser),
      defaultUser.password,
      (err, user) => {
        if (err) done(err);
        done();
      },
    );
  });

  beforeEach((done) => {
    // login
    request
      .post('/login')
      .send(defaultUser)
      .end((err, res) => {
        if (err) done(err);
        accessToken = res.header.authorization;
        done();
      });
  });

  afterEach(async () => {
    await Expenses.collection.drop();
    await Users.collection.drop();
  });

  describe('GET /expenses', () => {
    it('should return a list of expenses', (done) => {
      request
        .get('/expenses')
        .auth(accessToken, { type: 'bearer' })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(2);
          done();
        });
    });

    it('should not list the expenses when passed a wrong endpoint', (done) => {
      request
        .get('/wrong')
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.an('object');
          res.body.should.be.empty;
          res.text.should.include('Cannot GET /wrong');
          done();
        });
    });
  });

  describe('GET /expenses/:id', () => {
    it('should list a single expense given its id', (done) => {
      request
        .get(`/expenses/${id}`)
        .auth(accessToken, { type: 'bearer' })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('description');
          res.body.should.have.property('category');
          res.body.should.have.property('value');
          res.body.should.have.property('date');
          res.body.should.have.property('value');
          res.body.should.have.property('_id').eql(id);
          done();
        });
    });

    it('should not list given an invalid id', (done) => {
      const invalidID = 'thisIdDoNotExist';

      request
        .get(`/expenses/${invalidID}`)
        .auth(accessToken, { type: 'bearer' })
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').eql('Invalid id');
          done();
        });
    });

    it('should list all expenses given its description', (done) => {
      request
        .get('/expenses')
        .auth(accessToken, { type: 'bearer' })
        .query({ description: 'Conta de Energia' })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);
          res.body[0].should.have.property('description').eql('Conta de Energia');
          done();
        });
    });

    it('should not list given an invalid description', (done) => {
      request
        .get('/expenses')
        .auth(accessToken, { type: 'bearer' })
        .query({ description: 'Invalid description' })
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('msg').eql('No description found.');
          done();
        });
    });
  });

  describe('GET /expenses/:year/:month', () => {
    it('should return a list of expenses given a year and a month', (done) => {
      const year = 2022;
      const month = 1;

      request
        .get(`/expenses/${year}/${month}`)
        .auth(accessToken, { type: 'bearer' })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(2);
          res.body[0].should.property('description');
          res.body[0].should.property('category');
          res.body[0].should.property('value');
          res.body[0].should.property('date');
          res.body[0].should.property('_id');
          done();
        });
    });

    it('should return an empty list when given a year and a month that does not exist', (done) => {
      const year = 2019;
      const month = 1;

      request
        .get(`/expenses/${year}/${month}`)
        .auth(accessToken, { type: 'bearer' })
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors.should.property('msg').eql('No expense found on this date.');
          done();
        });
    });
  });

  describe('POST /expenses', () => {
    it('should add a single expense', (done) => {
      const newExpense = {
        description: 'Mercado',
        category: 'Alimentação',
        value: 850.99,
        date: '2022-10-30',
      };

      request
        .post('/expenses')
        .auth(accessToken, { type: 'bearer' })
        .send(newExpense)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.an('object');
          res.body.should.have.property('message').eql('Expense was added.');
          res.body.should.have.property('expense');
          res.body.expense.should.have.property('description');
          res.body.expense.should.have.property('category');
          res.body.expense.should.have.property('value');
          res.body.expense.should.have.property('date');
          res.body.expense.should.have.property('_id');
          done();
        });
    });

    it('should return an error when when try save existing expense', (done) => {
      const newExpense = {
        description: 'Conta de Energia',
        category: 'Moradia',
        value: 200,
        date: '2022-01-05',
      };

      request
        .post('/expenses')
        .auth(accessToken, { type: 'bearer' })
        .send(newExpense)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('msg').eql('This data already exist.');
          done();
        });
    });

    it('should return an error when the value field to be less than 0', (done) => {
      const newExpense = {
        description: 'Conta de Energia',
        category: 'Moradia',
        value: -1,
        date: '2022-01-05',
      };

      request
        .post('/expenses')
        .auth(accessToken, { type: 'bearer' })
        .send(newExpense)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').eql('The value must not be zero or less');
          done();
        });
    });

    it('should return an error when an invalid value to be passed to `description` field', (done) => {
      const newExpense = {
        description: '1', // invalid value
        category: 'Moradia',
        value: 200,
        date: '2022-01-05',
      };

      request
        .post('/expenses')
        .auth(accessToken, { type: 'bearer' })
        .send(newExpense)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').eql('The description must be a string');
          done();
        });
    });

    it('should return an error when an invalid value to be passed to `value` field', (done) => {
      const newExpense = {
        description: 'Conta de Energia',
        category: 'Moradia',
        value: 'wrong!', // invalid value
        date: '2022-01-05',
      };

      request
        .post('/expenses')
        .auth(accessToken, { type: 'bearer' })
        .send(newExpense)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').eql('The value must be a number');
          done();
        });
    });

    it('should return an error when an invalid value to be passed to `date` field', (done) => {
      const newExpense = {
        description: 'Conta de Energia',
        category: 'Moradia',
        value: 200,
        date: '2022', // invalid value
      };

      request
        .post('/expenses')
        .auth(accessToken, { type: 'bearer' })
        .send(newExpense)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').eql('The date must be yyyy-mm-dd format');
          done();
        });
    });

    it('should return an error when an invalid value to be passed to `category` field', (done) => {
      const newExpense = {
        description: 'Conta de Energia',
        category: 'Invalid Category', // invalid value
        value: 200,
        date: '2022-01-05',
      };

      request
        .post('/expenses')
        .auth(accessToken, { type: 'bearer' })
        .send(newExpense)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').to.include('Invalid value.');
          done();
        });
    });

    it('should return an error when to be passed an empty json object', (done) => {
      request
        .post('/expenses')
        .auth(accessToken, { type: 'bearer' })
        .send({})
        .end((err, res) => {
          res.should.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors.should.be.an('array').to.have.length(3);
          res.body.errors.should.nested.property('[0].msg').to.include('field is required');
          done();
        });
    });

    it('should return an error when missing some required field', (done) => {
      const expense = {
        description: 'Moradia',
        category: 'Outros',
        value: 200,
        // date field is missing
      };
      request
        .post('/expenses')
        .auth(accessToken, { type: 'bearer' })
        .send(expense)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.a('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').to.include('field is required');
          done();
        });
    });
  });

  describe('PUT /expenses/:id', () => {
    it('should update a single expense given its id', (done) => {
      request
        .put(`/expenses/${id}`)
        .auth(accessToken, { type: 'bearer' })
        .send({ value: 500 })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('message').eql('Expense updated.');
          res.body.should.have.property('expense');
          res.body.expense.should.property('value').eql(500);
          done();
        });
    });

    it('should return an error when try update to an exist expense', (done) => {
      request
        .put(`/expenses/${id}`)
        .auth(accessToken, { type: 'bearer' })
        .send({ description: 'Convênio' })
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('msg').eql('This data already exist.');
          done();
        });
    });

    it('should return an error when invalid value to be passed to `description` field', (done) => {
      request
        .put(`/expenses/${id}`)
        .auth(accessToken, { type: 'bearer' })
        .send({ description: 1000 })
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.to.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').eql('The description must be a string');
          done();
        });
    });

    it('should return an error when invalid value to be passed to `category` field', (done) => {
      request
        .put(`/expenses/${id}`)
        .auth(accessToken, { type: 'bearer' })
        .send({ category: 'Invalid Category' })
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.to.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').to.include('Invalid value.');
          done();
        });
    });

    it('should return an error when invalid value to be passed to `value` field', (done) => {
      request
        .put(`/expenses/${id}`)
        .auth(accessToken, { type: 'bearer' })
        .send({ value: 'Wrong!' })
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.to.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').eql('The value must be a number');
          done();
        });
    });

    it('should return an error when invalid value to be passed to `date` field', (done) => {
      request
        .put(`/expenses/${id}`)
        .auth(accessToken, { type: 'bearer' })
        .send({ date: '2022' })
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.to.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').eql('The date must be yyyy-mm-dd format');
          done();
        });
    });

    it('should return an error when to be passed an empty json object', (done) => {
      request
        .put(`/expenses/${id}`)
        .auth(accessToken, { type: 'bearer' })
        .send({})
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('msg').eql('Empty object');
          done();
        });
    });

    it('should return en error when passed an invalid id', (done) => {
      request
        .put('/incomes/InvalidId')
        .auth(accessToken, { type: 'bearer' })
        .send({ value: 500 })
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.nested.property('msg').eql('Invalid id');
          done();
        });
    });
  });

  describe('DELETE /expenses/:id', () => {
    it('should delete a single expense given its id', (done) => {
      request
        .delete(`/expenses/${id}`)
        .auth(accessToken, { type: 'bearer' })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('message').eql(`Expense with id:${id} was deleted.`);
          done();
        });
    });

    it('should not delete when given an invalid id', (done) => {
      request
        .delete('/expenses/InvalidId')
        .auth(accessToken, { type: 'bearer' })
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').eql('Invalid id');
          done();
        });
    });
  });
});
