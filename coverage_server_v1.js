var express = require('express');
var passport = require('passport');
var session = require('express-session');
var parseurl = require('parseurl');

var app = express();
app.use(passport.initialize());
app.use(passport.session());

const LocalStrategy = require('passport-local').Strategy


app.disable('x-powered-by');

var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(require('body-parser').urlencoded({extended: true}));

//var formidable = require('formidable');

var credentials = require('./credentials.js');
app.use(require('cookie-parser')(credentials.cookieSecret));

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));


// ------------------------------------------------------------------------------------

const user = {  
  username: 'test-user',
  passwordHash: 'bcrypt-hashed-password',
  id: 1
}

function findUser(username, callback) {
	console.log('in finduser');
	callback(null, user);
}

// ------------------------------------------------------------------------------------
// Passport initialization

passport.use(new LocalStrategy(  
 (username, password, done) => {
    findUser(username, (err, user) => {
    	console.log('>> findUser called with user: ' + user);

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

      if (password == 'ccaassee') {
      	return done(null, user);      	
      } else {
      	return done("Invalid password!");
      }

    })
  }
))

app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

var User = require('./models/user');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

function authenticationMiddleware () {  
  return function (req, res, next) {
  	console.log('In function authenticationMiddleware');
    if (req.isAuthenticated()) {
    	console.log('...going next');
      return next()
    }
    console.log('redirecting')
    res.redirect('/')
  }
}

function renderProfile (req, res) {
  res.render('profile', {
    username: req.user.username
  })
}


// =====================================================================================
// REQUEST HANDLERS

app.get('/', function(req, res) {
 	res.render('home');
 });

app.post('/login', passport.authenticate('local', { successRedirect: '/',
                                                    failureRedirect: '/login' }));


// app.get('/login', function(req, res, next) {
//   passport.authenticate('local', function(err, user, info) {
//     if (err) { return next(err); }
//     if (!user) { return res.redirect('/login'); }
//     req.logIn(user, function(err) {
//       if (err) { return next(err); }
//       return res.redirect('/users/' + user.username);
//     });
//   })(req, res, next);
// });


// app.get('/profile', function(req, res) {
// 	res.render('profile');
// });

//app.get('/', authenticationMiddleware(), renderProfile);

// app.get('/', function(req, res){
// 	console.log('**** Going to render home!! ****')
//   res.render('home');
// });

app.use(function(req, res, next){
  console.log("Looking for URL : " + req.url);
  next();
});

app.get('/junk', function(req, res, next){
  console.log('Tried to access /junk');
  throw new Error('/junk doesn\'t exist');
});

app.use(function(err, req, res, next){
  console.log('Error : ' + err.message);
  next();
});

app.get('/about', function(req, res){
  res.render('about');
});

app.get('/contact', function(req, res){
  res.render('contact', { csrf: 'CSRF token here'});
});

app.get('/thankyou', function(req, res){
  res.render('thankyou');
});

app.post('/process', function(req,res){
  console.log('Form : ' + req.query.form);
  console.log('CSRF token : ' + req.body._csrf);
  console.log('Email : ' + req.body.email);
  console.log('Question : ' + req.body.ques);
  res.redirect(303, '/thankyou');
});

app.get('/cookie', function(req, res){
  res.cookie('username', 'Derek Banas', {expire: new Date() + 9999}).send('username has the value of Derek Banas');
});

app.get('/listcookies', function(req, res){
  console.log("Cookies : ", req.cookies);
  res.send('Look in the console for cookies');
});

app.get('/deletecookie', function(req, res){
  res.clearCookie('username');
  res.send('username Cookie Deleted');
});


app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: credentials.cookieSecret,
}));

app.use(function(req, res, next){
  var views = req.session.views;

  if(!views){
    views = req.session.views = {};
  }

  var pathname = parseurl(req).pathname;

  views[pathname] = (views[pathname] || 0) + 1;

  next();

});

app.get('/viewcount', function(req, res, next){
  res.send('You viewed this page ' + req.session.views['/viewcount'] + ' times');
});

var fs = require("fs");

app.get('/readfile', function(req, res, next){
  fs.readFile('./public/randomfile.txt', function(err, data){
      if(err){
        return console.error(err);
      }
      res.send("the File : " + data.toString());
  });
});

app.get('/writefile', function(req, res, next){
  fs.writeFile('./public/randomfile2.txt',
    'More random text', function(err){
      if(err){
        return console.error(err);
      }
    });

  fs.readFile('./public/randomfile2.txt', function(err, data){
    if(err){
      return console.error(err);
    }
    res.send("The File " + data.toString());
  });

});

app.use(function(req, res){
  res.type('text/html');
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});


app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + ' press Ctrl-C to terminado');
});



