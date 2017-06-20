'use strict'

import { createError, MISSING_DOC } from 'pouchdb-errors'
import { base64StringToBlobOrBuffer } from 'pouchdb-binary-utils'
import { forAttachment } from './keys'

export default function (db, docId, attachId, attachment, opts, callback) {
  const digest = attachment.digest
  const type = attachment.content_type

  db.storage.get(forAttachment(digest), (error, attachmentData) => {
    if (error) {
      return callback(createError(
        MISSING_DOC, error.message || 'missing-read-error'))
    }

    const data = attachmentData.data
    if (opts.binary) {
      try {
        if (typeof Blob === 'undefined') {
          callback(null, base64StringToBlobOrBuffer(data, type))
        } else {
          /* global Blob */
          const bluffer = new Blob(data, {type})
          if (bluffer.isRNFetchBlobPolyfill) {
            bluffer.onCreated(() => {
              callback(null, bluffer)
            })
          } else {
            callback(null, bluffer)
          }
        }
      } catch (e) {
        callback(e)
      }
    } else {
      callback(null, data)
    }
  })
}
