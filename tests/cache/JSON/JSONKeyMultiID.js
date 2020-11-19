'use strict'

const GenericRedisCache = require('../../../lib/services/GenericRedisCache')
const RedisKeyTypeEnum = require('../../../lib/enums/RedisKeyTypeEnum')

const GENERIC_REDIS_ATTRS = {
  keyName : 'test:{?}:second:{?}:third:{?}',
  type    : RedisKeyTypeEnum.JSON,
  ids     : [ { id: 'id' }, { id: 'id2' }, { id: 'id3' } ]
}

class JSONKeyMultiID extends GenericRedisCache {
  static get GENERIC_REDIS_ATTRS()  { return GENERIC_REDIS_ATTRS }
}

module.exports = JSONKeyMultiID