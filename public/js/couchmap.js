var app = angular.module('Todo', []);
// #######
// #
// # ANGULAR
// #

app.controller('TodoCtrl', function($scope) {

	$scope.username = 'gpuenteallott';

	$scope.mapBtnClick = function($event) {
		if ( $scope.username === '' ) {
			$event.preventDefault();
			alert("Empty username");
		}
	};
});


var couchmap = couchmap ? couchmap : {};
couchmap.ACEESS_TOKEN = 'pk.eyJ1IjoiZ3B1ZW50ZWFsbG90dCIsImEiOiJDb01hYlVFIn0.SC1BPQVo52ms__EJm3ybaw';
couchmap.MAP_TYPE = 'mapbox.places-city-v1';
couchmap.MAP_ID = 'gpuenteallott.jighe8gc';


couchmap.marker = function($) {
	return {
		emphasize : function( $marker ) {
			$marker.siblings('.leaflet-marker-icon').css('opacity','.7');
		},
		resetEmphasis : function ( $marker ) {
			$('.leaflet-marker-icon').css('opacity','1');
		},
		getTemplate: function () {
			return $('#templates #templateMarker').clone();
		},
		getContentTemplate: function () {
			return $('#templates #templateMarkerContent').clone();
		},
		getContentRowTemplate: function () {
			return $('#templates #templateMarkerContentRow').clone();
		},
		setMarker: function (lat, lng, users) {
			// prepare the template marker
			var $thisMarker = couchmap.marker.getTemplate();


			var $markerContent = couchmap.marker.getContentTemplate();
			$markerContent.find('.popup-location').text(users[0]['city']+', '+users[0]['country']);

			for ( var i in users ) {
				$picBox = $('<div>').addClass('pic-box');
				$picBox.css('background-image', 'url('+users[i]['image']+')' );
				$thisMarker.find('.marker .pic-holder').append( $picBox );

				$contentRow = couchmap.marker.getContentRowTemplate();
				$contentRow.find('.profile-pic').css('background-image', 'url('+users[i]['image']+')' );;
				$contentRow.find('.name').text( users[i]['name'] );
				//$contentRow.find('a').attr('href', 'http://www.couchsurfing.org/people/'+users[i]['username'] );
				$contentRow.find('a').attr('href', '/'+users[i]['username'] );

				$markerContent.append( $contentRow.html() );
			}
			//$thisMarker.find('.location').text(users[0]['city']+', '+users[0]['country']);
			$thisMarker.find('.marker').addClass('users-'+users.length);
			$('#popups').append( $thisMarker );

			L.marker([lat, lng], {
				title: users[i]['username'],
				icon: L.divIcon({
					className: 'custom-marker users-'+users.length,
					html: $thisMarker.html(),
					iconSize: [90, 90]
				})
			}).addTo( couchmap.map.featureLayer ).bindPopup( $markerContent.html() , {
				maxHeight: 300,
				maxWidth: 200,
				minWidth: 200,
				autoPan: false
			});
		},

		closeAll: function () {
			$('.leaflet-marker-icon').removeClass('open');
		}
	}
}(jQuery)

couchmap.map = function($) {
	return {

		featureLayer:null,
		map:null,

		geocoder:null,
		thisGeocodingQuery:0,
		geocodingQueries:{},
		geocodingResult:{},

		getPositionsFromData: function (err, data) {
			var positions = [];

			// if there is only one result, then it isn't in an array, so we wrap it in one
			if ( typeof data.results.type != 'undefined' ) {
				data.results = [ data.results ];
			}

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
			return positions;
		},

		checkGeocoding: function ( err, data ) {

			// save the result in the global var
			couchmap.map.geocodingResult = geocodingResult.concat(data);

			// increase index
			couchmap.map.thisGeocodingQuery++;

			// if there are more queries to be made, call again the geocoding
			if ( couchmap.map.thisGeocodingQuery < couchmap.map.geocodingQueries.length &&
				typeof couchmap.map.geocodingQueries[ couchmap.map.thisGeocodingQuery ] != 'undefined'
			) {

				couchmap.map.geocoder.query( geocoderQuery[ couchmap.map.thisGeocodingQuery ] , couchmap.map.checkGeocoding );
			}
			// if not, proceed to drawing
			else {

				couchmap.map.draw( couchmap.map.geocodingResult );
			}


		},

		draw: function(data) {

			if ( typeof data != 'undefined' ) {
				var positions = couchmap.map.getPositionsFromData(err, data);

				// After the positions structure is ready, we paint the markers
				for ( p in positions ) {
					couchmap.marker.setMarker( positions[p]['lat'], positions[p]['lng'], positions[p]['users'] );
				}

				// Add the feature layer to the map and fit bounds
				couchmap.map.featureLayer.addTo( couchmap.map.map );

				if ( positions.length > 0 ) {
					couchmap.map.map.fitBounds( couchmap.map.featureLayer.getBounds() );
				}
			}

			couchmap.map.setupEvents();

			// Move legend to the left
			$('.leaflet-control-container .leaflet-bottom.leaflet-left').append($('.leaflet-control-attribution').detach());

			couchmap.map.hideLoader();
		},

		setupEvents: function () {
			$('.leaflet-marker-icon').on('mouseenter', function() {
				couchmap.marker.emphasize($(this));
			});
			$('.leaflet-marker-icon').on('mouseleave', function() {
				couchmap.marker.resetEmphasis();
			});
			$('#map').on('click', function() {
				couchmap.marker.closeAll();
			});
		},

		hideLoader: function() {
			$('#map-loader').fadeOut();
		}
	}
}(jQuery)

