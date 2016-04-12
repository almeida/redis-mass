#!/usr/bin/env node

/*jslint node: true, white: false */
var fs = require('fs'),
    RedisProtocol = require('./RedisProtocol');

if (process.argv.length < 3) {
    console.error('USAGE: redis-mass INPUTFILE [OUTPUTFILE] or --pipe');
    process.exit(1);
}

if (process.argv = '--pipe') {

    var readline = require('readline');
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    rl.on('line', function (line) {
        var encoded = RedisProtocol.encode(line);
        process.stdout.write(encoded);
    });

    rl.on('exit', function (code) {
        console.log("exit");
        process.exit(code);
    });

} else {

    var inputfile = process.argv[2],
        outputfile = process.argv[3],
        text = fs.readFileSync(inputfile).toString(),
        protocol = RedisProtocol.encode(text);

    if (outputfile) {
        fs.writeFileSync(outputfile, protocol);
    } else {
        console.log(protocol.trim() + '\r');
    }

}





