var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

// HELPER FUNCTIONS
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

//serves static files
function serveStatic(res, cache, absPath) {
	if (cache[absPath]) {
		sendFile(res, absPath, cache[absPath]); //call to line 17
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