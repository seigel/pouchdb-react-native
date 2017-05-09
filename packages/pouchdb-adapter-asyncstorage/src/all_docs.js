'use strict'

import { generateErrorFromResponse } from 'pouchdb-errors'
import { collectConflicts } from 'pouchdb-merge'
import { getDocumentKeys, toDocumentKeys, forSequence } from './keys'
import inlineAttachments from './inline_attachments'

export default function (db, opts, callback) {
  // get options like pouchdb-adapter-indexeddb
  const filterKey = 'key' in opts ? opts.key : false
  const skip = opts.skip || 0
  const limit = typeof opts.limit === 'number' ? opts.limit : -1
  const includeDeleted = 'deleted' in opts ? opts.deleted === 'ok' : false
  const includeDoc = 'include_docs' in opts ? opts.include_docs : true
  const includeAttachments = 'attachments' in opts ? opts.attachments : false
  const binaryAttachments = 'binary' in opts ? opts.binary : false
  const includeConflicts = 'conflicts' in opts ? opts.conflicts : false
  const descending = 'descending' in opts && opts.descending
  const startkey = descending
    ? 'endkey' in opts ? opts.endkey : false
    : 'startkey' in opts ? opts.startkey : false
  const endkey = descending
    ? 'startkey' in opts ? opts.startkey : false
    : 'endkey' in opts ? opts.endkey : false
  const excludeStart = descending && !(opts.inclusive_end !== false)
  const inclusiveEnd = descending || opts.inclusive_end !== false

  const docToRow = doc => {
    const result = {
      id: doc.id,
      key: doc.id,
      value: {
        deleted: doc.deleted,
        rev: doc.winningRev
      }
    }

    if (includeDoc && !doc.deleted) {
      result.doc = {
        ...doc.data,
        _id: doc.id,
        _rev: doc.winningRev
      }

      if (includeConflicts) {
        result.doc._conflicts = collectConflicts(doc)
      }
    }

    return result
  }

  getDocs(db,
    {filterKey, startkey, endkey, skip, limit, excludeStart, inclusiveEnd, includeAttachments, binaryAttachments, includeDeleted, descending},
    (error, docs) => {
      if (error) return callback(generateErrorFromResponse(error))

      let rows = docs.map(docToRow)

      callback(null, {
        total_rows: db.meta.doc_count,
        offset: skip,
        rows
      })
    }
  )
}

const getDocs = (db,
  {filterKey,
   startkey,
   endkey,
   skip,
   limit,
   excludeStart,
   inclusiveEnd,
   includeDeleted,
   includeAttachments,
   binaryAttachments,
   descending
 },
  callback) => {
  db.storage.getKeys((error, keys) => {
    if (error) return callback(error)

    const filterKeys = getDocumentKeys(keys).filter(key => {
      if (startkey && startkey > key) return false
      if (excludeStart && startkey && startkey === key) return false
      if (endkey) return inclusiveEnd ? endkey >= key : endkey > key
      if (filterKey) return filterKey === key

      return true
    })

    db.storage.multiGet(toDocumentKeys(filterKeys), (error, docs) => {
      if (error) return callback(error)

      let result = includeDeleted
        ? docs
        : docs.filter(doc => !doc.deleted)

      if (descending) result = result.reverse()
      if (skip > 0) result = result.slice(skip)
      if (limit >= 0 && result.length > limit) result = result.slice(0, limit)

      let seqKeys = result.map(item => {
        return forSequence(item.rev_map[item.winningRev])
      })
      db.storage.multiGet(seqKeys, (error, dataDocs) => {
        if (error) return callback(error)

        const dataObj = dataDocs.reduce(
          (res, data) => {
            if (data) res[data._id] = data
            return res
          }, {})

        if (!includeAttachments) {
          return callback(null, result.map(item => {
            item.data = dataObj[item.id]
            return item
          }))
        }

        inlineAttachments(db, dataDocs, {binaryAttachments}, (error) => {
          if (error) return callback(error)

          return callback(null, result.map(item => {
            item.data = dataObj[item.id]
            return item
          }))
        })
      })
    })
  })
}
