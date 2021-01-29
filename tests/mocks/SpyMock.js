'use strict'

/**
 * The `spy` types
 * @enum
*/
const SPY_TYPE = {
  SPY   : 'spy',
  STUB  : 'stub'
}

/**
 * Contains a set of (`sinon`) spy mock methods
 * @class
 *
 * @property {Array<Object>} spies The array of `spies`
 * @property {Array<Object>} dependencySpies The array of `dependency spies`
*/
class SpyMock {
  constructor() {
    this.spies = []
    this.dependencySpies = []
  }

  /**
   * Attaches an spy to `attr` inside `object`
   *
   * @param {Object|Function} object The object to attach the spy
   * @param {string} attr The `attr` to spy on
   * @param {*} stub The return/replacement value for `attr`
   * @param {SPY_TYPE} type The `spy` type
   * @param {Boolean} [isAsync = true] Whether the response is `async` or not
   *
   * @return {Object} The attached spy (See [`sinon` spies]{@link https://sinonjs.org/releases/latest/spies/})
  */
  getSpy(object, attr, stub, type = SPY_TYPE.SPY, isAsync = true) {
    const returnFn = this
      ._getReturnFunctionName(isAsync)

    const spy = sinon
      [type](object, attr)
      [returnFn](stub)

    this.spies
      .push(spy)

    return spy
  }

  /**
   * Attaches an spy to `attr` inside `object`
   *
   * @param {(Object|Function)} object The object to attach the spy
   * @param {string} attr The `attr` to spy on
   * @param {SPY_TYPE} type The `spy` type
   *
   * @return {Object} The attached spy (See [`sinon` spies]{@link https://sinonjs.org/releases/latest/spies/})
  */
  getStub(object, attr, type = SPY_TYPE.SPY) {
    const stub = sinon
      [type](object, attr)

    return stub
  }

  /**
   * Mocks the `attr` with an `stub`
   *
   * @param {Object} stub The [`sinon.stub`]{@link https://sinonjs.org/releases/latest/stubs} object
   * @param {*} mock The return/replacement value for `attr`
   * @param {Boolean} isAsync Whether the `mock` is `async` or not
   * @param {Boolean} isAsync Whether the `mock` is an `exception` or not
   *
   * @return {Object} The attached spy (See [`sinon` spies]{@link https://sinonjs.org/releases/latest/spies/})
  */
  addSpy(stub, mock, isAsync = true, isException = false) {
    const returnFn = this
      ._getFunctionName(isAsync, isException)

    const spy = stub[returnFn](mock)

    this.spies.push(spy)

    return spy
  }

  /**
   * Mocks the `attr` with an `stub`
   *
   * @param {Object|Function} object The object to attach the spy
   * @param {string} attr The `attr` to spy on
   * @param {*} mock The return/replacement value for `attr`
   * @param {Boolean} isAsync Whether the response is `async` or not
   *
   * @return {Object} The attached spy (See [`sinon` spies]{@link https://sinonjs.org/releases/latest/spies/})
  */
  addReturnSpy(object, attr, mock, isAsync) {
    const stub = this.getStub(object, attr, 'stub')

    return this
      .addSpy(stub, mock, isAsync)
  }

  /**
   * Mocks the `attr` with an `exception`
   *
   * @param {Object|Function} object The object to attach the spy
   * @param {string} attr The `attr` to spy on
   * @param {Object} exception The `exception` for `attr`
   * @param {Boolean} isAsync Whether the response is `async` or not
   *
   * @return {Object} The attached spy (See [`sinon` spies]{@link https://sinonjs.org/releases/latest/spies/})
  */
  addExceptionSpy(object, attr, exception = Error, isAsync = true) {
    const stub = this.getStub(object, attr, 'stub')

    return this
      .addSpy(stub, exception, isAsync, true)
  }

  /**
   * Attaches an spy to an `import` dependency
   *
   * @param {Object|Function} object The object to attacth the spy
   * @param {string} attr The `attr` to spy on
   * @param {*} stub The return/replacement value for `attr`
   * @param {Boolean} [isAsync = true] Whether the response is `async` or not
   * @param {Boolean} [isException = false] Whether it throws an exception or not
   *
   * @return {Object} The attached spy (See [`rewire`]{@link https://github.com/jhnns/rewire})
  */
  getDependencySpy(object, attr, stub, isAsync = true, isException = false) {
    const returnFn = this
      ._getFunctionName(isAsync, isException)

    const spy = sinon
      .stub()
      [returnFn](stub)

    this.dependencySpies
      .push(
        object
          .__set__(attr, spy)
      )

    return spy
  }

  restoreSpies(spies) {
    return this._restoreSpies(spies)
  }

  restoreDependecySpies(spies) {
    return this._restoreSpies(spies, true)
  }

  /**
   * Restore all spies
  */
  restoreAll() {
    return this
      .restoreSpies()
      .restoreDependecySpies()
  }

  _getReturnFunctionName(isAsync = true) {
    return isAsync ?
      'resolves' :
      'returns'
  }

  _getExceptionFunctionName(isAsync = true) {
    return isAsync ?
      'rejects' :
      'throws'
  }

  _getFunctionName(isAsync = true, isException = false) {
    const method = isException ?
      '_getExceptionFunctionName' :
      '_getReturnFunctionName'

    return this[method](isAsync)
  }

  _restoreSpies(spies, isDependency = false) {
    if (spies && !(spies instanceof Array))
      spies = [spies]

    if (!spies) {
      const spyName = isDependency ?
        'dependencySpies' :
        'spies'

      spies = [].concat(this[spyName])

      this[spyName] = []
    }

    spies
      .forEach(spy => {
        isDependency ?
          spy() :
          spy.restore()
      })

    return this
  }
}

module.exports = new SpyMock()