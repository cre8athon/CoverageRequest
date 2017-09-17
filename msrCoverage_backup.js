// We need this to build our post string
var querystring = require('querystring');
var http = require('http');
var fs = require('fs');
var request = require('request');

const CAL_ID = 'ksr68d2jhiqwh12ghb';
const API_KEY = '4887c46d317a218dcd8723c097cd58f2ca195a36c35aa75ede9b1b6a243fddfd'
const CAL_URL = 'https://api.teamup.com';


var request = require('request');

function getFromCal(message) {
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
	   console.log(error);
	   console.log(JSON.stringify(response));
	   console.log(body);
	});
}


function postToCal(message) {
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



msg = {
	startDate: "2017-08-19",
	endDate: "2017-08-21"

}

//     "subcalendar_id": 730624,


create_event_msg = {
	"subcalendar_id": 3653990,
    "start_dt": "2017-08-23T18:00:00-0400",
    "end_dt": "2017-08-24T06:00:00-0400",
    "all_day": false,
    "rrule": "",
    "title": "Coverage Request",
    "who": "George Nowakowski",
    "location": "",
    "notes": "{'event':'Coverage Request', 'who': 'George Nowakowski', 'type': 'CC' }"
}


//postFromCal(msg)
postToCal(create_event_msg);