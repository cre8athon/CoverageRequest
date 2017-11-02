// app/routes.js
const SUB_CALENDAR_ID = 3653990;
const EVENT_LOCATION = '43';

const utils = require('../utils');
const dateFormat = require('dateformat');
const path = require('path');
const express = require('express');
const authenticator = require('../authenticator');

var WSPREFIX = '/agency'


module.exports = function(app, passport, coverageCalendar, userManager) {

    // app.all('/coveragedata', function(req, res) {
    //    console.log('here');
    // });

    app.use(express.static(path.resolve('./public')));

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get(WSPREFIX + '/', function(req, res) {
        //res.render('home'); // load the index.ejs file
        res.redirect('/home')
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get(WSPREFIX + '/login', function(req, res) {
        res.render('login')
    });

    app.post(WSPREFIX + '/login', function(req, res) {

        if( authenticator.authenticate(req, req.body.username, req.body.password) ) {
            var user = req.session.user;
            if (user.usermustresetpw === true) {
                res.render('resetPassword', {user: user})
            } else {
                res.redirect(req.session.returnTo || '/home');
                delete req.session.returnTo;
            }
        } else {
            res.render('login', {message: 'Invalid UserId or Password'});
        }

    });
    app.get(WSPREFIX + '/resetPassword', function(req, res) {
       res.render('resetPassword');
    });

    app.post(WSPREFIX + '/resetPassword', authenticator.ensure_authenticated, function(req, res) {

        console.log('resetPassword, user struct: ' + JSON.stringify(req.session.user));
        req.session.user.password = req.body.newpassword;
        req.session.user.usermustresetpw = false;
        userManager.addOrSaveUser(req.session.user);

        res.redirect(req.session.returnTo || '/home');
        delete req.session.returnTo;
    });

    app.post(WSPREFIX + '/createCoverageRequest', authenticator.ensure_authenticated, function(req, res) {

        var startDateTimeString = utils.dateTimeToISO(req.body.coverageStartDate, req.body.coverageStartTime);
        var endDateTimeString = utils.dateTimeToISO(req.body.coverageEndDate, req.body.coverageEndTime);

        coverageCalendar.createCoverageRequest(
            startDateTimeString, 
            endDateTimeString, 
            req.body.coverageType,
            req.session.user,
            SUB_CALENDAR_ID, 
            EVENT_LOCATION,
            function(error, response, body) {
                 res.redirect('/home');
            }
        );
    });

    app.post(WSPREFIX + '/deleteEvent', authenticator.ensure_authenticated, function(req, res) {
        coverageCalendar.getEvent(req.body.eventId, function(error, eventId, body) {
            console.log('\n\n------------------ Got event ----------------------');
            console.log(body);
            console.log('------------------ Got event ----------------------\n\n');

            var notes = JSON.parse(JSON.parse(body).event.notes);

            if( notes.requestor.username != req.session.user.username ) {
                console.log('Attempt to delete event created by: ' + notes.requestor.username + ' By user with id: ' +
                    req.session.user.username + ' ** Aborting **');
                res.redirect('/home');               
            } else {
                coverageCalendar.deleteEvent(eventId, body, function (error) {
                    res.redirect('/home');
                });
            }
        });
    });

    app.get(WSPREFIX + '/userAdministration', authenticator.is_admin, function(req, res) {

       var users = userManager.getUsersForAgency(req.session.user.agency);
        res.render('userAdmin', {users:users, adminUser: req.session.user});
    });

    app.post(WSPREFIX + '/addNewUser', authenticator.is_admin, function(req, res) {
        console.log('Saving new user...');

        var userToAdd = {
            agency: req.body.agency,
            displayname: req.body.userdisplayname,
            email: req.body.username,
            isactive: req.body.userisactive,
            role: req.body.userrole,
            isadmin: req.body.userisadmin,
            password: req.body.userinitialpassword,
            usermustresetpw: true
        };

        console.log('Adding new user: ' + JSON.stringify(userToAdd));

        userManager.addOrSaveUser(userToAdd);
        res.render('/userAdmin');
    });

    app.get(WSPREFIX + '/home', authenticator.ensure_authenticated, function(req, res, next) {
        console.log('Here is the user at the home page: ' + req.session.user);
        var now = new Date();
        var date_range = {
            startDate: dateFormat(now, 'yyyy-mm-dd'),
            endDate: dateFormat(utils.addYearToDate(now), 'yyyy-mm-dd')
        };

        coverageCalendar.getCalendarEvents(date_range, req.session.user, function(error, response, body, coveringEventIds, calendarEvents){
            if( error ) {
                console.log('Error received while querying for range: ' +
                    date_range.startDate + " - " + date_range.endDate);
            } else {
                res.render('home', {
                        user: req.session.user,
                        events: calendarEvents.events,
                        coveringEventIds: coveringEventIds,
                        eventText: JSON.stringify(calendarEvents.events),
                        user_as_text: JSON.stringify(req.session.user, null, 4)
                    }
                );
            }
        });
    });

    app.get(WSPREFIX + '/requestcoverage', authenticator.is_authenticated, function(req, res) {
        res.render('requestcoverage', {username: req.session.user.displayname});
    });

    app.post(WSPREFIX + '/offerCoverage', authenticator.is_authenticated, function(req, res) {
        console.log(">> offerCoverage: " + JSON.stringify({email: req.body.userEmail, name: req.body.userName}, null, 4));
        coverageCalendar.addCoverage(req.body.eventId, {email: req.body.userEmail, name: req.body.userName},
            function(error, response, body) {
                res.redirect('home');
            });
    });

    app.post(WSPREFIX + '/removeCoverage', authenticator.is_authenticated, function(req, res) {
        coverageCalendar.removeCoverage(req.body.eventId, {email: req.body.userEmail, name: req.body.userName},
            function(error, response, body) {
                res.redirect('home');
            });
    });

    /* Example of how to to return json response (maybe for an ajax call?)
    app.get('/process_get', function (req, res) {
   // Prepare output in JSON format
   response = {
      first_name:req.query.first_name,
      last_name:req.query.last_name
   };
   console.log(response);
   res.end(JSON.stringify(response));
})

     */

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get(WSPREFIX + '/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

