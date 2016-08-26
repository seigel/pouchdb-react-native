'use strict'

import { createError, MISSING_DOC, REV_CONFLICT } from 'pouchdb-errors'
import { parseDoc } from 'pouchdb-adapter-utils'
import { merge } from 'pouchdb-merge'

export default function (db, req, opts, callback) {
  const wasDelete = 'was_delete' in opts
  const newEdits = opts.new_edits
  const revsLimit = db.opts.revs_limit || 1000

  const mapRequestDoc = doc => {
    // call shared parseDoc (pouchDB) and reformat it
    const parsedDoc = parseDoc(doc, newEdits)
    const result = {
      id: parsedDoc.metadata.id,
      rev: parsedDoc.metadata.rev,
      writtenRev: parsedDoc.metadata.rev,
      rev_tree: parsedDoc.metadata.rev_tree,
      revs: {}
    }

    result.revs[result.rev] = {
      data: parsedDoc.data,
      deleted: parsedDoc.metadata.deleted
    }

    return result
  }

  const rootIsMissing = doc => doc.rev_tree[0].ids[1].status === 'missing'
  const docsRevsLimit = doc => /^_local/.test(doc.id) ? 1 : revsLimit

  const getChange = (oldDoc, newDoc) => {
    // pouchdb magic, adapted from indexeddb adapter
    if (wasDelete && !oldDoc) {
      return {error: createError(MISSING_DOC, 'deleted')}
    }
    if (newEdits && !oldDoc && rootIsMissing(newDoc)) {
      return {error: createError(REV_CONFLICT)}
    }

    if (oldDoc) {
      // Ignore updates to existing revisions
      if (newDoc.rev in oldDoc.revs) return {}

      const isRoot = /^1-/.test(newDoc.rev)

      // Reattach first writes after a deletion to last deleted tree
      if (oldDoc.deleted && !newDoc.deleted && opts.new_edits && isRoot) {
        var tmp = newDoc.revs[newDoc.rev].data
        tmp._rev = oldDoc.rev
        tmp._id = oldDoc.id
        newDoc = mapRequestDoc(tmp)
      }

      var merged = merge(oldDoc.rev_tree, newDoc.rev_tree[0], docsRevsLimit(newDoc))
      newDoc.stemmedRevs = merged.stemmedRevs
      newDoc.rev_tree = merged.tree

      // Merge the old and new rev data
      const revs = oldDoc.revs
      revs[newDoc.rev] = newDoc.revs[newDoc.rev]
      newDoc.revs = revs

      newDoc.attachments = oldDoc.attachments

      const inConflict = newEdits && (((oldDoc.deleted && newDoc.deleted) ||
         (!oldDoc.deleted && merged.conflicts !== 'new_leaf') ||
         (oldDoc.deleted && !newDoc.deleted && merged.conflicts === 'new_branch')))

      if (inConflict) {
        return {error: createError(REV_CONFLICT)}
      }

      newDoc.wasDeleted = oldDoc.deleted
      return {change: [newDoc.id, newDoc]}
    } else {
      // create
      const merged = merge([], newDoc.rev_tree[0], docsRevsLimit(newDoc))
      newDoc.rev_tree = merged.tree
      newDoc.stemmedRevs = merged.stemmedRevs
      newDoc.isNewDoc = true
      newDoc.wasDeleted = newDoc.revs[newDoc.rev].deleted ? 1 : 0
      return {change: [newDoc.id, newDoc]}
    }
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
    const changes = []
    for (let index = 0; index < newDocs.length; index++) {
      let newDoc = Object.assign({}, newDocs[index])
      const oldDoc = oldDocsObj[newDoc.id]

      const change = getChange(newDoc, oldDoc)
      if (change.error) return callback(change.error)
      if (change.change) changes.push(change.change)
    }

    if (changes.length === 0) return callback()

    db.storage.multiPut(changes, (error, result) => {
      if (error) return callback(createError(error), 'muti_put')

      callback(null, result)
    })
  })
}
