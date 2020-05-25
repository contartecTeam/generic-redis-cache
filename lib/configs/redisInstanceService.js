'use strict'
require('link-module-alias')

module.exports = (redis) => {
  global.redisInstance = redis
}