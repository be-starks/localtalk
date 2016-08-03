var mongoose = require('mongoose');

var PricingSchema = new mongoose.Schema({
    info: String,
    price: Number,
    min: Number,
    max: Number
}, { _id : false });

var LocationSchema = new mongoose.Schema({
    address: String,
    lat: {type: Number, index: true},
    lng: {type: Number, index: true}
}, { _id : false });

var ListingSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    enabled: { type: Boolean, default: true },
    headline: String,
    description: String,
    url: String,
    pricing: PricingSchema,
    location: LocationSchema,
    submitted: { type: Date, default: Date.now },
    updated: { type: Date }
});

function mapArrayToObject(cb, err, listings) {
    if(err || !listings) { return cb(err); }
    var retMap = listings.reduce(function(listingMap, item) {
        if(item.location.lat) item.location.lat = Math.toDegrees(item.location.lat);
        if(item.location.lng) item.location.lng = Math.toDegrees(item.location.lng);
        listingMap[item._id] = item;
        return listingMap;
    }, {});
    cb(null, retMap);
}

ListingSchema.statics.mapAll = function (selector, cb) {
    this.find(selector).sort({submitted: "desc"}).limit(50).exec(mapArrayToObject.bind(null, cb));
}

ListingSchema.statics.mapAllWithin = function (lat, lng, radius, searchText, cb) {
    lat = Math.toRadians(lat); lng = Math.toRadians(lng);

    //BOX
    var latDiff = radius / (24901 / (2*Math.PI));

    var lngDiff = radius / (Math.cos(lat) * (24901 / (2*Math.PI)));
    var lngPositive = lng + lngDiff, lngNegative = lng - lngDiff;

    var query = this.find({"location.lat": {$lte : lat + latDiff, $gte : lat - latDiff}});

    if(lngDiff < Math.PI) {  //////////////////////////////////////////////////////
        var lngQuery = {$or: [{"location.lng": {$lte: lngPositive, $gte: lngNegative} }]};
        if(lngPositive > Math.PI)
            lngQuery.$or.push({"location.lng": {$lte: lngPositive-(2*Math.PI)}});
        else if(lngNegative < -Math.PI)
            lngQuery.$or.push({"location.lng": {$gte: lngNegative+(2*Math.PI)}});

        query = query.and(lngQuery);

    }  ////////////////////////////////////////////////////////////////////////////

    //CIRCLE and TEXT

    query = query.and({$where:"distanceMiles("+lat+","+lng+",this.location.lat,this.location.lng)<=" + radius });
    if(searchText) {
        var words = searchText.toLowerCase().split(/\n+|\s+/g);
        var stringWordArray = "['"+words.join("','")+"']";
        console.log(stringWordArray);
        query = query.and({$where:"stringContainsAll(this.headline, "+stringWordArray+") || stringContainsAll(this.description, "+stringWordArray+")"});
    }
    query.sort({submitted: "desc"})
        .limit(50)
        .exec(mapArrayToObject.bind(null, cb));
}

module.exports = mongoose.model('Listing', ListingSchema);
