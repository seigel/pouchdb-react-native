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
  var keys = []
  var prefix = this._prefix
  var prefixLen = prefix.length

  AsyncStorage.getAllKeys((error, allKeys) => {
    if (error) return callback(error)

    allKeys.forEach((fullKey) => {
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
  AsyncStorage.setItem(key, value, callback)
}

AsyncStorageCore.prototype.multiPut = function (pairs, callback) {
  var self = this
  pairs.forEach((pair) => {
    pair[0] = prepareKey(pair[0], self)
  })

  AsyncStorage.multiSet(pairs, callback)
}

AsyncStorageCore.prototype.get = function (key, callback) {
  key = prepareKey(key, this)
  AsyncStorage.getItem(key, callback)
}

AsyncStorageCore.prototype.multiGet = function (keys, callback) {
  var self = this
  keys = keys.map((key) => {
    return prepareKey(key, self)
  })

  AsyncStorage.multiGet(keys)
    .then(function (pairs) {
      callback(null, pairs.map((pair) => pair[1]))
    })
    .catch(callback)
}

AsyncStorageCore.prototype.remove = function (key, callback) {
  key = prepareKey(key, this)
  AsyncStorage.removeItem(key, callback)
}

AsyncStorageCore.prototype.multiRemove = function (keys, callback) {
  keys = keys.map((key) => prepareKey(key, this))
  AsyncStorage.multiRemove(keys, callback)
}

AsyncStorageCore.destroy = function (dbName, callback) {
  var prefix = createPrefix(dbName)
  var prefixLen = prefix.length

  AsyncStorage.getAllKeys((error, keys) => {
    if (error) return callback(error)

    keys = keys.filter((key) => key.slice(0, prefixLen) === prefix)
    AsyncStorage.multiRemove(keys, callback)
  })
}

module.exports = AsyncStorageCore
