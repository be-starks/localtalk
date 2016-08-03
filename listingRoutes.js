var mongoose = require('mongoose');
var Listing = require('./models/listing.js');
var userAuth = require('./userAuth.js');

module.exports = function (router) {
    router.get("/", function(req, res) {
		if(Math.isNumber(req.query.lat) && Math.isNumber(req.query.lng) && Math.isNumber(req.query.radius)) {
			Listing.mapAllWithin(req.query.lat, req.query.lng, req.query.radius, req.query.searchText, function (err, listings) {
				res.json({listings: listings, error: err});
			});
		}
		else if(req.query.userId || req.query.id) {
	        var query = {};
	        if(req.query.userId) query.userId = req.query.userId;
	        if(req.query.id) query._id = req.query.id;
	        Listing.mapAll(query, function (err, listings) {
	            res.json({listings: listings, error: err});
	        });
		}
        else {
            res.json({error:{message: "Invalid query."}});
        }
    });

    function handlePricing(listing, body) {
        delete listing.pricing;
        if(body.pricing) {
            listing.pricing = { info: body.pricing.info };
            if(Math.isNumber(body.pricing.price))
                listing.pricing.price = body.pricing.price;
            else if(Math.isNumber(body.pricing.min) && Math.isNumber(body.pricing.max)) {
                listing.pricing.min = body.pricing.min;
                listing.pricing.max = body.pricing.max;
            }
        }
    }
    function handleLocation(listing, body) {
        if(!listing.location) listing.location = {};
        listing.location.lng = Math.toRadians(body.location.lng);
        listing.location.lat = Math.toRadians(body.location.lat);
        listing.location.address = body.location.address;
    }
    function isFormDataInvalid(body) {
        if(!body.headline || body.headline.length < 9 || body.headline.length > 101) return {message: "Headline is required {10-100 characters}."};
        if(body.description && body.description.length > 5001) return {message: "Description must have a length no greater than 5000 characters."};
        if(body.url && (body.url.length > 2001 || !body.url.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/)))
            return {message: "URL must be a semi-standard valid HTTP url. Must have a length no greater than 2000 characters.", "name" : "url"};
        if(body.description && body.description.length > 5001) return {message: "Description must have a length no greater than 5000 characters."};
        if(!Math.isNumber(body.location.lat) || body.location.lat < -90 || body.location.lat > 90) return {message: "Try re-selecting your location."};
        if(!Math.isNumber(body.location.lng) || body.location.lng < -180 || body.location.lng > 180) return {message: "Try re-selecting your location."};
        if(body.pricing) {
            if(body.pricing.info && body.pricing.info.length > 200) return {message: "Pricing info input must have a length less than 200 characters."};
            var priceIsValid = !body.pricing.price || (Math.isNumber(body.pricing.price) && body.pricing.price > 0);
            var rangeIsValid = (!body.pricing.max && !body.pricing.min) || (Math.isNumber(body.pricing.max) && Math.isNumber(body.pricing.min) && body.pricing.min <= body.pricing.max && body.pricing.min >= 0);
            if(!priceIsValid) return {message: "Price is invalid."};
            if(!rangeIsValid) return {message: "Price range is invalid."};
        }
    }

    router.post("/create", userAuth.isLoggedIn, function (req, res) {
        var body = req.body;
        var invalidData = isFormDataInvalid(body);
        if(invalidData)
            return res.json({error: invalidData});

        var listingData = { userId: req.user._id, description: body.description, headline: body.headline, url: body.url };
        handlePricing(listingData, body);
        handleLocation(listingData, body);
        Listing.create(listingData, function (err, listing) {
            if(err) console.log(err);
            res.json({ error: err });
        });
    });

    router.post("/edit/:id", userAuth.isLoggedIn, function (req, res) {
        var body = req.body;
        var invalidData = isFormDataInvalid(body);
        if(invalidData)
            return res.json({error: invalidData});

        Listing.findOne({ _id: req.params.id, userId: req.user._id }, function (err, listing) {
            if(err || !listing) {
                console.error(err);
                return res.json({ error: err });
            }
            listing.updated = Date.now();
            listing.headline = body.headline; listing.description = body.description; listing.url = body.url;
            handlePricing(listing, body);
            handleLocation(listing, body);
            listing.save(function (err) {
                if (err) console.log(err);
                res.json({ error: err });
            });
        });
    });

    router.post("/delete/:id", userAuth.isLoggedIn, function (req, res) {
        Listing.remove({ _id: req.params.id, userId: req.user._id }, function (err) {
            if(err) console.log(err);
            res.json({ error: err });
        });
    });

    router.post("/fileUpload/:listingId", userAuth.isLoggedIn, function (req, res) {

    });
}
