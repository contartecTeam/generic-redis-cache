'use strict'

const GenericRedisCache = require('lib/GenericRedisCache')
const RedisKeyTypeEnum = require('enums/RedisKeyTypeEnum')
const GenericJSONCache = require('types/GenericJSONCache')

const KEY_NAME = 'test:{?}'
const TYPE = RedisKeyTypeEnum.JSON
const IDS = [{ id: 'id'}]

class JSONKeySingleID extends GenericRedisCache {
  constructor() {
    super(KEY_NAME, TYPE, IDS)
  }

  static get KEY_NAME()            { return KEY_NAME }
  static get ID()                  { return IDS }
  static get TYPE()                { return TYPE }

  get KEY_NAME()            { return KEY_NAME }
  get ID()                  { return IDS }
  get TYPE()                { return TYPE }

  static async onSave(key, value, commands) {
    const keyName = this.getKeyName( Math.floor(Math.random() * 100) + 1)
    GenericJSONCache._getCache(keyName, ['.'], commands)
  }
}

module.exports = JSONKeySingleID