
const FS = require('fs');
const glob = require('glob');

var USERFILEDIR = '/root/mrscoverage/userinfo';
var PROFILEDIR = '/root/emscoveragewebsite/public/profiles';
var EMAIL_TO_AGENCY = '/root/mrscoverage/emailToAgency.csv';

// Used for testing
function setUserFileDir(fn) {
    USERFILEDIR = fn;
}

// Used for testing
function setProfileDir(dir) {
    PROFILEDIR = dir;
}

// Used for testing
function setEmailToAgency(emailAgencyFN) {
    EMAIL_TO_AGENCY = emailAgencyFN;
}

function buildAgencyFilename(agency) {
    return  USERFILEDIR + '/' + agency + '.json';
}

/**
 * In the mapping file that contains key=email, value=agency, look up the give useremail
 * {"agencies": [{"user": "gmn314@yahoo.com", "agency":"43"}, {"user": "scott_rap@aol.com", "agency":"34"}]}
 * @param username
 */
function getAgencyFromIndex(userEmail) {
    if( FS.existsSync(EMAIL_TO_AGENCY) ) {
        var agencyIndexJson = JSON.parse(FS.readFileSync(EMAIL_TO_AGENCY, 'utf-8'));
        if (agencyIndexJson.agencies.length > 0) {
            return findAgencyForUser(agencyIndexJson, userEmail);
        }
    }
}

function findAgencyForUser(agencyIndexJson, userEmail) {
    for(var idx =0; idx < agencyIndexJson.agencies.length; idx++ ) {
        var tup = agencyIndexJson.agencies[idx];
        if (tup.user === userEmail) {
            return tup.agency;
        }
    }
}

function addEmailToAgencyIndex(email, agency) {
    console.log('Appending to file: ' + EMAIL_TO_AGENCY);

    var agencyIndexJSON;
    if( !FS.existsSync(EMAIL_TO_AGENCY) ) {
        agencyIndexJSON = {"agencies": []};
    } else {
        var agencyIndex = FS.readFileSync(EMAIL_TO_AGENCY, 'utf-8');
        agencyIndexJSON = JSON.parse(agencyIndex);
    }

    if( findAgencyForUser(agencyIndexJSON, email) === undefined ) {
        agencyIndexJSON.agencies.push({"user": email, "agency": agency});
        FS.writeFileSync(EMAIL_TO_AGENCY, JSON.stringify(agencyIndexJSON));
    }
}

function removeEmailFromAgencyIndex(email) {
    if (FS.existsSync(EMAIL_TO_AGENCY)) {
        var agencyIndex = FS.readFileSync(EMAIL_TO_AGENCY, 'utf-8');
        var agencyIndexJSON = JSON.parse(agencyIndex);
        agencyIndexJSON.agencies.forEach(function (tuple, idx) {
            if (tuple.user === email) {
                agencyIndexJSON.agencies.splice(idx, 1);
                FS.writeFileSync(EMAIL_TO_AGENCY, JSON.stringify(agencyIndexJSON));
            }
        });
    }
}

function loadAgencyFileAsJSON(agency) {
    var agencyFN = buildAgencyFilename(agency);
    if( FS.existsSync(agencyFN)) {
        var agencyData = FS.readFileSync(agencyFN, 'utf-8');
        return JSON.parse(agencyData);
    }
}

/**
 * Add user or update if already exists
 * @param {JSON}   user     User object
 * @param {Function} callback(err)
 */
function addOrSaveUser(user) {
	var agencyJson = _loadAgencyFileAsJSON(user.agency);

	var existing = _findUser(user.email, agencyJson);
	if( existing.userIdx === -1 ) {
        agencyJson.users.push(user);
		_addEmailToAgencyIndex(user.email, user.agency);
	} else {
        allUsersJson.users[existing.userIdx] = user;
	}
	saveJson(allUsersJson, user.agency);
}

function getUsersForAgency(agency) {
    var agencyJson = _loadAgencyFileAsJSON(agency);
    return agencyJson.users;
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


/**
 * Look through profiles of confirmed users.  If you find the email address as part of the filename, import that users
 * info.  Might have to create an agency file as well.
 *
 * @param email
 */
function importConfirmedUser(email) {
    var emailFiles = glob.sync(email + '\.profile\.json');
    if( emailFiles !== undefined && emailFiles.length > 0 ) {
        emailFiles.forEach(function(emailFile) {
            var userProfile = FS.readFileSync(emailFile, 'utf-8');
            if( userProfile !== undefined && userProfile.length > 0 ) {
                var userProfileJson = JSON.parse(userProfile)
                var userJson = profileToUser(userProfileJson);
                addOrSaveUser(userJson);
                return userJson;
            }
        });
    }
}

function profileToUser(profile) {
    /** Profile:
     * {"firstname":"George",
     * "lastname":"Nowakowski",
     * "email":"gmn314@yahoo.com",
     * "password":"ccaassee",
     * "phone":"9084192571",
     * "code":"3C0ZATGK",
     * "squadname":"Martinsville Rescue Squad"}
     */

    /** User:
     * 	var mrs_43user1 = {
		agency: 43,
		email:"gmn314@yahoo.com",
		displayname:"George Nowakowski",
		role:"Crew Chief",
		isactive: true,
		isadmin: true,
		password:"ccaassee",
        usermustresetpw: false
	};

     */
    return {
        agency: profile.code,
        email: profile.email,
        displayname: profile.firstname + ' ' + profile.lastname,
        isactive: true,
        isadmin: true,
        password: profile.password,
        usermustresetpw: false
    };
}

/**
 * Gets user by agency + userid
 * @param  {[type]}   agency   agency identifier
 * @param  {[type]}   userId   userId
 * @param  {Function} callback(err, user)
 * @return {[type]}            [description]
 */
function getUserById(email, agency) {
    var userJson;
    if( agency === undefined ) {
        agency = getAgencyFromIndex(email);
    }

    if( agency === undefined ) {
        userJson = importConfirmedUser(email);
    } else {
        var agencyFileJson = loadAgencyFileAsJSON(agency);
        userJson = findUser(email, agencyFileJson.users);
    }
	return userJson;
}

/**
 * Delete a user
 * @param  { String } agency agency Name
 * @param  {String}   userId   [description]
 */
function deleteUser(userEmail) {
    var agency = findAgencyForUser(userEmail);
    if( agency !== undefined ) {
        var agencyUsers = loadFileAsJson(agency);
        var userInfo = findUser(userId, agencyUsers);
        if( userInfo.userIdx >= 0 ) {
            userJson.users = removeUserFromJson(userJson.users, userInfo.user);
            saveJson(userJson);
        }
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
    setUserFileDir: setUserFileDir,
    setProfileDir: setProfileDir,
    setEmailToAgency: setEmailToAgency,
    addOrSaveUser: addOrSaveUser,
	getUserById: getUserById,
	deleteUser: deleteUser,
	getUsersForAgency: getUsersForAgency,
    _getAgencyFromIndex: getAgencyFromIndex,
    _findAgencyForUser: findAgencyForUser,
    _addEmailToAgencyIndex: addEmailToAgencyIndex,
    _removeEmailFromAgencyIndex: removeEmailFromAgencyIndex,
    _loadAgencyFileAsJSON: loadAgencyFileAsJSON
};