import mongoose from 'mongoose';
import {
  compare,
  genSalt,
  hash,
} from 'bcryptjs';

// define the User model schema
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    index: { unique: true }
  },
  password: String,
  name: String
});


/**
 * Compare the passed password with the value in the database. A model method.
 *
 * @param {string} password
 * @returns {object} callback
 */
UserSchema.methods.comparePassword = function (password) {
  return compare(password, this.password);
};


/**
 * The pre-save hook method.
 */
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await genSalt();
    this.password = await hash(this.password, salt);
    next();
  } catch (e) {
    next(e);
  }
});

export default UserSchema;
