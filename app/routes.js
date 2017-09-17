// app/routes.js
module.exports = function(app, passport, coverageCalendar) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        //res.render('home'); // load the index.ejs file
        res.redirect('/home')
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {
        console.log('in handler: /login');
        // render the page and pass in any flash data if it exists
 //       res.render('login.ejs', { message: req.flash('loginMessage') }); 
        res.render('login')
    });

    app.get('/home', function(req, res) {
        console.log('in /home get handler')
        if( req.isAuthenticated() ) {
            // console.log('User is logged in.  Going to render home');
            // console.log('User: ' + JSON.stringify(req.user));
            // console.log('Cookies: ' + JSON.stringify(req.cookies));
            // console.log('Signed Cookies: ' + JSON.stringify(req.signedCookies))
            date_range = {
                startDate: "2017-08-19",
                endDate: "2017-08-21"

            };

            coverageCalendar.getCalendarEvents(date_range, function(error, response, body){
                if( error ) {
                    console.log('Error received while querying for range: ' + 
                        date_range.startDate + " - " + date_range.endDate);
                } else {
                    var parsedBody = JSON.parse(body);
                    console.log('Parsed body: ' + JSON.stringify(parsedBody));
                    res.render('home', 
                        {
                            username: req.user.username,
                            events: parsedBody.events
                        }
                    );
                }
            });
//            res.render('home', {username: req.user.username})
        } else {
//            console.log('User is not logged in!!!!, redirecting to login');
            res.redirect('login');
        }
    });

    app.post('/home', function(req, res) {
        console.log('posted to home!');
    });

    // app.post('/login', passport.authenticate('local', {
    //     successRedirect : '/home', // redirect to the secure profile section
    //     failureRedirect : '/login', // redirect back to the signup page if there is an error
    //     failureFlash : false // allow flash messages
    // }));

    function callAuth(req, res, next) {
        var ret = passport.authenticate('local');
        var x = ret(req, res, next);
    }

    app.post('/login', callAuth, function(req, res) {
        res.redirect('/home');
    }); 

    // app.post('/login', callAuth,
    //     function(req, res) {
    //         console.log('Authenticated');
    //         console.log('redirecting to /home');
    //         res.redirect('/home')
    // });


    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    // app.post('/signup', do all our passport stuff here);

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
