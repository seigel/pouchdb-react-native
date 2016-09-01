'use strict'

import { uuid } from 'pouchdb-utils'

import { getDocumentKeys, toDocumentKeys, forSequence } from './keys'

const getDocs = (db,
  {lastSeq, limit, docIds},
  callback) => {
  db.storage.getKeys((error, keys) => {
    if (error) return callback(error)

    const filterKeys = getDocumentKeys(keys).filter(key => {
      if (docIds) return docIds.has(key)

      return true
    })

    db.storage.multiGet(toDocumentKeys(filterKeys), (error, docs) => {
      if (error) return callback(error)

      let result = docs.filter(doc => !doc.deleted)

      if (lastSeq) result = result.filter(doc => doc.seq > lastSeq)
      if (limit > 0 && result.length > limit) result = result.slice(0, limit)

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

export default function (db, api, opts) {
  const continuous = opts.continuous

  console.warn('changes', opts)
  if (continuous) {
    const id = db.opts.name + ':' + uuid()
    db.changes.addListener(db.opts.name, id, api, opts)
    db.changes.notify(db.opts.name)
    return {
      cancel () {
        db.changes.removeListener(db.opts.name, id)
      }
    }
  }

//  const descending = opts.descending
  const lastSeq = opts.since || 0
  const limit = ('limit' in opts && opts.limit > 0)
    ? opts.limit
    : null
  const docIds = opts.doc_ids && new Set(opts.doc_ids)
/*  const returnDocs = ('return_docs' in opts)
    ? opts.return_docs
    : 'returnDocs' in opts
      ? opts.returnDocs
      : true
*/
//  let cancelled = false
  return {
    cancel: function () {
//      cancelled = true
      getDocs(db, {lastSeq, limit, docIds}, (error, result) => {
        if (error) console.warn(error)
      })
    }
  }
}
