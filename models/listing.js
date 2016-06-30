var mongoose = require('mongoose');

var ListingSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    enabled: { type: Boolean, default: true },
    title: String,
    details: String,
    submitted: { type: Date, default: Date.now }
});

ListingSchema.statics.mapAll = function (selector, cb) {
    this.find(selector, function(err, listings) {
        // console.log(err);
        if(err) { console.log(err); return; }
        // console.log(tags);
        var retMap = listings.reduce(function(listingMap, item) {
            // console.log("reducing %j", item)
            listingMap[item._id] = item;
            return listingMap;
        }, {});
        return cb(retMap);
    });
}

module.exports = mongoose.model('Listing', ListingSchema);
