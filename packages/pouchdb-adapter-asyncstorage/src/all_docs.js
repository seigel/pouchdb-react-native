'use strict'

import { generateErrorFromResponse } from 'pouchdb-errors'
import { collectConflicts } from 'pouchdb-merge'
import { getDocumentKeys, toDocumentKeys, forAttachment, forSequence } from './keys'

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
          _conflicts: includeConflicts ? collectConflicts(doc) : undefined
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

  getDocs(db,
    {filterKey, startkey, endkey, skip, limit, excludeStart, inclusiveEnd, includeAttachments, binaryAttachments, includeDeleted},
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
   binaryAttachments
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

        if (!includeAttachments) {
          return callback(null, result.map(item => {
            item.data = dataObj[item.id]
            return item
          }))
        }

        const attachmentKeys = dataDocs.reduce((res, data) => {
          data && data._attachments && Object.keys(data._attachments).forEach(key => {
            res.push(forAttachment(data._attachments[key].digest))
          })
          return res
        }, [])

        db.storage.multiGet(attachmentKeys, (error, attachments) => {
          if (error) return callback(error)

          const attachmentObj = attachments.reduce(
            (res, attachment) => {
              if (attachment) res[attachment.digest] = attachment
              return res
            }, {})

          dataDocs.forEach(doc => {
            doc && doc._attachments && Object.keys(doc._attachments).forEach(key => {
              const newAttachment = attachmentObj[doc._attachments[key].digest]
              if (newAttachment) {
                doc._attachments[key] = newAttachment
                if (binaryAttachments) {
                  doc._attachments[key].data = doc._attachments[key].data
                    ? global.Buffer.from(doc._attachments[key].data, 'base64')
                    : global.Buffer.alloc(0)
                  doc._attachments[key].data.type = doc._attachments[key].content_type
                }
              }
            })
          })

          callback(null, result.map(item => {
            item.data = dataObj[item.id]
            return item
          }))
        })
      })
    })
  })
}
