'use strict'

const test = require('tape')

const PouchDB = require('pouchdb')
require('../index')

const db = new PouchDB('testdb', {adapter: 'asyncstorage'})

test('basic post', (assert) => {
  db.post({test: 'test'})
    .then((result) => {
      assert.ok(result.ok, 'Post Ok')
      assert.end()
    })
    .catch((error) => assert.error(error))
})
