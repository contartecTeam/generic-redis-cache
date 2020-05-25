'use strict'

const GenericRedisCache = require('../../../lib/services/GenericRedisCache')
const RedisKeyTypeEnum = require('../../../lib/enums/RedisKeyTypeEnum')

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