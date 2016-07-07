

function LocalTalkMap(mapElement) {
    var defaultCenter = { lat: 47.614994, lng: -122.47599 };

    var map = this.map = new google.maps.Map(mapElement, {
        center: defaultCenter,
        zoom: 8
    });

    this.marker = new google.maps.Marker({
        position: defaultCenter,
        map: map
        // draggable: true //make it draggable
    });

    this.infoWindow = new google.maps.InfoWindow({map: map});

    // Try HTML5 geolocation.
    var this_ = this;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            this_.infoWindow.setPosition(pos);
            this_.marker.setPosition(pos);
            this_.infoWindow.setContent('Location found.');
            this_.map.setCenter(pos);
        }, function() {
            handleLocationError(true, this_.infoWindow, this_.map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, this.infoWindow, this.map.getCenter());
    }
    this.geocoder = new google.maps.Geocoder;

    google.maps.event.addListener(this.marker, 'dblclick', function (event) {
        this_.map.setCenter(this_.marker.getPosition());
        this_.map.setZoom(this_.map.getZoom() + 1);
    });

    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        this_.infoWindow.setPosition(pos);
        this_.infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
    }
}
LocalTalkMap.prototype = Object.create(Object.prototype);
LocalTalkMap.prototype.constructor = LocalTalkMap;
LocalTalkMap.prototype.onMarkerPositionChanged = function (eventHandler) {
    var this_ = this;
    google.maps.event.addListener(this.map, 'click', function(event) {
        var clickedLocation = event.latLng;
        this_.marker.setPosition({lat: clickedLocation.lat(), lng: clickedLocation.lng()});
    });

    google.maps.event.addListener(this.marker, 'position_changed', function () {
        handleClickLocation(this_.marker.getPosition());
    });

    function handleClickLocation(clickedLocation) {
        this_.geocoder.geocode({'location': {lat: clickedLocation.lat(), lng: clickedLocation.lng()}}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                    return eventHandler({ position: {lat: clickedLocation.lat(), lng: clickedLocation.lng(), address: results[1].formatted_address } });
                }
            }
            eventHandler({ position: {lat: clickedLocation.lat(), lng: clickedLocation.lng(), address: "" } });
        });
    }

    handleClickLocation(this.marker.getPosition());
    // google.maps.event.addListener(this.marker, 'dragend', eventHandler);
}
// LocalTalkMap._singleton = null;
// LocalTalkMap.initialize = function (mapElement) {
//     if(!LocalTalkMap._singleton) {
//         LocalTalkMap._singleton = new LocalTalkMap();
//     }
//     return LocalTalkMap._singleton;
// }
