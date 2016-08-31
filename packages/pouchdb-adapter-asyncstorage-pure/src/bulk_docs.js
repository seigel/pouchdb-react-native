'use strict'

import { createError, generateErrorFromResponse, MISSING_DOC, REV_CONFLICT } from 'pouchdb-errors'
import { parseDoc } from 'pouchdb-adapter-utils'
import { merge } from 'pouchdb-merge'

import { forDocument, forMeta, forSequence } from './keys'

export default function (db, req, opts, callback) {
  const wasDelete = 'was_delete' in opts
  const newEdits = opts.new_edits
  const revsLimit = db.opts.revs_limit || 1000
  const newMeta = {...db.meta}

  const mapRequestDoc = doc => {
    // call shared parseDoc (pouchDB) and reformat it
    const parsedDoc = parseDoc(doc, newEdits)
    const result = {
      id: parsedDoc.metadata.id,
      rev: parsedDoc.metadata.rev,
      rev_tree: parsedDoc.metadata.rev_tree,
      data: parsedDoc.data,
      revs: {}
    }

    result.revs[result.rev] = {
      deleted: parsedDoc.metadata.deleted
    }

    return result
  }

  const getChange = (oldDoc, newDoc) => {
    // pouchdb magic, adapted from indexeddb adapter
    const rootIsMissing = doc => doc.rev_tree[0].ids[1].status === 'missing'

    if (wasDelete && !oldDoc) {
      return {error: createError(MISSING_DOC, 'deleted')}
    }
    if (newEdits && !oldDoc && rootIsMissing(newDoc)) {
      return {error: createError(REV_CONFLICT)}
    }

    if (oldDoc) {
      /* "{
         "id":"C58F6DCD-9451-728C-B7AA-70240F710D9F",
         "rev":"2-ef7df567fdf053c9157696bc932a3c7c",
         "rev_tree":[{"pos":1,"ids":["64899b888295be7d0a2712a69ff0fbfd",{"status":"available"},[["ef7df567fdf053c9157696bc932a3c7c",{"status":"available"},[]]]]}],
         "rev_map":{"1-64899b888295be7d0a2712a69ff0fbfd":1,"2-ef7df567fdf053c9157696bc932a3c7c":2},
         "winningRev":"2-ef7df567fdf053c9157696bc932a3c7c"
         ,"deleted":false,
         "seq":2}" */
      // Ignore updates to existing revisions
      if (newDoc.rev in oldDoc.rev_map) return {}

      const isRoot = /^1-/.test(newDoc.rev)

      // Reattach first writes after a deletion to last deleted tree
      if (oldDoc.deleted && !newDoc.deleted && opts.new_edits && isRoot) {
        newDoc = mapRequestDoc({
          ...newDoc.revs[newDoc.rev].data,
          _id: oldDoc.id,
          _rev: oldDoc.rev
        })
      }

      var merged = merge(oldDoc.rev_tree, newDoc.rev_tree[0], revsLimit)
      newDoc.stemmedRevs = merged.stemmedRevs
      newDoc.rev_tree = merged.tree

      // Merge the old and new rev data
      const revTree = oldDoc.rev_tree
      revTree[newDoc.rev] = newDoc.rev_tree[newDoc.rev]
      newDoc.rev_tree = revTree

      newDoc.attachments = oldDoc.attachments

      const inConflict = newEdits && (((oldDoc.deleted && newDoc.deleted) ||
         (!oldDoc.deleted && merged.conflicts !== 'new_leaf') ||
         (oldDoc.deleted && !newDoc.deleted && merged.conflicts === 'new_branch')))

      if (inConflict) {
        return {error: createError(REV_CONFLICT)}
      }

      if (oldDoc.deleted && !newDoc.deleted) newMeta.doc_count ++
      else if (!oldDoc.deleted && newDoc.deleted) newMeta.doc_count --

      newDoc.seq = ++newMeta.update_seq
      newDoc.rev_map = oldDoc.rev_map
      newDoc.rev_map[newDoc.rev] = newDoc.seq
      newDoc.winningRev = newDoc.rev

      const data = newDoc.data
      delete newDoc.data
      data._id = newDoc.id
      data._rev = newDoc.rev
      return {
        type: newDoc.deleted ? 'DELETE' : 'UPDATE',
        doc: [newDoc.id, newDoc],
        data: [forSequence(newDoc.seq), data]
      }
    } else {
      // create
      const merged = merge([], newDoc.rev_tree[0], revsLimit)
      newDoc.rev_tree = merged.tree
      newDoc.deleted = newDoc.revs[newDoc.rev].deleted
      newDoc.seq = ++newMeta.update_seq
      newDoc.rev_map = {}
      newDoc.rev_map[newDoc.rev] = newDoc.seq
      newDoc.winningRev = newDoc.rev
      if (!newDoc.deleted) newMeta.doc_count ++

      const data = newDoc.data
      delete newDoc.data
      data._id = newDoc.id
      data._rev = newDoc.rev

      return {
        type: 'INSERT',
        doc: [forDocument(newDoc.id), newDoc],
        data: [forSequence(newDoc.seq), data]
      }
    }
  }

  let newDocs
  try {
    newDocs = req.docs.map(mapRequestDoc)
  } catch (error) {
    return callback(generateErrorFromResponse(error))
  }

  const docIds = newDocs.map(doc => forDocument(doc.id))
  db.storage.multiGet(docIds, (error, oldDocs) => {
    if (error) return callback(generateErrorFromResponse(error))

    const oldDocsObj = oldDocs.reduce(
      (result, doc) => {
        if (doc && doc.id) result[doc.id] = doc
        return result
      }, {})

    const changes = []
    for (let index = 0; index < newDocs.length; index++) {
      let newDoc = {...newDocs[index]}
      const oldDoc = oldDocsObj[newDoc.id]

      const change = getChange(oldDoc, newDoc)
      if (change.error) return callback(change.error)
      if (change.doc) changes.push(change)
    }

    if (changes.length === 0) return callback(null, {})

    const dbChanges = changes.map(item => item.doc)
      .concat(changes.map(item => item.data))
    dbChanges.push([forMeta('_local_doc_count'), newMeta.doc_count])
    dbChanges.push([forMeta('_local_last_update_seq'), newMeta.update_seq])

    db.storage.multiPut(dbChanges, error => {
      if (error) return callback(generateErrorFromResponse(error))

      db.meta.doc_count = newMeta.doc_count
      db.meta.update_seq = newMeta.update_seq
      db.changes.notify(db.opts.name)

      callback(null, {})
    })
  })
}
