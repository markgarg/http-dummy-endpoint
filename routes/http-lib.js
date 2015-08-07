var redis = require("redis"),
        client = redis.createClient();
var app = require("../app");
var uuid = require('node-uuid');
var async = require('async');
var _und = require('underscore');

var KEY_ALL_KEYS = 'ALL_KEYS';

client.on("error", function (err) {
    console.log("Error " + err);
});

// Store the request in Redis store.
exports.storeRequest = function(req, done){
	// Generate a unique key for this request
	var tuuid = uuid.v4();
	// Store in global
	updateAllKeys(tuuid, function(err){
		if(err) done(err);
		// Build the request information
		var val = buildRequestInfo(req);
		console.log('http-lib>storeRequest> val :' + val);
		console.log('http-lib>storeRequest> JSON.stringify(val) :' + JSON.stringify(val));
		if(val == null || val == '')
			done(null);

		//Store this key with value
		client.set(tuuid, JSON.stringify(val), function(err, res){
			done(null);
		});	
	});
}

function buildRequestInfo(req){
	// TODO: Expand this.
	console.log(' req :' + _und.keys(req));
	console.log('headers :' + JSON.stringify(req.headers));
	return req.headers;
}

// Fetch data from the Redis store to show on the screen.
exports.fetchDetails = function(req, res){
	client.smembers(KEY_ALL_KEYS, function(err, result){
		console.log('fetchDetails> err :' + err + '## result :' + result);
		if(err){
			console.log('http-lib>fetchDetails> err :' + err);
			res.render('error', {message: 'Bummer ! Something went wrong :('});
		}
		result = result.toString();
		var allKeys = [];
		// console.log('http-lib>fetchDetails> result :' + result);
		// console.log('http-lib>fetchDetails> result.indexOf(,) :' + result.indexOf(','));
		if(result.indexOf(',') != -1){
			allKeys = result.split(',');
		} else {
			allKeys.push(result);
		}
		console.log('http-lib>fetchDetails> allKeys :' + allKeys);
		console.log('http-lib>fetchDetails> allKeys.length :' + allKeys.length);
		console.log('http-lib>fetchDetails> *****Start iterating on each key in ' + KEY_ALL_KEYS);
		var data = {'items':[]};
		// For each key in the map, get the value
		async.each(allKeys, function(item, callback){
			console.log('http-lib>fetchDetails> For key :' + item);
			client.get(item, function(err, result){
				if(!err){
					data.items.push(JSON.parse(result));
				} else {
					console.log('http-lib>fetchDetails> err in hget :' + err);
				}
				callback(null);
			});
		}, function(err){
			if(err){
				console.log('http-lib>fetchDetails> err in callback for each key :' + JSON.stringify(err));
			}
			console.log('http-lib>fetchDetails> ****** Done iterating on each key in ' + KEY_ALL_KEYS);
			console.log('http-lib>fetchDetails> data :' + JSON.stringify(data));
			res.render('index', {title : 'The HTTP Dummy Endpoint App', data: data});
		});
		
	})
}

// Used to store the passed-in key to the global key cache
function updateAllKeys(newKey, callback){
	// client.get(KEY_ALL_KEYS, function(err, result){
	// 	if(err){console.log('http-lib>updateAllKeys> err :' + err); callback(err);}
	// 	console.log('http-lib>updateAllKeys> KEY_ALL_KEYS :' + result);		
		client.sadd(KEY_ALL_KEYS, newKey);
		callback(null);
	// });
}
