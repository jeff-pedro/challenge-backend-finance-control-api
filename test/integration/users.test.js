import Users from '../../src/model/User.js';

describe('Users', () => {
  let id;

  beforeEach(async () => {
    const user = new Users({
      username: 'admin',
      email: 'admin@admin.com',
      password: '123',
    });

    const result = await user.save();
    id = String(result._id);
  });

  afterEach(async () => {
    await Users.collection.drop();
  });

  describe('GET /users', () => {
    it('should list all users', (done) => {
      request
        .get('/users')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);
          done();
        });
    });

    it('should not list when passed a non-existent endpoint', (done) => {
      request
        .get('/invalidEndpoint')
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.an('object');
          res.body.should.be.empty;
          res.text.should.include('Cannot GET /invalidEndpoint');
          done();
        });
    });
  });

  describe('GET /users/:id', () => {
    it('should retrieve a single user given its id', (done) => {
      request
        .get(`/users/${id}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('username');
          res.body.should.have.property('email');
          res.body.should.have.property('password');
          res.body.should.have.property('_id').eql(id);
          done();
        });
    });

    it('should not list given an invalid id', (done) => {
      request
        .get('/users/InvalidId')
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').eql('Invalid ID');
          done();
        });
    });

    it('should return a message when the user is not founded', (done) => {
      const dummyId = 'c20ad4d76fe97759aa27a0c9';
      request
        .get(`/users/${dummyId}`)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.an('object');
          res.body.should.have.property('message').eql('No user found.');
          done();
        });
    });
  });

  describe('POST /users', () => {
    it('should creates a new user', (done) => {
      const user = {
        username: 'gandalf',
        email: 'thegrey@wizards.com',
        password: 'aman3021',
      };

      request
        .post('/users')
        .send(user)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.an('object');
          res.body.user.should.have.property('username');
          res.body.user.should.have.property('email');
          res.body.user.should.have.property('password');
          res.body.user.should.have.property('_id');
          res.body.should.have.property('message').eql('User added');
          done();
        });
    });

    it('should return an error when try save an existing user', (done) => {
      const user = {
        username: 'admin',
        email: 'super@admin.com',
        password: '1234567',
      };

      request
        .post('/users')
        .send(user)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').eql(`username: '${user.username}' already exist`);
          done();
        });
    });

    it('should return an error when the required username field is missing', (done) => {
      const user = {
        email: 'admin@admin.com',
        password: 'admin',
      };

      request
        .post('/users')
        .send(user)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').eql('The username field is required');
          done();
        });
    });

    it('should return an error when the required email field is missing', (done) => {
      const user = {
        username: 'admin',
        password: 'admin',
      };

      request
        .post('/users')
        .send(user)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').eql('The email field is required');
          done();
        });
    });

    it('should return an error when the required password field is missing', (done) => {
      const user = {
        username: 'admin',
        email: 'admin@admin.com',
      };

      request
        .post('/users')
        .send(user)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').eql('The password field is required');
          done();
        });
    });

    it('should return an error when given an invalid username format', (done) => {
      const user = {
        username: 1000, // wrong format
        email: 'gray@wizards.com',
        password: 'aman3021',
      };

      request
        .post('/users')
        .send(user)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors.should.be.an('array');
          res.body.errors[0].should.have.property('msg').eql('Username must be a string');
          done();
        });
    });

    it('should return an error when given an invalid email format', (done) => {
      const user = {
        username: 'gandalf',
        email: 'wrong', // invalid format
        password: 'aman3021',
      };

      request
        .post('/users')
        .send(user)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors.should.be.an('array');
          res.body.errors[0].should.have.property('msg').eql('Email must be a valid format');
          done();
        });
    });

    it('should return an error when the password lenght is less than 7', (done) => {
      const user = {
        username: 'gandalf',
        email: 'gandalf@wizards.com',
        password: '123', // must be grather than 6 chars
      };

      request
        .post('/users')
        .send(user)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors.should.be.an('array');
          res.body.errors[0].should.have.property('msg').eql('Password should be at least 7 chars long');
          done();
        });
    });

    it('should return an error when receiving an empty object', (done) => {
      request
        .post('/users')
        .send({ })
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors.should.be.an('array');
          res.body.errors.length.should.be.eql(3);
          done();
        });
    });
  });

  describe('PUT /users/:id', () => {
    it('should update an user given its id', (done) => {
      const update = { password: 'YouShallNotPass' };
      request
        .put(`/users/${id}`)
        .send(update)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('user');
          res.body.user.should.have.property('password').eql(update.password);
          res.body.should.have.property('message').eql('User updated');
          done();
        });
    });

    it('should return an error when try update existing username', async () => {
      const user = new Users({
        username: 'sauron',
        email: 'sasa@morgoth.com',
        password: 'thedarklord',
      });
      const update = { username: 'admin' };

      await user.save().then();

      request
        .put(`/users/${id}`)
        .send(update)
        .then((res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').eql(`username: '${update.username}' already exist`);
        });
    });

    it('should return an error when given an invalid username format', (done) => {
      request
        .put(`/users/${id}`)
        .send({ username: 1000 })
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors.should.be.an('array');
          res.body.errors[0].should.have.property('msg').eql('Username must be a string');
          done();
        });
    });

    it('should return an error when given an invalid email format', (done) => {
      request
        .put(`/users/${id}`)
        .send({ email: 'gandalf@' })
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors.should.be.an('array');
          res.body.errors[0].should.have.property('msg').eql('Email must be a valid format');
          done();
        });
    });

    it('should return an error when the password lenght is less than 7', (done) => {
      request
        .put(`/users/${id}`)
        .send({ password: '123' })
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors.should.be.an('array');
          res.body.errors[0].should.have.property('msg').eql('Password should be at least 7 chars long');
          done();
        });
    });

    it('should return an error when receiving an empty object', (done) => {
      request
        .put(`/users/${id}`)
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
        .get('/users/InvalidId')
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').eql('Invalid ID');
          done();
        });
    });

    it('should return a message when the user is not founded', (done) => {
      const dummyId = 'c20ad4d76fe97759aa27a0c9';
      request
        .put(`/users/${dummyId}`)
        .send({ password: 'something' })
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.an('object');
          res.body.should.have.property('message').eql('No user found.');
          done();
        });
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete an user given its it', (done) => {
      request
        .delete(`/users/${id}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('message');
          res.body.message.should.be.eql(`User with id:${id} was deleted.`);
          done();
        });
    });

    it('should not delete when given an invalid id', (done) => {
      request
        .get('/users/InvalidId')
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors[0].should.have.property('msg').eql('Invalid ID');
          done();
        });
    });

    it('should return a message when the user is not founded', (done) => {
      const dummyId = 'c20ad4d76fe97759aa27a0c9';
      request
        .delete(`/users/${dummyId}`)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.an('object');
          res.body.should.have.property('message').eql('No user found.');
          done();
        });
    });
  });
});
