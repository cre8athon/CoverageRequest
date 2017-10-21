var express = require('express');
var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
//var flash = require('connect-flash');
var flash = require('express-flash');

passport.use(new LocalStrategy(
    function(username, password, done) {

        if( username != 'georgen' ) {
            return done(null, false, { message: 'Incorrect username.' });
        }

        if(password != 'ccaassee' ) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    }
));

var app = express();

app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));


var handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(flash());

app.get('/login', function(req, res) {
    res.render('test_login')
});


app.post('/login',
    passport.authenticate('local', { successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true })
);

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + ' press Ctrl-C to terminado');
});

module.exports = server;

