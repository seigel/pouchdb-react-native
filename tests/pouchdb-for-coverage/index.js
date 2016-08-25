'use strict'

import PouchDB from '../../packages/pouchdb-react-native'
import ajax from 'pouchdb-ajax'
import utils from '../../pouchdb-original/packages/node_modules/pouchdb-for-coverage/src/utils'
import errors from '../../pouchdb-original/packages/node_modules/pouchdb-for-coverage/src/errors'

PouchDB.ajax = ajax
PouchDB.utils = utils
PouchDB.Errors = errors

PouchDB
  .plugin(require('../../pouchdb-original/packages/node_modules/pouchdb-adapter-memory'))
  .plugin(require('../../pouchdb-original/packages/node_modules/pouchdb-adapter-leveldb'))

// leveldb is required because of `new PouchDB({name: 'local_db', db: memdown})`
// in /pouchdb-original/tests/unit/test.gen-replication-id.js:6
// which resolves in using leveldb adapter
// in /packages/pouchdb-react-native/node_modules/pouchdb-core/lib/index.js:1433

export default PouchDB
