/**
 * Unit tests for teamUpAPI.js 
 * To run (once): 
 * mocha 
 *
 * To run continually: 
 * mocha test --recursive --watch
 */


const USERFILENAME = "/tmp/test_mrscoverageUsers.json";
const userUtil = require('../fileUserManager.js')

const chai = require('chai');
const chaiJsonEqual = require('chai-json-equal');
const assert = chai.assert;
const expect = chai.expect;
chai.use(chaiJsonEqual);
const FS = require('fs');



describe('Test User CRUD', function() {

	before(function() {
		userUtil.setUserFileName(USERFILENAME);

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

	afterEach(function() {
		FS.unlinkSync(USERFILENAME);
	});

	it('addUser', function() {
		userUtil.addOrSaveUser(mrs_43user1);

		expect(mrs_43user1).to.jsonEqual(
			userUtil.getUserById(mrs_43user1.email)
		);
	});

	it('TestDeleteOne', function() {
		userUtil.addOrSaveUser(mrs_43user1);
		expect(mrs_43user1).to.jsonEqual(
			userUtil.getUserById(mrs_43user1.email)
		);
		userUtil.deleteUser(mrs_43user1.email);

		assert.notExists(
			userUtil.getUserById(mrs_43user1.email)
		);
	});

	it('testDeleteAll', function() {
		userUtil.addOrSaveUser(mrs_43user1);
		userUtil.addOrSaveUser(mrs_43user2);
		userUtil.addOrSaveUser(mrs_43user3);

		assert.equal(3, userUtil.getUsersForAgency(43).length);

		userUtil.deleteUser(mrs_43user1.email);

		assert.equal(2, userUtil.getUsersForAgency(43).length);

		userUtil.deleteUser(mrs_43user3.email);

		assert.equal(1, userUtil.getUsersForAgency(43).length);

		userUtil.deleteUser(mrs_43user2.email);

		assert.equal(0, userUtil.getUsersForAgency(43).length);

	});


	it('testDeleteAllMultipleAgencies', function() {
		userUtil.addOrSaveUser(mrs_43user1);
		userUtil.addOrSaveUser(mrs_43user2);
		userUtil.addOrSaveUser(mrs_43user3);
		// Add users from other squad as well
		userUtil.addOrSaveUser(mrs_51user1);
		userUtil.addOrSaveUser(mrs_51user2);
		userUtil.addOrSaveUser(mrs_51user3);

		assert.equal(3, userUtil.getUsersForAgency(43).length);

		userUtil.deleteUser(mrs_43user1.email);

		assert.equal(2, userUtil.getUsersForAgency(43).length);

		userUtil.deleteUser(mrs_43user3.email);

		assert.equal(1, userUtil.getUsersForAgency(43).length);

		userUtil.deleteUser(mrs_43user2.email);

		assert.equal(0, userUtil.getUsersForAgency(43).length);

		// Now, ensure that we still have a full complement for the other agency ;)
		assert.equal(3, userUtil.getUsersForAgency(51).length);

	});

	it('addMultipleUsers', function() {
		userUtil.addOrSaveUser(mrs_43user1);
		userUtil.addOrSaveUser(mrs_43user2);
		userUtil.addOrSaveUser(mrs_43user3);
		// Add users from other squad as well
		userUtil.addOrSaveUser(mrs_51user1);
		userUtil.addOrSaveUser(mrs_51user2);
		userUtil.addOrSaveUser(mrs_51user3);

		var users43 = userUtil.getUsersForAgency(43);
		assert.equal(3, users43.length);

	}); 



});
