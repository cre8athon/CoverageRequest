// app/routes.js
const SUB_CALENDAR_ID = 3653990;
const EVENT_LOCATION = '43';

const utils = require('../utils');
const dateFormat = require('dateformat');
const path = require('path');
const express = require('express');

module.exports = function(app, passport, coverageCalendar) {


    app.use(express.static(path.resolve('./public')));

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

    // ===========================================================
    // Catch all - block any requests unless authenticated!
    // ===========================================================
    // app.all('*', function(req, res, next) {
    //     if( !req.isAuthenticated() ) {
    //         res.redirect('login');
    //     }
    //     next();
    // });

    app.post('/createCoverageRequest', function(req, res) {

        var startDateTimeString = utils.dateTimeToISO(req.body.coverageStartDate, req.body.coverageStartTime);
        var endDateTimeString = utils.dateTimeToISO(req.body.coverageEndDate, req.body.coverageEndTime);

        coverageCalendar.createCoverageRequest(
            startDateTimeString, 
            endDateTimeString, 
            req.body.coverageType,
            req.cookies.mrs_user, 
            SUB_CALENDAR_ID, 
            EVENT_LOCATION,
            function(error, response, body) {
                 res.redirect('/home');
            }
        );
    });

    app.post('/deleteEvent', function(req, res) {
        if( !req.isAuthenticated() ) {
            res.redirect('login');
        }

        coverageCalendar.getEvent(req.body.eventId, function(error, eventId, body) {
            console.log('\n\n------------------ Got event ----------------------');
            console.log(body);
            console.log('------------------ Got event ----------------------\n\n');

            var notes = JSON.parse(JSON.parse(body).event.notes);

            if( notes.requestor.id != req.cookies.mrs_user.id ) {
                console.log('Attempt to delete event created by: ' + notes.requestor.id + ' By user with id: ' + 
                    req.cookies.mrs_user.id + ' ** Aborting **');
                res.redirect('/home');               
            }

            coverageCalendar.deleteEvent(eventId, body, function(error) {
                res.redirect('/home');
            });
        });
    });

    app.get('/home', function(req, res) {

        console.log('in /home get handler: ');
//        console.log('Here are the cooks: ' + JSON.stringify(req.cookies));
        if( req.isAuthenticated() ) {

            var now = new Date();

            date_range = {
                startDate: dateFormat(now, 'yyyy-mm-dd'),
                endDate: dateFormat(utils.addYearToDate(now), 'yyyy-mm-dd')
            };

            console.log('>>>>>> Date range: ' + JSON.stringify(date_range));

            coverageCalendar.getCalendarEvents(date_range, req.cookies.mrs_user, function(error, response, body, coveringEventIds, calendarEvents){
                if( error ) {
                    console.log('Error received while querying for range: ' + 
                        date_range.startDate + " - " + date_range.endDate);
                } else {
                    res.render('home', {
                        user: req.cookies.mrs_user,
                        events: calendarEvents.events,
                        coveringEventIds: coveringEventIds,
                        eventText: JSON.stringify(calendarEvents.events)
//                        origBody: body
                        }
                    );
                }
            });
        } else {
            res.redirect('login');
        }
    });

    app.get('/requestcoverage', function(req, res) {
        if( req.isAuthenticated() ) {
            res.render('requestcoverage', {username: req.cookies.mrs_user.displayname});
        } else {
           res.redirect('login');
        }
    });

    app.post('/offerCoverage', function(req, res) {
        console.log(">> offerCoverage: " + JSON.stringify({id: req.body.userId, name: req.body.userName}, null, 4));
        coverageCalendar.addCoverage(req.body.eventId, {id: req.body.userId, name: req.body.userName}, 
            function(error, response, body) {
                res.redirect('home');
            });
    });

    app.post('/removeCoverage', function(req, res) {
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
