'use strict'

const GenericJSONArrayCache = require('../../../lib/services/types/GenericJSONArrayCache')
const GenericJSONCacheMock = require('../../mocks/GenericJSONCacheMock')
const JSONKeySingleID = require('../../cache/JSON/JSONKeySingleID')

const SpyMock = require('@contartec-team/spy-mock/lib/SpyMock')

describe('GenericJSONArrayCache', () => {
  describe('.addCache', () => {
    context('when a `keyName` is passed', () => {
      const ID = 1
      const keyName = JSONKeySingleID.getKeyName(ID)

      context('and a `value` is passed', () => {
        context('and the `keyName` is cached', () => {
          const CACHE_VALUE = { teste: ID, attr1: 'teste' }
          
          let result
          let spies

          before(async () => {
            await GenericJSONArrayCache
              .initArrayCache(keyName)

            spies = {
              _addCache : SpyMock
                .addReturnSpy(GenericJSONArrayCache, '_addCache', 1)
            }
            
            result = await GenericJSONArrayCache
              .addCache(keyName, CACHE_VALUE)
          })

          after(async () => {
            SpyMock
              .restoreAll()

            await GenericJSONCacheMock
              .delete(keyName)
          })

          it('should return the list size', () => {
            expect(result).to.eql(1)
          })

          it('should call `_addCache`', () => {
            expect(spies._addCache).to.have.been.calledOnce
          })
        })

        context('and the `keyName` is not cached', () => {
          const CACHE_VALUE = { teste: ID, attr1: 'teste'}

          let result
          let spies

          before(async () => {
            spies = {
              initArrayCache : SpyMock
                .addReturnSpy(GenericJSONArrayCache, 'initArrayCache', 1)
            }

            result = await GenericJSONArrayCache
              .addCache(keyName, CACHE_VALUE)
          })

          after(() => SpyMock.restoreAll())

          it('should return the list size', () => {
            expect(result).to.eql(1)
          })

          it('should call `initArrayCache`', () => {
            expect(spies.initArrayCache).have.been.calledOnce
          })
        })
      })

      context('and a `value` is not passed', () => {
        let result
        let spies

        before(async () => {
          spies = {
            isCached : SpyMock
              .addReturnSpy(GenericJSONArrayCache, 'isCached')
          }

          result = result = await GenericJSONArrayCache
            .addCache(keyName)
        })

        after(() => SpyMock.restoreAll())

        it('should return the list size', () => {
          expect(result).to.eql(0)
        })

        it('should not call `isCached`', () => {
          expect(spies.isCached).not.to.have.been.called
        })
      })
    })

    context('when a `keyName` is not passed', () => {
      let result

      before(async () => {
        result = result = await GenericJSONArrayCache
          .addCache(null)
      })

      it('should return the list size', () => {
        expect(result).to.eql(0)
      }) 
    })
  })

  describe('.initArrayCache', () => {  
    context('when the `keyName` is passed', () => {
      const ID = 1
      const keyName = JSONKeySingleID.getKeyName(ID)

      context('and the `value` is passed', () => {
        const CACHE_VALUE = { teste: ID, attr1: 'teste' }

        let result

        before(async () => {
          result = await GenericJSONArrayCache
            .initArrayCache(keyName, CACHE_VALUE)
        })

        after(async () => {
          await GenericJSONCacheMock
            .delete(keyName)
        })

        it('should return the list size', () => {
          expect(result).to.eql(1)
        })

        it('should save the value on cache', async () => {
          const cachedValue = await GenericJSONArrayCache
            .getCache(keyName)

          expect(cachedValue).to.eql([CACHE_VALUE])
        })
      })

      context('and the `value` is not passed', () => {        
        let result

        before(async () => {
          result = await GenericJSONArrayCache
            .initArrayCache(keyName)
        })

        after(async () => {
          await GenericJSONCacheMock
            .delete(keyName)
        })

        it('should return the list size', () => {
          expect(result).to.eql(0)
        })

        it('should save an empty list on cache', async () => {
          const cachedValue = await GenericJSONCacheMock
            .getCache(keyName)

          expect(cachedValue).to.eql([])
        })
      })
    })

    context('when the `keyName` is not passed', () => {       
      let result

      before(async () => {
        result = await GenericJSONArrayCache
          .initArrayCache()
      })

      it('should return the list size', () => {
        expect(result).to.eql(0)
      })
    })
  })

  describe('._addCache', () => {
    const ID = 1
    const keyName = JSONKeySingleID.getKeyName(ID)
    
    context('when the `position` is passed', () => {
      context('and the `position` is in the array\'s range', () => {
        const CACHE_VALUE = { teste: ID, attr1: 'teste' }
        const position = 0

        let result

        before(async () => {
          const value = { teste: 2 }

          await GenericJSONArrayCache
            .initArrayCache(keyName, value)
          
          result = await GenericJSONArrayCache
            ._addCache(keyName, CACHE_VALUE, position)
        })

        after(async () => {
          await GenericJSONCacheMock
            .delete(keyName)
        })

        it('should return the list size', () => {
          expect(result).to.eql(2)
        })

        it('should save the value on cache', async () => {
          const cachedValue = await GenericJSONArrayCache
            .getCache(keyName)

          expect(cachedValue[position]).to.eql(CACHE_VALUE)
        })
      })

      context('and the `position` is not in the array\'s range', () => {
        const CACHE_VALUE = { teste: ID, attr1: 'teste' }
        
        let result

        before(async () => {
          const position = 10

          const value = { teste: 2 }

          await GenericJSONArrayCache
            .initArrayCache(keyName, value)
          
          result = await GenericJSONArrayCache
            ._addCache(keyName, CACHE_VALUE, position)
        })

        after(async () => {
          await GenericJSONCacheMock
            .delete(keyName)
        })

        it('should return the list size', () => {
          expect(result).to.eql(2)
        })

        it('should save the value in the last position', async () => {
          const cachedValue = await GenericJSONCacheMock
            .getCache(keyName)

          const last = cachedValue.length - 1

          expect(cachedValue[last]).to.eql(CACHE_VALUE)
        })
      })
    })

    context('when the `position` is not passed', () => {
      const CACHE_VALUE = { teste: ID, attr1: 'teste' }
        
      let result

      before(async () => {
        const value = { teste: 2 }

        await GenericJSONArrayCache
          .initArrayCache(keyName, value)
        
        result = await GenericJSONArrayCache
          ._addCache(keyName, CACHE_VALUE)
      })

      after(async () => {
        await GenericJSONCacheMock
          .delete(keyName)
      })

      it('should return the list size', () => {
        expect(result).to.eql(2)
      })

      it('should save the value in the last position', async () => {
        const cachedValue = await GenericJSONCacheMock
          .getCache(keyName)

        const last = cachedValue.length - 1

        expect(cachedValue[last]).to.eql(CACHE_VALUE)
      })
    })
  })
})