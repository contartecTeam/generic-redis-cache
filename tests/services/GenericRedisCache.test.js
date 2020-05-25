'use strict'

const GenericRedisCache = rewire('generic-redis-cache/services/GenericRedisCache')
const RedisKeyTypeEnum = require('generic-redis-cache/enums/RedisKeyTypeEnum')

const GenericRedisCacheMock = require('generic-redis-cache-tests/mocks/GenericRedisCacheMock')

const GenericJSONCache = require('generic-redis-cache-types/GenericJSONCache')
const GenericJSONCacheMock = require('generic-redis-cache-tests/mocks/GenericJSONCacheMock')
const GenericHASHCache = require('generic-redis-cache-types/GenericHASHCache')
const GenericSTRINGCache = require('generic-redis-cache-types/GenericSTRINGCache')

const JSONKeySingleID = require('generic-redis-cache-tests/cache/JSON/JSONKeySingleID')
const JSONKeySingleIDWithUndefined = require('generic-redis-cache-tests/cache/JSON/JSONKeySingleIDWithUndefined')
const JSONKeySingleIDWithNull = require('generic-redis-cache-tests/cache/JSON/JSONKeySingleIDWithNull')
const JSONKeyNoID = require('generic-redis-cache-tests/cache/JSON/JSONKeyNoID')

const JSONKeyMultiID = require('generic-redis-cache-tests/cache/JSON/JSONKeyMultiID')
const JSONKeyMultiIDWithUndefined = require('generic-redis-cache-tests/cache/JSON/JSONKeyMultiIDWithUndefined')
const JSONKeyMultiIDWithNull = require('generic-redis-cache-tests/cache/JSON/JSONKeyMultiIDWithNull')

const HASHKeySingleID = require('generic-redis-cache-tests/cache/HASH/HASHKeySingleID')

const STRINGKeySingleID = require('generic-redis-cache-tests/cache/STRING/STRINGKeySingleID')

const SpyMock = require('generic-redis-cache-tests/mocks/SpyMock')

