var mongoose = require('mongoose');
var Listing = require('./models/listing');

module.exports = function (router) {
    function getListingMap(req, res) {
        Listing.mapAll({}, function (listings) {
            res.json(listings);
        });
    }
    router.get("/", getListingMap);
    router.post("/", function (req, res) {
        Listing.create(req.body, function (err) {
            if(err) return console.log(err);
            Listing.find(function (err, listings) {
                if(err) {console.log(err);}
                else {
                    getListingMap(req, res);
                }
            });
        });
    });
    router.delete('/:id', function (req, res) {
        Listing.remove({_id: req.params.id}, function (err) {
            if(err) return console.log(err);
            res.json({ error: err });
        });
    });
}
