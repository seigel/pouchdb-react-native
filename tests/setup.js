'use strict'

const path = require('path')

const pouchDir = path.resolve(__dirname, '/../pouchdb-original/packages/node_modules')

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

const reqPouch = () => _require(require.resolve('./pouchdb-for-coverage/')).default
const reqPouchModule = name => _require(require.resolve(`../pouchdb-original/packages/node_modules/${name}`))

const map = fs
  .readdirSync(path.resolve(__dirname, '/../pouchdb-original/packages/node_modules'))
  .reduce((total, name) => {
    total[name] = reqPouchModule.bind(null, name)
    return total
  }, {
    '../../packages/node_modules/pouchdb-for-coverage': reqPouch,
    '../../packages/node_modules/pouchdb': reqPouch
  })

Module.prototype.require = function patchedRequire (name) {
  const callback = map[name]

  if (callback) {
    return callback()
  }

  return _require.call(this, name)
}

require('../pouchdb-original/tests/integration/node.setup.js')
