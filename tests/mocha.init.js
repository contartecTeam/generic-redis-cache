'use strict'

const bluebird = require('bluebird')
const chai = require('chai')
const chaiHttp = require('chai-http')
const chaiThings = require('chai-things')
const chaiShallowDeepEqual = require('chai-shallow-deep-equal')
const co = require('co')

chai.use(chaiHttp)
chai.use(chaiShallowDeepEqual)
chai.use(chaiThings)
chai.use(require('chai-as-promised'))
chai.use(require('sinon-chai'))
chai.use(require('chai-datetime'))
chai.use(require('deep-equal-in-any-order'))

global.sinon = require('sinon')

global.faker = require('faker')
global.expect = chai.expect
global.rewire = require('rewire')
global.redis = bluebird.promisifyAll(require('./config/socket').redis)

require('../lib/configs/redisInstanceService')(global.redis)

global.clear_database = function*() {
  yield redis.flushallAsync()
}

global.execAsync = function(generatorFunction) {
  return co(
    generatorFunction()
  )
}

global.getSpy = function(object, attr, stub, type = 'spy', isAsync = true) {
  const returnFn = isAsync ?
    'resolves' :
    'returns'

  const spy = sinon
    [type](object, attr)
    [returnFn](stub)

  return spy
}

global.getStub = function(object, attr, stub, isAsync) {
  return getSpy(object, attr, stub, 'stub', isAsync)
}

global.restoreSpies = function(spies) {
  if (spies && !(spies instanceof Array))
    spies = [spies]

  for (var i = spies.length - 1; i >= 0; i--) {
    if (spies[i])
      spies[i].restore()
  }
}

process
  .on('uncaughtException', () => {
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1)
    }
  })