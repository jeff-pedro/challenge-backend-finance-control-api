import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: [true, 'username is required'] },
  email: { type: String, required: [true, 'email is required'] },
});

userSchema.plugin(passportLocalMongoose);

const Users = mongoose.model('users', userSchema);

export default Users;
