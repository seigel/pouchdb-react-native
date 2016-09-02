'use strict'

/*
 * Adapted from https://github.com/tradle/asyncstorage-down
 */

import { AsyncStorage } from 'react-native'

function createPrefix (dbName) {
  return dbName.replace(/!/g, '!!') + '!' // escape bangs in dbName
}

function prepareKey (key, core) {
  return core._prefix + key
}

function AsyncStorageCore (dbName) {
  this._prefix = createPrefix(dbName)
}

AsyncStorageCore.prototype.getKeys = function (callback) {
  const keys = []
  const prefix = this._prefix
  const prefixLen = prefix.length

  AsyncStorage.getAllKeys((error, allKeys) => {
    if (error) return callback(error)

    allKeys.forEach(fullKey => {
      if (fullKey.slice(0, prefixLen) === prefix) {
        keys.push(fullKey.slice(prefixLen))
      }
    })

    keys.sort()
    callback(null, keys)
  })
}

AsyncStorageCore.prototype.put = function (key, value, callback) {
  key = prepareKey(key, this)
  AsyncStorage.setItem(key, JSON.stringify(value), callback)
}

AsyncStorageCore.prototype.multiPut = function (pairs, callback) {
  pairs = pairs.map(pair => [prepareKey(pair[0], this), JSON.stringify(pair[1])])
  AsyncStorage.multiSet(pairs)
    .then(result => callback(null, result))
    .catch(callback)
}

AsyncStorageCore.prototype.get = function (key, callback) {
  key = prepareKey(key, this)
  AsyncStorage.getItem(key)
    .then(item => callback(null, JSON.parse(item)))
    .catch(callback)
}

AsyncStorageCore.prototype.multiGet = function (keys, callback) {
  keys = keys.map(key => prepareKey(key, this))

  AsyncStorage.multiGet(keys)
    .then(pairs => callback(null, pairs.map(pair => JSON.parse(pair[1]))))
    .catch(callback)
}

AsyncStorageCore.prototype.multiGetAsObj = function (keys, callback) {
  keys = keys.map(key => prepareKey(key, this))

  AsyncStorage.multiGet(keys)
    .then(pairs => callback(
      null,
      pairs.reduce((result, pair) => {
        result[pair[0].slice(this._prefix.length)] = JSON.parse(pair[1])
        return result
      }, {}))
    )
    .catch(callback)
}

AsyncStorageCore.prototype.remove = function (key, callback) {
  key = prepareKey(key, this)
  AsyncStorage.removeItem(key, callback)
}

AsyncStorageCore.prototype.multiRemove = function (keys, callback) {
  keys = keys.map(key => prepareKey(key, this))
  AsyncStorage.multiRemove(keys, callback)
}

AsyncStorageCore.destroy = function (dbName, callback) {
  const prefix = createPrefix(dbName)
  const prefixLen = prefix.length

  AsyncStorage.getAllKeys((error, keys) => {
    if (error) return callback(error)

    keys = keys.filter(key => key.slice(0, prefixLen) === prefix)
    AsyncStorage.multiRemove(keys, callback)
  })
}

module.exports = AsyncStorageCore
