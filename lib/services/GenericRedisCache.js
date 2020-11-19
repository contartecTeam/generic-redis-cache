'use strict'

const redis = global.redisInstance

const RedisKeyTypeEnum = require('../enums/RedisKeyTypeEnum')

const GenericJSONCache  = require('../services/types/GenericJSONCache')
const GenericSTRINGCache  = require('../services/types/GenericSTRINGCache')
const GenericHASHCache  = require('../services/types/GenericHASHCache')

/**
 * @typedef KeyId
 * @type {Object}
 * @memberof GenericRedisCache
 *
 * @property {string} id The alias to the key
 * @property {string} idNull The alias to the key when `id` is `null`
 * @property {string} idUndefined The string value to use when `id` is `undefined`
*/

/**
 * Config attrs for cache key
 *
 * @typedef GenericRedisConfig
 * @type {Object}
 * @memberof GenericRedisCache
 *
 * @property {string} keyName
 * @property {RedisKeyTypeEnum} type
 * @property {Array<KeyId>} ids The list of [`KeyIds`]{@link KeyId}
 * @property {string} idNull The string value to use when `id` is `null`
 * @property {string} idUndefined The string value to use when `id` is `undefined`
*/
const GENERIC_REDIS_ATTRS = {
  keyName     : '',
  type        : RedisKeyTypeEnum.JSON,
  ids         : [],
  idNull      : 'null',
  idUndefined : 'undefined'
}

/**
 * Contains a set of methods to handle the `redis` operations
 * @class GenericRedisCache
*/
class GenericRedisCache {

  /**
   * Default attrs to define the `cache` model
   *
   * @type {GenericRedisConfig}
  */
  static get DEFAULT_GENERIC_REDIS_ATTRS()  { return GENERIC_REDIS_ATTRS }

  /**
   * Attrs that define the `cache` model (Override this on your class)
   *
   * @type {GenericRedisConfig}
  */
  static get GENERIC_REDIS_ATTRS()  { return this.DEFAULT_GENERIC_REDIS_ATTRS }

  /**
   * Attrs that define the `cache` model (used internally)
   *
   * @type {Object}
  */
  static get ATTRS() {
    return {
      ...this.DEFAULT_GENERIC_REDIS_ATTRS,
      ...this.GENERIC_REDIS_ATTRS
    }
  }

  //Overriden methods
  static async getIds(keys) { return keys }

  /**
   * Returns the cache value from `db`
   * @async
   *
   * @param {*} key The cache key
   *
   * @return {*} The cache value
  */
  static async getDB(key) { return key }

  /**
   * Returns the list of cache values from `db`
   * @async
   *
   * @param {Array} keys The cache keys
   *
   * @return {Array} The cache values
  */
  static async getListDB() { return [] }

  /**
   * Pre-Hook for `save` operation
   * @description
   *
   * @param {*} key The cache key
   * @param {*} value The cache value
   *
   * @return {*} The value to be saved (or `null` to cancel the `save`)
  */
  static async onSaving(key, value) { return value }

  static async onGetListCache(objects) { return objects }
  static async onGetError(e) { throw e }
  static async onGetListError(e) { throw e }
  static async onSetError(e) { throw e }
  static async onDeleteError(e) { throw e }
  static async onSetListError(e) { throw e }
  static async onSave(key, value, oldCache, command) { return command }
  static async onDelete() { return null }

