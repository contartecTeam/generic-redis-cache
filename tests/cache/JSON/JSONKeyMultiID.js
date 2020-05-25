'use strict'

const GenericRedisCache = require('../../../lib/services/GenericRedisCache')
const RedisKeyTypeEnum = require('../../../lib/enums/RedisKeyTypeEnum')

const KEY_NAME = 'test:{?}:second:{?}:third:{?}'
const TYPE = RedisKeyTypeEnum.JSON
const IDS = [{ id: 'id'}, { id: 'id2' }, { id: 'id3'} ]

class JSONKeyMultiID extends GenericRedisCache {
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

module.exports = JSONKeyMultiID