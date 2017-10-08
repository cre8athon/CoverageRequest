
function dateTimeToISO(date, time) {

	if( time.length < 4 ) {
		return '';
	}

	if( time.indexOf(':') === -1 ) {
		time = time.substring(0, 2) + ':' + time.substring(3);
	}

	if( time.indexOf('+') === -1 ) {
		time = time + '+0000';
	}

	Date.prototype.toIsoString = function() {
	    var tzo = -this.getTimezoneOffset(),
	        dif = tzo >= 0 ? '+' : '-',
	        pad = function(num) {
	            var norm = Math.floor(Math.abs(num));
	            return (norm < 10 ? '0' : '') + norm;
	        };
	    return this.getFullYear() +
	        '-' + pad(this.getMonth() + 1) +
	        '-' + pad(this.getDate()) +
	        'T' + pad(this.getHours()) +
	        ':' + pad(this.getMinutes()) +
	        ':' + pad(this.getSeconds()) +
	        dif + pad(tzo / 60) +
	        ':' + pad(tzo % 60);
	}

	return new Date(Date.parse(date + ' ' + time)).toIsoString();	
}

function addYearToDate(startDate) {
	var day = 60 * 60 * 24 * 1000;
	var year = day * 365;
	var endDate = new Date(startDate.getTime() + year);

	return endDate;
}


module.exports = {
	dateTimeToISO : dateTimeToISO,
	addYearToDate : addYearToDate
}