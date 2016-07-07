
var AppData = require("../models/appData.js");
var User = require("../models/user.js");
var Settings = require("../settings.js");

var GoogleStrategy = require('passport-google-oauth20').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var uuid = require('node-uuid');

module.exports = function (passport) {
    "use strict";
    var sessionUsers = {}; //move to database
    passport.serializeUser(function(user, done) {
        user.uuid = uuid.v4();
        sessionUsers[user.uuid] = user;
        done(null, user.uuid);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        done(null, sessionUsers[id]);
    });

    passport.use("google-oauth", new GoogleStrategy({
            // authorizationURL: 'https://accounts.google.com/o/oauth2/auth',
            // tokenURL: 'https://accounts.google.com/o/oauth2/token',
            clientID: Settings.oauth.google.clientId,
            clientSecret: Settings.oauth.google.secret,
            callbackURL: Settings.oauth.google.callback,//"http://localhost:3000/auth/example/callback"
        },
        function (accessToken, refreshToken, profile, done) {
            if(profile.id && profile.emails.length) {
                var profileEmails = profile.emails.map(function(emailObj) { return emailObj.value; });
                var profileEmail = profileEmails[0];
                User.findOne({ googleId: profile.id }, function (err, doc) {
                    if(err)
                        return done(err, false);
                    User.find({ googleId: null, email: profileEmail }, function (err, nonGoogleMatches) {
                        if(err)
                            return done(err, false);
                        if(!doc && nonGoogleMatches.length != 1) {
                            incrementUserCount();
                            AppData.getValue(Settings.oauth.userCountKey, function (usersEverCreatedCount) {
                                User.create({
                                    googleId: profile.id,
                                    username: "user_" + usersEverCreatedCount,
                                    email: profileEmail
                                }, function (err, user) {
                                    if(err)
                                        return done(err, false);
                                    done(null, user.toSecureObject());
                                });
                            });
                        }
                        else { // log in
                            if(nonGoogleMatches.length == 1 && !doc) { // merge accounts
                                var nGM = nonGoogleMatches[0];
                                nGM.googleId = profile.id;
                                nGM.save(function (err) {
                                    done(err, nGM.toSecureObject());
                                });
                            }
                            else
                                done(null, doc.toSecureObject());
                        }
                    });
                });
            }
            else
                done(null, false, { message: "Google authentication failed." });
        }
    ));

    passport.use("local-login", new LocalStrategy({ usernameField: 'email' }, function (email, password, done) {
        User.findOne({ email: email }, function (err, doc) {
            if(err) { console.log(err); done(err); } //
            else if(!doc) done(null, false, { message: "This email address and password combination is incorrect." });
            else if(!doc.password) done(null, false, { message: "This email address has not yet set up a LocalTalk login. Please use the Google login instead or register." });
            else {
                User.comparePasswordToHash(password, doc.password, function(err, areEquivalent) {
                    if(err) return console.log(err);
                    if(!areEquivalent)
                        done(null, false, { message: "This email address and password combination is incorrect." });
                    else {
                        var unmodifiableUser = doc.toObject(); delete unmodifiableUser.password;
                        done(null, unmodifiableUser);
                    }
                });
            }
        });
    }));

    passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {
        //todo: find errors in fields

        ///findOne due to mathematical induction
        User.findOne({ $or: [{ email: email }, { username: req.body.username }] }, function (err, doc) {
            if(err) { console.log(err); done(err, false, { message: "Internal server error. :(" }); }
            else if(doc) {
                if(doc.email == email)
                    done(null, false, { message: "This email address is already listed under a different account." });
                else
                    done(null, false, { message: "This username is taken." });
            }
            else {
                User.hashPassword(password, function(err, hash) {
                    if(err) { console.log(err); return done(err, false, { message: "Internal server error. :(" }); }
                    var user = new User({ email: email, password: hash, username: req.body.username });
                    incrementUserCount();
                    user.save(function (err) {
                        if(err) { console.log(err); done(err, false, { message: "Internal server error. :(" }); }
                        else {
                            var unmodifiableUser = user/*.toObject()*/; delete unmodifiableUser.password;
                            done(null, unmodifiableUser.toObject());
                        }
                    });
                });
            }
        });
    }));

    function incrementUserCount() {
        AppData.update({ key: Settings.oauth.userCountKey }, { $inc: { value: 1 }}, {multi: false}, function(err) {
            if(err) throw (err);
        });
    }
}
