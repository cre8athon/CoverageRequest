var express = require('express');
var passport = require('passport');
var session = require('express-session');


const coverageCalendar = require('./mrsCoverage.js');

var app = express();
//require('./app/routes.js')(app, passport, coverageCalendar); // load our routes and pass in our app and fully configured passport

// ========== Standard stuff from Banas tutorial
app.disable('x-powered-by');

var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(require('body-parser').urlencoded({extended: true}));
var credentials = require('./credentials.js');
app.use(require('cookie-parser')(credentials.cookieSecret));
var flash=require("connect-flash");
// Cache of users:
usersById = {}

usersWithPasswords = {}

// todo: Replace this with something that loads users/passwords
usersWithPasswords['georgen'] = {
    username: 'georgen',
    password: 'ccaassee',
    id: 1
};

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
	console.log('in finduser');
	callback(null, usersWithPasswords[user_name]);
}

passport.serializeUser(function(user, done) {
    console.log('>>serializeUser called with user.id: ' + user.id);
    usersById[user.id] = user;
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	console.log('>> deserializeUser called. Returning: ' + usersById[id]);
    done(null, usersById[id]);
});

passport.use('local', new LocalStrategy(
 (username, password, done) => {
    findUser(username, (err, user) => {
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
        return done("Invalid password!!")
      }

      // if (password == 'ccaassee') {
      // 	console.log('Ok!  You have authenticated ;)');
      // 	return done(null, user);      	
      // } else {
      // 	return done("Invalid password!");
      // }

    })
  }
));


// ========== Standard stuff from Banas tutorial
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
//app.use(flash());

// routes ======================================================================
require('./app/routes.js')(app, passport, coverageCalendar); // load our routes and pass in our app and fully configured passport

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + ' press Ctrl-C to terminado');
});

