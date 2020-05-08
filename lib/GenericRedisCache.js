'use strict'

const redis = global.redisInstance

const RedisKeyTypeEnum = require('lib/enums/RedisKeyTypeEnum')

const GenericJSONCache  = require('lib/services/types/GenericJSONCache')
const GenericSTRINGCache  = require('lib/services/types/GenericSTRINGCache')
const GenericHASHCache  = require('lib/services/types/GenericHASHCache')

const DEFAULT_UNDEFINED_ID = 'undefined'
const DEFAULT_NULL_ID = 'null'

const DEFAULT_PATH = '.'

/**
 * Contains a set of methods to handle the `redis` operations
 *
 * @class GenericRedisCache
*/
class GenericRedisCache {
  get KEY_NAME()             { return this._keyName }
  get TYPE()                 { return this._type }
  get ID()                   { return this._id }

  static get DEFAULT_UNDEFINED_ID() { return DEFAULT_UNDEFINED_ID }
  static get DEFAULT_NULL_ID() { return DEFAULT_NULL_ID }

  /**
   * Sets the properties of the key
   *
   * @param {String} keyName The keyname using the pattern key:{?}
   * @param {RedisKeyTypeEnum} type The type of the key
   * @param {Array<Object>} id The ids to compose the path of the key replacing on the keyname ex:([ { id: objectId, undefinedValue: last, nullValue: all } ])
   */
  constructor (keyName, type,  id = []) {
    this._keyName = keyName
    this._id = id
    this._type = type
  }

  //Overriden methods
  static async getIds() { return []}
  static async getObjectfromDB() { return null }
  static async getListFromDB() { return [] }
  static async onGetError(e) { throw e}
  static async onGetListError(e) { throw e}
  static async onSetError(e) { throw e}
  static async onDeleteError(e) { throw e }
  static async onSetListError(e) { throw e }
  static async onSavingVerify() { return true }
  static async onSave(key, value, command) { return command }

  /**
    * Return the `key` name
    *
    * @param {(string | Number | Object)} params The params to compose the key name
    *
    * @return {string} The `key` name
  */
  static getKeyName(key) {
    let keyName = null
    const idsIndexes = GenericRedisCache.getIdIndexes(this.KEY_NAME)

    if (key) {
      if (key.constructor.name == 'Object'
        && Object.keys(key).length <= this.ID.length) {
        const keys = Object.keys(key)

        const chars = this.KEY_NAME.split('')

        idsIndexes.forEach((indexKeyName, index) =>  {
          const paramKey = keys[index]

          if (paramKey) {
            const objectValue = key[paramKey]

            if (typeof(objectValue) == 'string')
              chars[indexKeyName] =  objectValue.includes(':') ? objectValue.replace(/:/g, '') : objectValue
            else if (Number.isInteger(objectValue))
              chars[indexKeyName] =  objectValue
            else if (objectValue === undefined) {
              if (!this.ID[index].undefinedValue)
                chars[indexKeyName] = GenericRedisCache.DEFAULT_UNDEFINED_ID
              else
                chars[indexKeyName] =  this.ID[index].undefinedValue
            }
            else if (objectValue === null) {
              if (!this.ID[index].nullValue)
                chars[indexKeyName] = GenericRedisCache.DEFAULT_NULL_ID
              else
                chars[indexKeyName] = this.ID[index].nullValue
            }
          }
          else
            chars[indexKeyName] = this.ID[index].undefinedValue ? this.ID[index].undefinedValue : GenericRedisCache.DEFAULT_UNDEFINED_ID
        })

        keyName = chars.join('')

        if (keyName) {
          keyName = keyName.replace(/{/g, '')
          keyName = keyName.replace(/}/g, '')
        }
      }
      else if ((typeof(key) == 'string') || Number.isInteger(key)){
        if (typeof(key) == 'string') {
          keyName = this.KEY_NAME
            .replace('{?}', key.includes(':') ? key.replace(/:/g, '') : key)
        }
        else if (Number.isInteger(key))
          keyName = this.KEY_NAME.replace('{?}', key)

        if (this.ID.length > 1) {
          this.ID.forEach((objectId, index) => {
            if (index > 0) {
              if (objectId.undefinedValue) {
                keyName = keyName
                  .replace('{?}', objectId.undefinedValue)
              }
              else {
                keyName = keyName
                  .replace('{?}', GenericRedisCache.DEFAULT_UNDEFINED_ID)
              }
            }
          })
        }
      }
    }
    else {
      const chars = this.KEY_NAME.split('')

      idsIndexes.forEach((indexKeyName, index) =>  {
        chars[indexKeyName] = this.ID[index].undefinedValue ? this.ID[index].undefinedValue : GenericRedisCache.DEFAULT_UNDEFINED_ID
      })

      keyName = chars.join('')

      keyName = keyName.replace(/{/g, '')
      keyName = keyName.replace(/}/g, '')
    }

    return keyName
  }