describe('GenericRedisCache', () => {
  before(function*() {
    yield clear_database()
  })

  describe('#constructor', () => {
    let genericRedisCache
    const KEY_NAME = 'test:{?}'
    const IDS = [{ id: 'id' }]
    const TYPE = RedisKeyTypeEnum.JSON

    before(() =>  {
      genericRedisCache = new GenericRedisCache(KEY_NAME, TYPE, IDS)
    })

    it('should return an object of type GenericRedisCache', () => {
      expect(genericRedisCache).to.be.instanceOf(GenericRedisCache)
    })

    it('should set "_keyName"', () => {
      expect(genericRedisCache.keyAttrs._keyName).to.eql(KEY_NAME)
      expect(genericRedisCache.KEY_NAME).to.eql(KEY_NAME)
    })

    it('should set "_id"', () => {
      expect(genericRedisCache.keyAttrs._id).to.eql(IDS)
      expect(genericRedisCache.ID).to.eql(IDS)
    })

    it('should set "_type"', () => {
      expect(genericRedisCache.keyAttrs._type).to.eql(TYPE)
      expect(genericRedisCache.TYPE).to.eql(TYPE)
    })
  })

  describe('.getKeyName', () => {
    context('when the `key` is passed', () => {
      context('when the `KEY_NAME` has one id', () => {
        context('and the `key` is a `string`', () => {
          it('should return the key name', () => {
            const key = 'value'
            const compareKeyName = JSONKeySingleID.KEY_NAME.replace('{?}', key)
            const keyName = JSONKeySingleID.getKeyName(key)

            expect(keyName).to.eql(compareKeyName)
          })

          context('and the `key` contains `:` symbols', () => {
            it('should return the key name', () => {
              const key = 'aa:bb:cc'
              const compareKeyName = JSONKeySingleID.KEY_NAME.replace('{?}', key.replace(/:/g, ''))
              const keyName = JSONKeySingleID.getKeyName(key)

              expect(keyName).to.eql(compareKeyName)
            })
          })
        })

        context('and the `key` is a `Number`', () => {
          it('should return the key name', () => {
            const key = Math.floor(Math.random() * 100) + 1
            const compareKeyName = JSONKeySingleID.KEY_NAME.replace('{?}', key)
            const keyName = JSONKeySingleID.getKeyName(key)

            expect(keyName).to.eql(compareKeyName)
          })
        })

        context('and the `key` is an `Object`', () => {
          context('and `key` has one attr', () => {
            context('and the `attr` is a `string`', () => {
              it('should return the key name', () => {
                const objectKey = { id: 'id' }
                const compareKeyName = JSONKeySingleID.KEY_NAME.replace('{?}', objectKey.id)
                const keyName = JSONKeySingleID.getKeyName(objectKey)

                expect(keyName).to.eql(compareKeyName)
              })
            })

            context('and the `attr` is a Number', () => {
              it('should return the key name', () => {
                const objectKey = { id: Math.floor(Math.random() * 100) + 1}
                const compareKeyName = JSONKeySingleID.KEY_NAME.replace('{?}', objectKey.id)
                const keyName = JSONKeySingleID.getKeyName(objectKey)

                expect(keyName).to.eql(compareKeyName)
              })
            })

            context('and the `attr` is `undefined`', () => {
              context('and the `ID` has no `undefinedValue` defined', () => {
                it('should return the key name with the default `DEFAULT_UNDEFINED_ID` value', () => {
                  const objectKey = { id: undefined }
                  const compareKeyName = JSONKeySingleID.KEY_NAME.replace('{?}', GenericRedisCache.DEFAULT_UNDEFINED_ID)
                  const keyName = JSONKeySingleID.getKeyName(objectKey)

                  expect(keyName).to.eql(compareKeyName)
                })
              })

              context('and the `ID` has an `undefinedValue` defined', () => {
                it('should return the key name with the `undefinedValue` attr', () => {
                  const objectKey = { id: undefined }
                  const compareKeyName = JSONKeySingleIDWithUndefined.KEY_NAME.replace('{?}', JSONKeySingleIDWithUndefined.ID[0].undefinedValue)
                  const keyName = JSONKeySingleIDWithUndefined.getKeyName(objectKey)

                  expect(keyName).to.eql(compareKeyName)
                })
              })
            })

            context('and the `attr` is `null`', () => {
              context('and the `ID` has no `nullValue` defined', () => {
                it('should return the key name with the default `DEFAULT_NULL_ID` value', () => {
                  const objectKey = { id: null }
                  const compareKeyName = JSONKeySingleID.KEY_NAME.replace('{?}', GenericRedisCache.DEFAULT_NULL_ID)
                  const keyName = JSONKeySingleID.getKeyName(objectKey)

                  expect(keyName).to.eql(compareKeyName)
                })
              })

              context('and the `ID` has an `nullValue` defined', () => {
                it('should return the key name with the `nullValue` attr', () => {
                  const objectKey = { id: null }
                  const compareKeyName = JSONKeySingleIDWithNull.KEY_NAME.replace('{?}', JSONKeySingleIDWithNull.ID[0].nullValue)
                  const keyName = JSONKeySingleIDWithNull.getKeyName(objectKey)

                  expect(keyName).to.eql(compareKeyName)
                })
              })
            })
          })

          context('and `key` has none attr', () => {
            it('should return the key name with `DEFAULT_UNDEFINED_ID`', () => {
              const objectKey = {}
              let compareKeyName = JSONKeySingleID.KEY_NAME.replace('?', GenericRedisCache.DEFAULT_UNDEFINED_ID)
              compareKeyName = compareKeyName.replace(/{/g, '')
              compareKeyName = compareKeyName.replace(/}/g, '')
              const keyName = JSONKeySingleID.getKeyName(objectKey)

              expect(keyName).to.eql(compareKeyName)
            })
          })

          context('and `key` has more than one attr', () => {
            it('should return null', () => {
              const objectKey = { id: 'teste', id2: 'teste2'}

              const keyName = JSONKeySingleID.getKeyName(objectKey)
              expect(keyName).to.eql(null)
            })
          })
        })
      })

      context('when the `KEY_NAME` has more than one id', () => {
        context ('and the `ids` have no undefinedValue or nullValue options', () => {
          // let genericRedisCache
          // const KEY_NAME = 'test:{?}:second:{?}:third:{?}'
          // const IDS = [{ id: 'id'}, { id: 'id2' }, { id: 'id3'} ]
          // const TYPE = RedisKeyTypeEnum.JSON

          // before(() =>  {
          //   genericRedisCache = new GenericRedisCache(KEY_NAME, TYPE, IDS)
          // })

          context('and the `key` is an `object`', () => {
            context('and all the attrs have values', () => {
              it('should return the key name', () => {
                const objectKey = {
                  id:   'aa:bb:cc',
                  id2:  Math.floor(Math.random() * 100) + 1,
                  id3:  Math.floor(Math.random() * 100) + 1
                }

                const idsIndexes = JSONKeyMultiID.getIdIndexes(JSONKeyMultiID.KEY_NAME)

                const chars = JSONKeyMultiID.KEY_NAME.split('')

                Object.keys(objectKey).forEach((key, index) => {
                  chars[idsIndexes[index]] = typeof(objectKey[key]) == 'string' ? objectKey[key].replace(/:/g, '') : objectKey[key]
                })

                let compareKeyName = chars.join('')

                compareKeyName = compareKeyName.replace(/{/g, '')
                compareKeyName = compareKeyName.replace(/}/g, '')

                const keyName = JSONKeyMultiID.getKeyName(objectKey)

                expect(keyName).to.eql(compareKeyName)
              })
            })

            context('and the attrs have `undefined` values', () => {
              it('should return the key name`', () => {
                const objectKey = {
                  id:   'aa:bb:cc',
                  id2:  undefined,
                  id3:  undefined
                }

                let compareKeyName = JSONKeyMultiID.KEY_NAME.replace('{?}', objectKey.id.replace(/:/g, ''))
                JSONKeyMultiID.ID.forEach((objectId, index) => {
                  if (index > 0) {
                    compareKeyName = compareKeyName
                      .replace('{?}', JSONKeyMultiID.DEFAULT_UNDEFINED_ID)
                  }
                })
                const keyName = JSONKeyMultiID.getKeyName(objectKey)

                expect(keyName).to.eql(compareKeyName)
              })
            })

            context('and the attrs have null values', () => {
              it('should return the key name', () => {
                const objectKey = {
                  id:   'aa:bb:cc',
                  id2:  null,
                  id3:  null
                }

                let compareKeyName = JSONKeyMultiID.KEY_NAME.replace('{?}', objectKey.id.replace(/:/g, ''))
                JSONKeyMultiID.ID.forEach((objectId, index) => {
                  if (index > 0) {
                    compareKeyName = compareKeyName
                      .replace('{?}', GenericRedisCache.DEFAULT_NULL_ID)
                  }
                })
                const keyName = JSONKeyMultiID.getKeyName(objectKey)

                expect(keyName).to.eql(compareKeyName)
              })
            })

            context('and the `key` has less attrs than the `ID` size', () => {
              it('should set the unpresents `ids` to the defaut `undefined` value', () => {
                const objectKey = {
                  id:  'aa:bb:cc',
                  id2: 'teste'
                }

                const chars = JSONKeyMultiID.KEY_NAME.split('')
                const idsIndexes = JSONKeyMultiID.getIdIndexes(JSONKeyMultiID.KEY_NAME)

                idsIndexes.forEach((indexKeyName, index) =>  {
                  const paramKey = Object.keys(objectKey)[index]

                  if (paramKey)
                    chars[indexKeyName] = objectKey[paramKey].replace(/:/g, '')
                  else
                    chars[indexKeyName] = JSONKeyMultiID.ID[index].undefinedValue ? JSONKeyMultiID.ID[index].undefinedValue : GenericRedisCache.DEFAULT_UNDEFINED_ID
                })

                let compareKeyName = chars.join('')
                compareKeyName = compareKeyName.replace(/{/g, '')
                compareKeyName = compareKeyName.replace(/}/g, '')

                const keyName = JSONKeyMultiID.getKeyName(objectKey)

                expect(keyName).to.eql(compareKeyName)
              })
            })
          })

          context('and the `key` is a `string`', () => {
            it('should return the key name', () => {
              const key = 'value'
              let compareKeyName = JSONKeyMultiID.KEY_NAME.replace('{?}', key)
              JSONKeyMultiID.ID.forEach((objectId, index) => {
                if (index > 0) {
                  compareKeyName = compareKeyName
                    .replace('{?}', JSONKeyMultiID.DEFAULT_UNDEFINED_ID)
                }
              })
              const keyName = JSONKeyMultiID.getKeyName(key)

              expect(keyName).to.eql(compareKeyName)
            })
          })

          context('and the `key` is a `Number`', () => {
            it('should return the key name', () => {
              const key = Math.floor(Math.random() * 100) + 1
              let compareKeyName = JSONKeyMultiID.KEY_NAME.replace('{?}', key)
              JSONKeyMultiID.ID.forEach((objectId, index) => {
                if (index > 0) {
                  compareKeyName = compareKeyName
                    .replace('{?}', JSONKeyMultiID.DEFAULT_UNDEFINED_ID)
                }
              })
              const keyName = JSONKeyMultiID.getKeyName(key)

              expect(keyName).to.eql(compareKeyName)
            })
          })
        })

        context('and the `ids` have `undefined` options', () => {
          context('and the `key` is an `object` with undefined `attrs`', () => {
            it('should return the key name', () => {
              const objectKey = {
                id: 'aa:bb:cc',
                id2: undefined
              }

              const idsIndexes = GenericRedisCache.getIdIndexes(JSONKeyMultiIDWithUndefined.KEY_NAME)

              const chars = JSONKeyMultiIDWithUndefined.KEY_NAME.split('')

              Object.keys(objectKey).forEach((key, index) => {
                chars[idsIndexes[index]] = typeof(objectKey[key]) == 'string' ? objectKey[key].replace(/:/g, '') : JSONKeyMultiIDWithUndefined.ID[index].undefinedValue
              })

              let compareKeyName = chars.join('')

              compareKeyName = compareKeyName.replace(/{/g, '')
              compareKeyName = compareKeyName.replace(/}/g, '')

              const keyName = JSONKeyMultiIDWithUndefined.getKeyName(objectKey)

              expect(keyName).to.eql(compareKeyName)
            })
          })

          context('and the `key` has less attrs than the `ID` size', () => {
            it('should set the unpresents `ID` values to the `undefinedValue`', () => {
              const objectKey = {
                id:  'aa:bb:cc'
              }

              const chars = JSONKeyMultiIDWithUndefined.KEY_NAME.split('')
              const idsIndexes = GenericRedisCache.getIdIndexes(JSONKeyMultiIDWithUndefined.KEY_NAME)

              idsIndexes.forEach((indexKeyName, index) =>  {
                const paramKey = Object.keys(objectKey)[index]

                if (paramKey)
                  chars[indexKeyName] = objectKey[paramKey].replace(/:/g, '')
                else
                  chars[indexKeyName] =  JSONKeyMultiIDWithUndefined.ID[index].undefinedValue
              })

              let compareKeyName = chars.join('')
              compareKeyName = compareKeyName.replace(/{/g, '')
              compareKeyName = compareKeyName.replace(/}/g, '')

              const keyName = JSONKeyMultiIDWithUndefined.getKeyName(objectKey)

              expect(keyName).to.eql(compareKeyName)
            })
          })

          context('and the `key` is an `string`', () => {
            it('should return the key name', () => {
              const key = 'value'
              let compareKeyName = JSONKeyMultiIDWithUndefined.KEY_NAME.replace('{?}', key)
              JSONKeyMultiIDWithUndefined.ID.forEach((objectId, index) => {
                if (index > 0) {
                  compareKeyName = compareKeyName
                    .replace('{?}', objectId.undefinedValue)
                }
              })
              const keyName = JSONKeyMultiIDWithUndefined.getKeyName(key)

              expect(keyName).to.eql(compareKeyName)
            })
          })

          context('and the `key` is an `Number`', () => {
            it('should return the key name', () => {
              const key = Math.floor(Math.random() * 100) + 1
              let compareKeyName = JSONKeyMultiIDWithUndefined.KEY_NAME.replace('{?}', key)
              JSONKeyMultiIDWithUndefined.ID.forEach((objectId, index) => {
                if (index > 0) {
                  compareKeyName = compareKeyName
                    .replace('{?}',  objectId.undefinedValue)
                }
              })
              const keyName = JSONKeyMultiIDWithUndefined.getKeyName(key)

              expect(keyName).to.eql(compareKeyName)
            })
          })
        })

        context('and the `ids` have `null` options', () => {
          context('and the `key` is an `object` with null `attrs`', () => {
            it('should return the key name', () => {
              const objectKey = {
                id: 'aa:bb:cc',
                id2: null
              }

              const idsIndexes = GenericRedisCache.getIdIndexes(JSONKeyMultiIDWithNull.KEY_NAME)

              const chars = JSONKeyMultiIDWithNull.KEY_NAME.split('')

              Object.keys(objectKey).forEach((key, index) => {
                chars[idsIndexes[index]] = typeof(objectKey[key]) == 'string' ? objectKey[key].replace(/:/g, '') : JSONKeyMultiIDWithNull.ID[index].nullValue
              })

              let compareKeyName = chars.join('')

              compareKeyName = compareKeyName.replace(/{/g, '')
              compareKeyName = compareKeyName.replace(/}/g, '')

              const keyName = JSONKeyMultiIDWithNull.getKeyName(objectKey)

              expect(keyName).to.eql(compareKeyName)
            })
          })

          context('and the `key` has less attrs than the `ID` size', () => {
            it('should set the unpresents `ID` values to the `undefinedValue`', () => {
              const objectKey = {
                id:  'aa:bb:cc'
              }

              const chars = JSONKeyMultiIDWithNull.KEY_NAME.split('')
              const idsIndexes = GenericRedisCache.getIdIndexes(JSONKeyMultiIDWithNull.KEY_NAME)

              idsIndexes.forEach((indexKeyName, index) =>  {
                const paramKey = Object.keys(objectKey)[index]

                if (paramKey)
                  chars[indexKeyName] = objectKey[paramKey].replace(/:/g, '')
                else
                  chars[indexKeyName] =  GenericRedisCache.DEFAULT_UNDEFINED_ID
              })

              let compareKeyName = chars.join('')
              compareKeyName = compareKeyName.replace(/{/g, '')
              compareKeyName = compareKeyName.replace(/}/g, '')

              const keyName = JSONKeyMultiIDWithNull.getKeyName(objectKey)

              expect(keyName).to.eql(compareKeyName)
            })
          })

          context('and the `key` is an `string`', () => {
            it('should return the key name', () => {
              const key = 'value'
              let compareKeyName = JSONKeyMultiIDWithNull.KEY_NAME.replace('{?}', key)
              JSONKeyMultiIDWithNull.ID.forEach((objectId, index) => {
                if (index > 0) {
                  compareKeyName = compareKeyName
                    .replace('{?}', GenericRedisCache.DEFAULT_UNDEFINED_ID)
                }
              })
              const keyName = JSONKeyMultiIDWithNull.getKeyName(key)

              expect(keyName).to.eql(compareKeyName)
            })
          })

          context('and the `key` is an `Number`', () => {
            it('should return the key name', () => {
              const key = Math.floor(Math.random() * 100) + 1
              let compareKeyName = JSONKeyMultiIDWithNull.KEY_NAME.replace('{?}', key)
              JSONKeyMultiIDWithNull.ID.forEach((objectId, index) => {
                if (index > 0) {
                  compareKeyName = compareKeyName
                    .replace('{?}', GenericRedisCache.DEFAULT_UNDEFINED_ID)
                }
              })
              const keyName = JSONKeyMultiIDWithNull.getKeyName(key)

              expect(keyName).to.eql(compareKeyName)
            })
          })
        })
      })
    })

    context('when the `key` is not passed', () => {
      context('when the cache have `ID` elements', () => {
        context ('and the `ids` have no `undefinedValue`  options', () => {
          it('should replace all the `ids` with the `DEFAULT_UNDEFINED_ID` value', () => {
            const idsIndexes = GenericRedisCache.getIdIndexes(JSONKeyMultiID.KEY_NAME)
            const chars = JSONKeyMultiID.KEY_NAME.split('')

            idsIndexes.forEach((indexKeyName) =>  {
              chars[indexKeyName] =  GenericRedisCache.DEFAULT_UNDEFINED_ID
            })

            let compareKeyName = chars.join('')

            compareKeyName = compareKeyName.replace(/{/g, '')
            compareKeyName = compareKeyName.replace(/}/g, '')

            const keyName = JSONKeyMultiID.getKeyName()

            expect(keyName).to.eql(compareKeyName)
          })
        })

        context ('and the `ids` have `undefinedValue`  options', () => {
          it('should replace all the `ids` with the `undefinedValue` values', () => {
            const idsIndexes = GenericRedisCache.getIdIndexes(JSONKeyMultiIDWithUndefined.KEY_NAME)
            const chars = JSONKeyMultiIDWithUndefined.KEY_NAME.split('')

            idsIndexes.forEach((indexKeyName, index) =>  {
              chars[indexKeyName] =  JSONKeyMultiIDWithUndefined.ID[index].undefinedValue ? JSONKeyMultiIDWithUndefined.ID[index].undefinedValue : GenericRedisCache.DEFAULT_UNDEFINED_ID
            })

            let compareKeyName = chars.join('')

            compareKeyName = compareKeyName.replace(/{/g, '')
            compareKeyName = compareKeyName.replace(/}/g, '')

            const keyName = JSONKeyMultiIDWithUndefined.getKeyName()

            expect(keyName).to.eql(compareKeyName)
          })
        })
      })

      context('when the cache have no `ID` elements', () => {
        it('should return the `KEY_NAME` itself', () => {
          const keyName = JSONKeyNoID.getKeyName()

          expect(keyName).to.eql(JSONKeyNoID.KEY_NAME)
        })
      })
    })
  })

  describe('.getKeyNames', () => {
    context('when `keys` is passed', () => {
      context('and it is an `Object`', () => {
        context('and `keys` has the same size of attrs than the key `ID`', () => {
          it('should return an `Array` with the key names', async () => {
            const KEY_NAME_SIZES = Array.from({length: Object.keys(JSONKeyMultiID.ID).length}, () => Math.floor((Math.random() * 50) + 1))
            const keys = {
              primaries: Array.from({length: KEY_NAME_SIZES[0]}, () => Math.floor(Math.random() * 99)),
              secondaries: Array.from({length: KEY_NAME_SIZES[1]}, () => Math.floor(Math.random() * 99)),
              thirds: Array.from({length: KEY_NAME_SIZES[2]}, () => Math.floor(Math.random() * 99))
            }

            const result = await JSONKeyMultiID.getKeyNames(keys)

            expect(result.length).to.eql(KEY_NAME_SIZES.reduce( (a,b) => a * b ))
            expect(result[0][JSONKeyMultiID.ID[0].id]).not.to.be.null
          })
        })

        context('and `keys` has a lower size of attrs than the key `ID`', () => {
          it('should return an `Array` with the key names', async () => {
            const KEY_NAME_SIZES = Array.from({length: Object.keys(JSONKeyMultiID.ID).length}, () => Math.floor((Math.random() * 50) + 1))
            const keys = {
              primaries: Array.from({length: KEY_NAME_SIZES[0]}, () => Math.floor(Math.random() * 99))
            }

            const result = await JSONKeyMultiID.getKeyNames(keys)

            expect(result.length).to.eql(KEY_NAME_SIZES[0])
            expect(result[0][JSONKeyMultiID.ID[0].id]).not.to.be.null
            expect(result[0][JSONKeyMultiID.ID[1].id]).to.be.undefined
          })
        })

        context('and `keys` has a greather size of attrs than the key `ID`', async() => {
          it('should return an empty `Array`', async () => {
            const KEY_NAME_SIZES = Array.from({length: 4}, () => Math.floor((Math.random() * 50) + 1))
            const keys = {
              primaries: Array.from({length: KEY_NAME_SIZES[0]}, () => Math.floor(Math.random() * 99)),
              secondaries: Array.from({length: KEY_NAME_SIZES[1]}, () => Math.floor(Math.random() * 99)),
              thirds: Array.from({length: KEY_NAME_SIZES[2]}, () => Math.floor(Math.random() * 99)),
              extra: Array.from({length: KEY_NAME_SIZES[3]}, () => Math.floor(Math.random() * 99))
            }

            const result = await JSONKeyMultiID.getKeyNames(keys)

            expect(result.length).to.eql(0)
          })
        })
      })

      context('and it is an `Array`', () => {
        context('and cache `ID` has one attr', () => {
          it('should return an `Array` with the key names', async () => {
            const KEY_NAME_SIZE = 5
            const keys = Array.from({length: KEY_NAME_SIZE}, () => Math.floor(Math.random() * 99))

            const result = await JSONKeySingleID.getKeyNames(keys)

            expect(result.length).to.eql(KEY_NAME_SIZE)
          })
        })

        context('and cache `ID` has more than one attr', () => {
          it('should return an `Array` with the key names', async() => {
            const KEY_NAME_SIZE = 5
            const keys = Array.from({length: KEY_NAME_SIZE}, () => Math.floor(Math.random() * 99))

            const result = await JSONKeyMultiID.getKeyNames(keys)

            expect(result.length).to.eql(KEY_NAME_SIZE)
            expect(result[0][JSONKeyMultiID.ID[1].id]).to.be.undefined
          })
        })
      })
    })

    context('when `keys` is not passed', () => {
      context('and `IDS` have one attr', () => {
        context('and it has an `undefinedValue`', () => {
          context('and there are keys on cache', () => {
            const KEYS_SIZE = 3
            let keyNames

            before(async () => {
              const values = Array.from({length: KEYS_SIZE}, () => Math.floor(Math.random() * 999))
              const objectValues = values.map((value) => {
                const object = {}
                object[JSONKeySingleIDWithUndefined.ID[0].id] = value
                return object
              })

              keyNames = await JSONKeySingleIDWithUndefined.getKeyNames(values)

              await GenericJSONCacheMock.addList(keyNames, objectValues)
            })

            after(async () => {
              await GenericJSONCacheMock.delete(keyNames)
            })

            it ('should return all the keys', async() => {
              const result = await JSONKeySingleIDWithUndefined.getKeyNames()

              expect(result.length).to.eql(KEYS_SIZE)
            })
          })

          context('and there are no keys on cache', () => {
            it ('should return an empty array', async() => {
              const result = await JSONKeySingleIDWithUndefined.getKeyNames()

              expect(result.length).to.eql(0)
            })
          })
        })
      })
    })
  })

  describe('.getKeyNamesObjects', () => {
    context('when `object` is passed', () => {
      context('and `object` is an `Object`', () => {
        context('and `ids` is passed', () => {
          context('and `ids` is an array of `Objects`', () => {
            context('and `ids` has one item', () => {
              it('should return an `array` with the objects', () => {
                const KEY_NAMES_SIZE = 5
                const IDS = [ { id: 'key_name_id' } ]
                const object = {
                  key_name_ids: Array.from({length: KEY_NAMES_SIZE}, () => Math.floor(Math.random() * KEY_NAMES_SIZE))
                }

                const result = GenericRedisCache.getKeyNamesObjects(object, IDS)

                expect(result.length).to.eql(KEY_NAMES_SIZE)
              })
            })

            context('and `ids` has more than one item', () => {
              it('should return an `array` with the objects', () => {
                const IDS = [
                  { id: 'key_name_id' },
                  { id: 'key_name_id2' },
                  { id: 'key_name_id3' }
                ]

                const KEY_NAME_SIZES = Array.from({length: Object.keys(IDS).length}, () => Math.floor((Math.random() * 50) + 1))

                const object = {
                  key_name_ids: Array.from({length: KEY_NAME_SIZES[0]}, () => Math.floor(Math.random() * 99)),
                  key_name_ids2: Array.from({length: KEY_NAME_SIZES[1]}, () => Math.floor(Math.random() * 99)),
                  key_name_ids3: Array.from({length: KEY_NAME_SIZES[2]}, () => Math.floor(Math.random() * 99)),
                }

                const result = GenericRedisCache.getKeyNamesObjects(object, IDS)

                expect(result.length).to.eql(KEY_NAME_SIZES.reduce( (a,b) => a * b ))
              })
            })
          })

          context('and `ids` is not an array', () => {
            it('should return an empty `array`', () => {
              const result = GenericRedisCache.getKeyNamesObjects('test', 'ids')

              expect(result).to.eql([])
            })
          })
        })

        context('and `ids` is not passed', () => {
          it('should return an empty `array`', () => {
            const result = GenericRedisCache.getKeyNamesObjects('test')

            expect(result).to.eql([])
          })
        })
      })

      context('and `object` is not an `Object`', () => {
        it('should return an empty `array`', () => {
          const result = GenericRedisCache.getKeyNamesObjects('test', [])

          expect(result).to.eql([])
        })
      })
    })

    context('when `object` is not passed', () => {
      it('should return an empty `array`', () => {
        const result = GenericRedisCache.getKeyNamesObjects(null, [])

        expect(result).to.eql([])
      })
    })
  })

  describe('.getCache', () => {
    context('when the key is `JSON`', () => {
      context('and the key has one `ID`', () => {
        const VALUE = 1
        const CACHE_VALUE = { teste: VALUE }

        context('when there is value cached', () => {
          before(async () => {
            await GenericJSONCacheMock.add(JSONKeySingleID.getKeyName(VALUE), CACHE_VALUE)
          })

          after(async () => {
            await GenericJSONCacheMock.delete(JSONKeySingleID.getKeyName(VALUE))
          })

          context('and a `key` is passed', () => {
            it('should return the cached object', async () => {
              const result = await JSONKeySingleID.getCache(VALUE)

              expect(result).to.eql(CACHE_VALUE)
            })
          })

          context('and a `key` is not passed', () => {
            it('should not return the cached object', async () => {
              const result = await JSONKeySingleID.getCache()

              expect(result).to.be.null
            })
          })

        })

        context('when there is no value cached', () => {
          it('should return null', async () => {
            const result = await JSONKeySingleID.getCache(VALUE)

            expect(result).to.be.null
          })
        })
      })

      context('and the key has more than one `ID`', () => {
        const VALUES = {
          object_id: Math.floor((Math.random() * 50) + 1),
          second_id: Math.floor((Math.random() * 50) + 1),
          third_id: Math.floor((Math.random() * 50) + 1)
        }

        const CACHE_VALUE = { x: 1 }

        context('when there value cached', () => {
          before(async () => {
            await GenericJSONCacheMock.add(JSONKeyMultiID.getKeyName(VALUES), CACHE_VALUE)
          })

          after(async () => {
            await GenericJSONCacheMock.delete(JSONKeyMultiID.getKeyName(VALUES))
          })


          it('should return the cached object', async () => {
            const result = await JSONKeyMultiID.getCache(VALUES)

            expect(result).to.eql(CACHE_VALUE)
          })
        })

        context('when there is no value cached', () => {
          it('should return null', async () => {
            const result = await JSONKeyMultiID.getCache(VALUES)

            expect(result).to.be.null
          })
        })
      })
    })

    context('when the key is `HASH`', () => {
      const VALUE = 1

      context('and there is value cached', () => {
        before(async () => {
          await GenericHASHCache.setCache(HASHKeySingleID.getKeyName(VALUE), VALUE, VALUE)
        })

        after(async () => {
          await GenericHASHCache.delete(HASHKeySingleID.getKeyName(VALUE), VALUE)
        })


        it('should return the cached object', async () => {
          const result = await HASHKeySingleID.getCache(VALUE)

          expect(result).to.eql(VALUE)
        })
      })

      context('and there is no value cached', () => {
        it('should return null', async () => {
          const result = await HASHKeySingleID.getCache(VALUE)

          expect(result).to.be.null
        })
      })
    })

    context('when the key is `STRING`', () => {
      const VALUE = 'string_value'

      context('and there is value cached', () => {
        before(async () => {
          await GenericSTRINGCache.setCache(STRINGKeySingleID.getKeyName(VALUE), VALUE)
        })

        after(async () => {
          await GenericSTRINGCache.delete(STRINGKeySingleID.getKeyName(VALUE))
        })

        it('should return the cached object', async () => {
          const result = await STRINGKeySingleID.getCache(VALUE)

          expect(result).to.eql([VALUE])
        })
      })

      context('and there is no value cached', () => {
        it('should return null', async () => {
          const result = await STRINGKeySingleID.getCache(VALUE)

          expect(result).to.eql([])
        })
      })
    })
  })

  describe('.get', () => {
    context('when there is cached value', () => {
      let response
      const VALUE = 1
      const CACHE_VALUE = {
        id: VALUE
      }

      before(async () => {
        SpyMock.addReturnSpy(JSONKeySingleID, 'getCache', CACHE_VALUE)

        response = await JSONKeySingleID.get(VALUE)
      })

      after(() => { SpyMock.restoreAll() })

      it('should return the cached object', () => {
        expect(response).to.eql(CACHE_VALUE)
      })
    })

    context('when threre is no cached value', () => {
      let spies, response
      const VALUE = 1
      const OBJECT = {
        id: VALUE
      }
      const KEY_NAME = JSONKeySingleID.getKeyName(VALUE)

      context('and `onGet` returns an object', () => {
        before(async () => {
          spies = {
            getCache  :  SpyMock
              .addReturnSpy(JSONKeySingleID, 'getCache', null),
            onGet : SpyMock
              .addReturnSpy(JSONKeySingleID, 'onGet', OBJECT)
          }

          response = await JSONKeySingleID.get(VALUE)
        })

        after(async () => {
          await GenericJSONCacheMock.delete(KEY_NAME)

          SpyMock.restoreAll()
        })

        it('should call `onGet`', () => {
          expect(spies.onGet).have.been.calledOnce
        })

        it('should return the object', () => {
          expect(response).to.eql(OBJECT)
        })

        it('should save the object on cache', async () => {
          const cachedObject = await JSONKeySingleID.get(VALUE)

          expect(cachedObject).to.eql(OBJECT)
        })
      })

      context('and `onGet` returns null', () => {
        before(async () => {
          spies = {
            getCache  : SpyMock
              .addReturnSpy(JSONKeySingleID, 'getCache', null),
            onGet : SpyMock
              .addReturnSpy(JSONKeySingleID, 'onGet', null),
          }

          response = await JSONKeySingleID.get(VALUE)
        })

        after(() => { SpyMock.restoreAll() })

        it('should call `onGet`', () => {
          expect(spies.onGet).have.been.calledOnce
        })

        it('should return null', () => {
          expect(response).to.be.null
        })
      })
    })
  })

  describe('.setCache', () => {
    const VALUE = 1

    context('when the verification `hook` returns `true`', () => {
      context('when the key is `JSON`', () => {
        let redisResponse
        const CACHE_VALUE = {
          id: VALUE
        }

        const KEY_NAME = JSONKeySingleID.getKeyName(VALUE)

        context('and `key` is passed', () => {
          before(async () => {
            redisResponse = await JSONKeySingleID.setCache(VALUE, CACHE_VALUE)
          })

          after(async () => {
            await GenericJSONCacheMock.delete(KEY_NAME)

            SpyMock.restoreAll()
          })


          it('should return the response', () => {
            expect(redisResponse).to.not.null
          })

          it('should set the value to cache when executing the response', async () => {
            await redisResponse.execAsync()

            const cachedValue = await JSONKeySingleID.getCache(VALUE)

            expect(cachedValue).to.eql(CACHE_VALUE)
          })
        })

        context('and  a null `key` is passed', () => {
          before(async () => {
            redisResponse = await JSONKeySingleID.setCache(null, CACHE_VALUE)
          })

          after(async () => {
            await GenericJSONCacheMock.delete(JSONKeySingleID.getKeyName(VALUE))

            SpyMock.restoreAll()
          })

          it('should return the response', () => {
            expect(redisResponse).to.not.null
          })
        })

        context('and an undefined `key` is passed', () => {
          before(async () => {
            redisResponse = await JSONKeySingleID.setCache(undefined, CACHE_VALUE)
          })

          after(async () => {
            await GenericJSONCacheMock.delete(JSONKeySingleID.getKeyName(VALUE))

            SpyMock.restoreAll()
          })

          it('should return the response', () => {
            expect(redisResponse).to.not.null
          })
        })
      })

      context('when the key is `HASH`', () => {
        let redisResponse
        const CACHE_VALUE = {
          id: VALUE
        }

        const KEY_NAME = HASHKeySingleID.getKeyName(VALUE)

        context('and `key` is passed', () => {
          before(async () => {
            redisResponse = await HASHKeySingleID.setCache(VALUE, CACHE_VALUE)
          })

          after(async () => {
            await GenericHASHCache.delete(KEY_NAME, VALUE)

            SpyMock.restoreAll()
          })

          it('should return the response', () => {
            expect(redisResponse).to.not.null
          })

          it('should set the value to cache when executing the response', async () => {
            await redisResponse.execAsync()

            const cachedValue = await HASHKeySingleID.getCache(VALUE)

            expect(cachedValue).to.eql(CACHE_VALUE)
          })
        })

        context('and a null `key` is passed', () => {
          before(async () => {
            redisResponse = await HASHKeySingleID.setCache(null, CACHE_VALUE)
          })

          after(() => SpyMock.restoreAll())

          it('should return the response', () => {
            expect(redisResponse).to.not.null
          })
        })

        context('and an undefined `key` is passed', () => {
          before(async () => {
            redisResponse = await HASHKeySingleID.setCache(undefined, CACHE_VALUE)
          })

          after(() => SpyMock.restoreAll())

          it('should return the response', () => {
            expect(redisResponse).to.not.null
          })
        })
      })

      context('when the key is `STRING`', () => {
        let redisResponse
        const STRING_VALUE = 'string_value'

        const KEY_NAME = STRINGKeySingleID.getKeyName(VALUE)

        context('and `key` is passed', () => {
          before(async () => {
            redisResponse = await STRINGKeySingleID.setCache(VALUE, STRING_VALUE)
          })

          after(async () => {
            await GenericSTRINGCache.delete(KEY_NAME)

            SpyMock.restoreAll()
          })

          it('should return the response', () => {
            expect(redisResponse).to.not.null
          })

          it('should set the value to cache when executing the response', async () => {
            await redisResponse.exec()

            const cachedValue = await STRINGKeySingleID.getCache(VALUE)

            expect(cachedValue).to.eql([STRING_VALUE])
          })
        })

        context('and a null`key` is passed', () => {
          before(async () => {
            redisResponse = await STRINGKeySingleID.setCache(null, STRING_VALUE)
          })

          after(() => SpyMock.restoreAll())

          it('should return the response', () => {
            expect(redisResponse).to.not.null
          })
        })

        context('and an undefined `key` is passed', () => {
          before(async () => {
            redisResponse = STRINGKeySingleID.setCache(undefined, STRING_VALUE)
          })

          after(() => SpyMock.restoreAll())

          it('should return the response', () => {
            expect(redisResponse).to.not.null
          })
        })
      })
    })
  })

  describe('.set', () => {
    context('and a `key` is passed', () => {
      context('and the `key` is an object', () => {
        const OBJECT_KEY = {
          id: 1,
          attr1: 'teste'
        }

        context('and no `value` is passed', () => {
          let spies, redisResponse

          context('and `_getIdAttr` returns something', () => {
            before(async () => {
              spies = {
                onSave: SpyMock
                  .addReturnSpy(JSONKeySingleID, 'onSave')
              }

              redisResponse = await JSONKeySingleID.set(OBJECT_KEY)
            })

            after(() => { SpyMock.restoreAll() })

            it('should call `onSave`', () => {
              expect(spies.onSave).have.been.calledOnce
            })

            it('should return the `key` setted', () => {
              expect(redisResponse).to.eql(OBJECT_KEY)
            })

            it('should set the`key` on cache', async () => {
              const cacheValue = await JSONKeySingleID.getCache(OBJECT_KEY.id)

              expect(cacheValue).to.eql(OBJECT_KEY)
            })
          })

          context('and `_getIdAttr` returns null', () => {
            before(async () => {
              spies = {
                setCache: SpyMock
                  .addReturnSpy(JSONKeySingleID, 'setCache'),
                getIdAttr: SpyMock
                  .addReturnSpy(JSONKeySingleID, '_getIdAttr', null)
              }

              redisResponse = await JSONKeySingleID.set(OBJECT_KEY)
            })

            after(() => { SpyMock.restoreAll() })

            it('should call `_getIdAttr`', () => {
              expect(spies.getIdAttr).have.been.calledOnce
            })

            it('should not call `setCache`', () => {
              expect(spies.setCache).not.have.been.calledOnce
            })

            it('should return `null`', () => {
              expect(redisResponse).to.be.null
            })
          })
        })
      })

      context('and the `key` is a `String`', () => {
        const STRING_KEY = 'teste'
        let redisResponse

        before(async () => {
          redisResponse = await JSONKeySingleID.set(STRING_KEY)
        })

        it('shpuld return null', () => {
          expect(redisResponse).to.be.null
        })
      })
    })

    context('and no `key` is passed', () => {
      let spies
      before(() => {
        spies = {
          setCache: SpyMock
            .addReturnSpy(JSONKeySingleID, 'setCache')
        }

        JSONKeySingleID.set()
      })

      after(() => { SpyMock.restoreAll() })

      it('should call `setCache`', () => {
        expect(spies.setCache).have.been.calledOnce
      })
    })
  })

  describe('.setList', () => {
    context('when the key is `JSON`', () => {
      const OBJECTS = GenericRedisCacheMock.getObjectMocks()
      const ID_ATTRS = JSONKeySingleID.getIdAttrs(OBJECTS)

      context('and `JSON` objects are passed', async () => {
        let redisResponse, keyNames

        before(async () => {
          keyNames = await JSONKeySingleID.getKeyNames(ID_ATTRS)

          redisResponse = await JSONKeySingleID.setList(OBJECTS)
        })

        after(async () => {
          await GenericJSONCacheMock.delete(keyNames)
        })

        it('should return the commands executed', () => {
          expect(redisResponse.length).to.be.above(1)
        })

        it('should save the objects to cache', async () => {
          const cachedValues = await GenericJSONCache.getListCache(keyNames)

          expect(cachedValues.length).to.eql(OBJECTS.length)
        })
      })

      context('and `key/value` objects are passed', () => {
        let redisResponse, keyNames

        context('and the values are `objects`',() => {
          before(async () => {
            keyNames = await JSONKeySingleID.getKeyNames(ID_ATTRS)

            const keyValues = OBJECTS.map((object) =>{
              return {
                key: JSONKeySingleID._getIdAttr(object),
                value: object
              }
            })

            redisResponse = await JSONKeySingleID.setList(keyValues)
          })

          after(async () => {
            await GenericJSONCacheMock.delete(keyNames)
          })

          it('should return the commands executed', () => {
            expect(redisResponse.length).to.be.above(1)
          })

          it('should save the objects to cache', async () => {
            const cachedValues = await GenericJSONCache.getListCache(keyNames)

            expect(cachedValues.length).to.eql(OBJECTS.length)
          })
        })

        context('and the values are `strings`', () => {
          before(async () => {
            keyNames = await JSONKeySingleID.getKeyNames(ID_ATTRS)

            const stringValues = OBJECTS.map((object) =>{
              return object.id
            })

            redisResponse = await JSONKeySingleID.setList(stringValues)
          })

          it('should return the commands executed', () => {
            expect(redisResponse.length).to.eql(0)
          })

          it('should not save the keys on cache', async () => {
            const cachedValues = await GenericJSONCache.getListCache(keyNames)

            expect(cachedValues).to.eql([])
          })
        })
      })
    })

    context('when the key is `HASH`', () => {
      const OBJECTS = GenericRedisCacheMock.getObjectMocks()
      const ID_ATTRS = HASHKeySingleID.getIdAttrs(OBJECTS)

      context('and `JSON` objects are passed', async () => {
        let redisResponse, keyNames

        before(async () => {
          keyNames = await HASHKeySingleID.getKeyNames(ID_ATTRS)

          redisResponse = await HASHKeySingleID.setList(OBJECTS)
        })

        after(async () => {
          await GenericHASHCache.delete(keyNames)
        })

        it('should return the commands executed', () => {
          expect(redisResponse.length).to.be.above(1)
        })

        it('should save the objects to cache', async () => {
          const cachedValues = await GenericHASHCache.getListCache(keyNames)

          expect(cachedValues.length).to.eql(OBJECTS.length)
        })
      })

      context('and `key/value` objects are passed', () => {
        let redisResponse, keyNames

        context('and the values are `objects`',() => {
          before(async () => {
            keyNames = await HASHKeySingleID.getKeyNames(ID_ATTRS)

            const keyValues = OBJECTS.map((object) =>{
              return {
                key: HASHKeySingleID._getIdAttr(object),
                value: object
              }
            })

            redisResponse = await HASHKeySingleID.setList(keyValues)
          })

          after(async () => {
            await GenericHASHCache.delete(keyNames)
          })

          it('should return the commands executed', () => {
            expect(redisResponse.length).to.be.above(1)
          })

          it('should save the objects to cache', async () => {
            const cachedValues = await GenericHASHCache.getListCache(keyNames)

            expect(cachedValues.length).to.eql(OBJECTS.length)
          })
        })

        context('and the values are `strings`', () => {
          before(async () => {
            keyNames = await HASHKeySingleID.getKeyNames(ID_ATTRS)

            const stringValues = OBJECTS.map((object) =>{
              return object.id
            })

            redisResponse = await HASHKeySingleID.setList(stringValues)
          })

          after(async () => {
            await GenericHASHCache.delete(keyNames)
          })

          it('should return the commands executed', () => {
            expect(redisResponse.length).to.be.above(1)
          })

          it('should save the objects to cache', async () => {
            const cachedValues = await GenericHASHCache.getListCache(keyNames)

            expect(cachedValues.length).to.eql(OBJECTS.length)
          })
        })
      })
    })

    context('when the key is `STRING`', () => {
      const OBJECTS = GenericRedisCacheMock.getObjectMocks()
      const ID_ATTRS = STRINGKeySingleID.getIdAttrs(OBJECTS)

      context('and `JSON` objects are passed', async () => {
        let redisResponse, keyNames

        before(async () => {
          keyNames = await STRINGKeySingleID.getKeyNames(ID_ATTRS)

          redisResponse = await STRINGKeySingleID.setList(OBJECTS)
        })

        after(async () => {
          await GenericSTRINGCache.delete(keyNames)
        })

        it('should return the commands executed', () => {
          expect(redisResponse.length).to.be.above(1)
        })

        it('should save the objects to cache', async () => {
          const cachedValues = await GenericSTRINGCache.getListCache(keyNames)

          expect(cachedValues.length).to.eql(OBJECTS.length)
        })
      })

      context('and `key/value` objects are passed', () => {
        let redisResponse, keyNames

        context('and the values are `objects`',() => {
          before(async () => {
            keyNames = await STRINGKeySingleID.getKeyNames(ID_ATTRS)

            const keyValues = OBJECTS.map((object) =>{
              return {
                key: STRINGKeySingleID._getIdAttr(object),
                value: object
              }
            })

            redisResponse = await STRINGKeySingleID.setList(keyValues)
          })

          after(async () => {
            await GenericSTRINGCache.delete(keyNames)
          })

          it('should return the commands executed', () => {
            expect(redisResponse.length).to.be.above(1)
          })

          it('should save the objects to cache', async () => {
            const cachedValues = await GenericSTRINGCache.getListCache(keyNames)

            expect(cachedValues.length).to.eql(OBJECTS.length)
          })
        })

        context('and the values are `strings`', () => {
          before(async () => {
            keyNames = await STRINGKeySingleID.getKeyNames(ID_ATTRS)

            const stringValues = OBJECTS.map((object) =>{
              return {
                key: object.id,
                value: 'test'+ (Math.floor(Math.random() * 1000) + 1)
              }
            })

            redisResponse = await STRINGKeySingleID.setList(stringValues)
          })

          after(async () => {
            await GenericSTRINGCache.delete(keyNames)
          })

          it('should return the commands executed', () => {
            expect(redisResponse.length).to.be.above(1)
          })

          it('should save the objects to cache', async () => {
            const cachedValues = await GenericSTRINGCache.getListCache(keyNames)

            expect(cachedValues.length).to.eql(OBJECTS.length)
          })
        })

        context('and the values are arrays of `strings`', () => {
          const VALUE_LENGTH = 4
          before(async () => {
            keyNames = await STRINGKeySingleID.getKeyNames(ID_ATTRS)

            const stringValues = OBJECTS.map((object) =>{
              return {
                key: object.id,
                value:  GenericRedisCacheMock.getRandomStrings(VALUE_LENGTH)
              }
            })

            redisResponse = await STRINGKeySingleID.setList(stringValues)
          })

          after(async () => {
            await GenericSTRINGCache.delete(keyNames)
          })

          it('should return the commands executed', () => {
            expect(redisResponse.length).to.be.above(1)
          })

          it('should save the objects to cache', async () => {
            const cachedValues = await GenericSTRINGCache.getListCache(keyNames)

            expect(cachedValues.length).to.eql(OBJECTS.length * VALUE_LENGTH)
          })
        })
      })
    })
  })

  describe('.getListCache', () => {
    context('when there are cached values', () => {
      const OBJECTS = GenericRedisCacheMock.getObjectMocks()

      context('and the key is `JSON`', () => {
        const ID_ATTRS = JSONKeySingleID.getIdAttrs(OBJECTS)
        let keyNames

        before(async () => {
          keyNames = await JSONKeySingleID.getKeyNames(ID_ATTRS)

          await JSONKeySingleID.setList(OBJECTS)
        })

        after(async () => {
          await GenericJSONCacheMock.delete(keyNames)
        })

        it('should return the cached values', async () => {
          const cachedValues = await JSONKeySingleID.getListCache(ID_ATTRS)

          expect(cachedValues.length).to.eql(OBJECTS.length)
        })
      })

      context('and the key is `HASH`', () => {
        const ID_ATTRS = HASHKeySingleID.getIdAttrs(OBJECTS)
        let keyNames

        before(async () => {
          keyNames = await HASHKeySingleID.getKeyNames(ID_ATTRS)

          await HASHKeySingleID.setList(OBJECTS)
        })

        after(async () => {
          await GenericHASHCache.delete(keyNames)
        })

        it('should return the cached values', async () => {
          const cachedValues = await HASHKeySingleID.getListCache(ID_ATTRS)

          expect(cachedValues.length).to.eql(OBJECTS.length)
        })
      })

      context('and the key is `STRING`', () => {
        const ID_ATTRS = STRINGKeySingleID.getIdAttrs(OBJECTS)
        let keyNames

        before(async () => {
          keyNames = await STRINGKeySingleID.getKeyNames(ID_ATTRS)

          await STRINGKeySingleID.setList(OBJECTS)
        })

        after(async () => {
          await GenericSTRINGCache.delete(keyNames)
        })

        it('should return the cached values', async () => {
          const cachedValues = await STRINGKeySingleID.getListCache(ID_ATTRS)

          expect(cachedValues.length).to.eql(OBJECTS.length)
        })
      })
    })

    context('when there are no cached values', () => {
      context('and the key is `JSON`', () => {
        it('should return an empty array', async () => {
          const cachedValues = await JSONKeySingleID.getListCache(['00000', '99999'])

          expect(cachedValues).to.eql([])
        })
      })

      context('and the key is `HASH`', () => {
        it('should return an empty array', async () => {
          const cachedValues = await HASHKeySingleID.getListCache(['00000', '99999'])

          expect(cachedValues).to.eql([])
        })
      })

      context('and the key is `STRING`', () => {
        it('should return an empty array', async () => {
          const cachedValues = await STRINGKeySingleID.getListCache(['00000', '99999'])

          expect(cachedValues).to.eql([])
        })
      })
    })
  })

  describe('.getList', () => {
    context('when the key is `JSON`', () => {
      const OBJECTS = GenericRedisCacheMock.getObjectMocks({}, 5)

      context('and there are cached values', () => {
        context('and all the keys passed have cached values', () => {
          const ID_ATTRS = JSONKeySingleID.getIdAttrs(OBJECTS)
          let keyNames, spies, redisResponse

          before(async () => {
            spies = {
              getIds  : SpyMock
                .addReturnSpy(JSONKeySingleID, 'getIds')
            }

            keyNames = await JSONKeySingleID.getKeyNames(ID_ATTRS)

            await JSONKeySingleID.setList(OBJECTS)

            redisResponse = await JSONKeySingleID.getList(ID_ATTRS)
          })

          after(async () => {
            await GenericJSONCacheMock.delete(keyNames)

            SpyMock.restoreAll()
          })

          it('should call `getIds`', () => {
            expect(spies.getIds).have.been.called
          })

          it('should return the cached values', async () => {
            expect(redisResponse).to.eql(OBJECTS)
          })
        })

        context('and some keys are not cached', () => {
          const ID_ATTRS = JSONKeySingleID.getIdAttrs(OBJECTS)
          let keyNames, spies, redisResponse

          context('and `getListFromDB` returns an array', () => {
            before(async () => {
              spies = {
                getIds  : SpyMock
                  .addReturnSpy(JSONKeySingleID, 'getIds'),
                getListFromDB : SpyMock
                  .addReturnSpy(JSONKeySingleID, 'getListFromDB', OBJECTS.slice(2))
              }

              keyNames = await JSONKeySingleID.getKeyNames(ID_ATTRS)

              await JSONKeySingleID.setList(OBJECTS.slice(0, 2))

              redisResponse = await JSONKeySingleID.getList(ID_ATTRS)
            })

            after(async () => {
              await GenericJSONCacheMock.delete(keyNames)

              SpyMock.restoreAll()
            })

            it('should call `getIds`', () => {
              expect(spies.getIds).have.been.called
            })

            it('should call `getListFromDB`', () => {
              expect(spies.getListFromDB).have.been.calledOnce
            })

            it('should return the cached values', async () => {
              expect(redisResponse).to.eql(OBJECTS)
            })
          })

          context('and `getListFromDB` returns an empty array', () => {
            before(async () => {
              spies = {
                getIds  : SpyMock
                  .addReturnSpy(JSONKeySingleID, 'getIds'),
                getListFromDB : SpyMock
                  .addReturnSpy(JSONKeySingleID, 'getListFromDB', [])
              }

              keyNames = await JSONKeySingleID.getKeyNames(ID_ATTRS)

              await JSONKeySingleID.setList(OBJECTS.slice(0, 2))

              redisResponse = await JSONKeySingleID.getList(ID_ATTRS)
            })

            after(async () => {
              await GenericJSONCacheMock.delete(keyNames)

              SpyMock.restoreAll()
            })

            it('should call `getIds`', () => {
              expect(spies.getIds).have.been.called
            })

            it('should call `getListFromDB`', () => {
              expect(spies.getListFromDB).have.been.calledOnce
            })

            it('should return the cached values', async () => {
              expect(redisResponse).to.eql(OBJECTS.slice(0, 2))
            })
          })
        })
      })

      context('when there are no cached values', () => {
        let keyNames, spies, redisResponse
        const ID_ATTRS = JSONKeySingleID.getIdAttrs(OBJECTS)

        context('and `getListFromDB` returns an array', () => {
          before(async () => {
            spies = {
              getIds  : SpyMock
                .addReturnSpy(JSONKeySingleID, 'getIds'),
              getListFromDB : SpyMock
                .addReturnSpy(JSONKeySingleID, 'getListFromDB', OBJECTS)
            }

            keyNames = await JSONKeySingleID.getKeyNames(ID_ATTRS)

            redisResponse = await JSONKeySingleID.getList(ID_ATTRS)
          })

          after(async () => {
            await GenericJSONCacheMock.delete(keyNames)

            SpyMock.restoreAll()
          })

          it('should call `getIds`', () => {
            expect(spies.getIds).have.been.called
          })

          it('should call `getListFromDB`', () => {
            expect(spies.getListFromDB).have.been.calledOnce
          })

          it('should return the cached values', async () => {
            expect(redisResponse).to.eql(OBJECTS)
          })
        })

        context('and `getListFromDB` returns an empty array', () => {
          before(async () => {
            spies = {
              getIds  : SpyMock
                .addReturnSpy(JSONKeySingleID, 'getIds'),
              getListFromDB : SpyMock
                .addReturnSpy(JSONKeySingleID, 'getListFromDB', [])
            }

            keyNames = await JSONKeySingleID.getKeyNames(ID_ATTRS)

            redisResponse = await JSONKeySingleID.getList(ID_ATTRS)
          })

          after(async () => {
            await GenericJSONCacheMock.delete(keyNames)

            SpyMock.restoreAll()
          })

          it('should call `getIds`', () => {
            expect(spies.getIds).have.been.called
          })

          it('should call `getListFromDB`', () => {
            expect(spies.getListFromDB).have.been.calledOnce
          })

          it('should return an emtpy array', async () => {
            expect(redisResponse).to.eql([])
          })
        })
      })
    })

    context('when the key is `HASH`', () => {
      const OBJECTS = GenericRedisCacheMock.getObjectMocks({}, 5)

      context('and there are cached values', () => {
        context('and all the keys passed have cached values', () => {
          const ID_ATTRS = HASHKeySingleID.getIdAttrs(OBJECTS)
          let keyNames, spies, redisResponse

          before(async () => {
            spies = {
              getIds  : SpyMock
                .addReturnSpy(HASHKeySingleID, 'getIds')
            }

            keyNames = await HASHKeySingleID.getKeyNames(ID_ATTRS)

            await HASHKeySingleID.setList(OBJECTS)

            redisResponse = await HASHKeySingleID.getList(ID_ATTRS)
          })

          after(async () => {
            await GenericHASHCache.delete(keyNames)

            SpyMock.restoreAll()
          })

          it('should call `getIds`', () => {
            expect(spies.getIds).have.been.called
          })

          it('should return the cached values', async () => {
            expect(redisResponse).to.eql(OBJECTS)
          })
        })

        context('and some keys are not cached', () => {
          const ID_ATTRS = HASHKeySingleID.getIdAttrs(OBJECTS)
          let keyNames, spies, redisResponse

          context('and `getListFromDB` returns an array', () => {
            before(async () => {
              spies = {
                getIds  : SpyMock
                  .addReturnSpy(HASHKeySingleID, 'getIds'),
                getListFromDB : SpyMock
                  .addReturnSpy(HASHKeySingleID, 'getListFromDB', OBJECTS.slice(2))
              }

              keyNames = await HASHKeySingleID.getKeyNames(ID_ATTRS)

              await HASHKeySingleID.setList(OBJECTS.slice(0, 2))

              redisResponse = await HASHKeySingleID.getList(ID_ATTRS)
            })

            after(async () => {
              await GenericHASHCache.delete(keyNames)

              SpyMock.restoreAll()
            })

            it('should call `getIds`', () => {
              expect(spies.getIds).have.been.called
            })

            it('should call `getListFromDB`', () => {
              expect(spies.getListFromDB).have.been.calledOnce
            })

            it('should return the cached values', async () => {
              expect(redisResponse).to.eql(OBJECTS)
            })
          })

          context('and `getListFromDB` returns an empty array', () => {
            before(async () => {
              spies = {
                getIds  : SpyMock
                  .addReturnSpy(HASHKeySingleID, 'getIds'),
                getListFromDB : SpyMock
                  .addReturnSpy(HASHKeySingleID, 'getListFromDB', [])
              }

              keyNames = await HASHKeySingleID.getKeyNames(ID_ATTRS)

              await HASHKeySingleID.setList(OBJECTS.slice(0, 2))

              redisResponse = await HASHKeySingleID.getList(ID_ATTRS)
            })

            after(async () => {
              await GenericHASHCache.delete(keyNames)

              SpyMock.restoreAll()
            })

            it('should call `getIds`', () => {
              expect(spies.getIds).have.been.called
            })

            it('should call `getListFromDB`', () => {
              expect(spies.getListFromDB).have.been.calledOnce
            })

            it('should return the cached values', async () => {
              expect(redisResponse).to.eql(OBJECTS.slice(0, 2))
            })
          })
        })
      })

      context('when there are no cached values', () => {
        let keyNames, spies, redisResponse
        const ID_ATTRS = HASHKeySingleID.getIdAttrs(OBJECTS)

        context('and `getListFromDB` returns an array', () => {
          before(async () => {
            spies = {
              getIds  : SpyMock
                .addReturnSpy(HASHKeySingleID, 'getIds'),
              getListFromDB : SpyMock
                .addReturnSpy(HASHKeySingleID, 'getListFromDB', OBJECTS)
            }

            keyNames = await HASHKeySingleID.getKeyNames(ID_ATTRS)

            redisResponse = await HASHKeySingleID.getList(ID_ATTRS)
          })

          after(async () => {
            await GenericHASHCache.delete(keyNames)

            SpyMock.restoreAll()
          })

          it('should call `getIds`', () => {
            expect(spies.getIds).have.been.called
          })

          it('should call `getListFromDB`', () => {
            expect(spies.getListFromDB).have.been.calledOnce
          })

          it('should return the cached values', async () => {
            expect(redisResponse).to.eql(OBJECTS)
          })
        })

        context('and `getListFromDB` returns an empty array', () => {
          before(async () => {
            spies = {
              getIds  : SpyMock
                .addReturnSpy(HASHKeySingleID, 'getIds'),
              getListFromDB : SpyMock
                .addReturnSpy(HASHKeySingleID, 'getListFromDB', [])
            }

            keyNames = await HASHKeySingleID.getKeyNames(ID_ATTRS)

            redisResponse = await HASHKeySingleID.getList(ID_ATTRS)
          })

          after(async () => {
            await GenericHASHCache.delete(keyNames)

            SpyMock.restoreAll()
          })

          it('should call `getIds`', () => {
            expect(spies.getIds).have.been.called
          })

          it('should call `getListFromDB`', () => {
            expect(spies.getListFromDB).have.been.calledOnce
          })

          it('should return an emtpy array', async () => {
            expect(redisResponse).to.eql([])
          })
        })
      })
    })

    context('when the key is `STRING`', () => {
      const OBJECTS = GenericRedisCacheMock.getObjectMocks({}, 5)

      const STRING_KEY_VALUES = OBJECTS.map((object) => {
        return {
          key: object.id,
          value: 'test'+ (Math.floor(Math.random() * 1000) + 1)
        }
      })

      const STRING_VALUES = STRING_KEY_VALUES.map((key) => {
        return key.value
      })

      context('and there are cached values', () => {
        context('and all the keys passed have cached values', () => {
          const ID_ATTRS = STRINGKeySingleID.getIdAttrs(OBJECTS)
          let keyNames, spies, redisResponse

          before(async () => {
            spies = {
              getIds  : SpyMock
                .addReturnSpy(STRINGKeySingleID, 'getIds')
            }

            keyNames = await STRINGKeySingleID.getKeyNames(ID_ATTRS)

            await STRINGKeySingleID.setList(STRING_KEY_VALUES)

            redisResponse = await STRINGKeySingleID.getList(ID_ATTRS)
          })

          after(async () => {
            await GenericSTRINGCache.delete(keyNames)

            SpyMock.restoreAll()
          })

          it('should call `getIds`', () => {
            expect(spies.getIds).have.been.called
          })

          it('should return the cached values', async () => {
            expect(redisResponse).to.deep.equalInAnyOrder(STRING_VALUES)
          })
        })

        context('and some keys are not cached', () => {
          const ID_ATTRS = STRINGKeySingleID.getIdAttrs(OBJECTS)
          let keyNames, spies, redisResponse

          context('and `getListFromDB` returns an array', () => {
            before(async () => {
              spies = {
                getIds  : SpyMock
                  .addReturnSpy(STRINGKeySingleID, 'getIds'),
                getListFromDB : SpyMock
                  .addReturnSpy(STRINGKeySingleID, 'getListFromDB', STRING_KEY_VALUES.slice(2))
              }

              keyNames = await STRINGKeySingleID.getKeyNames(ID_ATTRS)

              await STRINGKeySingleID.setList(STRING_KEY_VALUES.slice(0, 2))

              redisResponse = await STRINGKeySingleID.getList(ID_ATTRS)
            })

            after(async () => {
              await GenericSTRINGCache.delete(keyNames)

              SpyMock.restoreAll()
            })

            it('should call `getIds`', () => {
              expect(spies.getIds).have.been.called
            })

            it('should call `getListFromDB`', () => {
              expect(spies.getListFromDB).have.been.calledOnce
            })

            it('should return the cached values', async () => {
              expect(redisResponse).to.deep.equalInAnyOrder(STRING_VALUES)
            })
          })

          // context('and `getListFromDB` returns an empty array', () => {
          //   before(async () => {
          //     spies = {
          //       getIds  : SpyMock
          //         .addReturnSpy(STRINGKeySingleID, 'getIds'),
          //       getListFromDB : SpyMock
          //         .addReturnSpy(STRINGKeySingleID, 'getListFromDB', [])
          //     }

          //     keyNames = await STRINGKeySingleID.getKeyNames(ID_ATTRS)

          //     await STRINGKeySingleID.setList(STRING_KEY_VALUES.slice(0, 2))

          //     redisResponse = await STRINGKeySingleID.getList(ID_ATTRS)
          //   })

          //   after(async () => {
          //     await GenericSTRINGCache.delete(keyNames)

          //     SpyMock.restoreAll()
          //   })

          //   it('should call `getIds`', () => {
          //     expect(spies.getIds).have.been.called
          //   })

          //   it('should call `getListFromDB`', () => {
          //     expect(spies.getListFromDB).have.been.calledOnce
          //   })

          //   it('should return the cached values', async () => {
          //     expect(redisResponse).to.deep.equalInAnyOrder(STRING_VALUES.slice(0, 2))
          //   })
          // })
        })
      })

      context('when there are no cached values', () => {
        let keyNames, spies, redisResponse
        const ID_ATTRS = STRINGKeySingleID.getIdAttrs(OBJECTS)

        context('and `getListFromDB` returns an array', () => {
          before(async () => {
            spies = {
              getIds  : SpyMock
                .addReturnSpy(STRINGKeySingleID, 'getIds'),
              getListFromDB : SpyMock
                .addReturnSpy(STRINGKeySingleID, 'getListFromDB', STRING_KEY_VALUES)
            }

            keyNames = await STRINGKeySingleID.getKeyNames(ID_ATTRS)

            redisResponse = await STRINGKeySingleID.getList(ID_ATTRS)
          })

          after(async () => {
            await GenericSTRINGCache.delete(keyNames)

            SpyMock.restoreAll()
          })

          it('should call `getIds`', () => {
            expect(spies.getIds).have.been.called
          })

          it('should call `getListFromDB`', () => {
            expect(spies.getListFromDB).have.been.calledOnce
          })

          it('should return the cached values', async () => {
            expect(redisResponse).to.deep.equalInAnyOrder(STRING_VALUES)
          })
        })

        context('and `getListFromDB` returns an empty array', () => {
          before(async () => {
            spies = {
              getIds  : SpyMock
                .addReturnSpy(STRINGKeySingleID, 'getIds'),
              getListFromDB : SpyMock
                .addReturnSpy(STRINGKeySingleID, 'getListFromDB', [])
            }

            keyNames = await STRINGKeySingleID.getKeyNames(ID_ATTRS)

            redisResponse = await STRINGKeySingleID.getList(ID_ATTRS)
          })

          after(async () => {
            await GenericSTRINGCache.delete(keyNames)

            SpyMock.restoreAll()
          })

          it('should call `getIds`', () => {
            expect(spies.getIds).have.been.called
          })

          it('should call `getListFromDB`', () => {
            expect(spies.getListFromDB).have.been.calledOnce
          })

          it('should return an emtpy array', async () => {
            expect(redisResponse).to.eql([])
          })
        })
      })
    })
  })

  describe('.delete', () => {
    context('when the key is `JSON`', () => {
      context('and the are cached values', () => {
        const OBJECTS = GenericRedisCacheMock.getObjectMocks()
        const ID_ATTRS = JSONKeySingleID.getIdAttrs(OBJECTS)

        let keyNames

        before(async () => {
          keyNames = await JSONKeySingleID.getKeyNames(ID_ATTRS)

          await JSONKeySingleID.setList(OBJECTS)
        })

        context('and `keys` is not passed', () => {
          it('should return `0`', async () => {
            const response = await JSONKeySingleID.delete()

            expect(response).to.be.null
          })
        })

        context('and `keys` is passed', () => {
          it('should return the number of deletes keys', async () => {
            const response = await JSONKeySingleID.delete(ID_ATTRS)

            expect(response).to.eql(OBJECTS)
          })

          it('should delete the keys from cache', async () => {
            const response = await GenericJSONCache.getListCache(keyNames)

            expect(response).to.eql([])
          })
        })
      })
    })

    context('when the key is `HASH`', () => {
      context('and there are cached values', () => {
        const OBJECTS = GenericRedisCacheMock.getObjectMocks()
        const ID_ATTRS = HASHKeySingleID.getIdAttrs(OBJECTS)
        let keyNames

        before(async () => {
          keyNames = await HASHKeySingleID.getKeyNames(ID_ATTRS)

          await HASHKeySingleID.setList(OBJECTS)
        })

        context('and `keys` is not passed', () => {
          it('should return `null`', async () => {
            const response = await HASHKeySingleID.delete()

            expect(response).to.be.null
          })
        })

        context('and `keys` is passed', () => {
          it('should return the number of deletes keys', async () => {
            const keys = ID_ATTRS.map((value) => {
              return value.id
            })
            const response = await HASHKeySingleID.delete(keys)

            expect(response).to.eql(OBJECTS)
          })

          it('should delete the keys from cache', async () => {
            const response = await GenericHASHCache.getListCache(keyNames)

            expect(response).to.eql([])
          })
        })
      })
    })

    context('when the key is `STRING`', () => {
      context('and the are cached values', () => {
        const OBJECTS = GenericRedisCacheMock.getObjectMocks()
        const ID_ATTRS = STRINGKeySingleID.getIdAttrs(OBJECTS)

        let values, keyNames, stringValues

        before(async () => {
          keyNames = await STRINGKeySingleID.getKeyNames(ID_ATTRS)

          values = GenericRedisCacheMock.getRandomStrings(3)

          stringValues = OBJECTS.map((object, index) =>{
            return {
              key: object.id,
              value: values[index]
            }
          })

          await STRINGKeySingleID.setList(stringValues)
        })

        context('and `keys` is not passed', () => {
          it('should return `0`', async () => {
            const response = await STRINGKeySingleID.delete()

            expect(response).to.be.null
          })
        })

        context('and `keys` is passed', () => {
          it('should return the  deletes values', async () => {
            const response = await STRINGKeySingleID.delete(ID_ATTRS)

            expect(response).to.eql(values)
          })

          it('should delete the keys from cache', async () => {
            const response = await GenericSTRINGCache.getListCache(keyNames)

            expect(response).to.eql([])
          })
        })
      })
    })
  })

  describe('.isCached', () => {
    context('when the key is `JSON`', () => {
      context('and the key has one `ID`', () => {
        const VALUE = 1
        const CACHE_VALUE = { teste: VALUE }

        context('when there is value cached', () => {
          before(async () => {
            await GenericJSONCacheMock.add(JSONKeySingleID.getKeyName(VALUE), CACHE_VALUE)
          })

          after(async () => {
            await GenericJSONCacheMock.delete(JSONKeySingleID.getKeyName(VALUE))
          })

          context('and a `key` is passed', () => {
            it('should return `true`', async () => {
              const result = await JSONKeySingleID.isCached(VALUE)

              expect(result).to.eql(true)
            })
          })

          context('and a `key` is not passed', () => {
            it('should return `false`', async () => {
              const result = await JSONKeySingleID.isCached()

              expect(result).to.eql(false)
            })
          })

        })

        context('when there is no value cached', () => {
          it('should return null', async () => {
            const result = await JSONKeySingleID.isCached(VALUE)

            expect(result).to.eql(false)
          })
        })
      })

      context('and the key has more than one `ID`', () => {
        const VALUES = {
          object_id: Math.floor((Math.random() * 50) + 1),
          second_id: Math.floor((Math.random() * 50) + 1),
          third_id: Math.floor((Math.random() * 50) + 1)
        }

        const CACHE_VALUE = { x: 1 }

        context('when there value cached', () => {
          before(async () => {
            await GenericJSONCacheMock.add(JSONKeyMultiID.getKeyName(VALUES), CACHE_VALUE)
          })

          after(async () => {
            await GenericJSONCacheMock.delete(JSONKeyMultiID.getKeyName(VALUES))
          })


          it('should return `true`', async () => {
            const result = await JSONKeyMultiID.isCached(VALUES)

            expect(result).to.eql(true)
          })
        })

        context('when there is no value cached', () => {
          it('should return false', async () => {
            const result = await JSONKeyMultiID.isCached(VALUES)

            expect(result).to.eql(false)
          })
        })
      })
    })

    context('when the key is `HASH`', () => {
      const VALUE = 1

      context('and there is value cached', () => {
        before(async () => {
          await GenericHASHCache.setCache(HASHKeySingleID.getKeyName(VALUE), VALUE, VALUE)
        })

        after(async () => {
          await GenericHASHCache.delete(HASHKeySingleID.getKeyName(VALUE), VALUE)
        })


        it('should return `true`', async () => {
          const result = await HASHKeySingleID.isCached(VALUE)

          expect(result).to.eql(true)
        })
      })

      context('and there is no value cached', () => {
        it('should return `false`', async () => {
          const result = await HASHKeySingleID.isCached(VALUE)

          expect(result).to.eql(false)
        })
      })
    })

    context('when the key is `STRING`', () => {
      const VALUE = 'string_value'

      context('and there is value cached', () => {
        before(async () => {
          await GenericSTRINGCache.setCache(STRINGKeySingleID.getKeyName(VALUE), VALUE)
        })

        after(async () => {
          await GenericSTRINGCache.delete(STRINGKeySingleID.getKeyName(VALUE))
        })

        it('should return `true`', async () => {
          const result = await STRINGKeySingleID.isCached(VALUE)

          expect(result).to.eql(true)
        })
      })

      context('and there is no value cached', () => {
        it('should return `false`', async () => {
          const result = await STRINGKeySingleID.isCached(VALUE)

          expect(result).to.eql(false)
        })
      })
    })
  })
})