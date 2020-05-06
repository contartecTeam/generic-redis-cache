'use strict'

const bluebird = require('bluebird')
const node_redis = require('redis')
const redisJSON =  require('redis-rejson')
redisJSON(node_redis)

bluebird.promisifyAll(node_redis.RedisClient.prototype)
bluebird.promisifyAll(node_redis.Multi.prototype)

const redis =  node_redis.createClient(process.env.REDISCLOUD_URL)

module.exports.redis = redis
module.exports.PREFIX = 'contartec:org:'