  /**
    * Return the list of key names
    *
    * @param {Array | Object} keys The list of keys or object with the keys
    *
    * @return {Array<string>} The list of key names
  */
  static async getKeyNames(keys) {
    let keyNames = []

    if (keys) {
      if (keys.constructor.name == 'Object' && Object.keys(keys).length <= this.ID.length) {
        const paramsKeys = Object.keys(keys)

        paramsKeys.forEach((key) => {
          if (!(keys[key] instanceof Array))
            keys[key] = [keys[key]]
        })

        const keyNameObjects = GenericRedisCache.getKeyNamesObjects(keys, this.ID)

        if (keyNameObjects.length) {
          keyNames = keyNameObjects.map((keys) => {
            return this.getKeyName(keys)
          })
        }
      }
      else if ((keys instanceof Array)) {
        keyNames = keys
          .map(id => {
            return this
              .getKeyName(id)
          })
      }
    }
    else if (!keys && this.ID.length == 1 && this.ID[0].undefinedValue) {
      keyNames = await GenericRedisCache._getKeyNamesCache(this.getKeyName())
    }

    return keyNames
  }

  /**
   * Returns an array of objects from an object with array properties
   *
   * @param {Object} object The object with array properties representing the keys
   *
   * @param {Array<Object>} ids The ids of the key
   *
   * @return {Array<Object>} The list objects
   *
   * @example
   *
   * params
   * {
   *   terminalsIds: ['aa:bb:cc', 'bb:cc:dd'],
   *   trackerTypeIds: [1,2,3]
   * }
   *
   * returns
   * [
   *    { terminal_id: 'aa:bb:cc', tracker_type_id: 1  },
   *    { terminal_id: 'aa:bb:cc', tracker_type_id: 2  },
   *    ...
   * ]
   *
   */
  static getKeyNamesObjects(object, ids) {
    const keyNameObjects = []
    if (object && object.constructor.name == 'Object' && ids instanceof Array) {
      if (ids.length && ids[0].constructor.name == 'Object' ) {
        const paramsKeys = Object.keys(object)

        paramsKeys.forEach((key) => {
          if (!(object[key] instanceof Array))
            object[key] = [object[key]]
        })

        const firstKeyArray = object[paramsKeys[0]]

        firstKeyArray.map((value) => {
          let valueObjects = []

          paramsKeys.forEach((key, index) => {
            const objects = []

            if ((paramsKeys.length > 1) && (index > 0)) {
              const lastValuesSize = valueObjects.length

              object[key].forEach((keyValue, i) => {
                if (!valueObjects.length) {
                  const keyNameObject = {}
                  keyNameObject[`${(ids[0].id || key )}`] = value
                  keyNameObject[`${ids[index].id || key}`] = keyValue
                  objects.push(keyNameObject)
                }
                else {
                  const keyNameObject = {}
                  keyNameObject[`${(ids[index].id || key)}`] = keyValue

                  if (i == 0) {
                    valueObjects = valueObjects.map((o) => {
                      return {...o, ...keyNameObject}
                    })
                  }
                  else {
                    let tempObjects = valueObjects.slice(0, lastValuesSize)
                    tempObjects = tempObjects.map((tempObject) => {
                      return {...tempObject, ...keyNameObject}
                    })

                    valueObjects.push(...tempObjects)
                  }
                }
              })

              if (objects.length)
                valueObjects.push(...objects)
            }
            else if (paramsKeys.length == 1) {
              const keyNameObject = {}
              keyNameObject[`${paramsKeys[index]}`] = value
              objects.push(keyNameObject)

              valueObjects.push(...objects)
            }
          })

          keyNameObjects.push(...valueObjects)
        })
      }

    }

    return keyNameObjects
  }

