import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, 'username is required'],
  },
  email: {
    type: String,
    required: [true, 'email is required'],
  },
  password: {
    type: String,
    minLength: [7, 'password should be at least 7 chars long'],
    required: [true, 'password is required'],
  },
});

const Users = mongoose.model('users', userSchema);

export default Users;
