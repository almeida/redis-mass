#!/usr/bin/env node

/*jslint node: true, white: false */
var fs = require('fs'),
	readline = require('readline'),
	RedisProtocol = require('./RedisProtocol');

if (process.argv.length < 3) {
	console.error('USAGE: redis-mass INPUTFILE [OUTPUTFILE]');
	process.exit(1);
}
var inputfile = process.argv[2];
	outputfile = process.argv[3];

var rl = readline.createInterface({
		input: fs.createReadStream(inputfile),
		crlfDelay: Infinity
	});

var writeStream = (outputfile ? fs.createWriteStream(outputfile) : null);

rl.on('line', function(command) {
	var protocol = RedisProtocol.encode(command);
	if (writeStream) {
		writeStream.write(protocol);
	} else {
		console.log(protocol);
	}
});
rl.on('close', function() {
	if (writeStream) {
		writeStream.close();
	}
});
