var assert = require("assert");
var RedisProtocol = require('../lib/RedisProtocol');

describe('RedisProtocol', function(){
  describe('#encode()', function() {
    it('should encode unquoted args', function(){
      assert.equal('*2\r\n$3\r\nGET\r\n$3\r\nkey\r\n',RedisProtocol.encode('GET key'));
    })
  }),
  describe('#encode()', function() {
    it('should encode quoted args', function(){
      assert.equal('*2\r\n$3\r\nGET\r\n$3\r\nkey\r\n',RedisProtocol.encode('GET "key"'));
    })
  }),
  describe('#encode()', function() {
    it('should encode one char unquoted args', function(){
      assert.equal('*2\r\n$3\r\nGET\r\n$1\r\nA\r\n',RedisProtocol.encode('GET A'));
    })
  }),
  describe('#encode()', function() {
    it('should allow whitespace within quoted strings', function() {
      assert.equal('*3\r\n$3\r\nSET\r\n$8\r\nredisKey\r\n$24\r\n{"json key 1":"value 1"}\r\n', RedisProtocol.encode('SET redisKey {"json key 1":"value 1"}'));
    })
  })
})
