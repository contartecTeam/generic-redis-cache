'use strict'

const GenericRedisCache = require('generic-redis-cache/services/GenericRedisCache')
const RedisKeyTypeEnum = require('generic-redis-cache/enums/RedisKeyTypeEnum')

const KEY_NAME = 'test:{?}'
const TYPE = RedisKeyTypeEnum.JSON
const IDS = [{
  id: 'id',
  undefinedValue: '*'
}]

class JSONKeySingleIDWithUndefined extends GenericRedisCache {
  constructor() {
    super(KEY_NAME, TYPE, IDS)
  }

  static get KEY_NAME()            { return KEY_NAME }
  static get ID()                  { return IDS }
  static get TYPE()                { return TYPE }

  get KEY_NAME()            { return KEY_NAME }
  get ID()                  { return IDS }
  get TYPE()                { return TYPE }
}

module.exports = JSONKeySingleIDWithUndefined