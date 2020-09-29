'use strict'

const redis = global.redisInstance

const JSON_GET_SUBCOMMANDS = [
  'NOESCAPE'
]

const DEFAULT_PATH = '.'

/**
 * Contains a set of simple methods to handle the `redis` json keys operations
 *
 * @class GenericJSONCache
*/
class GenericJSONCache {
  static get jsonGetSubcommands() { return JSON_GET_SUBCOMMANDS.join(' ') }

  static get DEFAULT_PATH()       { return DEFAULT_PATH }

  static async getCache(keyName, params) {
    let objectCache = null

    if (keyName) {
      const objectCacheTemp = await GenericJSONCache
        ._getCache(keyName, params)

      if (objectCacheTemp)
        objectCache = GenericJSONCache
          .parseCacheString(objectCacheTemp)
    }

    return objectCache
  }

  static setCache(keyName, value, attr = DEFAULT_PATH, commands = redis) {
    let command = null
    let valueTemp = value

    if (keyName) {
      if (attr == DEFAULT_PATH) {
        if (value && typeof(value) != 'string' ) {
          if (!(value instanceof Object))
            valueTemp = { ...value }
          else
            valueTemp = GenericJSONCache._getObject(value)

          command = GenericJSONCache._setCache(keyName, valueTemp, attr, commands)
        }
      }
      else {
        valueTemp = JSON.stringify(value)

        command = GenericJSONCache._setCache(keyName, valueTemp, attr, commands)
      }
    }

    return command
  }

  /**
   * Returns the parsed cache value
   *
   * @param {string} cacheString The `cache` string
   *
   * @return {(Object|string)} The parsed cache `value`
  */
  static parseCacheString(cacheString) {
    let cacheValue = null

    if (cacheString) {
      if (typeof(cacheString) == 'string') {
        cacheValue = cacheString.match(/^".*"$/g) ?
          cacheString.substring(1, cacheString.length - 1) :
          JSON.parse(cacheString)
      }
      else
        cacheValue = cacheString
    }

    return cacheValue
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
    let count = 0

    if (keyName)
      count = await redis.json_objlenAsync(keyName)

    return count >= 1
  }

  /**
   * Returns the `objects` cache object
   * @async
   *
   * @param {string} keyName The `key` name
   * @param {Object} [attrs = []] The list of specified `attrs` to return (`default:  all`)
   * @param {redis.Multi} [commands] The `redis` multi command object to chain(See {@link https://github.com/NodeRedis/node_redis#clientmulticommands})
   *
   * @return {Promise<string>} The `object` cache
    */
  static _getCache(keyName, attrs = [DEFAULT_PATH], commands = redis) {
    if (attrs && !(attrs instanceof Array))
      attrs = [attrs]

    const params = [
      keyName,
      GenericJSONCache.jsonGetSubcommands,
      ...attrs
    ]

    return commands
      .json_getAsync.apply(commands, params)
  }

  /**
   * Returns the list of `objects` in cache
   * @async
   *
   * @param {string} keyNames The `key` name
   * @param {Object} [attrs = []] The list of specified `attrs` to return (`default:  all`)
   * @param {redis.Multi} [commands] The `redis` multi command object to chain(See {@link https://github.com/NodeRedis/node_redis#clientmulticommands})
   *
   * @return {Promise<string>} The `objects` in cache
  */
  static async getListCache(keyNames, attrs = [DEFAULT_PATH], commands = redis.multi()) {
    let cachedValues = []

    if (keyNames) {
      keyNames
        .forEach(keyName => {
          this
            ._getCache(keyName, attrs, commands)
        })

      const redisResponse = await commands.execAsync()

      if (redisResponse.length) {
        cachedValues = redisResponse.filter((value) => {
          return value != null
        }).map((value) => {
          return GenericJSONCache.parseCacheString(value)
        })
      }
    }

    return cachedValues
  }

  /**
   * Sets the `object` to `keyName`
   * @async
   *
   * @param {string} keyName The `key` name
   * @param {Object} object The `object`
   * @param {Object} [attr = '.'] The `attr` name
   * @param {redis.Multi} [commands = redis] The `redis` multi command object to chain(See {@link https://github.com/NodeRedis/node_redis#clientmulticommands})
   *
   * @return {Promise<string>} The `status` of the operation
  */
  static _setCache(keyName, object, attr = '.', commands = redis) {
    let cacheString = object

    if (object && object instanceof Object) {
      cacheString = JSON
        .stringify({ ...object })
    }

    return commands
      .json_setAsync(keyName, attr, cacheString)
  }

  /**
   * Returns the `value` as `Object`
   *
   * @param {(Object)} value The `value` passed
   *
   * @return {Object} The `value` passed as `Object`
  */
  static _getObject(value) {
    let object = null

    if (value instanceof Object) {
      object = value.constructor.name == 'Object' ?
        { ...value } :
        JSON.parse(JSON.stringify(value))
    }

    return object
  }

  /**
    * Deletes the `keyNames` from cache
    * @async
    *
    * @param {(Array<string> | string)} keyNames The list of `keyNames`
    *
    * @return {Array<Number>} The count of deleted keys
  */
  static async delete(keyNames) {
    const keyNamesTemp = keyNames instanceof Array ?
      [ ...keyNames ] :
      [keyNames]

    let promises = 0

    if (keyNamesTemp[0]) {
      promises = keyNamesTemp.map(k => this._delete(k))

      const response = await Promise.all(promises)

      promises = response.length
    }

    return promises
  }

  /**
    * Deletes the `keyName` from cache
    *
    * @param {string} keyName The `keyName`
    *
    * @return {Number} The count of deleted keys
  */
  static _delete(keyName) {
    return redis.json_delAsync(keyName)
  }
}

module.exports = GenericJSONCache