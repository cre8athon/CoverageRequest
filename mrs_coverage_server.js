var express = require('express');
var passport = require('passport');
var session = require('express-session');
//var flash = require('express-flash');
var flash = require('connect-flash');


const coverageCalendar = require('./teamUpAPI.js');
const userManager = require('./fileUserManager.js');
userManager.setUserFileName('/tmp/mrscoverageUsers.json');

var app = express();

var userCache = {};

// ========== Standard stuff from Banas tutorial
app.disable('x-powered-by');
app.use(express.static(__dirname + '/public'));


var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(require('body-parser').urlencoded({extended: true}));
var credentials = require('./credentials.js');
app.use(require('cookie-parser')(credentials.cookieSecret));
//var flash=require("connect-flash");
// Cache of users:
// Configure Passport
// ------------------------------------------------------------------------------------
// Passport initialization

const LocalStrategy = require('passport-local').Strategy;
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

function findUser(user_name, callback) {
	callback(null, userManager.getUserById(user_name));
}

passport.serializeUser(function(user, done) {
    userCache[user.email] = user;
    done(null, user.email);
});

passport.deserializeUser(function(username, done) {
    done(null, userCache[username]);
});

passport.use('local', new LocalStrategy(
 (email, password, done) => {
    findUser(email, (err, user) => {
        console.log('<< findUser err: ' + err + ' User: ' + user);
      if (err) {
        return done(err)
      }

      // User not found
      if (!user) {
        return done(null, false)
      }

      // Always use hashed passwords and fixed time comparison
      // bcrypt.compare(password, user.passwordHash, (err, isValid) => {
      //   if (err) {
      //     return done(err)
      //   }
      //   if (!isValid) {
      //     return done(null, false)
      //   }
      //   return done(null, user)
      // })
      console.log('Checking passwords: ' + password + ' == ' + user.password);
      if( password == user.password ) {
        console.log('Authentication passed!');
        return done(null, user);
      } else {
        console.log('Invalid password');
        return done(null, false);
      }

      // if (password == 'ccaassee') {
      // 	console.log('Ok!  You have authenticated ;)');
      // 	return done(null, user);      	
      // } else {
      // 	return done("Invalid password!");
      // }

    })
  }
))


// ========== Standard stuff from Banas tutorial
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());

// routes ======================================================================
require('./app/routes.js')(app, passport, coverageCalendar, userManager); // load our routes and pass in our app and fully configured passport
require('./app/coverage_request_router.js')(app, coverageCalendar);
require('./app/user_admin_router.js')(app, coverageCalendar);

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + ' press Ctrl-C to terminado');
});

module.exports = server;

