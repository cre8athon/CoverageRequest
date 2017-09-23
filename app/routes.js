// app/routes.js
const SUB_CALENDAR_ID = 3653990;
const EVENT_LOCATION = '43';

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

    app.post('/createCoverageRequest', function(req, res) {

        console.log('Cookies: ' + JSON.stringify(req.cookies));
        create_event_msg = {
            "subcalendar_id": SUB_CALENDAR_ID,
            "start_dt": req.body.coverageStartDate,
            "end_dt": req.body.coverageEndDate,
            "all_day": false,
            "rrule": "",
            "title": "Coverage Request",
            "who": req.body.requestor,
            "location": EVENT_LOCATION
        };

        var extra_meta = {}
        extra_meta['role'] = req.body.role;

        //console.log('-------- extra_meta: ' + JSON.stringify(extra_meta));

        coverageCalendar.postRequestToCalendar(create_event_msg, extra_meta);
        // console.log('************************************************');
        // console.log(JSON.stringify(create_event_msg));

        // res.username = req.body.username;
        // res.id = req.body.id;
        res.redirect('/home');
    });

    app.post('/deleteEvent', function(req, res) {
        if( !req.isAuthenticated() ) {
            res.redirect('login');
        }

        coverageCalendar.getEvent(req.body.eventId, function(error, eventId, body) {
            console.log('\n\n------------------ Got event ----------------------');
            console.log(body);
            console.log('------------------ Got event ----------------------\n\n');

            coverageCalendar.deleteEvent(eventId, body, function(error) {
                res.redirect('/home');
            });
        });
    });

    app.get('/home', function(req, res) {

        console.log('in /home get handler: ');
//        console.log('Here are the cooks: ' + JSON.stringify(req.cookies));
        if( req.isAuthenticated() ) {

            date_range = {
                startDate: "2017-08-19",
                endDate: "2017-10-01"

            };

            coverageCalendar.getCalendarEvents(date_range, function(error, response, body, calendarEvents){
                console.log('Got calendar events: ' + JSON.stringify(calendarEvents));
                if( error ) {
                    console.log('Error received while querying for range: ' + 
                        date_range.startDate + " - " + date_range.endDate);
                } else {
                    res.render('home', {
                        user: req.cookies.mrs_user,
                        events: calendarEvents.events,
                        origBody: body
                        }
                    );
                }
            });
        } else {
            res.redirect('login');
        }
    });

    app.post('/offerCoverage', function(req, res) {
        
        coverageCalendar.addCoverage(req.body.eventId, {id: req.body.userId, name: req.body.userName}, 
            function(error, response, body) {
                res.redirect('home');
            });
    });

    app.post('removeCoverage', function(req, res) {
        coverageCalendar.removeCoverage(req.body.eventId, {id: req.body.userId, name: req.body.userName}, 
            function(error, response, body) {
                res.redirect('home');
            });
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
        ret(req, res, next);
    }

    app.post('/login', callAuth, function(req, res) {

        console.log('Here is the user: ' + JSON.stringify(req.user));
        res.cookie('mrs_user', req.user);
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
