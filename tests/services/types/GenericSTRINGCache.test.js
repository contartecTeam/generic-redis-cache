'use strict'

const GenericSTRINGCache = require('types/GenericSTRINGCache')
const STRINGKeySingleID = require('tests/cache/STRING/STRINGKeySingleID')

const GenericRedisCacheMock = require('mocks/GenericRedisCacheMock')

describe('GenericSTRINGCache', () => {
  describe('.getCache', () => {
    const VALUE = 'string_value'

    context('and a `keyName` is passed', () => {
      context('and a `string` is the value on `cache`', () => {
        const KEY_NAME = STRINGKeySingleID.getKeyName(VALUE)

        context('and there is value cached', () => {
          before(async () => {
            await GenericSTRINGCache.setCache(KEY_NAME, VALUE)
          })

          after(async () => {
            await GenericSTRINGCache.delete(KEY_NAME)
          })

          it('should return the cached object', async () => {
            const result = await GenericSTRINGCache.getCache(KEY_NAME)

            expect(result).to.eql([VALUE])
          })
        })

        context('and there is no value cached', () => {
          it('should return null', async () => {
            const result = await GenericSTRINGCache.getCache(KEY_NAME)

            expect(result).to.eql([])
          })
        })
      })
    })

    context('and a `keyName` is not passed', () => {
      it('should return null', async () => {
        const result = await GenericSTRINGCache.getCache()

        expect(result).to.eql([])
      })
    })
  })

  describe('.setCache', () => {
    context('when a `keyName` is passed', () => {
      const ID = 1
      const keyName = STRINGKeySingleID.getKeyName(ID)

      context('and a `value` is passed', () => {
        context('and it`s a `String`', () => {
          const STRING_VALUE = 'string_value'
          let result
          before(async () => {
            result = await GenericSTRINGCache.setCache(keyName, STRING_VALUE)
          })

          after(async () => {
            await GenericSTRINGCache.delete(keyName)
          })

          it('should return the status operation', () => {
            expect(result).to.eql(1)
          })

          it('should save the value on cache', async () => {
            const cachedValue = await GenericSTRINGCache.getCache(keyName)

            expect(cachedValue).to.eql([STRING_VALUE])
          })
        })

        context('and it`s an `Object`', () => {
          const CACHE_VALUE = { teste: ID}
          let result
          before(async () => {
            result = await GenericSTRINGCache.setCache(keyName, CACHE_VALUE)
          })

          after(async () => {
            await GenericSTRINGCache.delete(keyName)
          })

          it('should return the status operation', () => {
            expect(result).to.eql(1)
          })

          it('should save the value on cache', async () => {
            const cachedValue = await GenericSTRINGCache.getCache(keyName)

            expect(JSON.parse(cachedValue[0])).to.eql(CACHE_VALUE)
          })
        })
      })

      context('and a `value` is not passed', () => {
        let result

        before(async () => {
          result = await GenericSTRINGCache.setCache(keyName)
        })

        after(async () => {
          await GenericSTRINGCache.delete(keyName)
        })

        it('should return the status operation', () => {
          expect(result).to.eql(1)
        })

        it('should save the `key`on cache', async () => {
          const cachedValue = await GenericSTRINGCache.getCache(keyName)

          expect(cachedValue).to.not.null
        })
      })
    })

    context('when a `keyName` is not passed', () => {
      it('should return null', async () => {
        const result = await GenericSTRINGCache.setCache()

        expect(result).to.eql(null)
      })
    })
  })

  describe('.getListCache', () => {
    const OBJECTS = GenericRedisCacheMock.getObjectMocks()
    const ID_ATTRS = STRINGKeySingleID.getIdAttrs(OBJECTS)

    context('when there are cached values', () => {
      context('and the cached values are `Objects`', () => {
        let keyNames

        before(async () => {
          keyNames = await STRINGKeySingleID.getKeyNames(ID_ATTRS)

          await STRINGKeySingleID.setList(OBJECTS)
        })

        after(async () => {
          await GenericSTRINGCache.delete(keyNames)
        })

        context('and valid `keyNames` are passed', () => {
          it('should return the cached values', async () => {
            const cachedValues = await GenericSTRINGCache.getListCache(keyNames)

            const parsedValues = cachedValues.map((value) => {
              return JSON.parse(value)
            })

            expect(parsedValues).to.deep.equalInAnyOrder(OBJECTS)
          })
        })
      })

      context('and the cached values are `strings`', () => {
        let keyNames, values

        before(async () => {
          keyNames = await STRINGKeySingleID.getKeyNames(ID_ATTRS)

          values = GenericRedisCacheMock.getRandomStrings(3)

          const stringValues = OBJECTS.map((object, index) =>{
            return {
              key: object.id,
              value: values[index]
            }
          })

          await STRINGKeySingleID.setList(stringValues)
        })

        after(async () => {
          await GenericSTRINGCache.delete(keyNames)
        })

        context('and valid `keyNames` are passed', () => {
          it('should return the cached values', async () => {
            const cachedValues = await GenericSTRINGCache.getListCache(keyNames)

            expect(cachedValues).to.deep.equalInAnyOrder(values)
          })
        })
      })

      context('and unexistent `keyNames` are passed', () => {
        it('should return an empty array', async () => {
          const unexistentKeyNames = [ '00000000', '99999999']
          const cachedValues = await GenericSTRINGCache.getListCache(unexistentKeyNames)

          expect(cachedValues).to.eql([])
        })
      })

      context('and no `keyNames` are passed', () => {
        it('should return an empty array', async () => {
          const cachedValues = await GenericSTRINGCache.getListCache()

          expect(cachedValues).to.eql([])
        })
      })
    })

    context('when there are no cached values', () => {
      it('should return an empty array', async () => {
        const keyNames = await STRINGKeySingleID.getKeyNames(ID_ATTRS)

        const cachedValues = await GenericSTRINGCache.getListCache(keyNames)

        expect(cachedValues).to.eql([])
      })
    })
  })

  describe('.delete', () => {
    context('when there are cached values', () => {
      const OBJECTS = GenericRedisCacheMock.getObjectMocks()
      const ID_ATTRS = STRINGKeySingleID.getIdAttrs(OBJECTS)
      let keyNames, values

      before(async () => {
        keyNames = await STRINGKeySingleID.getKeyNames(ID_ATTRS)

        values = GenericRedisCacheMock.getRandomStrings(3)

        const stringValues = OBJECTS.map((object, index) =>{
          return {
            key: object.id,
            value: values[index]
          }
        })

        await STRINGKeySingleID.setList(stringValues)
      })

      context('and `keyNames` is not passed', () => {
        it('should return the redis response', async () => {
          const redisResponse = await GenericSTRINGCache.delete()

          expect(redisResponse).to.eql(0)
        })

        it('should not delete the keys from cache', async () => {
          const cachedValues = await GenericSTRINGCache.getListCache(keyNames)

          expect(cachedValues.length).to.eql(OBJECTS.length)
        })
      })

      context('and `keyNames` is passed', () => {
        it('should return the redis response', async () => {
          const redisResponse = await GenericSTRINGCache.delete(keyNames)

          expect(redisResponse).to.eql(OBJECTS.length)
        })

        it('should delete the keys from cache', async () => {
          const cachedValues = await GenericSTRINGCache.getListCache(keyNames)

          expect(cachedValues).to.eql([])
        })
      })
    })
  })
})