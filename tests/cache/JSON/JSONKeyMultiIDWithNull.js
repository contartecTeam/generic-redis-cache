'use strict'

const GenericRedisCache = require('../../../lib/services/GenericRedisCache')
const RedisKeyTypeEnum = require('../../../lib/enums/RedisKeyTypeEnum')

const GENERIC_REDIS_ATTRS = {
  keyName : 'test:{?}:second:{?}',
  type    : RedisKeyTypeEnum.JSON,
  ids     : [
    { id: 'id', idNull: 'nullValue1' },
    { id: 'id2', idNull: 'nullValue2' }
  ]
}

class JSONKeyMultiIDWithNull extends GenericRedisCache {
  static get GENERIC_REDIS_ATTRS()  { return GENERIC_REDIS_ATTRS }
}

module.exports = JSONKeyMultiIDWithNull