'use strict'

import { btoa, readAsBinaryString } from 'pouchdb-binary-utils'
import { createError, MISSING_DOC } from 'pouchdb-errors'
import keys from './keys'

export default function (db, docId, attachId, attachment, opts, callback) {
  db.storage.get(keys.forDocument(docId), (error, doc) => {
    if (error) {
      return callback(createError(
        MISSING_DOC, error.message || 'missing-read-error'))
    }

    const rev = opts.rev ? doc.revs[opts.rev].data : doc.data
    const digest = rev._attachments[attachId].digest

    if (opts.binary) {
      return callback(null, doc.attachments[digest].data)
    }

    readAsBinaryString(doc.attachments[digest].data, binString => {
      callback(null, btoa(binString))
    })
  })
}
