const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const multer = require('multer');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');  // session middleware
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { local_strategy } = require('./config/passportlocal');
const { myEmitter } = require('./config/eventemitter');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const { response } = require('./config/response');

const app = express();
global.__basedir = __dirname;

const authUser = (user, password, done) => {
  console.log(`Value of "User" in authUser function ----> ${user}`)         //passport will populate, user = req.body.username
  console.log(`Value of "Password" in authUser function ----> ${password}`) //passport will popuplate, password = req.body.password

// Use the "user" and "password" to search the DB and match user/password to authenticate the user
// 1. If the user not found, done (null, false)
// 2. If the password does not match, done (null, false)
// 3. If user found and password match, done (null, user)

  let authenticated_user = { id: 123, name: "Kyle"}
//Let's assume that DB search that user found and password matched for Kyle

  return done (null, authenticated_user )
}

const authUser2 = (user, password, done) => {
  console.log('authUser2.............');
  // look for the user data
  User.findOne({ username: username }, function (err, user) {
    // if there is an error
    if (err) { return done(err); }
    // if user doesn't exist
    if (!user) { return done(null, false, { message: 'User not found.' }); }
    // if the password isn't correct
    if (!user.verifyPassword(password)) { return done(null, false, {
      message: 'Invalid password.' }); }
    // if the user is properly authenticated
    return done(null, user);
  });
}


if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}


// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

var upload = multer({ storage: storage, inMemory:true })

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));
// this makes my emitter available across all our controllers.
app.set("myEmitter", myEmitter);

// sanitize request data
app.use(xss());
app.use(mongoSanitize({
  allowDots: true,
  replaceWith: '__'
}));

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(session({
  secret: 'ZmQ0ZGI5NjQ0MDQwY2I4MjMxY2Y3ZmI3MjdhN2ZmMjNhODViOTg1ZGE0NTBjMGM4NDA5NzYxMjdjOWMwYWRmZTBlZjlhNGY3ZTg4Y2U3YTE1ODVkZDU5Y2Y3OGYwZWE1NzUzNWQ2YjFjZDc0NGMxZWU2MmQ3MjY1NzJmNTE0MzI=',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use('jwt', jwtStrategy);


//
// const strategy = new LocalStrategy(function verify(username, password, cb) {
//   console.log('local.................')
//   const user = null;
//   return cb(null, user);
// });
//
// // ToDo: Moving to Passport local to check user role
const authenticateUser = async (username, password, done) => {

  User.findOne({ username: username }).then((user) => {
    if (!user)
      return done(null, false, { message: 'No user with that username' })
    if(bcrypt.compareSync(password,user.password))
      return done(null, user)
    else
      return done(null, false,{ message: 'wrong password' });
  }).catch((err) => {
    done(err);
  });
}
const strategy  = new LocalStrategy(authenticateUser);
// passport.use('local', strategy);

passport.serializeUser(function(user, cb) {

  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

app.use(response);

const cpUpload = upload.fields([{ name: 'file', maxCount: 20 }, { name: 'photo', maxCount: 20 }])
// v1 api routes
app.use('/api', cpUpload, routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