  /**
   * Gets the object from cache
   * @async
   *
   * @param {(string | Number | Object)} key The key or `object` to get from the `cache`
   * @param {Object} [params = {}] An `object` with a set of params to fetch the object
   *
   * @return {Object} The `object` from `cache`.
   */
  static async getCache(key, params = {}) {
    let objectCache = null

    const keyName = this
      .getKeyName(key)

    switch (this.TYPE) {
      case RedisKeyTypeEnum.JSON:
        objectCache = await GenericJSONCache
          .getCache(keyName, params)
        break
      case RedisKeyTypeEnum.STRING:
        objectCache = await GenericSTRINGCache
          .getCache(keyName)
        break
      case RedisKeyTypeEnum.HASH:
        objectCache = await GenericHASHCache
          .getCache(keyName, key)
        break
      default:
        break
    }

    return objectCache
  }

  /**
   * Returns the object from cache or `db`
   *
   * @param {(string | Number | Object)} The key or `object` to get from the `cache`
   *
   * @return {Object | Array} The object from `cache` or `db`
   */
  static async get(key, params = {}) {
    try {
      let cacheObject = await this
        .getCache(key, params)

      if (!cacheObject) {
        const dbObject = await this.getObjectfromDB(key)

        if (dbObject) {
          const redisResponse = await (await this.set(key, dbObject)).execAsync()

          if (redisResponse[0] == 'OK')
            cacheObject = dbObject
        }
      }

      return cacheObject
    }
    catch (e) {
      this.onGetError(e)
    }
  }

  /**
   * Returns the list of objects from cache
   *
   * @param {(Array | Object))} keys The `object` with the keys or an array of keys
   * @param {Object} [params = {}] An object with a set of params to fetch the object
   *
   * @return {Array} The list of objects from cache
   */
  static async getListCache(keys, params = {}) {
    let cacheObjects = []

    const keyNames = await this
      .getKeyNames(keys)

    switch (this.TYPE) {
      case RedisKeyTypeEnum.JSON:
        cacheObjects = await GenericJSONCache.getListCache(keyNames, params.attrs)
        break
      case RedisKeyTypeEnum.STRING:
        cacheObjects = await GenericSTRINGCache.getListCache(keyNames)
        break
      case RedisKeyTypeEnum.HASH:
        cacheObjects = await GenericHASHCache.getListCache(keyNames, params.fields)
        break
      default:
        break
    }


    return cacheObjects
  }

  /**
   * Returns the list of `values`
   * @async
   *
   * @param {(Object | Array)} keys The keys list or object
   * @param {Object} [params = {}] An object with a set of params to fetch the object
   * @param {Object} [params.attrs = []] The list of attrs
   *
   * @return {Array} The list of `values`
  */
  static async getList(keys, params = {}) {
    try {
      let objectsCache = []
      const ids = await this.getIds(keys)

      if (ids && ids.length)
        keys = ids

      objectsCache = await this.getListCache(keys, params)

      const keysNotCached = await this._getKeysNotCached(keys, objectsCache)

      if (keysNotCached.length > 0) {
        const dbObjects = await this.getListFromDB(keysNotCached)

        if (dbObjects && dbObjects.length) {
          await this.setList(dbObjects)

          const newObjects = await this.getListCache(keysNotCached, params)

          if (newObjects && newObjects.length > 0) {
            objectsCache
              .push.apply(objectsCache, newObjects)
          }
        }
      }

      return objectsCache
    }
    catch (error) {
      await this.onGetListError(error)
    }

  }

