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
UserSchema.methods.comparePassword = function comparePassword(password) {
  return compare(password, this.password);
};


/**
 * The pre-save hook method.
 */
UserSchema.pre('save', function saveHook(next) {
  const user = this;

  // proceed further only if the password is modified or the user is new
  if (!user.isModified('password')) return next();


  genSalt()
    .then((salt) => {
      hash(user.password, salt)
        .then((hash) => {
          user.password = hash;
          next();
        })
        .catch(next)
      ;
    })
    .catch(next)
  ;
});

export default UserSchema;
