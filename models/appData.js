var mongoose = require('mongoose');

var appDataSchema = new mongoose.Schema({
    key: {type:String, index: { unique: true }},
    value: mongoose.Schema.Types.Mixed
});

appDataSchema.statics.ensureExists = function (key, defaultValue, cb) {
    var this_ = this;
    this.findOne({ key: key }, (function (err, doc) {
        if(err)
            cb(err);
        else if(!doc) {
            this_.create({ key: key, value: defaultValue }, cb);
        }
        else {
            cb(err, doc);
        }
    }));
}

appDataSchema.statics.getValue = function (key, cb) {
    this.findOne({ key: key }, function (err, doc) {
        if(err) throw err;
        if(!doc) cb(null);
        else cb(doc.value);
    });
}

module.exports = mongoose.model('AppData', appDataSchema);
