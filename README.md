# Generic service for operations on redis cache

[![CircleCI](https://circleci.com/gh/contartec/generic-model-bookshelf.svg?style=shield&circle-token=21e695f1398a24c2a7387f71cf5b33ebac7893e3)](https://circleci.com/gh/contartec-team/generic-redis-cache)
[![Maintainability](https://api.codeclimate.com/v1/badges/26df8aa208935c7fd638/maintainability)](https://codeclimate.com/github/contartecTeam/generic-redis-cache/maintainability)
[![Test Coverage](https://codecov.io/gh/contartec-team/generic-redis-cache/branch/master/graph/badge.svg)](https://codecov.io/gh/contartec-team/generic-redis-cache)


## Install

`npm i @contartec-team/generic-redis-cache`

## Quick-start

```js
app/
  caches/
  models/
  index.js
```

```js
// index.js (aka bootstrap/init file)
// Pass the `redis` instance
require('@contartec-team/generic-redis-cache/lib/configs/redisInstanceService')(redis)
```

```js
// caches/DogCache.js
const Dog = require('../models/Dog')
const GenericRedisCache = require('@contartec-team/generic-redis-cache')
const RedisKeyTypeEnum = require('@contartec-team/generic-redis-cache/lib/enums/RedisKeyTypeEnum')

const GENERIC_REDIS_ATTRS = {
  keyName     : 'people:{?}:dogs:{?}',
  type        : RedisKeyTypeEnum.JSON,
  ids         : [
    { id: 'peopleId' },
    { id: 'name' }
  ],
  idNull      : 'null',
  idUndefined : 'undefined'
}

class DogCache extends GenericRedisCache {
  static getDB (key) {
    // Used to fetch the model from `db`
    // key = { peopleId: ?, name: ? }
    const dog = await Dog.findById(key)

    return dog
  }

  static getListDB (keys) {
    // Used to fetch the model's list from `db`
    // key = [ { peopleId: ?, name: ? }, ... ]
  }
}

// Dogs in `db`
const randomDogs = [
  {
    id        : 1,
    guardianId: 10,
    name      : 'Hun',
    weight    : 10
  },
  {
    id        : 2,
    guardianId: 10,
    name      : 'Kora',
    weight    : 13
  },
  {
    id        : 3,
    guardianId: 30,
    name      : 'Molo',
    weight    : 42
  },
  {
    id        : 4,
    guardianId: 40,
    name      : 'Quaza',
    weight    : 23
  },
  {
    id        : 5,
    guardianId: 50,
    name      : 'Kora',
    weight    : 5
  },
]

Dog
  .get({ name: 'Kora', guardianId: 50 })
// Calls Dog.getDB
// JSON.SET guardian:50:dogs:Kora
// { id: 5, guardianId: 50, name: 'Kora', weight: 5 }

Dog
  .getCache({ name: 'Molo', guardianId: 30 })
// JSON.GET guardian:30:dogs:Molo NOESCAPE .
// null

Dog
  .setList(randomDogs)
// JSON.SET guardian:10:dogs:Hun ; JSON.SET guardian:20:dogs:Kora ; ...
// [ { id: 1, name: 'Hun', ... }, { id: 2, name: 'Kora', ... }, ... ]

Dog
  .getCache({ name: 'Kora', guardianId: 10 })
// JSON.GET guardian:10:dogs:Kora NOESCAPE .
// { id: 1, guardianId: 10, name: 'Kora', weight: 13 }

```

## Docs

https://contartecteam.github.io/generic-redis-cache/