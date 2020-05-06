'use strict'

const redis = global.redisInstance

/**
 * Contains a set of simple methods to handle the `redis` set/string keys operations
 *
 * @class GenericSETCache
*/
class GenericSTRINGCache {
  static async getCache(keyName) {
    return await redis.smembersAsync(keyName)
  }

  static async getListCache(keyNames, commands = redis) {
    const cachedValues = await commands.sunionAsync(keyNames)

    return cachedValues
  }

  static setCache(keyName, value, commands = redis) {
    if (keyName) {
      if (!(value instanceof Array))
        value = [value]

      const values = value.map((value) => {
        if (value)
          return value.constructor.name == 'Object' ? JSON.stringify(value) : value
        else
          return value
      })

      return commands
        .saddAsync([keyName].concat(values))
    }
    else
      return null
  }

  static async remove (keyName, values = [],  commands = redis) {
    if (values && !(values instanceof Array))
      values = [values]

    return commands
      .sremAsync([keyName].concat(values))
  }

  static async delete(keyNames) {
    const keyNamesTemp = keyNames instanceof Array ?
      [ ...keyNames ] :
      [keyNames]

    return redis.delAsync(keyNamesTemp)
  }
}

module.exports = GenericSTRINGCache