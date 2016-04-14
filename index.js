'use strict'

const downAdapter = require('asyncstorage-down')

const pouchdb = require('pouchdb')

module.exports = pouchdb.defaults({db: downAdapter})
