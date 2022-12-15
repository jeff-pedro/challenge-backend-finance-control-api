import Users from '../../src/model/User.js';

const defaultUser = {
  username: 'admin',
  email: 'admin@admin.com',
  password: 'password123',
};

let accessToken;
let id;

describe('Users', () => {
  beforeEach((done) => {
    const userCredentials = {
      username: 'admin',
      email: 'admin@admin.com',
      password: 'senha1234567',
    };

    // register
    Users.register(
      new Users(userCredentials),
      userCredentials.password,
      (err, user) => {
        if (err) done(err);
        id = String(user._id);

        // login
        request
          .post('/login')
          .send(
            {
              username: userCredentials.username,
              password: userCredentials.password,
            },
          )
          .end((err, res) => {
            if (err) done(err);
            accessToken = res.header.authorization;
            done();
          });
      },
    );
  });

  afterEach(async () => {
    await Users.collection.drop();
  });

  describe('GET /users', () => {
    it('should list all users', (done) => {
      request
        .get('/users')
        .set('Authorization', `bearer ${accessToken}`)
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
        .set('Authorization', `bearer ${accessToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('username');
          res.body.should.have.property('email');
          res.body.should.have.property('_id').eql(id);
          done();
        });
    });

    it('should not list given an invalid id', (done) => {
      request
        .get('/users/InvalidId')
        .set('Authorization', `bearer ${accessToken}`)
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
        .set('Authorization', `bearer ${accessToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.an('object');
          res.body.should.have.property('message').eql('No user found.');
          done();
        });
    });
  });

  describe('PUT /users/:id', () => {
    it('should update a user given its id', (done) => {
      const update = { password: 'youshallnotpass' };
      request
        .put(`/users/${id}`)
        .set('Authorization', `bearer ${accessToken}`)
        .send(update)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('user');
          res.body.user.should.have.property('_id');
          res.body.user.should.have.property('username');
          res.body.user.should.have.property('email');
          res.body.should.have.property('message').eql('User updated');
          done();
        });
    });

    it('should return an error when try update existing username', async () => {
      const user = new Users({
        username: 'sauron',
        email: 'sasa@maia.com',
        password: 'thedarklord',
      });
      const update = { username: 'admin' };

      await user.save().then();

      request
        .put(`/users/${id}`)
        .set('Authorization', `bearer ${accessToken}`)
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
        .set('Authorization', `bearer ${accessToken}`)
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
        .set('Authorization', `bearer ${accessToken}`)
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
        .set('Authorization', `bearer ${accessToken}`)
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
        .set('Authorization', `bearer ${accessToken}`)
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
        .put('/users/InvalidId')
        .set('Authorization', `bearer ${accessToken}`)
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
        .set('Authorization', `bearer ${accessToken}`)
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
        .set('Authorization', `bearer ${accessToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('message');
          res.body.message.should.be.eql(`User with id:${id} was deleted.`);
          done();
        });
    });

    it('should return an error when try delete with an invalid id', (done) => {
      request
        .delete('/users/InvalidId')
        .set('Authorization', `bearer ${accessToken}`)
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
        .set('Authorization', `bearer ${accessToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.an('object');
          res.body.should.have.property('message').eql('No user found.');
          done();
        });
    });
  });
});
