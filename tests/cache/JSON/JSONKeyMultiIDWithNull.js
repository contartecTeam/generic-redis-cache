'use strict'

const GenericRedisCache = require('../../../lib/services/GenericRedisCache')
const RedisKeyTypeEnum = require('../../../lib/enums/RedisKeyTypeEnum')

const KEY_NAME = 'test:{?}:second:{?}'
const TYPE = RedisKeyTypeEnum.JSON
const IDS = [
  { id: 'id', nullValue: 'nullValue1' },
  { id: 'id2', nullValue: 'nullValue2' }
]

class JSONKeyMultiIDWithNull extends GenericRedisCache {
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

module.exports = JSONKeyMultiIDWithNull