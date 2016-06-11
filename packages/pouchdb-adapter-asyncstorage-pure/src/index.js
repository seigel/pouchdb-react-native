'use strict'

import './polyfill'
import { changesHandler as ChangesHandler } from 'pouchdb-utils'
import AsyncStorageCore from 'AsyncStorageCore'

// API implementations
import info from './info'
import get from './get'
import getAttachment from './getAttachment'
import bulkDocs from './bulkDocs'
import allDocs from './allDocs'
import changes from './changes'
import getRevisionTree from './getRevisionTree'
import doCompaction from './doCompaction'
import destroy from './destroy'

const ADAPTER_NAME = 'asyncstorage'
const asyncStorageChanges = new ChangesHandler()

// A shared list of database handles
const openDatabases = {}
const getDatabase = (opts) => {
  if (opts.name in openDatabases) {
    return openDatabases[opts.name]
  }

  openDatabases[opts.name] = new Promise((resolve) => {
    const storage = new AsyncStorageCore(opts.name)

    resolve({storage})
  })
}

function AsyncStoragePouch (dbOpts, callback) {
  const api = this
  let metadata = {}

  // This is a wrapper function for any methods that need an
  // active database handle it will recall itself but with
  // the database handle as the first argument
  var $ = function (fun) {
    return function () {
      var args = Array.prototype.slice.call(arguments)
      getDatabase(dbOpts).then(function (res) {
        metadata = res.metadata
        args.unshift(res.idb)
        fun.apply(api, args)
      })
    }
  }

  api.type = () => ADAPTER_NAME

  api._id = $(function (idb, cb) {
    cb(null, metadata.db_uuid)
  })

  api._info = $(function (idb, cb) {
    return info(idb, metadata, cb)
  })

  api._get = $(get)

  api._bulkDocs = $(function (idb, req, opts, callback) {
    return bulkDocs(idb, req, opts, metadata, dbOpts, asyncStorageChanges, callback)
  })

  api._allDocs = $(function (idb, opts, cb) {
    return allDocs(idb, metadata, opts, cb)
  })

  api._getAttachment = $(function (idb, docId, attachId, attachment, opts, cb) {
    return getAttachment(idb, docId, attachId, opts, cb)
  })

  api._changes = $(function (idb, opts) {
    return changes(idb, asyncStorageChanges, api, dbOpts, opts)
  })

  api._getRevisionTree = $(getRevisionTree)
  api._doCompaction = $(doCompaction)

  api._destroy = function (opts, callback) {
    return destroy(dbOpts, openDatabases, asyncStorageChanges, callback)
  }

  api._close = $(function (db, cb) {
    delete openDatabases[dbOpts.name]
    db.close()
    cb()
  })

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
