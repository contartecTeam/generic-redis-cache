'use strict'

const redis = global.redisInstance

/**
 * Contains a set of simple methods to handle the `redis` hash keys operations
 *
 * @class GenericHASHCache
*/
class GenericHASHCache {
  static async getCache(keyName, field) {
    const cacheValue = await redis.hgetAsync(keyName, field)

    return this.parseCacheString(cacheValue)
  }

  static async getListCache(keyNames, fields, commands = redis) {
    const cachedValues = []

    if (keyNames && !(keyNames instanceof Array))
      keyNames = [keyNames]

    for (const index in keyNames) {
      const keyName = keyNames[index]
      let fieldsTemp

      if (!fields) {
        fieldsTemp = await commands
          .hkeysAsync(keyName)
      }
      else if (fields && !(fields instanceof Array))
        fieldsTemp = [fields]

      if (fieldsTemp.length) {
        const redisResponse = await commands.hmgetAsync(keyName, fieldsTemp)

        if (redisResponse && !(redisResponse.every((value) => { return value === null }))) {
          const parsedValues = redisResponse.map((value) => {
            return this.parseCacheString(value)
          })
          cachedValues.push(...parsedValues)
        }

      }
    }

    return cachedValues
  }

  static setCache(keyName, field, value, commands = redis) {
    const keyValue =  value && value.constructor.name == 'Object' ? JSON.stringify(value) : value

    if (field && field.constructor.name == 'Object') {
      const keys = Object.keys(field)
      if (keys.length == 1)
        field = field[keys[0]]
      else
        field = JSON.stringify(field)
    }

    return commands
      .hsetAsync(keyName, field, keyValue)
  }

  static async delete(keyNames) {
    if (keyNames && !(keyNames instanceof Array))
      keyNames = [keyNames]

    return redis.delAsync(keyNames)
  }

  static parseCacheString(cacheString) {
    try {
      return JSON.parse(cacheString)
    }
    catch (error) {
      return cacheString
    }
  }

  /**
   * Returns whether the `keyName` is cached or not
   * @async
   *
   * @param {string} keyName The `keyName`
   * @param {string} field The field of the HASH key
   *
   * @return {Boolean} Whether the `keyName` is cached or not
  */
  static async isCached(keyName, field) {
    let isCached = false

    if (keyName)
      isCached = (await redis.hexistsAsync(keyName, field)) == 1

    return isCached
  }

}

module.exports = GenericHASHCache