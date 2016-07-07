var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var userSchema = new mongoose.Schema({
    password: String,
    username: String,
    email: { type: String },
    googleId: { type: String, unique: true }
});

userSchema.statics.hashPassword = function (password, cb) {
    bcrypt.hash(password, 11, cb);
}

userSchema.statics.comparePasswordToHash = function (password, hash, cb) {
    bcrypt.compare(password, hash, cb);
}

userSchema.methods.toSecureObject = function () {
    var secureObj = this.toObject();
    delete secureObj.password;
    delete secureObj.googleId;
    delete secureObj.uuid;
    // delete secureObj.id;
    return secureObj;
}

module.exports = mongoose.model('User', userSchema);
