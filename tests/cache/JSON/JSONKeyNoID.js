'use strict'

const GenericRedisCache = require('generic-redis-cache-lib/GenericRedisCache')
const RedisKeyTypeEnum = require('generic-redis-cache-enums/RedisKeyTypeEnum')

const KEY_NAME = 'test:key'
const TYPE = RedisKeyTypeEnum.JSON

class JSONKeyNoID extends GenericRedisCache {
  constructor() {
    super(KEY_NAME, TYPE)
  }

  static get KEY_NAME()            { return KEY_NAME }
  static get TYPE()                { return TYPE }

  get KEY_NAME()            { return KEY_NAME }
  get TYPE()                { return TYPE }
}

module.exports = JSONKeyNoID