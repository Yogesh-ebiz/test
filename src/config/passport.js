const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('./config');
const ObjectID = require('mongodb').ObjectID;
const { tokenTypes } = require('./tokens');
const { User } = require('../models');

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  passReqToCallback: true,
  algorithms: 'HS256'
};

const jwtVerify = async (req, payload, done) => {
  console.log('jwtVerify', payload, req.params)
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

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy,
};
