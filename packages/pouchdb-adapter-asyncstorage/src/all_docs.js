'use strict'

import { generateErrorFromResponse } from 'pouchdb-errors'
import { collectConflicts } from 'pouchdb-merge'
import { getDocumentKeys, toDocumentKeys, forSequence } from './keys'

const getDocs = (db,
  {filterKey, startkey, endkey, skip, limit, inclusiveEnd, includeDeleted},
  callback) => {
  db.storage.getKeys((error, keys) => {
    if (error) return callback(error)

    const filterKeys = getDocumentKeys(keys).filter(key => {
      if (startkey && startkey > key) return false
      if (endkey) return inclusiveEnd ? endkey >= key : endkey > key
      if (filterKey) return filterKey === key

      return true
    })

    db.storage.multiGet(toDocumentKeys(filterKeys), (error, docs) => {
      if (error) return callback(error)

      let result = includeDeleted
        ? docs
        : docs.filter(doc => !doc.deleted)

      if (skip > 0) result = result.slice(skip)
      if (limit >= 0 && result.length > limit) result = result.slice(0, limit)

      let seqKeys = result.map(item => forSequence(item.seq))
      db.storage.multiGet(seqKeys, (error, dataDocs) => {
        if (error) return callback(error)

        const dataObj = dataDocs.reduce(
          (res, data) => {
            if (data) res[data._id] = data
            return res
          }, {})

        callback(null, result.map(item => {
          item.data = dataObj[item.id]
          return item
        }))
      })
    })
  })
}

export default function (db, opts, callback) {
  // get options like pouchdb-adapter-indexeddb
  const startkey = 'startkey' in opts ? opts.startkey : false
  const endkey = 'endkey' in opts ? opts.endkey : false
  const filterKey = 'key' in opts ? opts.key : false
  const skip = opts.skip || 0
  const limit = typeof opts.limit === 'number' ? opts.limit : -1
  const inclusiveEnd = opts.inclusive_end !== false
  const includeDeleted = 'deleted' in opts ? opts.deleted === 'ok' : false
  const includeDoc = 'include_docs' in opts ? opts.include_docs : true
  const descending = 'descending' in opts && opts.descending

  const docToRow = doc => {
    if (includeDoc) {
      return {
        id: doc.id,
        key: doc.id,
        value: {
          rev: doc.rev
        },
        doc: {
          ...doc.data,
          _id: doc.id,
          _rev: doc.rev,
          _conflicts: opts.conflicts ? collectConflicts(doc) : undefined
        }
      }
    }

    return {
      id: doc.id,
      key: doc.id,
      value: {
        rev: doc.rev
      }
    }
  }

  getDocs(db, {filterKey, startkey, endkey, skip, limit, inclusiveEnd, includeDeleted},
    (error, docs) => {
      if (error) return callback(generateErrorFromResponse(error))

      let rows = docs.map(docToRow)
      if (descending) rows = rows.reverse()

      callback(null, {
        total_rows: db.meta.doc_count,
        offset: skip,
        rows
      })
    }
  )
}
