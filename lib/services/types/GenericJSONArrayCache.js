'use strict'

const redis = global.redisInstance

const GenericJSONCache = require('./GenericJSONCache')

/**
 * Contains a set of simple methods to handle the `redis` json array keys operations
 *
 * @class GenericJSONArrayCache
 * @extends {GenericJSONCache}
*/
class GenericJSONArrayCache extends GenericJSONCache {

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
      if (value && typeof(value) != 'string' ) {
        if (!(value instanceof Object))
          valueTemp = { ...value }
        else
          valueTemp = GenericJSONArrayCache._getObject(value)

        const isCached = await GenericJSONArrayCache
          .isCached(keyName)

        if (isCached) {
          command = GenericJSONArrayCache
            ._addCache(keyName, valueTemp, position, attr, commands)
        }
        else {
          command = GenericJSONArrayCache
            .initArrayCache(keyName, valueTemp, attr, commands)
        }
      }
    }

    return command
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
    let response = null

    if (keyName)
      response = await redis.json_getAsync(keyName)

    return response != null
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

    if (typeof(position) === 'number') {
      size = await commands
        .json_arrlenAsync(keyName)
    }
    
    if (typeof(position) === 'number' && position <= size) {
      command = await commands
        .json_arrinsertAsync(keyName, attr, position, cacheString)
    }
    else {
      command = await commands
        .json_arrappendAsync(keyName, attr, cacheString)
    }

    return command
  }
}

module.exports = GenericJSONArrayCache