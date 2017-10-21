
var user_manager = require("./fileUserManager");
user_manager.setUserFileName('/tmp/mrscoverageUsers.json');

const MAX_INACTIVE_MIN = 10;
var user_cache = {};

const AUTHTOKEN = 'authtoken';
const USER = 'user';


/**
 * Authenticates email + password.
 * Returns true, false
 * If email, password are correct:
 *      Creates a token, stores user + new token in session
 * @param req
 * @param email
 * @param password
 */
function authenticate(req, email, password) {

    var user = user_manager.getUserById(email);
    if( user === undefined || user.password !== password ) {
        return false;
    }

    var token = _token();
    req.session.AUTHTOKEN = token;
    user_cache[token] = user;
    user.password = 'removed';
    req.session.user = user;
    return true;
}

function ensure_authenticated(req, res, next) {
    if( is_authenticated(req) ) {
        next();
    } else {
        req.session.returnTo = req.path;
        res.redirect('/login', {message: 'Login required'});
    }
}

/**
 * Validate token with in-memory cache.  Expire if last access > MAX_INACTIVE_MIN
 * returns true, false
 * @param token
 */
function is_authenticated(req, res, next) {

    var token = req.session.AUTHTOKEN;
    if( token === undefined ) {
        console.log('>> authenticator.is_authenticated no token in session');
        req.session.returnTo = req.path;
        res.redirect('/login');
    } else {

        //TODO: Check last accessed - expire?
        if (token in user_cache) {
            console.log('>> authenticator.is_authenticated token not found in cache');
            if (next !== undefined) {
                next();
            }
            return true;
        } else {
            console.log('Redirecting...');
            res.redirect('/login');
        }
    }
}

function is_admin(req, res, next) {
    if( !is_authenticated(req, res, next) ) {
        return false;
    }

    var user = req.session[USER];

    var actual_user = user_manager.getUserById(user.email);
    return ('isadmin' in actual_user && actual_user.isadmin == true);
}

/**
 * Remove all from from session and in memory
 * @param token
 */
function log_off(token) {

}

function _rand() {
    return Math.random().toString(36).substr(2); // remove `0.`
};

function _token() {
    return _rand() + _rand(); // to make it longer
};

module.exports = {
    authenticate: authenticate,
    is_authenticated: is_authenticated,
    is_admin: is_admin,
    ensure_authenticated: ensure_authenticated
}