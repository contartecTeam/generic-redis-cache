Generic service for operations on redis keys

[![CircleCI](https://circleci.com/gh/contartec/generic-model-bookshelf.svg?style=shield&circle-token=21e695f1398a24c2a7387f71cf5b33ebac7893e3)](https://circleci.com/gh/contartec-team/generic-redis-cache)
[![Maintainability](https://api.codeclimate.com/v1/badges/26df8aa208935c7fd638/maintainability)](https://codeclimate.com/github/contartecTeam/generic-redis-cache/maintainability)
[![Test Coverage](https://codecov.io/gh/contartec-team/generic-redis-cache/branch/master/graph/badge.svg)](https://codecov.io/gh/contartec-team/generic-redis-cache)


## Install

`npm i @contartec-team/generic-redis-cache`

## Quick-start

```js
app/
  queries/
  script.js
  index.js
```

```js
// index.js (aka bootstrap/init file)
// Pass the `redis` instance
require('@contartec-team/generic-redis-cache/lib/configs/redisInstanceService')(redis)
```

```js
// your_cache_service.js
const GenericRedisCache = require('@contartec-team/generic-redis-cache')
const RedisKeyTypeEnum = require('@contartec-team/generic-redis-cache/lib/enums/RedisKeyTypeEnum')

const KEY_NAME = 'key:{?}'

const TYPE = RedisKeyTypeEnum.JSON //or any type in the enums

//An array with all the ids to compose the path of the key as objets
const IDS = [{
  id: 'some_id'
  undefinedValue: 'something_undefined' //any value to replace the key when undefined is passed
  nullValue: 'something_null' //any value to replace the key when null is passed
}]

class YourCacheService extends GenericRedisCache {
   constructor (object) {
    super(KEY_NAME, TYPE, IDS)
  }

  static get KEY_NAME()             { return KEY_NAME }
  static get ID()                  { return IDS }
  static get TYPE()                { return TYPE }

  get KEY_NAME()            { return KEY_NAME }
  get ID()                  { return IDS }
  get TYPE()                { return TYPE }

}

module.exports = YourCacheService

```

## Docs

https://contartecteam.github.io/generic-redis-cache/