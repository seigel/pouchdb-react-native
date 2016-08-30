'use strict'

import './polyfill'

// API implementations
import allDocs from './all_docs'
import get from './get'
import getAttachment from './get_attachment'
import getRevisionTree from './get_revision_tree'
import bulkDocs from './bulk_docs'
import changes from './changes'
import doCompaction from './do_compaction'
import info from './info'
import destroy from './destroy'

import { get as getDatabase, close as closeDatabase } from './databases'

const ADAPTER_NAME = 'asyncstorage'

function AsyncStoragePouch (dbOpts, callback) {
  const api = this

  // This is a wrapper function for any methods that need an
  // active database handle it will recall itself but with
  // the database handle as the first argument
  const $ = function (fun) {
    return function () {
      var args = Array.prototype.slice.call(arguments)
      getDatabase(dbOpts).then(database => {
        args.unshift(database)
        console.log('$', args, fun.toString())
        fun.apply(api, args)
      })
    }
  }

  api.type = () => ADAPTER_NAME

  api._id = $(({meta}, cb) => cb(null, meta.db_uuid))
  api._info = $(info)

  api._get = $(get)
  api._getRevisionTree = $(getRevisionTree)
  api._getAttachment = $(getAttachment)

  api._bulkDocs = $(bulkDocs)
  api._allDocs = $(allDocs)
  api._changes = $(changes)

  api._doCompaction = $(doCompaction)
  api._destroy = $(destroy)

  api._close = cb => {
    closeDatabase(dbOpts.name)
    cb()
  }

  callback(null, api)
}

AsyncStoragePouch.valid = () => {
  try {
    return require('react-native').AsyncStorage !== null
  } catch (error) {
    return false
  }
}

export default function (PouchDB) {
  PouchDB.adapter(ADAPTER_NAME, AsyncStoragePouch, true)
}