  /**
    * Saves the `key` in cache
    * @async
    *
    * @param {Object | String | Number} key the key to save on cache
    * @param {*} value The `value`
    * @param {redis.Multi} [commands] The `redis` multi command object to chain(See {@link https://github.com/NodeRedis/node_redis#clientmulticommands})
    *
    * @return {redis.Multi} The `commands.Multi` to execute
    *
    * @throws {Error} Any sort or error
  */
  static async set(key, value = undefined, attr = DEFAULT_PATH, commands = redis.multi()) {
    try {
      let redisResponse = null

      if (key instanceof Object && !value) {
        const idAttrs = await this._getIdAttr(key)

        if (idAttrs) {
          redisResponse = await this
            .setCache(idAttrs, key, attr, commands)
        }
      }
      else {
        redisResponse = await this
          .setCache(key, value, attr, commands)
      }

      return redisResponse
    }
    catch (e) {
      this.onSetError(e)
    }
  }

  /**
   * Sets the commands to save the value on cache
   * @async
   *
   * @param {(string | Number | Object)} key The key or object to save on cache
   * @param {*} [value] The value to save on cache
   * @param {redis.Multi} [commands] The `redis` multi command object to chain(See {@link https://github.com/NodeRedis/node_redis#clientmulticommands})
   *
   * @return {redis.Multi} The commands to be executed including the `set` command
  */
  static async setCache(key, value, attr = DEFAULT_PATH, commands = redis.multi()) {
    const setVerification = await this.onSavingVerify(key, value)

    if (setVerification) {
      const keyName = this
        .getKeyName(key)

      switch (this.TYPE) {
        case RedisKeyTypeEnum.JSON:
          GenericJSONCache
            .setCache(keyName, value, attr, commands)
          break
        case RedisKeyTypeEnum.STRING:
          GenericSTRINGCache
            .setCache(keyName, value, commands)
          break
        case RedisKeyTypeEnum.HASH:
          GenericHASHCache
            .setCache(keyName, key, value, commands)
          break
        default:
          break
      }

      await this.onSave(key, value, commands)
    }

    return commands
  }

  /**
   * Sets the list of objects to save on cache
   * @async
   *
   * @param {Array} objects The list of objects to set on cache
   *
   * @return {Array<Object>} The saved `objects`
   *
   * @example
   *
   * // Except JSON
   * this.setList([ { key:'128', value: 'teste' } ])
  */
  static async setList(objects) {
    try {
      let redisResponse = null

      if (!(objects instanceof Array))
        objects = [objects]

      if (objects.length) {
        const commands = redis
          .multi()

        for (const objectIndex in objects) {
          const object = objects[objectIndex]

          const objectAttrs = Object.keys(object)

          if (objectAttrs.length == 2 && objectAttrs[0] == 'key')
            await this.set(object.key, object.value, DEFAULT_PATH ,commands)
          else
            await this.set(object, null, DEFAULT_PATH, commands)
        }

        redisResponse = await commands.execAsync()
      }

      return redisResponse
    }
    catch (error) {
      this.onSetListError(error)
    }
  }

  /**
   * Gets the positions of the ids elements on the keyName
   * @param {String} keyName
   *
   * @returns {Array<Number>} The positions of the id elements
   */
  static getIdIndexes(keyName) {
    const regex = /\?/gi
    const idsIndexes = []
    let result

    while ((result = regex.exec(keyName))) {
      idsIndexes.push(result.index)
    }

    return idsIndexes
  }

  /**
   * Returns an object with the ID attributtes of the key based on an Object
   *
   * @param {Object} object The object to get the attrs from
   *
   * @returns {Object} The object with the ids of the key
   */
  static _getIdAttr(object) {
    let idAttr = null

    if (object) {
      const tempObject = {}

      if (object instanceof Object) {
        object = object.constructor.name == 'Object' ?
          { ...object } :
          JSON.parse(JSON.stringify(object))
      }

      this.ID.forEach(id => {
        if (object[id.id])
          tempObject[id.id] = object[id.id]
        else
          tempObject[id.id] = id.undefinedValue ? id.undefinedValue : DEFAULT_UNDEFINED_ID
      })

      if (Object.keys(tempObject).length)
        idAttr = tempObject
    }

    return idAttr
  }

