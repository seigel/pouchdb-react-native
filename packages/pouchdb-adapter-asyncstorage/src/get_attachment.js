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
      callback(null, base64StringToBlobOrBuffer(data, type))
    } else {
      callback(null, data)
    }
  })
}
