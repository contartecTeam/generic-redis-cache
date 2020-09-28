'use strict'

const GenericRedisCache = require('../../../lib/services/GenericRedisCache')
const RedisKeyTypeEnum = require('../../../lib/enums/RedisKeyTypeEnum')
const GenericJSONCache = require('../../../lib/services/types/GenericJSONCache')

const GENERIC_REDIS_ATTRS = {
  keyName     : 'test:{?}',
  type        : RedisKeyTypeEnum.JSON,
  ids         : [{ id: 'id' }]
}

class JSONKeySingleID extends GenericRedisCache {
  static get GENERIC_REDIS_ATTRS()  { return GENERIC_REDIS_ATTRS }

  static async onSave(key, value, oldCache, commands) {
    const keyName = this.getKeyName( Math.floor(Math.random() * 100) + 1)
    GenericJSONCache._getCache(keyName, ['.'], commands)
  }
}

module.exports = JSONKeySingleID