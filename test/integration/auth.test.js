import jwt from 'jsonwebtoken';
import { token } from 'morgan';
import Users from '../../src/model/User.js';
import tokens from '../../src/auth/tokens.js';

const defaultUser = {
  username: 'admin',
  email: 'admin@admin.com',
  password: 'password123',
};

let accessToken;
let refreshToken;
let id;

describe('Auth', () => {
  beforeEach((done) => {
    // register
    Users.register(
      new Users(defaultUser),
      defaultUser.password,
      (err, user) => {
        if (err) done(err);
        id = String(user._id);
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
        refreshToken = res.body.refreshToken;
        done();
      });
  });

  afterEach(async () => {
    await Users.collection.drop();
  });

  describe('POST /register', () => {
    it('should register a new user', (done) => {
      const user = {
        username: 'gandalf',
        email: 'gandalf@wizard.com',
        password: 'thegrey123',
      };

      request
        .post('/register')
        .send(user)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.an('object');
          res.body.should.have.property('message').eql(`${user.username} registered`);
          done();
        });
    });

    it('should return an error when try register an existing username', (done) => {
      const user = {
        username: 'admin',
        email: 'super@admin.com',
        password: '1234567',
      };

      request
        .post('/register')
        .send(user)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('error').eql('A user with the given username is already registered');
          done();
        });
    });

    it('should return an error when the required username field is missing', (done) => {
      const user = {
        email: 'admin@admin.com',
        password: 'admin123',
      };

      request
        .post('/register')
        .send(user)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('error').eql('No username was given');
          done();
        });
    });

    it('should return an error when the required email field is missing', (done) => {
      const user = {
        username: 'sauron',
        password: 'thedarklord',
      };

      request
        .post('/register')
        .send(user)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('error').to.contain('email is required');
          done();
        });
    });

    it('should return an error when the required password field is missing', (done) => {
      const user = {
        username: 'saruman',
        email: 'saruman@wizard.com',
      };

      request
        .post('/register')
        .send(user)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('error').eql('No password was given');
          done();
        });
    });

    it('should return an error when given an invalid username format', (done) => {
      const user = {
        username: 1000, // wrong format
        email: 'gandalf@wizard.com',
        password: 'thegray',
      };

      request
        .post('/register')
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
        password: 'thegray',
      };

      request
        .post('/register')
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
        email: 'gandalf@wizard.com',
        password: '123', // must be grather than 6 chars
      };

      request
        .post('/register')
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
        .post('/register')
        .send({ })
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.an('object');
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('msg').eql('Empty object');
          done();
        });
    });
  });

  describe('POST /login', () => {
    it('should login a user', (done) => {
      const userCredentials = {
        username: 'admin',
        password: 'password123',
      };

      request
        .post('/login')
        .send(userCredentials)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          done();
        });
    });

    it('should login a user providing an access token', (done) => {
      const userCredentials = {
        username: 'admin',
        password: 'password123',
      };

      request
        .post('/login')
        .send(userCredentials)
        .end((err, res) => {
          res.should.have.status(200);
          res.header.authorization.should.be.a('string');
          res.header.authorization.should.match(/^([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_\-\+\/=]*)/);
          done();
        });
    });

    it('should login a user providing a refresh token', (done) => {
      const userCredentials = {
        username: 'admin',
        password: 'password123',
      };

      request
        .post('/login')
        .send(userCredentials)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('refreshToken');
          res.body.refreshToken.should.be.a('string');
          res.body.refreshToken.should.have.length(48);
          done();
        });
    });

    it('should not authorize login when username is not provided', (done) => {
      const userCredentials = {
        // username field is missing
        password: 'password123',
      };

      request
        .post('/login')
        .send(userCredentials)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.should.have.property('error').eql('Missing credentials');
          done();
        });
    });

    it('should not authorize login when password is not provided', (done) => {
      const userCredentials = {
        username: 'admin',
        // password field is missing
      };

      request
        .post('/login')
        .send(userCredentials)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.should.have.property('error').eql('Missing credentials');
          done();
        });
    });

    it('should not authorize login given a non-existent username', (done) => {
      const userCredentials = {
        username: 'admin',
        password: 'wrongPassword',
      };

      request
        .post('/login')
        .send(userCredentials)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.should.have.property('error').eql('Password or username is incorrect');
          done();
        });
    });

    it('should not authorize login given a non-existent password', (done) => {
      const userCredentials = {
        username: 'wrongUsername',
        password: 'password123',
      };

      request
        .post('/login')
        .send(userCredentials)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.should.have.property('error').eql('Password or username is incorrect');
          done();
        });
    });
  });

  describe('POST /logout', () => {
    it('should logout a user', (done) => {
      request
        .post('/logout')
        .send({ refreshToken })
        .auth(accessToken, { type: 'bearer' })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return an error when receiving an invalid token', (done) => {
      const invalidToken = `${accessToken}wrong`;
      request
        .post('/logout')
        .send({ refreshToken })
        .auth(invalidToken, { type: 'bearer' })
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.should.have.property('error').eql('invalid signature');
          done();
        });
    });

    it('should return an error when receiving an expired token', (done) => {
      const payload = jwt.verify(accessToken, process.env.JWT_KEY);
      const tokenExpired = jwt.sign({ id: payload.id }, process.env.JWT_KEY, { expiresIn: '1ms' });
      request
        .post('/logout')
        .send({ refreshToken })
        .auth(tokenExpired, { type: 'bearer' })
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.should.have.property('error').eql('token expired');
          res.body.should.have.property('expiredAt');
          done();
        });
    });

    it('should return an unauthorized status when no token is passe in header', (done) => {
      request
        .post('/logout')
        .send({ refreshToken })
        .auth('', { type: 'bearer' })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('should return an error when no refresh token is passed in body', (done) => {
      request
        .post('/logout')
        .send({})
        .auth('', { type: 'bearer' })
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.should.have.property('error').eql('no refresh token provided');
          done();
        });
    });

    it('should return an error when when receiving an invalid refresh token', (done) => {
      tokens.refresh.invalidate(refreshToken).then(() => {
        request
          .post('/logout')
          .send({ refreshToken })
          .auth(accessToken, { type: 'bearer' })
          .end((err, res) => {
            res.should.have.status(401);
            res.body.should.be.an('object');
            res.body.should.have.property('error').eql('refresh token invalid');
            done();
          });
      });
    });

    it('should return an error when logout is already done', (done) => {
      request
        .post('/logout')
        .send({ refreshToken })
        .auth(accessToken, { type: 'bearer' })
        .then(() => {
          request
            .post('/logout')
            .send({ refreshToken })
            .auth(accessToken, { type: 'bearer' })
            .end((err, res) => {
              res.should.have.status(401);
              res.body.should.be.an('object');
              res.body.should.have.property('error').eql('refresh token invalid');
              done();
            });
        });
    });
  });

  describe('POST /update_token', () => {
    it('should return an new "access token" and "refresh token"', (done) => {
      request
        .post('/update_token')
        .send({ refreshToken })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('refreshToken');
          res.body.refreshToken.should.have.be.a('string');
          res.body.refreshToken.should.have.length(48);
          res.header.authorization.should.be.an('string');
          res.header.authorization.should.match(/^([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_\-\+\/=]*)/);
          done();
        });
    });

    it('should return an new "access token" and "refresh token"', (done) => {
      request
        .post('/update_token')
        .send({})
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.should.have.property('error').eql('no refresh token provided');
          done();
        });
    });

    it('should return an error when when receiving an invalid refresh token', (done) => {
      tokens.refresh.invalidate(refreshToken).then(() => {
        request
          .post('/update_token')
          .send({ refreshToken })
          .auth(accessToken, { type: 'bearer' })
          .end((err, res) => {
            res.should.have.status(401);
            res.body.should.be.an('object');
            res.body.should.have.property('error').eql('refresh token invalid');
            done();
          });
      });
    });
  });
});
