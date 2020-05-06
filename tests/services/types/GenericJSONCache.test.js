'use strict'

const GenericJSONCache = require('types/GenericJSONCache')
const GenericJSONCacheMock = require('mocks/GenericJSONCacheMock')
const GenericRedisCacheMock = require('mocks/GenericRedisCacheMock')
const JSONKeySingleID = require('tests/cache/JSON/JSONKeySingleID')

describe('GenericJSONCache', () => {
  describe('.getCache', () => {
    context('when `keyName` is cached', () => {
      const VALUE = 1
      const CACHE_VALUE = { teste: VALUE, randomProperty: Math.floor((Math.random() * 50) + 1), randomProperty2: Math.floor((Math.random() * 50) + 1) }

      before(async () => {
        await GenericJSONCacheMock.add(JSONKeySingleID.getKeyName(VALUE), CACHE_VALUE)
      })

      after(async () => {
        await GenericJSONCacheMock.delete(JSONKeySingleID.getKeyName(VALUE))
      })

      context('when `params.attrs` has multiple itens', () => {
        let attrs, cachedValue

        before(async () => {
          attrs = Object
            .keys(CACHE_VALUE)
            .filter(attrName => attrName.charAt(0) != '_')
            .slice(1)

          cachedValue = await GenericJSONCache
            .getCache(JSONKeySingleID.getKeyName(VALUE), { attrs })
        })

        it('should return the cached object with the specified `attrs`', () => {
          const cachedValueTemp = {}

          attrs
            .forEach(attrName => cachedValueTemp[attrName] = CACHE_VALUE[attrName])

          expect(cachedValue).to.shallowDeepEqual(cachedValueTemp)
        })
      })

      context('when `params.attrs` has one item', () => {
        let attrs, cachedValue

        before(async () => {
          attrs = [ Object.keys(CACHE_VALUE)[0] ]

          cachedValue = await GenericJSONCache
            .getCache(JSONKeySingleID.getKeyName(VALUE), { attrs })
        })

        it('should return the cached object with the specified `attrs`', () => {
          expect(cachedValue).to.shallowDeepEqual(VALUE)
        })
      })

      context('when `params.attrs` is `null`', () => {
        it('should return the cached object', async () => {
          const terminalTrackerReadingCache = await GenericJSONCache
            .getCache(JSONKeySingleID.getKeyName(VALUE))

          expect(terminalTrackerReadingCache).to.deep.equal(CACHE_VALUE)
        })
      })
    })

    context('when `keyName` is not cached', () => {
      it('should return null', async () => {
        const cacheValue = await GenericJSONCache
          .getCache(JSONKeySingleID.getKeyName(9999))

        expect(cacheValue).to.be.null
      })
    })
  })

  describe('.getListCache', () => {
    const OBJECTS = GenericRedisCacheMock.getObjectMocks()
    const ID_ATTRS = JSONKeySingleID.getIdAttrs(OBJECTS)

    context('when there are cached values', () => {
      let keyNames

      before(async () => {
        keyNames = await JSONKeySingleID.getKeyNames(ID_ATTRS)

        await JSONKeySingleID.setList(OBJECTS)
      })

      after(async () => {
        await GenericJSONCache.delete(keyNames)
      })

      context('and valid `keyNames` are passed', () => {
        it('should return the cached values', async () => {
          const cachedValues = await GenericJSONCache.getListCache(keyNames)

          expect(cachedValues).to.deep.equalInAnyOrder(OBJECTS)
        })
      })

      context('and unexistent `keyNames` are passed', () => {
        it('should return an empty array', async () => {
          const unexistentKeyNames = [ '00000000', '99999999']
          const cachedValues = await GenericJSONCache.getListCache(unexistentKeyNames)

          expect(cachedValues).to.eql([])
        })
      })

      context('and no `keyNames` are passed', () => {
        it('should return an empty array', async () => {
          const cachedValues = await GenericJSONCache.getListCache()

          expect(cachedValues).to.eql([])
        })
      })
    })

    context('when there are no cached values', () => {
      it('should return an empty array', async () => {
        const keyNames = await JSONKeySingleID.getKeyNames(ID_ATTRS)

        const cachedValues = await GenericJSONCache.getListCache(keyNames)

        expect(cachedValues).to.eql([])
      })
    })
  })

  describe('.setCache', () => {
    context('when a `keyName` is passed', () => {
      const ID = 1
      const keyName = JSONKeySingleID.getKeyName(ID)

      context('and a `value` is passed', () => {
        context('and it`s an `Object`', () => {
          const CACHE_VALUE = { teste: ID}
          let result

          before(async () => {
            result = await GenericJSONCache.setCache(keyName, CACHE_VALUE)
          })

          after(async () => {
            await GenericJSONCacheMock.delete(keyName)
          })

          it('should return the status operation', () => {
            expect(result).to.eql('OK')
          })

          it('should save the value on cache', async () => {
            const cachedValue = await GenericJSONCache.getCache(keyName)

            expect(cachedValue).to.eql(CACHE_VALUE)
          })
        })

        context('and it`s a `String`', () => {
          const STRING_VALUE = 'string_value'
          let result
          before(async () => {
            result = GenericJSONCache.setCache(keyName, STRING_VALUE)
          })

          after(async () => {
            await GenericJSONCacheMock.delete(keyName)
          })

          it('should return null', () => {
            expect(result).to.not.exist
          })

          it('should not save the value on cache', async () => {
            const cachedValue = await GenericJSONCache.getCache(keyName)

            expect(cachedValue).to.be.null
          })
        })
      })

      context('and a `value` is not passed', () => {
        let result

        before(async () => {
          result = GenericJSONCache.setCache(keyName)
        })

        after(async () => {
          await GenericJSONCacheMock.delete(keyName)
        })

        it('should return the status operation', () => {
          expect(result).to.not.exist
        })

        it('should not save the `key`on cache', async () => {
          const cachedValue = await GenericJSONCache.getCache(keyName)

          expect(cachedValue).to.be.null
        })
      })
    })

    context('when a `keyName` is not passed', () => {
      it('should return null', async () => {
        const result = GenericJSONCache.setCache(null)

        expect(result).to.be.null
      })
    })
  })

  describe('._setCache', () => {
    const ID = 1
    const keyName = JSONKeySingleID.getKeyName(ID)

    context('when `object` passed is an `Object`', () => {
      const CACHE_VALUE = { teste: ID}

      it ('should return the redis operation status', async () => {
        const response = GenericJSONCache._setCache(keyName, CACHE_VALUE)

        expect(response).to.exist
      })
    })

    context('when `object` passed is  `String`', () => {
      const STRING_VALUE = 'string_value'

      it('should give an error', async () => {
        try {
          await GenericJSONCache._setCache(keyName, STRING_VALUE)
        }
        catch (error) {
          expect(error).to.exist
        }
      })
    })
  })

  describe('.delete', () => {
    context('when there are cached values', () => {
      const OBJECTS = GenericRedisCacheMock.getObjectMocks()
      const ID_ATTRS = JSONKeySingleID.getIdAttrs(OBJECTS)
      let keyNames

      before(async () => {
        keyNames = await JSONKeySingleID.getKeyNames(ID_ATTRS)

        await JSONKeySingleID.setList(OBJECTS)
      })

      context('and `keyNames` is not passed', () => {
        it('should return the redis response', async () => {
          const redisResponse = await GenericJSONCache.delete()

          expect(redisResponse).to.eql(0)
        })

        it('should not delete the keys from cache', async () => {
          const cachedValues = await GenericJSONCache.getListCache(keyNames)

          expect(cachedValues).to.eql(OBJECTS)
        })
      })

      context('and `keyNames` is passed', () => {
        it('should return the redis response', async () => {
          const redisResponse = await GenericJSONCache.delete(keyNames)

          expect(redisResponse).to.eql(OBJECTS.length)
        })

        it('should delete the keys from cache', async () => {
          const cachedValues = await GenericJSONCache.getListCache(keyNames)

          expect(cachedValues).to.eql([])
        })
      })
    })
  })
})