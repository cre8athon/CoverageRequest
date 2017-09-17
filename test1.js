var coverage = require('./mrsCoverage.js')

date_range = {
	startDate: "2017-08-19",
	endDate: "2017-08-21"
}

coverage.getCalendarEvents(date_range, function(error, response, body){
	if( error ) {
		console.log('Error received while querying for range: ' + 
			date_range.startDate + " - " + date_range.endDate);
	} else {
		var parsedBody = JSON.parse(body);
		for( var event of parsedBody.events ) {
			console.log('who? ' + event.who);
		}
	}
});

