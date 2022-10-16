import Incomes from '../../src/model/Income.js';

describe('Incomes', () => {
  let id;

  beforeEach(async () => {
    const incomes = await Incomes.create([
      {
        description: 'Salário',
        value: 5000,
        date: '2022-01-01',
      },
      {
        description: 'Renda Extra',
        value: 300,
        date: '2022-01-01',
      },
    ]);

    id = String(incomes[0]._id);
  });

  afterEach(async () => {
    await Incomes.collection.drop();
  });

  describe('/GET income', () => {
    it('should list all the incomes', (done) => {
      request
        .get('/incomes')
        .end((err, res) => {
          res.should.be.a.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(2);
          done();
        });
    });

    it('should not list the incomes when passed a wrong endpoint', (done) => {
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

  describe('GET /incomes/:id', () => {
    it('should list a single income given its id', (done) => {
      request
        .get(`/incomes/${id}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('description');
          res.body.should.have.property('value');
          res.body.should.have.property('date');
          res.body.should.have.property('_id').eql(id);
          done();
        });
    });

    it('should not list given an invalid id', (done) => {
      request
        .get('/incomes/InvalidId')
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').eql('Invalid id');
          done();
        });
    });

    it('should list all the incomes given a description', (done) => {
      request
        .get('/incomes')
        .query({ description: 'Renda Extra' })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);
          res.body.should.have.nested.property('[0].description').eql('Renda Extra');
          done();
        });
    });

    it('should not list given an invalid description', (done) => {
      request
        .get('/incomes')
        .query({ description: 'Invalid description' })
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('msg').eql('No description found.');
          done();
        });
    });

    it('should return a message when the user is not founded');
  });

  describe('GET /incomes/:year/:month', () => {
    it('should return a list of incomes given a year and a month', (done) => {
      const year = 2022;
      const month = 1;

      request
        .get(`/incomes/${year}/${month}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(2);
          res.body[0].should.have.property('description');
          res.body[0].should.have.property('value');
          res.body[0].should.have.property('date');
          res.body[0].should.have.property('_id');
          done();
        });
    });

    it('should return an empty list when given a year and a month that does not exist', (done) => {
      const year = 2019;
      const month = 3;

      request
        .get(`/incomes/${year}/${month}`)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('msg').eql('No incomes found on this date.');
          done();
        });
    });
  });

  describe('POST /incomes', () => {
    it('should add a single income', (done) => {
      const newIncome = {
        description: 'Salário',
        value: 5000,
        date: '2022-12-30',
      };
      request
        .post('/incomes')
        .send(newIncome)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Income was added');
          res.body.income.should.have.property('description');
          res.body.income.should.have.property('value');
          res.body.income.should.have.property('date');
          done();
        });
    });

    it('should return an error when try save existing income', (done) => {
      const newIncome = {
        description: 'Salário',
        value: 5000,
        date: '2022-01-01',
      };

      request
        .post('/incomes')
        .send(newIncome)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.a('object');
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('msg').eql('This data already exist.');
          done();
        });
    });

    it('should return an error when the value field to be less than 0', (done) => {
      const newIncome = {
        description: 'Salário',
        value: -1, // invalid value
        date: '2022-12-30',
      };

      request
        .post('/incomes')
        .send(newIncome)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.a('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').eql('The value must not be zero or less');
          done();
        });
    });

    it('should return an error when an invalid value to be passed to `description` field', (done) => {
      const newIncome = {
        description: 10, // unsupported type
        value: 5000,
        date: '2022-12-30',
      };

      request
        .post('/incomes')
        .send(newIncome)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.a('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').eql('The description must be a string');
          done();
        });
    });

    it('should return an error when an invalid value to be passed to `date` field', (done) => {
      const newIncome = {
        description: 'Salário',
        value: 5000,
        date: '2022', // unsupported format
      };

      request
        .post('/incomes')
        .send(newIncome)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.a('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').eql('The date must be yyyy-mm-dd format');
          done();
        });
    });

    it('should return an error when an invalid value to be passed to `value` field', (done) => {
      const newIncome = {
        description: 'Salário',
        value: 'Wrong type', // unsupported type
        date: '2022-09-30',
      };

      request
        .post('/incomes')
        .send(newIncome)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').eql('The value must be a number');
          done();
        });
    });

    it('should return an error when to be passed an empty json object', (done) => {
      request
        .post('/incomes')
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
      const newIncome = {
        description: 'Salário',
        value: 5000,
        // date field is missing
      };
      request
        .post('/incomes')
        .send(newIncome)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.a('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').to.include('field is required');
          done();
        });
    });
  });

  describe('PUT /incomes/:id', () => {
    it('should update a single income given its id', (done) => {
      request
        .put(`/incomes/${id}`)
        .send({ value: 8000 })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Income updated.');
          res.body.income.should.have.property('value').eql(8000);
          done();
        });
    });

    it('should return an error when try update to an exist income', (done) => {
      request
        .put(`/incomes/${id}`)
        .send({ description: 'Renda Extra' })
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
        .put(`/incomes/${id}`)
        .send({ description: 1000 })
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.to.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').eql('The description must be a string');
          done();
        });
    });

    it('should return an error when invalid value to be passed to `value` field', (done) => {
      request
        .put(`/incomes/${id}`)
        .send({ value: 'Bad value' })
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors.should.be.an('array');
          res.body.errors[0].should.have.property('msg').eql('The value must be a number');
          done();
        });
    });

    it('should return an error when invalid value to be passed to `date` field', (done) => {
      request
        .put(`/incomes/${id}`)
        .send({ date: '2020' })
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').eql('The date must be yyyy-mm-dd format');
          done();
        });
    });

    it('should return an error when to be passed an empty json object', (done) => {
      request
        .put(`/incomes/${id}`)
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
        .send({ value: 500 })
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.nested.property('msg').eql('Invalid id');
          done();
        });
    });

    it('should return a message when the user is not founded');
  });

  describe('DELETE /incomes/:id', () => {
    it('should delete a single income given its id', (done) => {
      request
        .delete(`/incomes/${id}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql(`Income with id:${id} was deleted.`);
          done();
        });
    });

    it('should not delete when given an invalid id', (done) => {
      request
        .delete('/incomes/InvalidId')
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').eql('Invalid id');
          done();
        });
    });

    it('should return a message when the user is not founded');
  });
});
