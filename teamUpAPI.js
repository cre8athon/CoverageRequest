/**
Author: George Nowakowski
Description: CalendarAPI to teamup.com
Notes:
	By convention, private functions are exported with an "_" at the beginning of the name
	for unit testing.
**/


// We need this to build our post string
var querystring = require('querystring');
var http = require('http');
var fs = require('fs');
var request = require('request');

const CAL_ID = 'ksr68d2jhiqwh12ghb';
const API_KEY = '4887c46d317a218dcd8723c097cd58f2ca195a36c35aa75ede9b1b6a243fddfd'
const CAL_URL = 'https://api.teamup.com';

var request = require('request');

function getFromCal(message, user, callback) {
	request.get({
	     url: CAL_URL + '/' + CAL_ID + '/events?' + querystring.stringify(message),
	     headers: {
//	        "Content-Type": "application/json",
	        "Content-Type": "text/javascript",
	        "Teamup-Token": API_KEY
	     },
	     body: ''
//	     ,
//	     json:true
	}, function(error, response, body) {
		console.log('>>getFromCal');
		console.log('ERROR: ' + error);
		// console.log('RESPONSE: ' + response);
		console.log('BODY: ' + body);
		var responseJSON = JSON.parse(body);

		var coveringEventIds = getCoveringEventsFromEvents(responseJSON, user)

		callback(error, response, body, coveringEventIds, responseJSON);
	});
}

