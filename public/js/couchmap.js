var app = angular.module('Todo', []);

app.controller('TodoCtrl', function($scope) {

	$scope.username = 'gpuenteallott';

	$scope.mapBtnClick = function($event) {
		if ( $scope.username === '' ) {
			$event.preventDefault();
			alert("Empty username");
		}
	};
});

$templateMarker = $('#templates #templateMarker');

// Set up map
if ( $('#map').length > 0 ) {
	L.mapbox.accessToken = 'pk.eyJ1IjoiZ3B1ZW50ZWFsbG90dCIsImEiOiJDb01hYlVFIn0.SC1BPQVo52ms__EJm3ybaw';
	
	var geocoder = L.mapbox.geocoder('mapbox.places-city-v1');
	var map = L.mapbox.map('map', 'gpuenteallott.j6h3mapo', {
			worldCopyJump: true
		});
	var featureLayer = L.mapbox.featureLayer();


	// Prepare one query for all friends. Limit is 50
	geocoderQuery = "";
	for ( i in user['friends'] ) {
		var thisQuery = user['friends'][i]['city'] +",";
		thisQuery += typeof user['friends'][i]['region'] == "undefined" ? '' :  user['friends'][i]['region'] +",";
		thisQuery += user['friends'][i]['country'];
		user['friends'][i]['query'] = thisQuery;
		geocoderQuery += thisQuery+";";
	}
	console.log( user['friends'] );

	geocoderQuery = geocoderQuery.substring(0, geocoderQuery.length - 1);

	geocoder.query( geocoderQuery , addCouchMarkers);


	function addCouchMarkers(err, data) {

		var positions = [];

		for ( i in data['results'] ) {

			// if there is no user for that index
			if ( typeof user['friends'][i] == 'undefined' ) {
				//console.log ( 'There is no user with index '+i );
				continue;
			}

			// if the geocoding didnt work
			if (  data['results'][i]["features"].length == 0 ) {
				console.log ( "Couldn't locate "+user['friends'][i]['name']+ ". Query was"+user['friends'][i]['query']);
				continue;
			}

			var latlng = data['results'][i]["features"][0]['center'];
			var lat = latlng[1];
			var lng = latlng[0];

			// if the position already exists (more than one user in the same place), we group them
			var existingPosition = false;
			for ( p in positions ) {
				if ( lat == positions[p]['lat'] && lng == positions[p]['lng'] ) {
					positions[p]['users'].push(user['friends'][i]);
					existingPosition = true;
					break;
				}
			}
			// if it is a new position (marker), we add the lat, lng and user to the positions array
			if ( !existingPosition ) {
				positions.push({ 
					'lat': lat,
					'lng': lng,
					'users': [user['friends'][i]] 
				});
			}
		}
		console.log(positions);

		// After the positions structure is ready, we paint the markers
		for ( p in positions ) {
			var markerTitle = "";

			addMarker( positions[p]['lat'], positions[p]['lng'],
				positions[p]['users']
			);

		}
		featureLayer.addTo(map);
		map.fitBounds(featureLayer.getBounds());
	}

	function addMarker (lat, lng, users) {

		// prepare the template marker
		var $thisMarker = $templateMarker.clone();

		for ( var i in users ) {
			$picBox = $('<div>').addClass('pic-box');
			$picBox.css('background-image', 'url('+users[i]['image']+')' );
			$thisMarker.find('.marker .pic-holder').append( $picBox );
		}
		$thisMarker.find('.marker').addClass('users-'+users.length);

		L.marker([lat, lng], {
			title: 'Expand',
			icon: L.divIcon({ 
				className: 'custom-marker',
				html: $thisMarker.html(),
				iconSize: [90, 90]
			})
		}).addTo(featureLayer);
	}

	function isFriend ( friends, username ) {
		for ( i = 0; i < friends.length; i++ ) {
			if ( friends[i]['username'] == username )
				return true;
		}
		return false;
	}
}