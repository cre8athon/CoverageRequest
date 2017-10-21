
const FS = require('fs');
var USERFILENAME;

function setUserFileName(fn) {
    USERFILENAME = fn;
}

function ensureFile() {
	if( !FS.existsSync(USERFILENAME)) {
		FS.writeFileSync(USERFILENAME, '{"users": []}');
	}
}

function loadFileAsJson() {
	ensureFile(USERFILENAME);
	var usersData = FS.readFileSync(USERFILENAME, 'utf-8');
	if( usersData.length === 0 ) {
		usersJSON = {users: []}
	} else {
		usersJson = JSON.parse(usersData)
	}
	return usersJson;
}

function saveJson(userJson) {
	FS.writeFileSync(USERFILENAME, JSON.stringify(userJson));	
}

/**
 * Add user or update if already exists
 * @param {JSON}   user     User object
 * @param {Function} callback(err)
 */
function addOrSaveUser(user) {
	var userJson = loadFileAsJson();

	var existing = findUser(user.email, userJson);
	if( existing.userIdx === -1 ) {
		userJson.users.push(user);
	} else {
		userJson.users[existing.userIdx] = user;
	}
	saveJson(userJson);
}

function findUser(email, userJson) {

	var retVal = {
		userIdx: -1
	};

	for( var i = 0; i < userJson.users.length; i++ ) {
		if( userJson.users[i].email === email ) {
			retVal.userIdx = i;
			retVal.user = userJson.users[i];
		}
	}

	return retVal;
}

function getUsersForAgency(agency) {
	var users = [];

	var userJson = loadFileAsJson();
	for( var i = 0; i < userJson.users.length; i++ ) {
		if( userJson.users[i].agency === agency ) {
			users.push(userJson.users[i]);
		}
	}

	return users;
}

/**
 * Gets user by agency + userid
 * @param  {[type]}   agency   agency identifier
 * @param  {[type]}   userId   userId
 * @param  {Function} callback(err, user)
 * @return {[type]}            [description]
 */
function getUserById(userId) {
	var userJson = loadFileAsJson();
	var userInfo = findUser(userId, userJson);

	return userInfo.user;
}

/**
 * Delete a user
 * @param  { String } agency agency Name
 * @param  {String}   userId   [description]
 */
function deleteUser(userId) {
	var userJson = loadFileAsJson();
	var userInfo = findUser(userId, userJson);

	if( userInfo.userIdx >= 0 ) {
		userJson.users = removeUserFromJson(userJson.users, userInfo.user);
		saveJson(userJson);
	}	
}

function removeUserFromJson(users, userToRemove) {
	var updatedUsers = [];
	for (var i = users.length - 1; i >= 0; i--) {
		var currUser = users[i];
		if( areUsersEqual(currUser, userToRemove) ) {
			// Skip!
		} else {
			updatedUsers.push(currUser);
		}
	}
	return updatedUsers;
}


function areUsersEqual(usera, userb) {
	return usera.agency === userb.agency && usera.email === userb.email;
}


// ============================================================================================================================

module.exports =  {
    setUserFileName: setUserFileName,
	addOrSaveUser: addOrSaveUser,
	getUserById: getUserById,
	deleteUser: deleteUser,
	getUsersForAgency: getUsersForAgency
};