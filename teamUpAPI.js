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

function getFromCal(message, callback) {
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
	}, function(error, response, body){
		console.log('>>getFromCal');
		console.log('ERROR: ' + error);
		// console.log('RESPONSE: ' + response);
		// console.log('BODY: ' + body);
		var responseJSON = JSON.parse(body);

		for (var i = responseJSON.events.length - 1; i >= 0; i--) {
			var event = responseJSON.events[i];
			if (event.notes !== undefined) {
				var notesJSON = JSON.parse(event.notes.replace(/\'/g, '"')); 
				event.role = notesJSON.role;

				var pplCovering = '';
				if( notesJSON.coverage !== undefined ) {
					for (var i = notesJSON.coverage.length - 1; i >= 0; i--) {
						var coverer = notesJSON.coverage[i];
						pplCovering = pplCovering + coverer.name;
						console.log('((((((((((()))))))))))) is coverer.name == event.who ? ' + coverer.name + " == " + event.who + (coverer.name == event.who));
						if( coverer.name == event.who ) {
							event.isCovering = 'true';
						}
					}
				}

				if( pplCovering !== undefined && pplCovering.length > 0 ) {
					event.coverage = pplCovering;
				}


				// var noteValues = JSON.parse(event.notes.replace(/\'/g, '"')); 
				// var keys = Object.keys(noteValues);
				// for(var j=0;j<keys.length;j++){
				//     var key = keys[j];
				//     event[key] = noteValues[key];
				// }
			}
		};
		callback(error, response, body, responseJSON);
	});
}

function getEvent(eventId, callback) {
	request.get({
	     url: CAL_URL + '/' + CAL_ID + '/events/' + eventId,
	     headers: {
//	        "Content-Type": "application/json",
	        "Content-Type": "text/javascript",
	        "Teamup-Token": API_KEY
	     },
	     body: ''
	}, function(error, response, body){
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

function postToCal(message, extra_meta) {

	message['notes'] = JSON.stringify(extra_meta);		
	console.log('Posting to Cal: \n' + JSON.stringify(message, null, 4));
	request.post({
	     url: CAL_URL + '/' + CAL_ID + '/events',
	     headers: {
	        "Content-Type": "application/json",
	        "Teamup-Token": API_KEY
	     },
	     body: message
	     ,
	     json:true
	}, function(error, response, body){
	   console.log('Error: ' + error);
	   console.log('Response: \n' + JSON.stringify(response));
	   console.log('Body: ' + JSON.stringify(body));
	});
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
		var modifiedNotes = removeCoverageFromNotes(coveredBy, msgJSON.event.notes);		
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
	if( coveredBy.id === undefined || coveredBy.name == undefined ) {
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
				if( notesJSON.coverage[i].id == coveredBy.id ) {
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
				if( substitute.id != coveredBy.id ) {
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


var input_notes = JSON.stringify({
	role: 'EMT',
	coverage: [
		'George',
		'Scott'
	]
});


// ====================================================================================================
// ====================================================================================================
// EXPORTS
// ====================================================================================================
// ====================================================================================================
module.exports = {
	getCalendarEvents: getFromCal,
	getEvent: getEvent,
	deleteEvent: deleteEvent,
	postRequestToCalendar: postToCal,
	addCoverage: addCoverage,
	removeCoverage: removeCoverage,
	_updateEvent: updateEvent,
	_addCoverageToNotes: addCoverageToNotes,
	_removeCoverageFromNotes: removeCoverageFromNotes
}