  /**
    * Return the `key` name
    *
    * @param {(string | Number | Object)} params The params to compose the key name
    *
    * @return {string} The `key` name
  */
  static getKeyName(key) {
    const idsIndexes = GenericRedisCache
      .getIdIndexes(this.ATTRS.keyName)

    let keyName = null

    if (key) {
      if (
        key.constructor.name == 'Object'
        && Object.keys(key).length <= this.ATTRS.ids.length
      ) {
        const keys = Object.keys(key)
        const chars = this.ATTRS.keyName.split('')

        idsIndexes.forEach((indexKeyName, index) =>  {
          const paramKey = keys[index]

          if (paramKey) {
            const objectValue = key[paramKey]

            if (typeof(objectValue) == 'string')
              chars[indexKeyName] =  objectValue.includes(':') ? objectValue.replace(/:/g, '') : objectValue
            else if (Number.isInteger(objectValue))
              chars[indexKeyName] =  objectValue
            else if (objectValue === undefined) {
              if (!this.ATTRS.ids[index].idUndefined)
                chars[indexKeyName] = this.ATTRS.idUndefined
              else
                chars[indexKeyName] = this.ATTRS.ids[index].idUndefined
            }
            else if (objectValue === null) {
              if (!this.ATTRS.ids[index].idNull)
                chars[indexKeyName] = this.ATTRS.idNull
              else
                chars[indexKeyName] = this.ATTRS.ids[index].idNull
            }
          }
          else {
            chars[indexKeyName] = this.ATTRS.ids[index].idUndefined ?
              this.ATTRS.ids[index].idUndefined :
              this.ATTRS.idUndefined
          }
        })

        keyName = chars.join('')

        if (keyName) {
          keyName = keyName.replace(/{/g, '')
          keyName = keyName.replace(/}/g, '')
        }
      }
      else if ((typeof(key) == 'string') || Number.isInteger(key)){
        if (typeof(key) == 'string') {
          keyName = this.ATTRS.keyName
            .replace('{?}', key.includes(':') ? key.replace(/:/g, '') : key)
        }
        else if (Number.isInteger(key))
          keyName = this.ATTRS.keyName.replace('{?}', key)

        if (this.ATTRS.ids && this.ATTRS.ids.length > 1) {
          this.ATTRS.ids.forEach((objectId, index) => {
            if (index > 0) {
              if (objectId.idUndefined) {
                keyName = keyName
                  .replace('{?}', objectId.idUndefined)
              }
              else {
                keyName = keyName
                  .replace('{?}', this.ATTRS.idUndefined)
              }
            }
          })
        }
      }
    }
    else {
      const chars = this.ATTRS.keyName.split('')

      idsIndexes.forEach((indexKeyName, index) =>  {
        chars[indexKeyName] = this.ATTRS.ids[index].idUndefined ?
          this.ATTRS.ids[index].idUndefined :
          this.ATTRS.idUndefined
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
    * @param {(Array | Object)} keys The list of keys or object with the keys
    *
    * @return {Array<string>} The list of key names
  */
  static async getKeyNames(keys) {
    let keyNames = []

    if (keys) {
      if (keys.constructor.name == 'Object' && Object.keys(keys).length <= this.ATTRS.ids.length) {
        const paramsKeys = Object.keys(keys)

        paramsKeys.forEach((key) => {
          if (!(keys[key] instanceof Array))
            keys[key] = [keys[key]]
        })

        const keyNameObjects = GenericRedisCache.getKeyNamesObjects(keys, this.ATTRS.ids)

        if (keyNameObjects.length) {
          keyNames = keyNameObjects.map((keys) => {
            return this.getKeyName(keys)
          })
        }
      }
      else {
        if (!(keys instanceof Array) &&  keys.constructor.name != 'Object' )
          keys = [keys]

        if (keys instanceof Array) {
          keyNames = keys
            .map(id => {
              return this
                .getKeyName(id)
            })
        }
      }
    }
    else if (keys === undefined && this.ATTRS.ids.length == 1 && this.ATTRS.ids[0].idUndefined) {
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
   * Gets the positions of the ids elements on the keyName
   *
   * @param {string} keyName
   *
   * @return {Array<Number>} The positions of the id elements
  */
  static getIdIndexes(keyName) {
    const regex = /\?/gi
    const idsIndexes = []

    let result

    while ((result = regex.exec(keyName)))
      idsIndexes.push(result.index)

    return idsIndexes
  }

  /**
   * Returns an array of object with the ID attributtes of the key based on an Object
   *
   * @param {Array<Object>} objects The objects to get the attrs from
   *
   * @return {Array<Object>} The objects with the ids of the key
  */
  static getIdAttrs(objects) {
    const idsAttrs = []

    if (objects && !(objects instanceof Array))
      objects = [objects]

    objects
      .forEach(object => {
        const idAttr = this._getIdAttr(object)

        idsAttrs.push(idAttr)
      })

    return idsAttrs
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
  static async getCache(key, params) {
    let objectCache = null

    const keyName = this
      .getKeyName(key)

    switch (this.ATTRS.type) {
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
   * @param {(string | Array)}
   *
   * @return {(Object | Array)} The object from `cache` or `db`
  */
  static async get(key, params) {
    try {
      let cacheObject = await this
        .getCache(key, params)

      if (!cacheObject) {
        const dbObject = await this.getDB(key)

        if (dbObject)
          cacheObject = await this.set(key, dbObject)
      }

      return cacheObject
    }
    catch (e) {
      this.onGetError(e, key, params)
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

    const ids = await  this.getIds(keys)

    if (ids && ids.length)
      keys = ids

    const keyNames = await this
      .getKeyNames(keys)

    switch (this.ATTRS.type) {
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

    cacheObjects = await this.onGetListCache(cacheObjects, params)

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
        const dbObjects = await this.getListDB(keysNotCached)

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
      await this.onGetListError(error, keys, params)
    }

  }

  /**
   * Sets the commands to save the value on cache
   *
   * @param {(string | Number | Object)} key The key or object to save on cache
   * @param {*} [value] The value to save on cache
   * @param {string} jsonPath The `path` to object (in case of `JSON`)
   * @param {redis.Multi} [commands] The `redis` multi command object to chain(See {@link https://github.com/NodeRedis/node_redis#clientmulticommands})
   *
   * @return {redis.Multi} The commands to be executed including the `set` command
  */
  static setCache(key, value, jsonPath = GenericJSONCache.DEFAULT_PATH, commands = redis.multi()) {
    const keyName = this
      .getKeyName(key)

    switch (this.ATTRS.type) {
      case RedisKeyTypeEnum.JSON:
        GenericJSONCache
          .setCache(keyName, value, jsonPath, commands)
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

    return commands
  }

  /**
    * Saves the `object` in cache
    * @async
    *
    * @param {string} key the key to save on cache
    * @param {*} value The `value`
    * @param {string} jsonPath The `path` to object (in case of `JSON`)
    * @param {redis.Multi} [commands] The `redis` multi command object to chain(See {@link https://github.com/NodeRedis/node_redis#clientmulticommands})
    *
    * @return {redis.Multi} The `commands.Multi` to execute
    *
    * @throws {Error} Any sort or error
  */
  static async setObject(object, jsonPath = GenericJSONCache.DEFAULT_PATH, commands = redis) {
    const idAttrs = await this._getIdAttr(object)

    let redisResponse = null

    if (idAttrs) {
      const objectTemp = await this.onSaving(idAttrs, object)

      if (objectTemp) {
        const oldCache = await this
          .getCache(idAttrs)

        const cacheObject = await this
          .setCache(idAttrs, objectTemp, jsonPath, commands)

        if (
          commands.constructor.name != 'RedisClient'
          || (
            commands.constructor.name == 'RedisClient'
            && commands.command_queue
            && commands.command_queue._length > 0
          )
        ) {
          redisResponse = cacheObject

          this.onSave(idAttrs, objectTemp, oldCache, commands)
        }
      }
    }

    return redisResponse
  }

  /**
    * Saves the `key` in cache
    * @async
    *
    * @param {string} key the key to save on cache
    * @param {*} value The `value`
    * @param {string} jsonPath The `path` to object (in case of `JSON`)
    * @param {redis.Multi} [commands] The `redis` multi command object to chain(See {@link https://github.com/NodeRedis/node_redis#clientmulticommands})
    *
    * @return {redis.Multi} The `commands.Multi` to execute
    *
    * @throws {Error} Any sort or error
  */
  static async setValue(key, value, jsonPath = GenericJSONCache.DEFAULT_PATH, commands = redis) {
    let redisResponse = null

    if (key) {
      const valueTemp = await this.onSaving(key, value)

      if (valueTemp) {
        const setCommand = await this
          .setCache(key, valueTemp, jsonPath, commands)

        if (commands.command_queue && commands.command_queue._length > 0) {
          redisResponse = setCommand

          this.onSave(key, valueTemp, null, commands)
        }
      }
    }

    return redisResponse
  }

  /**
    * Saves the `key` in cache
    * @async
    *
    * @param {(Object | string | Number)} key the key to save on cache
    * @param {*} value The `value`
    * @param {string} jsonPath The `path` to object (in case of `JSON`)
    * @param {redis.Multi} [commands] The `redis` multi command object to chain(See {@link https://github.com/NodeRedis/node_redis#clientmulticommands})
    *
    * @return {redis.Multi} The `commands.Multi` to execute
    *
    * @throws {Error} Any sort or error
  */
  static async set(key, value = undefined, jsonPath = GenericJSONCache.DEFAULT_PATH, commands = redis) {
    try {
      let redisResponse = null

      if (key) {
        let keyTemp = key

        if (!value && await this.isKey(key))
          keyTemp = await this.getDB(key)

        if (keyTemp instanceof Object && !value) {
          redisResponse = await this
            .setObject(keyTemp, jsonPath, commands)
        }
        else if (keyTemp && value) {
          redisResponse = await this
            .setValue(keyTemp, value, jsonPath, commands)
        }

        if (commands.constructor.name == 'RedisClient' && redisResponse) {
          const multi = commands.multi()
          const response = await multi.exec()

          if (response)
            redisResponse = value || key
        }
      }

      return redisResponse
    }
    catch (e) {
      this.onSetError(e, key, value, jsonPath)
    }
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
   * this.setList([ { key:'128', value: 'teste' } ])
   * this.setList([ { id: 1, name: 'la' }, { ... }, ... ])
   * this.setList([ 1, 2, 3 ]) // ids from `db`
  */
  static async setList(objects) {
    try {
      let redisResponse = null

      if (!(objects instanceof Array))
        objects = [ objects ]

      if (objects.length) {
        const commands = redis.multi()
        const promises = []

        for (const objectIndex in objects) {
          const object = objects[objectIndex]

          let promise = null

          if (!(object instanceof Object))
            promise = this.get(object)
          else {
            const objectAttrs = Object.keys(object)

            if (objectAttrs.length == 2 && objectAttrs[0] == 'key')
              promise = this.set(object.key, object.value, GenericJSONCache.DEFAULT_PATH, commands)
            else if (objectAttrs.length)
              promise = this.set(object, null, GenericJSONCache.DEFAULT_PATH, commands)
          }

          if (promise)
            promises.push(promise)
        }

        const responseObjects = await Promise.all(promises)

        if (objects[0] instanceof Object)
          redisResponse = await commands.execAsync()
        else
          redisResponse = responseObjects.filter(r => r != null)
      }

      return redisResponse
    }
    catch (error) {
      this.onSetListError(error, objects)
    }
  }

  /**
   * Delete the keys from cache
   * @async
   *
   * @param {(Object | Array | string)} keys The keys or key to remove from cache
   *
   * @return {Object} The values deleted from cache
  */
  static async delete(keys) {
    try {
      let deletedValues = []

      if (keys) {
        if (!(keys instanceof Array))
          keys = [keys]

        for (const index in keys) {
          const key = keys[index]
          const keyName = this.getKeyName(key)
          let cachedValue = await this.getCache(key)

          let redisResponse

          if (cachedValue) {
            switch (this.ATTRS.type) {
              case RedisKeyTypeEnum.JSON:
                redisResponse = await GenericJSONCache.delete(keyName)
                break
              case RedisKeyTypeEnum.STRING:
                redisResponse = await GenericSTRINGCache.delete(keyName)
                break
              case RedisKeyTypeEnum.HASH:
                redisResponse = await GenericHASHCache.delete(keyName)
                break
              default:
                break
            }

            if (redisResponse == 1) {
              if (cachedValue instanceof Array)
                cachedValue = cachedValue[0]
              deletedValues.push(cachedValue)

              await this.onDelete(key, cachedValue)
            }
          }
        }
      }

      if (!deletedValues.length)
        deletedValues = null
      else if (deletedValues.length == 1)
        deletedValues = deletedValues[0]

      return deletedValues
    }
    catch (error) {
      await this.onDeleteError(error, keys)
    }
  }

  /**
   * Return wheter the key is cached or not
   * @param {(Object | string | Number)} key
  */
  static async isCached(key) {
    const keyName = this
      .getKeyName(key)

    let isCached = false

    switch (this.ATTRS.type) {
      case RedisKeyTypeEnum.JSON:
        isCached = await GenericJSONCache
          .isCached(keyName)
        break
      case RedisKeyTypeEnum.STRING:
        isCached = await GenericSTRINGCache
          .isCached(keyName)
        break
      case RedisKeyTypeEnum.HASH:
        isCached = await GenericHASHCache
          .isCached(keyName, key)
        break
      default:
        break
    }

    return isCached
  }

  /**
   * Returns whether `key` is an `key` value or not
   * @async
   *
   * @param {*} key The cache `key` value
   *
   * @return {Boolean} Whether `key` is an `key` value or not
  */
  static async isKey(key) {
    const idAttrs = await this
      ._getIdAttr(key)

    const idKeys = this.ATTRS.ids
      .map(id => id.id)

    const isKey = !(key instanceof Object)
      || (idAttrs && Object.keys(idAttrs) == idKeys)

    return isKey
  }

  /**
   * Returns whether the `attr` is `true` or `false`
   * @async
   *
   * @param {(Number | Object)} key The cache key or its object
   * @param {string} attrName The `attr` name
   *
   * @return {Boolean} Whether the `attr` is `true` or `false`
  */
  static async isAttrTrue(key, attrName, defaultValue = true) {
    let isTrue = null

    if (key && attrName) {
      let organization = { ...key }

      if (!(key instanceof Object))
        organization = await this.get(key)

      if (organization) {
        isTrue = organization[attrName] != undefined ?
          organization[attrName] :
          defaultValue
      }
    }

    return isTrue
  }

  /**
   * Returns an object with the ID attributtes of the key based on an Object
   *
   * @param {Object} object The object to get the attrs from
   *
   * @return {Object} The object with the ids of the key
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

      this.ATTRS.ids.forEach(id => {
        if (object[id.id])
          tempObject[id.id] = object[id.id]
        else {
          tempObject[id.id] = id.idUndefined ?
            id.idUndefined :
            this.ATTRS.idUndefined
        }
      })

      if (Object.keys(tempObject).length)
        idAttr = tempObject
    }

    return idAttr
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
              this.ATTRS.ids.forEach((id) => {
                keyFound = o[id.id] == keyObject[id.id]
              })

              return keyFound
            })
        })
      }
      else if ((keys instanceof Array) && keys.length) {
        if (this.ATTRS.ids.length == 1 && keys[0] != null && (!objects.length || ( objects.length && objects[0].constructor.name == 'Object'))) {
          if (keys[0].constructor.name == 'Object') {
            keysNotCached = keys
              .filter(value => {
                const foundObject = objects
                  .find(o => o[this.ATTRS.ids[0].id] === value[this.ATTRS.ids[0].id])

                if (!foundObject)
                  return value
              })
          }
          else {
            keysNotCached = keys
              .filter(key => {
                if (!objects.find(o => o.id == key))
                  return key
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

  getCacheObject() {
    const tempObject = this

    return tempObject
  }
}

module.exports = GenericRedisCache