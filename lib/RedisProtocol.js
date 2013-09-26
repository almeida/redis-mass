var util = require('util');

RedisCommandParserState = {
	WaitingArgumentStart: function(state, c, eol) {
		if (c != ' ') {
			if (c == '"') {
				state.parser = RedisCommandParserState.WaitingQuotedArgumentEnd;
			} else {
				state.buffer += c;
				state.parser = RedisCommandParserState.WaitingUnquotedArgumentEnd;
			}
		}
	}, 
	_WaitingArgumentEnd: function(endToken, state, c, eol) {
		if (c != endToken) {
			state.buffer += c;
		}
		if (eol || c == endToken) {
			state.arguments.push(state.buffer);
			state.buffer = '';
			state.parser = RedisCommandParserState.WaitingArgumentStart;
		}
	},
	WaitingQuotedArgumentEnd: function(state, c, eol) {
		RedisCommandParserState._WaitingArgumentEnd('"', state, c, eol);
	},
	WaitingUnquotedArgumentEnd: function(state, c, eol) {
		RedisCommandParserState._WaitingArgumentEnd(' ', state, c, eol);
	}
}
RedisCommandParser = {
	parse: function(command) {
		var state = { parser: RedisCommandParserState.WaitingArgumentStart, arguments: [], buffer: '' };
		var length = command.length;
		for (var i = 0; i < length; i++) {
			var c = command.charAt(i);
			var eol = (i == length-1);
			state.parser(state, c, eol);
		}
		return state.arguments;
	}
}
RedisProtocol = {
	encode: function(text) {
		var commands = text.split("\n");
		var protocol = '';
		for(i in commands) {
			var command = commands[i];
			var arguments = RedisCommandParser.parse(command.trim());
			var length = arguments.length;
			if (length > 0) {
				protocol += util.format('*%d\r\n', length);
				for (var a = 0; a < length; a++) {
					var argument = arguments[a];
					protocol += util.format('$%d\r\n%s\r\n', Buffer.byteLength(argument), argument);
				}
			}
		}
		return protocol;
	}
}
module.exports = RedisProtocol;