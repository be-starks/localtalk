var mongoose = require('mongoose');
var Listing = require('./models/listing.js');
var userAuth = require('./userAuth.js');

module.exports = function (router) {
    function getListingMap(req, res) {
        var query = {};
        if(req.params.userId) query.userId = req.params.userId;
        if(req.params.id) query._id = req.params.id;
        Listing.mapAll(query, function (listings) {
            res.json(listings);
        });
    }
    router.get("/", getListingMap);
    router.delete('/:id', userAuth.isLoggedIn, function (req, res) {
        Listing.remove({ _id: req.params.id, userId: req.user.id }, function (err) {
            if(err) console.log(err);
            res.json({ error: err });
        });
    });

    router.post("/create", userAuth.isLoggedIn, function (req, res) {
        var body = req.body;

        var listingData = { userId: req.user._id, details: body.details, headline: body.headline };
        if(body.pricing) {
            listingData.pricing = body.pricing;
            if(listingData.pricing.min && listingData.pricing.max)
                delete listingData.pricing.price;
            if(listingData.pricing.price) {
                delete listingData.pricing.min;
                delete listingData.pricing.max;
            }
        }
        Listing.create(listingData, function (err, listing) {
            if(err) console.log(err);
            res.json({ error: err });
        });
    });

    router.post("/fileUpload/:listingId", userAuth.isLoggedIn, function (req, res) {

    });
}
