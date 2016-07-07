var request = require('request');
var mongoose = require('mongoose');
var passport = require('passport');
require('./auth/initializePassport.js')(passport);
var session = require('express-session');
// var OAuth2Strategy = require('passport-oauth2');
var Settings = require("./settings");

var User = require("./models/user");
var AppData = require("./models/appData");

module.exports = function (app) {
    var promise = new Promise(function (onSuccess, onFailure) {
        // User.count({}, function (err, count) {     //doesn't work as users may be deleted
        //     if(err) onFailure(err);
        //     else { appData.userCount = count; onSuccess(); }
        // });
        AppData.ensureExists(Settings.oauth.userCountKey, 0, function (err, doc) {
            if(err) throw err;
            onSuccess();
        });
    });
    app.use(session({ secret: Settings.session.secret })); // session secret
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions


    var passportLocalCallback = function(req, res, err, user, info) {
        if (err) { console.log(err); return res.json({error:"There was an internal server error!\n ¯\\_(ツ)_/¯" }); }
        else if (!user) { return res.json({ error: info.message }); }
        else {
            req.logIn(user, function(err) {
                if(!err)
                    res.json({ user: user });
                else {
                    console.log(err);
                }
            });
        }
    };

    app.get('/auth/callback', function (req, res, next) {
        passport.authenticate('google-oauth', function (err, user, info) {
            if (err) { return res.redirect("/failure"); } //"There was an internal server error! ¯\\_(ツ)_/¯"
            else if (!user) { return res.redirect("/failure"); }//res.json({ error: info.message }); }
            else {
                req.logIn(user, function(err) {
                    if(!err)
                        res.redirect("/");
                    else console.log(err);
                });
            }
        })(req, res, next);
    });
    app.get('/auth/google/', passport.authenticate("google-oauth", {
        scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
        accessType: 'online',
        approvalPrompt: 'auto'
    }));

    app.post('/login', function (req, res, next) {
        passport.authenticate('local-login', passportLocalCallback.bind(null, req, res))(req, res, next);
    });

    app.post('/register', function (req, res, next) {
        passport.authenticate('local-signup', passportLocalCallback.bind(null, req, res))(req, res, next);
    });

    app.get('/user', function (req, res) {
        res.json({ user: req.user });
    });

    app.get('/logout', function (req, res) {
        req.logOut();
        // console.log(req.user);
        res.json({ user: req.user });
    });
    return promise;
}
