'use strict'

global.Buffer = global.Buffer || require('buffer').Buffer

if (!process.version) process.version = 'v0.10'
process.nextTick = process.nextTick || setImmediate

const downAdapter = require('asyncstorage-down')
const pluginBase = require('./pouchdb_level_adapter')

const adapterConfig = {
  name: 'asyncstorage',
  valid: function () {
    return true
  },
  use_prefix: false
}

pluginBase(adapterConfig, downAdapter)
