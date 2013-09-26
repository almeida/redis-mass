#!/usr/bin/env node

var fs = require('fs'),
	RedisProtocol = require('./RedisProtocol');

if (process.argv.length < 3) {
	console.error("USAGE: redis-mass INPUTFILE [OUTPUTFILE]");
	process.exit(1);
}
var inputfile = process.argv[2];
var outputfile = process.argv[3];
var text = fs.readFileSync(inputfile).toString();
var protocol = RedisProtocol.encode(text);
if (outputfile) {
	fs.writeFileSync(outputfile,protocol);
} else {
	console.log(protocol.trim() + '\r');
}