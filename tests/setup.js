'use strict'

/* eslint-disable */

const pouchDir = require('path').resolve(__dirname + '/../pouchdb-original/packages/node_modules')

require('babel-register')({
  presets: ['react-native'],
  ignore: name => {
    return name.indexOf('node_modules') > -1 && name.indexOf(pouchDir) !== 0
  }
})

require('react-native-mock/mock')

const fs = require('fs')
const Module = require('module')

const _require = Module.prototype.require

const reqPouch = () => _require.call(null, require.resolve('./pouchdb-for-coverage/')).default
const reqPouchModule = name => _require.call(null, require.resolve(`../pouchdb-original/packages/node_modules/${name}`))
const reqAdapter = () => _require.call(null, require.resolve('../packages/pouchdb-adapter-asyncstorage')).default
const reqAdapterPure = () => _require.call(null, require.resolve('../packages/pouchdb-adapter-asyncstorage-pure')).default
const reqLevelAdapter = () => _require.call(null, require.resolve('../packages/pouchdb-adapter-leveldb-core-rn')).default

const map = fs
  .readdirSync(__dirname + '/../pouchdb-original/packages/node_modules')
  .reduce((total, name) => {
    total[name] = reqPouchModule.bind(null, name)
    return total
  }, {
    '../../packages/node_modules/pouchdb-for-coverage': reqPouch,
    '../../packages/node_modules/pouchdb': reqPouch,
    'pouchdb-adapter-asyncstorage': reqAdapter,
    'pouchdb-adapter-asyncstorage-pure': reqAdapterPure,
    'pouchdb-adapter-leveldb-core-rn': reqLevelAdapter
  })

Module.prototype.require = function patchedRequire (name) {
  const callback = map[name]

  if (callback) {
    return callback()
  }
  return _require.call(this, name)
}

require('../pouchdb-original/tests/integration/node.setup.js')
