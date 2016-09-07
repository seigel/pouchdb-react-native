'use strict'

import { changesHandler as ChangesHandler, uuid } from 'pouchdb-utils'

import AsyncStorageCore from './asyncstorage_core'
import { forMeta, toMetaKeys } from './keys'

// A shared list of database handles
const openDatabases = {}

export const get = opts => new Promise((resolve, reject) => {
  const resolveResult = meta => {
    const result = {
      storage,
      meta: {
        db_uuid: meta[0],
        doc_count: meta[1],
        update_seq: meta[2]
      },
      opts,
      changes: new ChangesHandler()
    }

    openDatabases[opts.name] = result
    resolve(result)
  }

  if (opts.name in openDatabases) {
    return resolve(openDatabases[opts.name])
  }

  const storage = new AsyncStorageCore(opts.name)

  storage.multiGet(toMetaKeys([
    '_local_uuid', '_local_doc_count', '_local_last_update_seq'
  ]), (error, meta) => {
    if (error) return reject(error)

    if (meta[0]) return resolveResult(meta)

    const id = uuid()
    storage.multiPut([
      [forMeta('_local_uuid'), id],
      [forMeta('_local_doc_count'), 0],
      [forMeta('_local_last_update_seq'), 0]],
      (error) => {
        if (error) return reject(error)

        resolveResult([id, 0, 0])
      }
    )
  })
})

export const close = name => {
  delete openDatabases[name]
}
