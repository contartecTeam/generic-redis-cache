'use strict'

const GenericHASHCache = require('generic-redis-cache-types/GenericHASHCache')
const HASHKeySingleID = require('generic-redis-cache-tests/cache/HASH/HASHKeySingleID')
const GenericRedisCacheMock = require('generic-redis-cache-tests/mocks/GenericRedisCacheMock')

describe('GenericHASHCache', () => {
  describe('.getCache', () => {
    context('and a `keyName` is passed', () => {
      const VALUE = 1

      context('and a `Object` is the value on `cache`', () => {
        const CACHE_VALUE = { teste: VALUE }

        context('and there is value cached', () => {
          before(async () => {
            await GenericHASHCache.setCache(HASHKeySingleID.getKeyName(VALUE), VALUE, CACHE_VALUE)
          })

          after(async () => {
            await GenericHASHCache.delete(HASHKeySingleID.getKeyName(VALUE), VALUE)
          })


          it('should return the cached object', async () => {
            const result = await GenericHASHCache.getCache(HASHKeySingleID.getKeyName(VALUE), VALUE)

            expect(result).to.eql(CACHE_VALUE)
          })
        })

        context('and there is no value cached', () => {
          it('should return null', async () => {
            const result = await GenericHASHCache.getCache(HASHKeySingleID.getKeyName(VALUE), CACHE_VALUE)

            expect(result).to.be.null
          })
        })
      })

      context('and a `Number` is the value on `cache`', () => {
        context('and there is value cached', () => {
          before(async () => {
            await GenericHASHCache.setCache(HASHKeySingleID.getKeyName(VALUE), VALUE, VALUE)
          })

          after(async () => {
            await GenericHASHCache.delete(HASHKeySingleID.getKeyName(VALUE), VALUE)
          })


          it('should return the cached object', async () => {
            const result = await await GenericHASHCache.getCache(HASHKeySingleID.getKeyName(VALUE), VALUE)

            expect(result).to.eql(VALUE)
          })
        })

        context('and there is no value cached', () => {
          it('should return null', async () => {
            const result = await GenericHASHCache.getCache(HASHKeySingleID.getKeyName(VALUE), VALUE)

            expect(result).to.be.null
          })
        })
      })

      context('and a `String` is the value on `cache`', () => {
        const STRING_VALUE = 'test_value'
        context('and there is value cached', () => {
          before(async () => {
            await GenericHASHCache.setCache(HASHKeySingleID.getKeyName(VALUE), STRING_VALUE, STRING_VALUE)
          })

          after(async () => {
            await GenericHASHCache.delete(HASHKeySingleID.getKeyName(VALUE), STRING_VALUE)
          })


          it('should return the cached object', async () => {
            const result = await GenericHASHCache.getCache(HASHKeySingleID.getKeyName(VALUE), STRING_VALUE)

            expect(result).to.eql(STRING_VALUE)
          })
        })

        context('and there is no value cached', () => {
          it('should return null', async () => {
            const result = await GenericHASHCache.getCache(HASHKeySingleID.getKeyName(VALUE), STRING_VALUE)

            expect(result).to.be.null
          })
        })
      })
    })

    context('and a `keyName` is not passed', () => {
      it('should return null', async () => {
        const result = await GenericHASHCache.getCache()

        expect(result).to.be.null
      })
    })
  })

  describe('.setCache', () => {
    context('when a `key` is passed', () => {
      context('when `value` is an `Object`', () => {
        const ID = 1
        const CACHE_VALUE = {
          id: ID
        }
        const KEY_NAME = HASHKeySingleID.getKeyName(ID)

        before(async () => {
          await GenericHASHCache.setCache(KEY_NAME, ID, CACHE_VALUE)
        })

        after(async () => {
          await GenericHASHCache.delete(KEY_NAME, ID)
        })

        it('should save the `key` on cache', async () => {
          const cachedValue = await GenericHASHCache.getCache(KEY_NAME, ID)

          expect(cachedValue).to.eql(CACHE_VALUE)
        })
      })

      context('when `value` is an `String`', () => {
        const ID = 1
        const STRING_VALUE = 'string_value'
        const KEY_NAME = HASHKeySingleID.getKeyName(ID)
        let redisResponse

        before(async () => {
          redisResponse = await GenericHASHCache.setCache(KEY_NAME, ID, STRING_VALUE)
        })

        after(async () => {
          await GenericHASHCache.delete(KEY_NAME, ID)
        })

        it('should return the redis status operation', () => {
          expect(redisResponse).to.eql(1)
        })

        it('should save the `key` on cache', async () => {
          const cachedValue = await GenericHASHCache.getCache(KEY_NAME, ID)

          expect(cachedValue).to.eql(STRING_VALUE)
        })
      })

      context('when `value` is null', () => {
        const ID = 1
        const KEY_NAME = HASHKeySingleID.getKeyName(ID)
        let redisResponse

        before(async () => {
          redisResponse = await GenericHASHCache.setCache(KEY_NAME, ID, null)
        })

        after(async () => {
          await GenericHASHCache.delete(KEY_NAME, ID)
        })

        it('should return the redis status operation', () => {
          expect(redisResponse).to.eql(1)
        })

        it('should save the `key` on cache', async () => {
          const cachedValue = await GenericHASHCache.getCache(KEY_NAME, ID)

          expect(cachedValue).to.eql(null)
        })
      })

      context('when `value` is undefined', () => {
        const ID = 1
        const KEY_NAME = HASHKeySingleID.getKeyName(ID)
        let redisResponse

        before(async () => {
          redisResponse = await GenericHASHCache.setCache(KEY_NAME, ID, undefined)
        })

        after(async () => {
          await GenericHASHCache.delete(KEY_NAME, ID)
        })

        it('should return the redis status operation', () => {
          expect(redisResponse).to.eql(1)
        })

        it('should save the `key` on cache', async () => {
          const cachedValue = await GenericHASHCache.getCache(KEY_NAME, ID)

          expect(cachedValue).to.eql('undefined')
        })
      })
    })

    context('when a null `key` is passed', () => {
      const ID = 1
      const CACHE_VALUE = {
        id: ID
      }
      const KEY_NAME = HASHKeySingleID.getKeyName(ID)

      before(async () => {
        await GenericHASHCache.setCache(KEY_NAME, null, CACHE_VALUE)
      })

      after(async () => {
        await GenericHASHCache.delete(KEY_NAME, null)
      })

      it('should save the `key` on cache', async () => {
        const cachedValue = await GenericHASHCache.getCache(KEY_NAME, null)

        expect(cachedValue).to.eql(CACHE_VALUE)
      })
    })

    context('when a `undefined` `key` is passed', () => {
      const ID = 1
      const CACHE_VALUE = {
        id: ID
      }
      const KEY_NAME = HASHKeySingleID.getKeyName(ID)

      before(async () => {
        await GenericHASHCache.setCache(KEY_NAME, undefined, CACHE_VALUE)
      })

      after(async () => {
        await GenericHASHCache.delete(KEY_NAME, undefined)
      })

      it('should save the `key` on cache', async () => {
        const cachedValue = await GenericHASHCache.getCache(KEY_NAME, undefined)

        expect(cachedValue).to.eql(CACHE_VALUE)
      })
    })
  })

  describe('.getListCache', () => {
    const OBJECTS = GenericRedisCacheMock.getObjectMocks()
    const ID_ATTRS = HASHKeySingleID.getIdAttrs(OBJECTS)

    context('when there are cached values', () => {
      context('and the cached values are `Objects`', () => {
        let keyNames

        before(async () => {
          keyNames = await HASHKeySingleID.getKeyNames(ID_ATTRS)

          await HASHKeySingleID.setList(OBJECTS)
        })

        after(async () => {
          await GenericHASHCache.delete(keyNames)
        })

        context('and valid `keyNames` are passed', () => {
          it('should return the cached values', async () => {
            const cachedValues = await GenericHASHCache.getListCache(keyNames)

            expect(cachedValues).to.deep.equalInAnyOrder(OBJECTS)
          })
        })
      })

      context('and the cached values are `strings`', () => {
        let keyNames, values

        before(async () => {
          keyNames = await HASHKeySingleID.getKeyNames(ID_ATTRS)

          values = GenericRedisCacheMock.getRandomStrings(3)

          const stringValues = OBJECTS.map((object, index) =>{
            return {
              key: object.id,
              value: values[index]
            }
          })

          await HASHKeySingleID.setList(stringValues)
        })

        after(async () => {
          await GenericHASHCache.delete(keyNames)
        })

        context('and valid `keyNames` are passed', () => {
          it('should return the cached values', async () => {
            const cachedValues = await GenericHASHCache.getListCache(keyNames)

            expect(cachedValues).to.deep.equalInAnyOrder(values)
          })
        })
      })

      context('and unexistent `keyNames` are passed', () => {
        it('should return an empty array', async () => {
          const unexistentKeyNames = [ '00000000', '99999999']
          const cachedValues = await GenericHASHCache.getListCache(unexistentKeyNames)

          expect(cachedValues).to.eql([])
        })
      })

      context('and no `keyNames` are passed', () => {
        it('should return an empty array', async () => {
          const cachedValues = await GenericHASHCache.getListCache()

          expect(cachedValues).to.eql([])
        })
      })
    })

    context('when there are no cached values', () => {
      it('should return an empty array', async () => {
        const keyNames = await HASHKeySingleID.getKeyNames(ID_ATTRS)

        const cachedValues = await GenericHASHCache.getListCache(keyNames)

        expect(cachedValues).to.eql([])
      })
    })
  })

  describe('.delete', () => {
    context('when there are cached values', () => {
      const OBJECTS = GenericRedisCacheMock.getObjectMocks()
      const ID_ATTRS = HASHKeySingleID.getIdAttrs(OBJECTS)
      let keyNames

      before(async () => {
        keyNames = await HASHKeySingleID.getKeyNames(ID_ATTRS)

        await HASHKeySingleID.setList(OBJECTS)
      })

      context('and `keyNames` is not passed', () => {
        it('should return the redis response', async () => {
          const redisResponse = await GenericHASHCache.delete()

          expect(redisResponse).to.eql(0)
        })

        it('should not delete the keys from cache', async () => {
          const cachedValues = await GenericHASHCache.getListCache(keyNames)

          expect(cachedValues.length).to.eql(OBJECTS.length)
        })
      })

      context('and `keyNames` is passed', () => {
        it('should return the redis response', async () => {
          const redisResponse = await GenericHASHCache.delete(keyNames)

          expect(redisResponse).to.eql(OBJECTS.length)
        })

        it('should delete the keys from cache', async () => {
          const cachedValues = await GenericHASHCache.getListCache(keyNames)

          expect(cachedValues).to.eql([])
        })
      })
    })
  })

  describe('.isCached', () => {
    context('when `keyName` is cached', () => {
      const VALUE = 1
      const CACHE_VALUE = { teste: VALUE, randomProperty: Math.floor((Math.random() * 50) + 1), randomProperty2: Math.floor((Math.random() * 50) + 1) }

      before(async () => {
        await  GenericHASHCache.setCache(HASHKeySingleID.getKeyName(VALUE),VALUE, CACHE_VALUE)
      })

      after(async () => {
        await GenericHASHCache.delete(HASHKeySingleID.getKeyName(VALUE))
      })

      context('when `keyName` is passed', () => {
        context('and `field` is passed', () => {
          let  isCached

          before(async () => {
            isCached = await GenericHASHCache
              .isCached(HASHKeySingleID.getKeyName(VALUE), VALUE)
          })

          it('should return `true`', () => {
            expect(isCached).to.equal(true)
          })
        })

        context('and `field` is not passed', () => {
          let  isCached

          before(async () => {
            isCached = await GenericHASHCache
              .isCached(HASHKeySingleID.getKeyName(VALUE))
          })

          it('should return `false`', () => {
            expect(isCached).to.equal(false)
          })
        })

      })

      context('when `keyName` is not passed', () => {
        let isCached

        before(async () => {
          isCached = await GenericHASHCache
            .isCached()
        })

        it('should return `false`', () => {
          expect(isCached).to.equal(false)
        })
      })
    })

    context('when `keyName` is not cached', () => {
      it('should return false', async () => {
        const isCached = await GenericHASHCache
          .isCached(HASHKeySingleID.getKeyName(9999))

        expect(isCached).to.equal(false)
      })
    })
  })
})