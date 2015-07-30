var redis = require("redis"),
        client = redis.createClient();
var app = require("../app");

client.on("error", function (err) {
        console.log("Error " + err);
    });

// Store the request in Redis store.
exports.storeRequest = function(req, done){
	// Build the request information
	var val = buildRequestInfo(req);
	if(val == null || val == '')
		done();

	// Get a random hash.
	var id = crypto.randomBytes(20).toString('hex');
	client.set(id, val, function(err, res){
		done();
	});	
}

function buildRequestInfo(req){
	// TODO: Expand this.
	return req;
}

// Fetch data from the Redis store to show on the screen.
exports.fetchDetails = function(req, res){
	// for()
}