'use strict'

import PouchDB from 'pouchdb-core'
import AsyncStoragePouch from 'pouchdb-adapter-asyncstorage'
import HttpPouch from 'pouchdb-adapter-http'
import mapreduce from 'pouchdb-mapreduce'
import replication from 'pouchdb-replication'

PouchDB
  .plugin(AsyncStoragePouch)
  .plugin(HttpPouch)
  .plugin(mapreduce)
  .plugin(replication)

export default PouchDB
