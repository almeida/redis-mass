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
    _WaitingArgumentEnd: function (endToken, state, c, eol) {
        if (c !== endToken) {
            state.buffer += c;
        }
        if (eol || c === endToken) {
            state.args.push(state.buffer);
            state.buffer = '';
            state.parser = RedisCommandParserState.WaitingArgumentStart;
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
        var state = { parser: RedisCommandParserState.WaitingArgumentStart, args: [], buffer: '' },
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
    encode: function (text) {
        var commands = text.split('\n'),
            protocol = '',
            commandsLength = commands.length;
        for (var i = 0; i < commandsLength; i++) {
            var command = commands[i],
                args = RedisCommandParser.parse(command.trim()),
                length = args.length;
            if (length > 0) {
                protocol += util.format('*%d\r\n', length);
                for (var a = 0; a < length; a++) {
                    var arg = args[a];
                    protocol += util.format('$%d\r\n%s\r\n', Buffer.byteLength(arg), arg);
                }
            }
        }
        return protocol;
    }
};
module.exports = RedisProtocol;