  /**
   * Returns an array of object with the ID attributtes of the key based on an Object
   *
   * @param {Array<Object>} objects The objects to get the attrs from
   *
   * @returns {Array<Object>} The objects with the ids of the key
   */
  static getIdAttrs(objects) {
    const idsAttrs = []
    if (objects && !(objects instanceof Array))
      objects = [objects]

    objects.forEach(object => {
      const idAttr = this._getIdAttr(object)

      idsAttrs.push(idAttr)
    })

    return idsAttrs
  }

  /**
   * Returns the keys not cached based on the list passed
   *
   * @param {*} keys
   * @param {*} objects
   */
  static async _getKeysNotCached(keys, objects) {
    let keysNotCached = []

    if (keys) {
      if (keys.constructor.name == 'Object') {
        const keyObjects = GenericRedisCache.getKeyNamesObjects(keys)

        keysNotCached = keyObjects.filter(keyObject => {
          return !objects
            .find(o => {
              let keyFound = true
              this.ID.forEach((id) => {
                keyFound = o[id.id] == keyObject[id.id]
              })

              return keyFound
            })
        })
      }
      else if ((keys instanceof Array) && keys.length) {
        if (this.ID.length == 1 && (!objects.length || ( objects.length && objects[0].constructor.name == 'Object'))) {
          if (keys[0].constructor.name == 'Object') {
            keysNotCached = keys
              .filter(value => {
                const foundObject = objects
                  .find(o => o[this.ID[0].id] === value[this.ID[0].id])

                if (!foundObject)
                  return value
              })
          }
          else {
            keysNotCached = keys
              .filter(value => {
                if (!objects.find(o => o == value))
                  return value
              })
          }
        }
        else {
          const commands = redis.multi()

          keys
            .forEach(key => {
              const keyName = this
                .getKeyName(key)

              if (keyName)
                commands
                  .exists(keyName)
            })

          const notCachedIndexes = (await commands.execAsync()).reduce((acc, value, index) => {
            if (value == 0)
              acc.push(index)
            return acc
          }, [])

          if (notCachedIndexes.length)
            notCachedIndexes.forEach((value) => {
              if (keys[value])
                keysNotCached.push(keys[value])
            })
        }
      }
    }

    return keysNotCached
  }

  /**
    * Returns the `key` names in cache
    *
    * @param {string} searchKey The search string to fetch the key names
    * @param {redis.Multi} [commands] The `redis` multi command object to chain(See {@link https://github.com/NodeRedis/node_redis#clientmulticommands})
    *
    * @return {Promise<Array<string>>} The `key` names in cache
  */
  static _getKeyNamesCache(searchKey, commands = redis) {
    return commands
      .keysAsync(searchKey)
  }

  /**
   * Delete the keys from cache
   * @async
   *
   * @param {(Object | Array)} keys The keys to remove from cache
   *
   * @return {Number} The number of deleted keys
  */
  static async delete(keys) {
    try {
      let deletedKeys = 0

      if (keys) {
        if (!(keys instanceof Array))
          keys = [keys]

        const keyNames = await this.getKeyNames(keys)

        switch (this.TYPE) {
          case RedisKeyTypeEnum.JSON:
            deletedKeys = await GenericJSONCache.delete(keyNames)
            break
          case RedisKeyTypeEnum.STRING:
            deletedKeys = await GenericSTRINGCache.delete(keyNames)
            break
          case RedisKeyTypeEnum.HASH:
            deletedKeys = await GenericHASHCache.delete(keyNames)
            break
          default:
            break
        }
      }
      return deletedKeys
    }
    catch (error) {
      await this.onDeleteError(error)
    }
  }
}

module.exports = GenericRedisCache