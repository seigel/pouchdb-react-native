'use strict'

import { createError } from 'pouchdb-errors'
import { parseDoc } from 'pouchdb-adapter-utils'

const processChanges = (db, newDocs, oldDocs, callback) => {
  callback()
}

export default function (db, req, {new_edits, was_delete}, callback) {
  //  const revsLimit = db.opts.revs_limit || 1000

  // call shared parseDoc (pouchDB) and reformat it
  const mapRequestDoc = doc => {
    const parsedDoc = parseDoc(doc, new_edits)
    const result = {
      id: parsedDoc.metadata.id,
      rev: parsedDoc.metadata.rev,
      rev_tree: parsedDoc.metadata.rev_tree,
      revs: {}
    }

    result.revs[result.rev] = {
      data: parsedDoc.data,
      deleted: parsedDoc.metadata.deleted
    }

    return result
  }

  let newDocs
  try {
    newDocs = req.docs.map(mapRequestDoc)
  } catch (error) {
    return callback(createError(error, 'parse_input'))
  }

  db.storage.multiGet(newDocs.map(doc => doc.id), (error, oldDocs) => {
    if (error) return callback(createError(error, 'muti_get'))

    const oldDocsObj = oldDocs.reduce((result, doc) => { result[doc.id] = doc }, {})

    processChanges(db, newDocs, oldDocsObj, (error, result) => {
      if (error) return callback(createError(error, 'process_changes'))

      callback(null, result)
    })
  })
}
