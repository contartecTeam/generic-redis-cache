'use strict'

const redis = global.redisInstance

/**
 * Contains a set of simple methods to handle the `redis` `SET/STRING` keys operations
 * @class GenericSTRINGCache
*/
class GenericSTRINGCache {
  static getCache(keyName) {
    return redis.smembersAsync(keyName)
  }

  static getListCache(keyNames, commands = redis) {
    return commands.sunionAsync(keyNames)
  }

  static setCache(keyName, value, commands = redis) {
    let promise = null

    if (keyName) {
      if (!(value instanceof Array))
        value = [value]

      const values = value
        .map(value => {
          let valueTemp = value

          if (value && value.constructor.name == 'Object')
            valueTemp = JSON.stringify(value)

          return valueTemp
        })

      promise = commands
        .saddAsync([ keyName, ...values ])
    }

    return promise
  }

  static remove (keyName, values = [],  commands = redis) {
    if (values && !(values instanceof Array))
      values = [values]

    return commands
      .sremAsync([keyName].concat(values))
  }

  static delete(keyNames) {
    const keyNamesTemp = keyNames instanceof Array ?
      [ ...keyNames ] :
      [keyNames]

    return redis.delAsync(keyNamesTemp)
  }

  /**
   * Returns whether the `keyName` is cached or not
   * @async
   *
   * @param {string} keyName The `keyName`
   *
   * @return {Boolean} Whether the `keyName` is cached or not
  */
  static async isCached(keyName) {
    let isCached = false

    if (keyName)
      isCached = (await redis.existsAsync(keyName)) == 1

    return isCached
  }
}

module.exports = GenericSTRINGCache