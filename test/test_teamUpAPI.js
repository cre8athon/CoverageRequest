/**
 * Unit tests for teamUpAPI.js 
 * To run (once): 
 * mocha 
 *
 * To run continually: 
 * mocha test --recursive --watch
 */

const calendarAPI = require('../teamUpAPI.js');
const chai = require('chai');
const chaiJsonEqual = require('chai-json-equal');
const assert = chai.assert;
const expect = chai.expect;
chai.use(chaiJsonEqual);


describe('Test create Event', function() {

	var mrs_user = {"username":"georgen","displayname":"George Nowakowski","role":"Crew Chief","password":"ccaassee", "email": "gmn314@yahoo.com"};

	it('first one', function() {
		var startDateTimeString = '';
		var endDateTimeString = ''; 
		var coverageType = 'EMT';
		var calendarId = '112299887';
		var event_location = '43';

		var expected_message = {
	        "subcalendar_id": calendarId,
	        "start_dt": startDateTimeString,
	        "end_dt": endDateTimeString,
	        "all_day": false,
	        "rrule": "",
	        "title": "Coverage Request",
	        "who": mrs_user.displayname,
	        "notes": "{\"role\":\"EMT\",\"requestor\":{\"email\":\"gmn314@yahoo.com\",\"username\":\"georgen\"}}",
	        "location": event_location
	    };

	    var create_message = calendarAPI._generateCreateEventMessage(startDateTimeString, endDateTimeString, 
			coverageType, 
			mrs_user, 
			calendarId, 
			event_location);

	    expect(expected_message).to.jsonEqual(create_message);
	    //expected_message.should.jsonEqual(create_message);
//	    assert.equal(expected_message, create_message);
	});
});

describe('addCoverageTests', function() {

	it('addCoverage to blank notes field', function() {
		var input_notes = undefined;
		var expected_notes = JSON.stringify(
			{
				coverage:
				[
					{email: 'alice@yahoo.com', name: "Alice"}
				] 
			});

		var modifiedMsg = calendarAPI._addCoverageToNotes({email: 'alice@yahoo.com', name: "Alice"}, input_notes);
		assert.equal(expected_notes, modifiedMsg);

//TODO:		calendarAPI.getCoveringEventsFromEvents(responseJSON);

        });

	it('addCoverage when role exists in notes field', function() {
		var input_notes = JSON.stringify({
			role: 'EMT'
		});

		var expected_notes = JSON.stringify({role:"EMT",coverage:[{email: 'alice@yahoo.com', name: "Alice"}]});
		var modifiedMsg = calendarAPI._addCoverageToNotes({email: 'alice@yahoo.com', name: "Alice"}, input_notes);

		assert.equal(expected_notes, modifiedMsg);
	});

	it('Add coverage when two already exist', function() {
		var input_notes = JSON.stringify({
			role: 'EMT',
			requestor: {email: 'inge@yahoo.com', name: "Inge Monticello"},
			coverage: [
				{email: 'gmn314@yahoo.com', name: "George"},
				{email: 'scott@yahoo.com', name: "Scott"}
			]
		});

		var expected_notes = JSON.stringify({role:"EMT",requestor: {email: 'inge@yahoo.com', name: "Inge Monticello"}, 
			coverage:[{email: 'gmn314@yahoo.com', name: "George"},{email: 'scott@yahoo.com', name: "Scott"},
			{email: 'alice@yahoo.com', name: "Alice"}]});
		var modifiedMsg = calendarAPI._addCoverageToNotes({email: 'alice@yahoo.com', name: "Alice"}, input_notes);

		assert.equal(expected_notes, modifiedMsg);
	});

	it('Add existing coverage when two already exist', function() {
		var input_notes = JSON.stringify({
			role: 'EMT',
			coverage: [
				{email: 'gmn314@yahoo.com', name: "George"},
				{email: 'scott@yahoo.com', name: "Scott"}
			]
		});

		var expected_notes = JSON.stringify({role:"EMT",coverage:[{email: 'gmn314@yahoo.com', name: "George"},{email: 'scott@yahoo.com', name: "Scott"},
			{email: 'alice@yahoo.com', name: "Alice"}]});
		var modifiedMsg = calendarAPI._addCoverageToNotes({email: 'gmn314@yahoo.com', name: "George"}, input_notes);

		assert.equal(input_notes, modifiedMsg);
	});

	it('Add invalid coverer', function() {
		var input_notes = JSON.stringify({
			role: 'EMT',
			coverage: [
				{email: 'gmn314@yahoo.com', name: "George"},
				{email: 'scott@yahoo.com', name: "Scott"}
			]
		});

		var modifiedMsg = calendarAPI._addCoverageToNotes({name: "George"}, input_notes);

		assert.equal(input_notes, modifiedMsg);
	});
});

describe('removeCoverage tests', function() {

	it('remove One from Notes', function() {
		var input_notes = JSON.stringify({
			role: 'EMT',
			coverage: [
				{email: 'gmn314@yahoo.com', name: "George"},
				{email: 'scott@yahoo.com', name: "Scott"}
			]
		});

		var expected_notes = JSON.stringify({
			role: 'EMT',
			coverage: [
				{email: 'gmn314@yahoo.com', name: "George"}
			]
		});

		var modifiedNotes = calendarAPI._removeCoverageFromNotes({email: 'scott@yahoo.com', name: "Scott"}, input_notes);

		assert.equal(expected_notes, modifiedNotes);
	});

	it('remove last one from Notes', function() {
		var input_notes = JSON.stringify({
			role: 'EMT',
			coverage: [
				{email: 'gmn314@yahoo.com', name: "George"}
			]
		});

		var expected_notes = JSON.stringify({
			role: 'EMT'
		});

		var modifiedNotes = calendarAPI._removeCoverageFromNotes({email: 'gmn314@yahoo.com', name: "George"}, input_notes);

		assert.equal(expected_notes, modifiedNotes);
	});

	it('remove from Notes - no coverage', function() {
		var input_notes = JSON.stringify({
			role: 'EMT'
		});

		var modifiedNotes = calendarAPI._removeCoverageFromNotes('George', input_notes);

		assert.equal(input_notes, modifiedNotes);
	});

	it('remove from Notes, bad id, not removed', function() {
		var input_notes = JSON.stringify({
			role: 'EMT',
			coverage: [
				{email: 'gmn314@yahoo.com', name: "George"},
				{email: 'scott@yahoo.com', name: "Scott"}
			]
		});

		var modifiedNotes = calendarAPI._removeCoverageFromNotes({email: 'albert@yahoo.com', name:'Al'}, input_notes);

		assert.equal(input_notes, modifiedNotes);
	});

});

