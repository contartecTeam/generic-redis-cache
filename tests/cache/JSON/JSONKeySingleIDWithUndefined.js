'use strict'

const GenericRedisCache = require('../../../lib/services/GenericRedisCache')
const RedisKeyTypeEnum = require('../../../lib/enums/RedisKeyTypeEnum')

const GENERIC_REDIS_ATTRS = {
  keyName : 'test:{?}',
  type    : RedisKeyTypeEnum.JSON,
  ids     : [{
    id: 'id',
    undefinedValue: '*'
  }]
}

class JSONKeySingleIDWithUndefined extends GenericRedisCache {
  static get GENERIC_REDIS_ATTRS()  { return GENERIC_REDIS_ATTRS }
}

module.exports = JSONKeySingleIDWithUndefined