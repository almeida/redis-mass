/*jslint node: true, white: false */
var util = require('util');

var RedisCommandParserState = {
    WaitingArgumentStart: function (state, c, eol) {
        if (c !== ' ') {
            if (c === '"') {
                state.parser = RedisCommandParserState.WaitingQuotedArgumentEnd;
            } else {
                state.parser = RedisCommandParserState.WaitingUnquotedArgumentEnd;
                state.parser(state, c, eol);
            }
        }
    },
    _FindEndToken: function (endToken, state, c, eol) {
        if (c !== endToken) {
            state.buffer += c;
        }
        if (eol || c === endToken) {
            state.args.push(state.buffer);
            state.buffer = '';
            state.quoted = false;
            state.parser = RedisCommandParserState.WaitingArgumentStart;
        }
    },
    _WaitingArgumentEnd: function (endToken, state, c, eol) {
        // when endToken is not quote, find pair of quotes and allow endToken within the pair
        // this is to allow ' ' in quoted strings in json blobs
        // for example SET redisKey {"json key 1": "value 1"}
        if (endToken !== '"') {
            if (c === '"') {
                state.quoted = !state.quoted;
            }

            // if it is in a quote pair, keep bufferring
            if (state.quoted) {
                state.buffer += c;
            } else {
                RedisCommandParserState._FindEndToken(endToken, state, c, eol);
            }
        } else {
            RedisCommandParserState._FindEndToken(endToken, state, c, eol);
        }
    },
    WaitingQuotedArgumentEnd: function (state, c, eol) {
        RedisCommandParserState._WaitingArgumentEnd('"', state, c, eol);
    },
    WaitingUnquotedArgumentEnd: function (state, c, eol) {
        RedisCommandParserState._WaitingArgumentEnd(' ', state, c, eol);
    }
};
var RedisCommandParser = {
    parse: function (command) {
        var state = { parser: RedisCommandParserState.WaitingArgumentStart, args: [], buffer: '', quoted: false },
            length = command.length;
        for (var i = 0; i < length; i++) {
            var c = command.charAt(i),
                eol = (i === length - 1);
            state.parser(state, c, eol);
        }
        return state.args;
    }
};
var RedisProtocol = {
	encode: function(command) {
		var arguments = RedisCommandParser.parse(command.trim());
		var protocol = '';
		var length = arguments.length;
		if (length > 0) {
			protocol += util.format('*%d\r\n', length);
			for (var a = 0; a < length; a++) {
				var argument = arguments[a];
				protocol += util.format('$%d\r\n%s\r\n', Buffer.byteLength(argument), argument);
			}
		}
		return protocol;
	}
};
module.exports = RedisProtocol;
