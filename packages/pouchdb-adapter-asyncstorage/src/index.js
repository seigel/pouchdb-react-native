'use strict'

import './polyfill'

// API implementations
import allDocs from './all_docs'
import bulkDocs from './bulk_docs'
import changes from './changes'
import destroy from './destroy'
import doCompaction from './do_compaction'
import get from './get'
import getAttachment from './get_attachment'
import getRevisionTree from './get_revision_tree'
import info from './info'

import { get as getDatabase, close as closeDatabase } from './databases'

const ADAPTER_NAME = 'asyncstorage'

function AsyncStoragePouch (dbOpts, constuctorCallback) {
  const api = this

  api._remote = false
  api.type = () => ADAPTER_NAME

  api._id = callback => {
    getDatabase(dbOpts)
      .then(database => sequence(cb => cb(null, database.meta.db_uuid), callback))
      .catch(callback)
  }
  api._info = callback => {
    getDatabase(dbOpts)
      .then(database => sequence(cb => info(database, cb), callback))
      .catch(callback)
  }
  api._get = (id, opts, callback) => {
    getDatabase(dbOpts)
      .then(database => sequence(cb => get(database, id, opts, cb), callback))
      .catch(callback)
  }
  api._getAttachment = (docId, attachId, attachment, opts, callback) => {
    getDatabase(dbOpts)
      .then(database => sequence(cb => getAttachment(database, docId, attachId, attachment, opts, cb), callback))
      .catch(callback)
  }
  api._getRevisionTree = (id, callback) => {
    getDatabase(dbOpts)
      .then(database => sequence(cb => getRevisionTree(database, id, cb), callback))
      .catch(callback)
  }
  api._allDocs = (opts, callback) => {
    getDatabase(dbOpts)
      .then(database => sequence(cb => allDocs(database, opts, cb), callback))
      .catch(callback)
  }
  api._bulkDocs = (req, opts, callback) => {
    getDatabase(dbOpts)
      .then(database => sequence(cb => bulkDocs(database, req, opts, cb), callback))
      .catch(callback)
  }
  api._changes = opts => {
    getDatabase(dbOpts)
      .then(database => sequence(cb => {
        changes(database, api, opts)
        cb()
      }))
      .catch(error => opts.complete && opts.complete(error))
  }
  api._doCompaction = (id, revs, callback) => {
    getDatabase(dbOpts)
      .then(database => sequence(cb => doCompaction(database, id, revs, cb), callback))
      .catch(callback)
  }
  api._destroy = (opts, callback) => {
    getDatabase(dbOpts)
      .then(database => sequence(cb => destroy(database, opts, cb), callback))
      .catch(callback)
  }
  api._close = callback => {
    sequence(cb => {
      closeDatabase(dbOpts.name)
      cb()
    }, callback)
  }

  constuctorCallback(null, api)

  const queue = []
  let isRunning = false
  const sequence = (func, callback) => {
    const run = () => {
      if (isRunning || queue.length === 0) return

      isRunning = true
      const task = queue.shift()
      setImmediate(() => {
        task.func((error, result) => {
          task.callback && task.callback(error, result)
          isRunning = false
          run()
        })
      })
    }

    queue.push({func, callback})
    run()
  }
}

AsyncStoragePouch.valid = () => {
  try {
    return require('react-native').AsyncStorage !== null
  } catch (error) {
    return false
  }
}

AsyncStoragePouch.use_prefix = false

export default function (PouchDB) {
  PouchDB.adapter(ADAPTER_NAME, AsyncStoragePouch, true)
}
