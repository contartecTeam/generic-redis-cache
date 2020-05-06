'use strict'

module.exports = (redis) => {
  global.redisIntance = redis
  console.warn('set global.redisIntance', global.redisIntance)
}