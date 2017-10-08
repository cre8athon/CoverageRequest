/**
 * Unit tests for utils.js 
 * To run (once): 
 * mocha 
 *
 * To run continually: 
 * mocha test --recursive --watch
 */

const util = require('../utils.js');
const chai = require('chai');
const assert = chai.assert;


describe('addCoverageTests', function() {

	it('Convert date, time into ISO datetime', function() {
		var expectedDate = '2017-09-26T14:00:00-04:00';

		var isoDate = util.dateTimeToISO('Tuesday September 26, 2017', '1800');
		assert.equal(expectedDate, isoDate);
	});

	it('addYeartoDate', function() {
		var startDate = new Date('2017-03-14');
		var expectedEndDate = new Date('2018-03-14');

		var endDate = util.addYearToDate(startDate);

		assert.equal(expectedEndDate.toISOString(), endDate.toISOString());
	})

});