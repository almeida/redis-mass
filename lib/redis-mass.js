#!/usr/bin/env node

/*jslint node: true, white: false */
var fs = require('fs'),
    RedisProtocol = require('./RedisProtocol');

if (process.argv.length < 3) {
    console.error('USAGE: redis-mass INPUTFILE [OUTPUTFILE]');
    process.exit(1);
}

var inputfile = process.argv[2],
    outputfile = process.argv[3],
    text = fs.readFileSync(inputfile).toString(),
    protocol = RedisProtocol.encode(text);
if (outputfile) {
    fs.writeFileSync(outputfile, protocol);
} else {
    console.log(protocol.trim() + '\r');
}