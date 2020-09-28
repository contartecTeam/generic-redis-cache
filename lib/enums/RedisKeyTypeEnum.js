'use strict'

/**
 * Redis key types
 * @enum RedisKeyTypeEnum
*/
const RedisKeyTypeEnum = {
  JSON    : 1,
  STRING  : 2,
  HASH    : 3,

  toArray   : function() {
    const values = []

    for (const key in RedisKeyTypeEnum) {
      if (typeof(RedisKeyTypeEnum[key]) == 'number')
        values.push(RedisKeyTypeEnum[key])
    }

    return values
  },

  toObjectArray : function() {
    const values = []

    for (const key in RedisKeyTypeEnum) {
      if (typeof(RedisKeyTypeEnum[key]) == 'number') {
        values
          .push({
            id        : RedisKeyTypeEnum[key],
            comment   : key
          })
      }
    }

    return values
  }
}

module.exports = RedisKeyTypeEnum