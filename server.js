var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};


// CREATE HTTP SERVER

//http server
var server = http.createServer(function(req, res) {
	var filePath = false;

	if (req.url == '/') {
		filePath = 'public/index.html';
	} else {
		filePath = 'public' + req.url;
	}
	var absPath = './' + filePath;
	serveStatic(res, cache, absPath);
});

//start the server
server.listen(3000, function() {
	console.log("Server listening on port 3000");
});

// HELPER FUNCTIONS...

//send 404 error message
function send404(res) {
	res.writeHead(404, {
		'Content-Type': 'text-plain'
	});
	res.write('Error 404: resource not found.');
	res.end();
}

//serves file data.
function sendFile(res, filePath, fileContents) {
	res.writeHead(
		200, {
			"content-type": mime.lookup(path.basename(filePath))
		}
	);
	res.end(fileContents);
}

//serves static files; check cache first for static files
function serveStatic(res, cache, absPath) {
	if (cache[absPath]) {
		sendFile(res, absPath, cache[absPath]); //Fn call to line 17
	} else {
		fs.exists(absPath, function(exists) {
			if (exists) {
				fs.readFile(absPath, function(err, data) {
					if (err) {
						send404(res);
					} else {
						cache[absPath] = data;
						sendFile(res, absPath, data);
					}
				});
			} else {
				send404(res);
			}
		});
	}
}

//setup module to supply logic to handle Socket.IO server
var chatServer = require('socket.io');
//start Socket.IO server functionality; provide defined HTTP server
chatServer.listen(server);