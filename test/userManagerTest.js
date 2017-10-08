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
const USERFILENAME = "/tmp/mrscoverageUsers.json";



describe('Test User CRUD', function() {

	var mrs_43user1 = {
		agency: 43,
		username:"georgen",
		displayname:"George Nowakowski",
		role:"Crew Chief",
		isactive: true,
		isadmin: true,
		password:"ccaassee",
		id:1
	};

	var mrs_43user2 = {
		agency: 43,
		username:"marksz",
		displayname:"Mark Swartz",
		role:"Crew Chief",
		isactive: true,
		isadmin: false,
		password:"11223344",
		id:2
	};

	var mrs_43user3 = {
		agency: 43,
		username:"hillaryj",
		displayname:"Hillary Jordan",
		role:"Assistant",
		isactive: true,
		isadmin: false,
		password:"zzee",
		id:3
	};

	var mrs_51user1 = {
		agency: 51,
		username:"samules",
		displayname:"Sam Samuleson",
		role:"EMT",
		isactive: true,
		isadmin: true,
		password:"csssassee",
		id:4
	};

	var mrs_51user2 = {
		agency: 51,
		username:"tobyl",
		displayname:"Toby Lyons",
		role:"EMT",
		isactive: false,
		isadmin: false,
		password:"11223344",
		id:5
	};

	var mrs_51user3 = {
		agency: 51,
		username:"trentd",
		displayname:"Trent Darby",
		role:"EMT",
		isactive: true,
		isadmin: false,
		password:"zzttee",
		id:6
	};

	after(function() {
		FS.unlinkSync(USERFILENAME);
	});

	it('addUser', function() {
		userUtil.addOrSaveUser(mrs_43user1);

		expect(mrs_43user1).to.jsonEqual(
			userUtil.getUserById(mrs_43user1.agency, mrs_43user1.id)
		);
	});

	it('TestDeleteOne', function() {
		userUtil.addOrSaveUser(mrs_43user1);
		expect(mrs_43user1).to.jsonEqual(
			userUtil.getUserById(mrs_43user1.agency, mrs_43user1.id)
		);
		userUtil.deleteUser(mrs_43user1.agency, mrs_43user1.id);

		assert.notExists(
			userUtil.getUserById(mrs_43user1.agency, mrs_43user1.id)
		);
	});

	it('testDeleteAll', function() {
		userUtil.addOrSaveUser(mrs_43user1);
		userUtil.addOrSaveUser(mrs_43user2);
		userUtil.addOrSaveUser(mrs_43user3);

		assert.equal(3, userUtil.getUsersForAgency(43).length);

		userUtil.deleteUser(mrs_43user1.agency, mrs_43user1.id);

		assert.equal(2, userUtil.getUsersForAgency(43).length);

		userUtil.deleteUser(mrs_43user3.agency, mrs_43user3.id);

		assert.equal(1, userUtil.getUsersForAgency(43).length);

		userUtil.deleteUser(mrs_43user2.agency, mrs_43user2.id);

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

		userUtil.deleteUser(mrs_43user1.agency, mrs_43user1.id);

		assert.equal(2, userUtil.getUsersForAgency(43).length);

		userUtil.deleteUser(mrs_43user3.agency, mrs_43user3.id);

		assert.equal(1, userUtil.getUsersForAgency(43).length);

		userUtil.deleteUser(mrs_43user2.agency, mrs_43user2.id);

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
