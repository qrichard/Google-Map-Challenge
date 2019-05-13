// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script
// src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        mapTypeControl: false,
        center: { lat: 33.4504, lng: -88.8184 },
        zoom: 15,
        mapTypeId: 'roadmap'
    });

    new AutocompleteDirectionsHandler(map);

    /*SEARCHBAR JAVASCRIPT*/

    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function () {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // Clear out the old markers.
        markers.forEach(function (marker) {
            marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }));

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

/* DIRECTIONS JAVASCRIPT */

function AutocompleteDirectionsHandler(map) {
    this.map = map;
    this.originPlaceId = null;
    this.destinationPlaceId = null;
    this.travelMode = 'WALKING';
    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    this.directionsDisplay.setMap(map);

    var originInput =  getElementById('origin-input');
    var destinationInput = document.getElementById('destination-input');
    var modeSelector = document.getElementById('mode-selector');
    var arrival = document.getElementById('arrivaltime')

    var originAutocomplete = new google.maps.places.Autocomplete(originInput);
    // Specify just the place data fields that you need.
    originAutocomplete.setFields(['place_id']);

    var destinationAutocomplete =
        new google.maps.places.Autocomplete(destinationInput);
    // Specify just the place data fields that you need.
    destinationAutocomplete.setFields(['place_id']);

    this.setupClickListener('changemode-walking', 'WALKING');
    this.setupClickListener('changemode-transit', 'TRANSIT');
    this.setupClickListener('changemode-driving', 'DRIVING');

    this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
    this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');

    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(
        destinationInput);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(arrival);
}

// Sets a listener on a radio button to change the filter type on Places
// Autocomplete.
AutocompleteDirectionsHandler.prototype.setupClickListener = function (
    id, mode) {
    var radioButton = document.getElementById(id);
    var me = this;

    radioButton.addEventListener('click', function () {
        me.travelMode = mode;
        me.route();
    });
};

AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function (
    autocomplete, mode) {
    var me = this;
    autocomplete.bindTo('bounds', this.map);

    autocomplete.addListener('place_changed', function () {
        var place = autocomplete.getPlace();

        if (!place.place_id) {
            window.alert('Please select an option from the dropdown list.');
            return;
        }
        if (mode === 'ORIG') {
            me.originPlaceId = place.place_id;
        } else {
            me.destinationPlaceId = place.place_id;
        }
        me.route();
    });
};

AutocompleteDirectionsHandler.prototype.route = function () {
    if (!this.originPlaceId || !this.destinationPlaceId) {
        return;
    }
    var me = this;

    this.directionsService.route(
        {
            origin: { 'placeId': this.originPlaceId },
            destination: { 'placeId': this.destinationPlaceId },
            travelMode: this.travelMode
        },
        function (response, status) {
            if (status === 'OK') {
                me.directionsDisplay.setDirections(response);
                document.getElementById("time").innerHTML = me.directionsDisplay.directions.routes[0].legs[0].duration.text;
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
};