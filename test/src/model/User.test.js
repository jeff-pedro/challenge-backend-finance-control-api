import Users from '../../../src/model/User.js';

describe('Users', () => {
  after(async () => {
    await Users.collection.drop();
  });

  describe('Creating documents', () => {
    it('should creates a user', (done) => {
      const newUser = new Users({
        username: 'admin',
        email: 'admin@admin.com',
      });

      newUser.save().then((user) => {
        user.should.be.an('object');
        user.should.have.property('username');
        user.should.have.property('email');
        user.should.have.property('_id');
        done();
      });
    });

    it('should not creates a user without an username', (done) => {
      const newUser = new Users({
        email: 'admin@admin.com',
        password: '123',
      });

      newUser.save((err) => {
        if (err) return done();
        throw new Error('Should generate error');
      });
    });

    it('should not creates a user without an email', (done) => {
      const newUser = new Users({
        username: 'admin',
        password: '123',
      });

      newUser.save((err) => {
        if (err) return done();
        throw new Error('Should generate error');
      });
    });

    it('should not creates a user with incorrect property format', (done) => {
      const newUser = new Users({
        wrongUserName: 'wrong property',
        email: 'wrong@wrong.com',
        password: '123',
      });

      newUser.save((err) => {
        if (err) return done();
        throw new Error('Should generate error');
      });
    });
  });

  describe('Findind documents', () => {
    it('should retrieve all users', (done) => {
      Users.find({}, (err, users) => {
        users.should.be.an('array');
        users.length.should.be.eql(1);
        done();
      });
    });

    it('should retrive an empty list', (done) => {
      Users.find({ username: 'jeff' }, (err, user) => {
        user.should.be.an('array');
        user.length.should.be.eql(0);
        done();
      });
    });
  });

  describe('Updating documents', () => {
    it('should update a user given its id', (done) => {
      const conditions = { username: 'admin' };
      const update = { email: 'admin2@admin.com' };
      const options = { new: true };
      Users.findOneAndUpdate(conditions, update, options, (err, user) => {
        user.should.be.an('object');
        user.should.have.property('email').eql('admin2@admin.com');
        done();
      });
    });
  });

  describe('Deleting documents', () => {
    it('should delete a user', (done) => {
      const conditions = { username: 'admin' };
      Users.deleteOne(conditions, (err, result) => {
        result.should.be.an('object');
        result.should.have.property('deletedCount').eql(1);
        done();
      });
    });
  });
});
