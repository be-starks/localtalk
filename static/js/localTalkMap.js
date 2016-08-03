function LocalTalkMap(mapElement, options) {
	var this_ = this;
	var defaultCenter = { lat: 47.614994, lng: -122.47599 };
	if(options && options.lat != null && isFinite(options.lat)
		&& options.lng != null && isFinite(options.lng)) {
		defaultCenter.lat = options.lat;
		defaultCenter.lng = options.lng;
	}
	this.googleGeocoderDepth = 0;

	var map = this.map = new google.maps.Map(mapElement, {
		center: defaultCenter,
		zoom: 8
	});

	if(options.searchInputElement)
		this.setSearchElement(options.searchInputElement);

	this.marker = new google.maps.Marker({
		position: defaultCenter,
		map: map,
		mapTypeId: google.maps.MapTypeId.ROADMAP
		// draggable: true //make it draggable
	});

	if(options && options.geolocation) {
		this.infoWindow = new google.maps.InfoWindow({map: map});
		// Try HTML5 geolocation.
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
LocalTalkMap.prototype.getMap = function () {
	return this.map;
}
LocalTalkMap.prototype.addMarkerPositionChangedHandler = function (eventHandler, fireImmediately) {
	var this_ = this;
	google.maps.event.addListener(this.map, 'click', function(event) {
		var clickedLocation = event.latLng;
		this_.googleGeocoderDepth = 0;
		this_.marker.setPosition({lat: clickedLocation.lat(), lng: clickedLocation.lng()});
	});

	google.maps.event.addListener(this.marker, 'position_changed', function () {
		handleClickLocation(this_.marker.getPosition());
	});

	function handleClickLocation(clickedLocation) {
		this_.geocoder.geocode({'location': {lat: clickedLocation.lat(), lng: clickedLocation.lng()}}, function(results, status) {
			if (status === google.maps.GeocoderStatus.OK) {
				if (results[1]) {
					return eventHandler({ position: { lat: clickedLocation.lat(), lng: clickedLocation.lng(), address: results[this_.googleGeocoderDepth].formatted_address } });
				}
			}
			eventHandler({ position: { lat: clickedLocation.lat(), lng: clickedLocation.lng(), address: "" } });
		});
	}

	if(fireImmediately)
		handleClickLocation(this.marker.getPosition());
}

LocalTalkMap.prototype.setSearchElement = function (searchInputElement) {
	var this_ = this; var map = this.map;
	var searchBox = new google.maps.places.SearchBox(searchInputElement);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(searchInputElement);

	//bias searchBox to viewport
	map.addListener('bounds_changed', function() {
		searchBox.setBounds(map.getBounds());
	});

	var markers = [];
	searchBox.addListener('places_changed', function() {
	    var places = searchBox.getPlaces();

	    // Clear out the old markers.
	    markers.forEach(function(marker) {
	        marker.setMap(null);
	    });
	    markers = [];

		if (places.length == 0)
			return;

		if (places.length == 1) {
			this_.marker.setPosition(places[0].geometry.location);
			this_.googleGeocoderDepth = 0;
			this_.map.setCenter(this_.marker.getPosition());
			return;
		}

	    // For each place, get the icon, name and location.
	    var bounds = new google.maps.LatLngBounds();
	    places.forEach(function(place) {
	        var icon = {
	            url: place.icon,
	            size: new google.maps.Size(71, 71),
	            origin: new google.maps.Point(0, 0),
	            anchor: new google.maps.Point(13, 15),
	            scaledSize: new google.maps.Size(25, 25)
	        };

	        // Create a marker for each place.
			var newMarker = new google.maps.Marker({
	            map: map, icon: icon, title: place.name, position: place.geometry.location
	        });
	        markers.push(newMarker);

			google.maps.event.addListener(newMarker, 'click', function(g) {
				this_.marker.setPosition(g.latLng);
			});

	        if (place.geometry.viewport) {
	            // Only geocodes have viewport.
	            bounds.union(place.geometry.viewport);
	        } else {
	            bounds.extend(place.geometry.location);
	        }
	    });
	    map.fitBounds(bounds);
	});
}
// LocalTalkMap._singleton = null;
// LocalTalkMap.initialize = function (mapElement) {
//	 if(!LocalTalkMap._singleton) {
//		 LocalTalkMap._singleton = new LocalTalkMap();
//	 }
//	 return LocalTalkMap._singleton;
// }
