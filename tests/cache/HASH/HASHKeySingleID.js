'use strict'

const GenericRedisCache = require('../../../lib/services/GenericRedisCache')
const RedisKeyTypeEnum = require('../../../lib/enums/RedisKeyTypeEnum')

const GENERIC_REDIS_ATTRS = {
  keyName : 'hash_key:{?}',
  type    : RedisKeyTypeEnum.HASH,
  ids     : [{ id: 'id' }]
}

class HASHKeySingleID extends GenericRedisCache {
  static get GENERIC_REDIS_ATTRS()  { return GENERIC_REDIS_ATTRS }
}

module.exports = HASHKeySingleID