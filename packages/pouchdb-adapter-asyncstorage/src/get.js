'use strict'

import {
  createError,
  MISSING_DOC } from 'pouchdb-errors'
import { btoa, readAsBinaryString } from 'pouchdb-binary-utils'
import { forDocument, forBinaryAttachment, forSequence } from './keys'

export default function (db, id, opts, callback) {
  const getAttachments = attachments => {
    const getAttachment = attachment => {
      return new Promise((resolve, reject) => {
        db.storage.get(forBinaryAttachment(attachment.digest), (error, data) => {
          if (error) return reject(error)

          if (opts.binary) {
            return resolve({
              digest: attachment.digest,
              content_type: attachment.content_type,
              length: attachment.length,
              data: data
            })
          }

          readAsBinaryString(attachment, binString => {
            return resolve({
              digest: attachment.digest,
              content_type: attachment.content_type,
              length: attachment.length,
              data: btoa(binString)
            })
          })
        })
      })
    }

    const promises = Object.keys(attachments).map(key => {
      const attachment = attachments[key]

      return getAttachment(attachment)
        .then(dataAttachment => {
          attachments[key] = dataAttachment
        })
    })

    return Promise.all(promises)
  }

  db.storage.get(forDocument(id), (error, meta) => {
    if (error || meta === null) {
      return callback(createError(
        MISSING_DOC, error.message || 'missing-read-error'))
    }

    const rev = opts.rev || (meta && meta.rev)
    if (!meta || (meta.deleted && !opts.rev) || !(rev in meta.rev_map)) {
      return callback(createError(MISSING_DOC, 'missing'))
    }

    db.storage.get(forSequence(meta.rev_map[rev]), (error, doc) => {
      if (error) {
        return callback(createError(
          MISSING_DOC, error.message || 'missing-read-error'))
      }

      if (!opts.attachments) return callback(null, {doc, metadata: meta})

      getAttachments(doc._attachments)
        .then(() => callback(null, {doc, metadata: meta}))
        .catch(callback)
    })
  })
}
