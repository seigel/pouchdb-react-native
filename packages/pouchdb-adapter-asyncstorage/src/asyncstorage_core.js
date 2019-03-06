'use strict'

/*
 * Adapted from https://github.com/tradle/asyncstorage-down
 */

import { AsyncStorage } from 'react-native'
import { safeJsonParse, safeJsonStringify } from 'pouchdb-json'


let AsyncStorageRocksDB
try {
  AsyncStorageRocksDB = require('react-native-async-storage-rocks').default
} finally {
  // Fall back to regular AsyncStorage
}


function createPrefix(dbName) {
  return dbName.replace(/!/g, '!!') + '!' // escape bangs in dbName
}

function prepareKey(key, core) {
  key = key
    .replace(/\u0002/g, '\u0002\u0002')
    .replace(/\u0001/g, '\u0001\u0002')
    .replace(/\u0000/g, '\u0001\u0001')

  if (AsyncStorageRocksDB) {
    key = key.replace(/ÿ/g, '\u0003') // RocksDB can't handle ÿ
  }

  return core._prefix + key
}

function unescapeKey(key) {
  key = key
    .replace(/\u0001\u0001/g, '\u0000')
    .replace(/\u0001\u0002/g, '\u0001')
    .replace(/\u0002\u0002/g, '\u0002')

  if (AsyncStorageRocksDB) {
    key = key.replace(/\u0003/g, 'ÿ')
  }

  return key
}

function AsyncStorageCore(dbName) {
  this._prefix = createPrefix(dbName)
}

AsyncStorageCore.prototype.getKeys = function(callback) {
  const keys = []
  const prefix = this._prefix
  const prefixLen = prefix.length

  if (AsyncStorageRocksDB) {

    // getAllKeysWithPrefix is dramatically more memory efficient if there are other items
    // stored that are not part of the current database (eg other databases or app data).
    // getAllKeys causes memory to increase linearly with the total number of keys.
    AsyncStorageRocksDB.getAllKeysWithPrefix(prefix, (error, allKeys) => {
      if (error) return callback(error)

      allKeys.forEach(fullKey => keys.push(unescapeKey(fullKey)))
    })

  } else {

    AsyncStorage.getAllKeys((error, allKeys) => {
      if (error) return callback(error)

      allKeys.forEach(fullKey => {
        if (fullKey.slice(0, prefixLen) === prefix) {
          keys.push(unescapeKey(fullKey.slice(prefixLen)))
        }
      })
    })
  }
  
  keys.sort()
  callback(null, keys)
}

const stringifyValue = value => {
  if (value === null) return ''
  if (value === undefined) return ''

  return safeJsonStringify(value)
}

AsyncStorageCore.prototype.put = function(key, value, callback) {
  key = prepareKey(key, this)
  AsyncStorage.setItem(key, stringifyValue(value), callback)
}

AsyncStorageCore.prototype.multiPut = function(pairs, callback) {
  pairs = pairs.map(pair => [
    prepareKey(pair[0], this),
    stringifyValue(pair[1])
  ])
  AsyncStorage.multiSet(pairs)
    .then(result => callback(null, result))
    .catch(callback)
}

const parseValue = value => {
  if (typeof value === 'string') return safeJsonParse(value)
  return null
}

AsyncStorageCore.prototype.get = function(key, callback) {
  key = prepareKey(key, this)
  AsyncStorage.getItem(key)
    .then(item => callback(null, parseValue(item)))
    .catch(callback)
}

AsyncStorageCore.prototype.multiGet = function(keys, callback) {
  keys = keys.map(key => prepareKey(key, this))

  AsyncStorage.multiGet(keys)
    .then(pairs => callback(null, pairs.map(pair => parseValue(pair[1]))))
    .catch(callback)
}

AsyncStorageCore.prototype.remove = function(key, callback) {
  key = prepareKey(key, this)
  AsyncStorage.removeItem(key, callback)
}

AsyncStorageCore.prototype.multiRemove = function(keys, callback) {
  keys = keys.map(key => prepareKey(key, this))
  AsyncStorage.multiRemove(keys, callback)
}

AsyncStorageCore.destroy = function(dbName, callback) {
  const prefix = createPrefix(dbName)
  const prefixLen = prefix.length

  AsyncStorage.getAllKeys((error, keys) => {
    if (error) return callback(error)

    keys = keys.filter(key => key.slice(0, prefixLen) === prefix)
    AsyncStorage.multiRemove(keys, callback)
  })
}

module.exports = AsyncStorageCore