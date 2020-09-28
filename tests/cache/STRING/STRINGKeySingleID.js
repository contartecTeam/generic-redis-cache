'use strict'

const GenericRedisCache = require('../../../lib/services/GenericRedisCache')
const RedisKeyTypeEnum = require('../../../lib/enums/RedisKeyTypeEnum')

const GENERIC_REDIS_ATTRS = {
  keyName     : 'string_key:{?}',
  type        : RedisKeyTypeEnum.STRING,
  ids         : [{ id: 'id' }]
}

class STRINGKeySingleID extends GenericRedisCache {
  static get GENERIC_REDIS_ATTRS()  { return GENERIC_REDIS_ATTRS }
}

module.exports = STRINGKeySingleID