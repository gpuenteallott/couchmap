// map controller
// controllers/map_controller.js

var https = require('https');
var cheerio = require('cheerio'); // https://www.npmjs.org/package/cheerio

// GET /map
// exports.index = function(req, res, next) {

// 	res.send('Hello Couch!');
// }

// GET /map/username
exports.index = function(req, res, next) {

	console.log('starting index');

	// load username or use default one
	if ( typeof req.param('username') == 'undefined' ) {
		var username = 'gpuenteallott';
	} else {
		var username = req.param('username');
	}

	var options = {
		host: 'www.couchsurfing.org',
		path: "/people/"+username+"/?all_friends=1&all_references=1",

		// workaround for certificate validation
		agent: false,
		rejectUnauthorized: false,
	};

	var callback = function(response) {
		var str = '';

		//another chunk of data has been recieved, so append it to `str`
		response.on('data', function (chunk) {
			str += chunk;
		});

		//the whole response has been recieved, so we just print it out here
		response.on('end', function () {

			var user = scrapeCSProfile(str);
			res.render('map/index',
				{ user: JSON.stringify(user)}
			);
		});
	}
	https.get(options, callback);
}

scrapeCSProfile = function( html ) {

	user = {};

	// parser
	// https://www.npmjs.org/package/cheerio
	var $ = cheerio.load(html, {
    	normalizeWhitespace: true
	});

	// Super ugly retrieval of information, CS source code is terrible
	user['name'] = $(".profile_header .profile").text().trim();
	var location = $(".profile_header a[target=mapblast]").html().split("<br>");
	user['city'] = location[2];
	user['region'] = location[1];
	user['country'] = location[0];
	user['username'] = $('.generalinfo tr:nth-child(7) td').text().toLowerCase();
	user['image'] = $('.right_profile div:nth-child(2) img').attr("src");

	// getting friends
	user['friends'] = {};
	user['n_friends'] = 0;
	var i = 0;
	$('#show_friends .friends td').each(function() {

		$friend = $(this);

		if ( $friend.attr('id') != 'morefriends' && $friend.find('.profile-image').length > 0 ) {
			var friend = {};
			friend['image'] = $friend.find('.profile-image img').attr('src');
			friend['username'] = $friend.find('.profile-image').attr("href").replace('/people/','').replace('/','');
			friend['name'] = $friend.find('a:nth-child(2)').text();
			location = $friend.html().split("<br>")[2].split(",");
			friend['city'] = location[0];
			friend['region'] = location[1];
			friend['country'] = $friend.html().match(/<strong>([^<]*)<\/strong>/)[1];
			friend['type'] = 'friend';

			user['friends'][i] = friend;
			user['n_friends']++;
			i++;
		}
	});

	// getting references
	user['n_references'] = 0;
	$('#show_references>div').each(function() {

		$ref = $(this);

		if ( $ref.attr('id') != 'no_matches' && $ref.attr('id') != 'show_all_references' && $ref.find('.profile-image').length > 0 ) {
			var friend = {};
			friend['username'] = $ref.find('.profile-image').attr("href").replace('/people/','').replace('/','');

			for ( u in user['friends'] ) {
				if ( user['friends'][u]['username'] == friend['username'] )
					return true; // continue to next loop iteration to avoid repeated friends
			}

			friend['image'] = $ref.find('.profile-image img').attr('src');
			friend['name'] = $ref.find('.userlink').text();
			location = $ref.find('small').html().split("<br>")[0];
			friend['city'] = location.split(",")[0];
			// there is no region info in the reference
			friend['country'] = location.split(",")[1];
			friend['type'] = 'reference';

			user['friends'][i] = friend;
			user['n_references']++;
			i++;
		}
	});

	return user;
}