function getCoveringEventsFromEvents(responseJSON, user) {

    var coveringEventIds = [];
    for (var i = 0; i < responseJSON.events.length; i++) {

        var event = responseJSON.events[i];
        if (event.notes !== undefined) {
            var notesJSON = JSON.parse(event.notes.replace(/\'/g, '"'));
            event.role = notesJSON.role;

            var pplCovering = '';
            if( notesJSON.coverage !== undefined ) {
                for (var j = notesJSON.coverage.length - 1; j >= 0; j--) {
                    var coverer = notesJSON.coverage[j];
                    pplCovering = pplCovering + coverer.name;
                    if( coverer.email === user.email ) {
                        coveringEventIds.push(event.id);
                    }
                }
            }

            if( pplCovering !== undefined && pplCovering.length > 0 ) {
                event.coverage = pplCovering;
            }
        }
    }
    return coveringEventIds;

}

function getEvent(eventId, callback) {
	console.log('>> Getting event with id: ' + eventId);
	request.get({
	     url: CAL_URL + '/' + CAL_ID + '/events/' + eventId,
	     headers: {
//	        "Content-Type": "application/json",
	        "Content-Type": "text/javascript",
	        "Teamup-Token": API_KEY
	     },
	     body: ''
	}, function(error, response, body){
		console.log('#ERROR: ' + error);
		console.log('#Response: ' + JSON.stringify(response));
		console.log('#Body: ' + JSON.stringify(body));
		console.log('Received event: ' + body);
		callback(error, eventId, body);
	});		
}

function deleteEvent(requestId, event, callback) {
	console.log("\n\n\n Deleting event: \n");
	console.log(JSON.stringify(JSON.parse(event).event, null, 4));
	request.delete({
	     url: CAL_URL + '/' + CAL_ID + '/events' + '/' + requestId,
	     headers: {
	        "Content-Type": "application/json",
	        "Teamup-Token": API_KEY
	     },
	     body: JSON.parse(event).event,
	     json:true
	}, function(error, response, body){
	   console.log('Error: ' + error);
	   console.log('Response: \n' + JSON.stringify(response));
	   console.log('Body: ' + JSON.stringify(body));
	   callback(error);
	});

}

function postToCal(message, callback) {
	request.post({
	     url: CAL_URL + '/' + CAL_ID + '/events',
	     headers: {
	        "Content-Type": "application/json",
	        "Teamup-Token": API_KEY
	     },
	     body: message,
	     json:true
	}, function(error, response, body){
		console.log('<< postToCal');
	    console.log('Error: ' + error);
	    console.log('Response: \n' + JSON.stringify(response));
	    console.log('Body: ' + JSON.stringify(body));
	    callback(error, response, body);
	});
}

function createCoverageRequest(
	startDateTimeString, 
	endDateTimeString, 
	coverageType, 
	mrs_user, 
	calendarId, 
	event_location, 
	callback) {

	var create_event_msg = generateCreateEventMessage(startDateTimeString, endDateTimeString, 
	coverageType, 
	mrs_user, 
	calendarId, 
	event_location);

    postToCal(create_event_msg,  
    	function(error, response, body) {
    		callback(error, response, body);
    	} 
    );
}

function generateCreateEventMessage(startDateTimeString, endDateTimeString, 
	coverageType, 
	mrs_user, 
	calendarId, 
	event_location) {

    create_event_msg = {
        "subcalendar_id": calendarId,
        "start_dt": startDateTimeString,
        "end_dt": endDateTimeString,
        "all_day": false,
        "rrule": "",
        "title": "Coverage Request",
        "who": mrs_user.displayname,
        "location": event_location
    };

    create_event_msg.notes = JSON.stringify({
    	role: coverageType,
    	requestor: {
    		email: mrs_user.email,
    		username: mrs_user.username
    	}
    });

    return create_event_msg;
}

/**
 * Add person to cover the request
 * @param {String} -  event_id - the event id to which to add coverage
 * @param {JSON} - Who will cover: {id: xx, name: 'yy'} 
 * @param {Function} - Prototype: function(error, response, body)
 */
function addCoverage(event_id, coveredBy, callback) {
	//TODO: If only covering part - split into 2 events, also, unsplit back!
	getEvent(event_id, function(error, eventId, body) {
		console.log('<< got event with id: ' + event_id);
		var eventJSON = JSON.parse(body);
		var modifiedNotes = addCoverageToNotes(coveredBy, eventJSON.event.notes);
		eventJSON.event.notes = modifiedNotes;
		updateEvent(event_id, eventJSON.event, callback);
	}); 
} 

/**
* @param {String} -  event_id - the event id to which to add coverage
* @param {JSON} - Who will cover: {id: xx, name: 'yy'} 
* @param {Function} - Prototype: function(error, response, body)
*/
function removeCoverage(event_id, coveredBy, callback) {
	getEvent(event_id, function(error, eventId, body) {
		var eventJSON = JSON.parse(body);
		var modifiedNotes = removeCoverageFromNotes(coveredBy, eventJSON.event.notes);		
		eventJSON.event.notes = modifiedNotes;
		updateEvent(event_id, eventJSON.event, callback);
	});
}

function updateEvent(eventId, eventBody, callback) {
	request.put({
	     url: CAL_URL + '/' + CAL_ID + '/events/' + eventId,
	     headers: {
	        "Content-Type": "application/json",
	        "Teamup-Token": API_KEY
	     },
	     body: eventBody,
	     json:true
	}, function(error, response, body) {
		console.log('<< Results from updateEvent: ');
	   	console.log('Error: ' + error);
	   	console.log('Response: \n' + JSON.stringify(response));
	   	console.log('Body: ' + JSON.stringify(body));

		callback(error, response, body);
	});
}

/*
	coveredBy - member name to add as coveredBy
	msgJSON - JSON of the event message

	returns the notes JSON stringified
*/
function addCoverageToNotes(coveredBy, notes) {	
	if( coveredBy.email === undefined || coveredBy.name === undefined ) {
		return notes;
	}

	var notesJSON;
	if( notes === undefined ) {
		notesJSON = {coverage: [coveredBy]};
	} else {
		notesJSON = JSON.parse(notes);
		if( notesJSON.coverage === undefined ) {
			notesJSON.coverage = [coveredBy];
		} else {
			for (var i = notesJSON.coverage.length - 1; i >= 0; i--) {
				if( notesJSON.coverage[i].email === coveredBy.email ) {
					return notes;
				}
			}
			notesJSON.coverage.push(coveredBy);
		}
	}
	return JSON.stringify(notesJSON);
}

/**
 * @param  {coveredBy} - Person you are removing from coverage
 * @param  {notes} - String representation of value in notes
 * @return {modifiedNotes} - Notes with person removed (or empty string - not null)
 */
function removeCoverageFromNotes(coveredBy, notes) {
	var notesJSON;
	if( notes === undefined ) {
		return notes;
	} else {
		notesJSON = JSON.parse(notes);
		if( notesJSON.coverage === undefined ) {
			return notes;
		} else {
			var newArr = [];
			for (var i = 0; i < notesJSON.coverage.length; i++) {
				var substitute = notesJSON.coverage[i];
				if( substitute.email != coveredBy.email ) {
					newArr.push(substitute);
				}
			}

			if( newArr.length == 0 ) {
				delete notesJSON.coverage;
			} else {
				notesJSON.coverage = newArr;
			}
			return JSON.stringify(notesJSON);
		}
	}
}

// ====================================================================================================
// ====================================================================================================
// EXPORTS
// ====================================================================================================
// ====================================================================================================
module.exports = {
	getCalendarEvents: getFromCal,
	getEvent: getEvent,
	deleteEvent: deleteEvent,
	createCoverageRequest: createCoverageRequest,
	addCoverage: addCoverage,
	removeCoverage: removeCoverage,
	_updateEvent: updateEvent,
	_addCoverageToNotes: addCoverageToNotes,
	_removeCoverageFromNotes: removeCoverageFromNotes,
	_generateCreateEventMessage: generateCreateEventMessage
}

