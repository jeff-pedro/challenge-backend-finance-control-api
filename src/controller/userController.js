import Users from '../model/User.js';

export default class UserController {
  static findUsers(req, res) {
    Users.find({}, (err, users) => {
      if (!err) {
        res.status(200).json(users);
      } else {
        res.status(400).json({ errors: { msg: err.message } });
      }
    });
  }

  static findUserById(req, res) {
    const { id } = req.params;
    Users.findById(id, (err, user) => {
      if (err) {
        res.status(400).json({ errors: { msg: err.message } });
      } else if (!user) {
        res.status(404).json({ message: 'No user found.' });
      } else {
        res.status(200).json(user);
      }
    });
  }

  static updateUser(req, res) {
    const { id } = req.params;
    const update = req.body;
    const options = { new: true };

    Users.findByIdAndUpdate(id, update, options, (err, user) => {
      if (err) {
        res.status(422).json({ errors: { msg: err.message } });
      } else if (!user) {
        res.status(404).json({ message: 'No user found.' });
      } else {
        res.status(200).json({ message: 'User updated', user });
      }
    });
  }

  static deleteUser(req, res) {
    const { id } = req.params;
    Users.findByIdAndDelete(id, (err, user) => {
      if (err) {
        res.status(422).json({ errors: { msg: `${err.message} - Error: user with id:${id} was not deleted.` } });
      } else if (!user) {
        res.status(404).json({ message: 'No user found.' });
      } else {
        res.status(200).json({ message: `User with id:${id} was deleted.` });
      }
    });
  }
}
