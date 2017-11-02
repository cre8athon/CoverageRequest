
const utils = require('../utils');
const dateFormat = require('dateformat');
const path = require('path');
const express = require('express');
const authenticator = require('../authenticator');

module.exports = function(router, coverageCalendar) {

    function prepareItem(source) {
        var result = source;
        result.Married = source.Married === 'true' ? true : false;
        result.Country = parseInt(source.Country, 10);
        return result;
    }

    function getClientFilter(query) {
        var result = {
            Name: new RegExp(query.Name, "i"),
            Address: new RegExp(query.Address, "i")
        };

        if (query.Married) {
            result.Married = query.Married === 'true' ? true : false;
        }

        if (query.Country && query.Country !== '0') {
            result.Country = parseInt(query.Country, 10);
        }

        return result;
    }

    function convertCalEventToDisplayEvent(calendarEvent) {


        // {
        //     "id": "141633561",
        //     "series_id": null,
        //     "remote_id": null,
        //     "subcalendar_id": 3653990,
        //     "subcalendar_ids": [
        //     3653990
        // ],
        //     "start_dt": "2017-10-21T14:00:00-04:00",
        //     "end_dt": "2017-10-22T02:00:00-04:00",
        //     "all_day": false,
        //     "rrule": "",
        //     "title": "Coverage Request",
        //     "who": "George Nowakowski",
        //     "location": "43",
        //     "notes": "{\"role\":\"EMT\",\"requestor\":{\"email\":\"gmn314@yahoo.com\"}}",
        //     "version": "59eac5f8e5fe2",
        //     "ristart_dt": null,
        //     "rsstart_dt": null,
        //     "creation_dt": "2017-10-21T03:40:53+00:00",
        //     "update_dt": "2017-10-21T03:58:48+00:00",
        //     "delete_dt": null,
        //     "readonly": false,
        //     "tz": null,
        //     "role": "EMT"
        // }
        var notesJson = JSON.parse(calendarEvent.notes);
        var displayEvent = {
            external_event_id: calendarEvent.id,
            requester: notesJson.requestor.displayname,
            coverage_status: "Not Covered",
            covered_by: "",
            req_role: 1,
            start_dt: "2017-10-21",
            start_t: "18:00",
            end_dt: "2017-10-22",
            end_t: "06:00"

        }
    }

    function find(user, filter, callback) {

        var now = new Date();
        var calendar_query = {
            startDate: dateFormat(now, 'yyyy-mm-dd'),
            endDate: dateFormat(utils.addYearToDate(now), 'yyyy-mm-dd')
        };

        coverageCalendar.getCalendarEvents(calendar_query, user, function (error, response, body, coveringEventIds, calendarEvents) {
            if (error) {
                console.log('Error received while querying for range: ' +
                    date_range.startDate + " - " + date_range.endDate);
            } else {

                console.log('Got the following events: ' + JSON.stringify(calendarEvents.events, null, 4));
                var items = [
                    {
                        requester: "George Nowakowski",
                        coverage_status: "Not Covered",
                        covered_by: "",
                        req_role: 1,
                        start_dt: "2017-10-21",
                        start_t: "18:00",
                        end_dt: "2017-10-22",
                        end_t: "06:00"
                    },
                    {
                        requester: "George Nowakowski",
                        coverage_status: "Covered",
                        covered_by: "Inge Montecello",
                        req_role: 2,
                        start_dt: "2017-10-22",
                        start_t: "18:00",
                        end_dt: "2017-10-23",
                        end_t: "06:00"
                    },
                    {
                        requester: "Mark Swartz",
                        coverage_status: "Not Covered",
                        covered_by: "",
                        req_role: 3,
                        start_dt: "2017-10-18",
                        start_t: "06:00",
                        end_dt: "2017-10-18",
                        end_t: "18:00"
                    }
                ];

                callback(undefined, items);

                // res.render('home', {
                //         user: req.session.user,
                //         events: calendarEvents.events,
                //         coveringEventIds: coveringEventIds,
                //         eventText: JSON.stringify(calendarEvents.events),
                //         user_as_text: JSON.stringify(req.session.user, null, 4)
                //     }
                // );
            }
        });

    }

    router.get('/coveragedata', authenticator.ensure_authenticated, function (req, res, next) {
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ You called it!!");
        find(req.session.user, getClientFilter(req.query), function (err, items) {
            res.json(items);
        });
    });

    router.post('/coveragedata', authenticator.ensure_authenticated, function (req, res, next) {
        db.insert(prepareItem(req.body), function (err, item) {
            res.json(item);
        });
    });

    router.put('/coveragedata', authenticator.ensure_authenticated, function (req, res, next) {
        var item = prepareItem(req.body);

        db.update({_id: item._id}, item, {}, function (err) {
            res.json(item);
        });
    });

    router.delete('/coveragedata', authenticator.ensure_authenticated, function (req, res, next) {
        var item = prepareItem(req.body);

        db.remove({_id: item._id}, {}, function (err) {
            res.json(item);
        });
    });
}