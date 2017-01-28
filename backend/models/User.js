/**
 * Copyright (c) 2014-2016 Sahat Yalkabov
 * https://github.com/sahat/hackathon-starter/blob/master/models/User.js
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  username: { type: String, unique: true, sparse: true }, // Null or unique.
  email: { type: String, required: true, unique: true }, // Always required.
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,

  github: { type: String, unique: true, sparse: true }, // Null or unique.
  google: { type: String, unique: true, sparse: true }, // Null or unique.
  tokens: [{
    _id: false,
    kind: String,
    accessToken: String
  }],

  profile: {
    name: String,
    gender: String,
    location: String,
    website: String,
    picture: String,
  },
}, { timestamps: true });

// Password hash middleware.
userSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

// Password validator.
userSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

// User's gravatar.
userSchema.methods.gravatar = function (size = 200) {
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const User = mongoose.model('User', userSchema);

export default User;