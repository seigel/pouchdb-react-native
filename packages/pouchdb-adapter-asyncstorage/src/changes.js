'use strict'

import { uuid, filterChange } from 'pouchdb-utils'
import { forDocument, getSequenceKeys, toSequenceKeys } from './keys'

export default function (db, api, opts) {
  const continuous = opts.continuous

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
  const returnDocs = ('return_docs' in opts)
    ? opts.return_docs
    : 'returnDocs' in opts
      ? opts.returnDocs
      : true
  const filter = filterChange(opts)
  const complete = opts.complete
  const onChange = opts.onChange
  const processChange = opts.processChange

  db.storage.getKeys((error, keys) => {
    if (error) return complete(error)

    const filterSeqs = getSequenceKeys(keys).filter(seq => {
      if (lastSeq) return seq > lastSeq

      return true
    })

    if (filterSeqs.length === 0) return complete(null, [])

    db.storage.multiGet(toSequenceKeys(filterSeqs), (error, dataDocs) => {
      if (error) return complete(error)

      const filterDocs = docIds
        ? dataDocs.filter(doc => docIds.has(doc._id))
        : dataDocs
      if (filterDocs.length === 0) return complete(null, [])

      db.storage.multiGet(filterDocs.map(data => forDocument(data._id)), (error, docs) => {
        if (error) return complete(error)

        const dataObj = filterDocs.reduce(
          (res, data) => {
            if (data) res[data._id] = data
            return res
          }, {})

        const results = []
        let lastChangeSeq
        for (let index = 0; index < docs.length; index++) {
          if (limit && results.length > limit) break

          const doc = docs[index]
          const data = dataObj[doc.id]
          const change = processChange(data, doc, opts)
          change.seq = doc.seq

          const filtered = filter(change)
          if (typeof filtered === 'object') {
            return complete(filtered)
          }
          if (filtered) {
            if (returnDocs) {
              // correct Position???
              change.changes[0].data = data
            }

            lastChangeSeq = change.seq
            results.push(change)
            onChange(change)
          }
        }

        complete(null, {
          results,
          last_seq: lastChangeSeq
        })
      })
    })
  })
}
