const LocalStrategy = require('passport-local');
const config = require('./config');
const ObjectID = require('mongodb').ObjectID;
const { tokenTypes } = require('./tokens');
const { User } = require('../models');

const option = {
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true,
  session: false,
};

const verify = async (req, payload, done) => {
  console.log('verify', payload, req.params)
  const {userId} = req.params;

  try {
    // if (payload.type !== tokenTypes.ACCESS) {
    //   throw new Error('Invalid token type');
    // }

    const user = await User.findById(ObjectID(userId));
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const local_strategy = new LocalStrategy(option, verify);

module.exports = {
  local_strategy,
};
