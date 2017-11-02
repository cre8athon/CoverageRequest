/**
 * Unit tests for teamUpAPI.js 
 * To run (once): 
 * mocha 
 *
 * To run continually: 
 * mocha test --recursive --watch
 */


const userUtil = require('../fileUserManager.js')

const chai = require('chai');
const chaiJsonEqual = require('chai-json-equal');
const assert = chai.assert;
const expect = chai.expect;
chai.use(chaiJsonEqual);
const FS = require('fs');

const AGENCY_PROFILE_PATH = '/tmp/testProfiles';
const USER_PROFILE_PATH = AGENCY_PROFILE_PATH;
const EMAIL_TO_AGENCY_PATH = AGENCY_PROFILE_PATH;
const EMAIL_TO_AGENCY_INDEX = EMAIL_TO_AGENCY_PATH + '/' + 'testEmailToAgencyIndex.csv';

function createDirIfNotExists(dirname) {
    if (!FS.existsSync(dirname)) {
        FS.mkdirSync(dirname);
    }
}

function beforeTests() {
	createDirIfNotExists(AGENCY_PROFILE_PATH);
	createDirIfNotExists(USER_PROFILE_PATH);
	createDirIfNotExists(EMAIL_TO_AGENCY_PATH);
}

beforeTests();

describe('Test User CRUD', function() {

	before(function() {
		userUtil.setUserFileDir(AGENCY_PROFILE_PATH);
		userUtil.setProfileDir(USER_PROFILE_PATH);
		userUtil.setEmailToAgency(EMAIL_TO_AGENCY_INDEX);
	});

	var mrs_43user1 = {
		agency: 43,
		email:"gmn314@yahoo.com",
		displayname:"George Nowakowski",
		role:"Crew Chief",
		isactive: true,
		isadmin: true,
		password:"ccaassee",
        usermustresetpw: false
	};

	var mrs_43user2 = {
		agency: 43,
		email:"marksz@yahoo.com",
		displayname:"Mark Swartz",
		role:"Crew Chief",
		isactive: true,
		isadmin: false,
		password:"11223344",
        usermustresetpw: false
	};

	var mrs_43user3 = {
		agency: 43,
		email:"hillaryj@yahoo.com",
		displayname:"Hillary Jordan",
		role:"Assistant",
		isactive: true,
		isadmin: false,
		password:"zzee",
        usermustresetpw: false
	};

	var mrs_51user1 = {
		agency: 51,
		email:"samules@yahoo.com",
		displayname:"Sam Samuleson",
		role:"EMT",
		isactive: true,
		isadmin: true,
		password:"csssassee",
        usermustresetpw: false
	};

	var mrs_51user2 = {
		agency: 51,
		email:"tobyl@yahoo.com",
		displayname:"Toby Lyons",
		role:"EMT",
		isactive: false,
		isadmin: false,
		password:"11223344",
        usermustresetpw: false
	};

	var mrs_51user3 = {
		agency: 51,
		email:"trentd@yahoo.com",
		displayname:"Trent Darby",
		role:"EMT",
		isactive: true,
		isadmin: false,
		password:"zzttee",
        usermustresetpw: false
	};

	var filesToRemove = [];

	afterEach(function() {
	    if( FS.existsSync(EMAIL_TO_AGENCY_INDEX) ) {
            FS.unlinkSync(EMAIL_TO_AGENCY_INDEX);
        }
    });


	function createAgencyFile(agency) {
        var agencyFileName = AGENCY_PROFILE_PATH + '/' + agency;
        filesToRemove.push(agencyFileName);
	    FS.writeFileSync(agencyFileName, '{users:[xx]}', 'utf-8');

	    FS.openSync(EMAIL_TO_AGENCY_INDEX, 'a');
    }

	it('IndexTest - addEmailToAgencyFile', function() {

        userUtil._addEmailToAgencyIndex('gmn314@yahoo.com', '43');

        console.log('Contents of file: ');
        var fileJson = JSON.parse(FS.readFileSync(EMAIL_TO_AGENCY_INDEX, 'utf-8'));
        assert.equal(1, fileJson.agencies.length);

        userUtil._addEmailToAgencyIndex('alice@yahoo.com', '34');
        fileJson = JSON.parse(FS.readFileSync(EMAIL_TO_AGENCY_INDEX, 'utf-8'));
        assert.equal(2, fileJson.agencies.length);

    });

    it('IndexTest - testLookup', function() {

        assert.equal(undefined, userUtil._getAgencyFromIndex('gmn314@yahoo.com'));

        userUtil._addEmailToAgencyIndex('gmn314@yahoo.com', '43');

        assert.equal('43', userUtil._getAgencyFromIndex('gmn314@yahoo.com'));

        userUtil._addEmailToAgencyIndex('horis@booboo.com', '153');

        assert.equal('153', userUtil._getAgencyFromIndex('horis@booboo.com'));
    });

    it('IndexTest - testRemoveEmailFrom', function() {
        // Negative test - remove from empty file
        userUtil._removeEmailFromAgencyIndex('junk');

        userUtil._addEmailToAgencyIndex('gmn314@yahoo.com', '43');
        userUtil._addEmailToAgencyIndex('gmn628@yahoo.com', '53');

        assert.equal('43', userUtil._getAgencyFromIndex('gmn314@yahoo.com'));
        assert.equal('53', userUtil._getAgencyFromIndex('gmn628@yahoo.com'));

        userUtil._removeEmailFromAgencyIndex('junk');

        userUtil._removeEmailFromAgencyIndex('gmn314@yahoo.com');
        assert.equal(undefined, userUtil._getAgencyFromIndex('gmn314@yahoo.com'));
        assert.equal('53', userUtil._getAgencyFromIndex('gmn628@yahoo.com'));

        userUtil._removeEmailFromAgencyIndex('gmn628@yahoo.com');
    });




});