// ------------------------
// Angular controllers

app.controller('MapCtrl', function($scope) {

	$scope.username = '';
	$scope.new_map_username = '';

	$scope.init = function() {

		// extract the username from the URL
		if ( typeof window.location.pathname.split('/')[1] != 'undefined' && window.location.pathname.split('/')[1] != '' ) {
			$scope.username = window.location.pathname.split('/')[1];
			var force_modal = false;
		} else {
			$scope.username = '';
			$('.nav-username').hide();
			var force_modal = true;
		}

		// make sure there is a map element
		if ( $('#map').length === 0 ) {
			return false;
		}

		if ( force_modal ) {
			$('#map').addClass('blur');
			$('#username-modal').show();
		}

		L.mapbox.accessToken = couchmap.ACEESS_TOKEN;

		couchmap.map.map = L.mapbox.map('map', couchmap.MAP_ID, {
			worldCopyJump: true,
			maxZoom : 10
		});

		setTimeout( function() {

		couchmap.map.featureLayer = L.mapbox.featureLayer();

		// Prepare one query for all friends. Limit is 50

		geocoderQuery = "";
		for ( i in user['friends'] ) {

			// group them by every 50 locations
			var groupIndex = Math.floor(i / 50);

			// initializate it
			if ( typeof geocodingQueries[ groupIndex ] == 'undefined' ) {
				geocodingQueries[ groupIndex ] = '';
			}

			var thisQuery = user['friends'][i]['city'] +", ";
			thisQuery += typeof user['friends'][i]['region'] == "undefined" ? '' :  user['friends'][i]['region'] +", ";
			thisQuery += user['friends'][i]['country'];
			user['friends'][i]['query'] = thisQuery;

			couchmap.map.geocodingQueries[ groupIndex ] += thisQuery+";";
		}

		if ( couchmap.map.geocodingQueries[0] != '' ) {
			//geocoderQuery = geocoderQuery.substring(0, geocoderQuery.length - 1);

			couchmap.map.thisGeocodingQuery = 0;

			couchmap.map.geocoder = L.mapbox.geocoder( couchmap.MAP_TYPE );
			couchmap.map.geocoder.query( geocoderQuery[ couchmap.map.thisGeocodingQuery ] , couchmap.map.checkGeocoding );
		}

		}, 500);
	};

	$scope.canvasClick = function($event) {

		if ( $scope.username == '' ) {
			return false;
		}

		// show modal to create new couchmap
		if ( $(event.target).closest('.nav-new').length ) {
			$('#username-modal').show();
			$('#map').addClass('blur');
		}

		// hide modals when clicked outside them
		else if( !$(event.target).closest('.couchmap-modal').length) {
			$('.couchmap-modal').hide();
			$('#map').removeClass('blur');
		}

	};

	$scope.newMap = function($event) {

		if ( $event.type != 'keyup' || $event.keyCode != 13 ) {
			return;
		}

		if ( $scope.new_map_username == '' ) {
			$($event.target).addClass('error');
			return false;
		}

		// redirect
		window.location = '/' + $scope.new_map_username;
	};

	$scope.refresh = function() {
		window.location.reload();
	};

	$scope.init();
});

