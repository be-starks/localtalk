var userAuth = {};

userAuth.userLoggedIn = function (req) {
    return req.isAuthenticated();
}

userAuth.isLoggedIn = function (req, res, next) {
    if(userAuth.userLoggedIn(req)) next();
    else {
        res.json({ error: { message: "You are not logged in!", notLoggedIn: true } });
    }
}

module.exports = userAuth;
