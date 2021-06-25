'use strict'

const redis = global.redisInstance

const GenericJSONCache = require('./GenericJSONCache')

const DEFAULT_PARAMS_SLICE = {
  path  : '.',
  start : 1,
  stop  : undefined
}

/**
 * Contains a set of simple methods to handle the `redis` json array keys operations
 *
 * @class GenericJSONArrayCache
 * @extends {GenericJSONCache}
*/
class GenericJSONArrayCache extends GenericJSONCache {

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

  /**
   * Adds the item on cache array (`index 0` default)
   * @async
   *
   * @param {string} keyName The `key` name
   * @param {Object} object The `object`
   * @param {Number} [position = undefined] The index position to insert the item
   * @param {Object} [attr = '.'] The `attr` name
   * @param {redis.Multi} [commands = redis] The `redis` multi command object to chain(See {@link https://github.com/NodeRedis/node_redis#clientmulticommands})
   * 
   * @return {Number} The new list size
  */
  static async _addCache(keyName, object, position = undefined, attr = '.', commands = redis) {
    let command = 0
    let cacheString = object

    if (object && object instanceof Object) {
      cacheString = JSON
        .stringify({ ...object })
    }

    let size = 0

    size = await commands
      .json_arrlenAsync(keyName)
    
    if (position === undefined || (typeof(position) === 'number' && position > size))
      position = size

    command = await commands
      .json_arrinsertAsync(keyName, attr, position, cacheString)

    return command
  }

  /**
   * Sets the `object` to `keyName`
   * @async
   *
   * @param {string} keyName The `key` name
   * @param {Object} value The value to insert
   * @param {Object} [attr = '.'] The `attr` name
   * @param {redis.Multi} [commands = redis] The `redis` multi command object to chain(See {@link https://github.com/NodeRedis/node_redis#clientmulticommands})
   * 
   * @return {Number} The new list size
  */
  static async initArrayCache(keyName, value, attr = '.', commands = redis) {
    let command = 0

    if (keyName) {
      let cacheString = '[]'

      if (value instanceof Array) {
        command = value.length
        
        cacheString = JSON
          .stringify(value)
      }
      else if (value && value instanceof Object) {
        cacheString = JSON
          .stringify([{ ...value }])
      }

      const response = await commands
        .json_setAsync(keyName, attr, cacheString)

      if (!command && cacheString != '[]' && response == 'OK')
        command = 1
    }

    return command
  }

  /**
   * Adds the item on cache array (`last index` default)
   * @async
   *
   * @param {string} keyName The `key` name
   * @param {*} value The value to insert
   * @param {Number} [position = undefined] The index position to insert the item
   * @param {Object} [attr = '.'] The `attr` name
   * @param {redis.Multi} [commands = redis] The `redis` multi command object to chain(See {@link https://github.com/NodeRedis/node_redis#clientmulticommands})
   *
   * @return {Number} The new list size
  */
  static async addCache(keyName, value, position = undefined, attr = '.', commands = redis) {
    let command = 0
    let valueTemp

    if (keyName) {
      if (value && typeof(value) != 'string') {
        if (!(value instanceof Object))
          valueTemp = { ...value }
        else
          valueTemp = GenericJSONArrayCache._getObject(value)
      }

      const isCached = await GenericJSONArrayCache
        .isCached(keyName)

      if (isCached && valueTemp && !(valueTemp instanceof Array)) {
        command = GenericJSONArrayCache
          ._addCache(keyName, valueTemp, position, attr, commands)
      }
      else {
        command = GenericJSONArrayCache
          .initArrayCache(keyName, valueTemp, attr, commands)
      }
    }

    return command
  }

  /**
   * Removes the item(s) from cache outside the `start` - `stop` params
   *
   * @param {string} keyName The `key` name
   * @param {Object} [params] The value to save on cache
   * @param {string} [params.path = '.'] The `path` to object (in case of `JSON`)
   * @param {Number} [params.start = 1] The start index to maintain
   * @param {Number} [params.stop = undefined] The stop index to maintain
   *
   * @return {Number} The new `array` size
  */
  static async slice(keyName, params = DEFAULT_PARAMS_SLICE) {
    let redisResponse = null

    if (keyName) {
      params = {
        ...DEFAULT_PARAMS_SLICE,
        ...params
      }

      if (params.stop == undefined) {
        params.stop = await redis
          .json_arrlenAsync(keyName, params.path)
      }

      redisResponse = await redis
        .json_arrtrimAsync(keyName, params.path, params.start, params.stop)
    }
  
    return redisResponse
  }
}

module.exports = GenericJSONArrayCache