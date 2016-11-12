'use strict'

import {
  createError,
  generateErrorFromResponse,
  BAD_ARG, BAD_REQUEST, MISSING_DOC, MISSING_STUB, REV_CONFLICT } from 'pouchdb-errors'
import { parseDoc } from 'pouchdb-adapter-utils'
import { merge, winningRev as computeWinningRev } from 'pouchdb-merge'
import Md5 from 'spark-md5'

import { forDocument, forAttachment, forMeta, forSequence } from './keys'

export default function (db, req, opts, callback) {
  const wasDelete = 'was_delete' in opts
  const newEdits = opts.new_edits
  const revsLimit = db.opts.revs_limit || 1000
  const newMeta = {...db.meta}

  const mapRequestDoc = doc => {
    const parsedDoc = parseDoc(doc, newEdits)
    if (!parsedDoc.metadata) throw BAD_REQUEST

    return {
      id: parsedDoc.metadata.id,
      rev: parsedDoc.metadata.rev,
      rev_tree: parsedDoc.metadata.rev_tree,
      deleted: !!parsedDoc.metadata.deleted,
      data: parsedDoc.data
    }
  }

  const processAllAttachments = data => {
    const parseBase64 = data => {
      try {
        return global.atob(data)
      } catch (error) {
        return {
          error: createError(BAD_ARG, 'Attachment is not a valid base64 string')
        }
      }
    }

    const processAttachment = attachment => {
      if (attachment.stub) {
        return new Promise((resolve, reject) => {
          if (!attachment.digest) return reject(createError(MISSING_STUB, 'no digest'))

          db.storage.get(forAttachment(attachment.digest), (error, data) => {
            if (error) return reject(createError(MISSING_STUB, error.message))
            if (!data) return reject(createError(MISSING_STUB, 'can not find attachment'))
            return resolve({attachment, dbAttachment: []})
          })
        })
      }

      let binData
      if (typeof attachment.data === 'string') {
        binData = parseBase64(attachment.data)
        if (binData.error) {
          return Promise.reject(binData.error)
        }
        binData = global.Buffer.from(attachment.data, 'base64')
        binData.type = attachment.content_type
      } else {
        binData = attachment.data
      }

      return new Promise((resolve, reject) => {
        const data = global.btoa(binData)
        const meta = {
          digest: 'md5-' + Md5.hash(data),
          content_type: attachment.content_type || attachment.type,
          length: binData.size || binData.length || 0,
          stub: true
        }

        const dbAttachment = [
          forAttachment(meta.digest), {
            digest: meta.digest,
            content_type: meta.content_type,
            data: data
          }]
        resolve({attachment: meta, dbAttachment})
      })
    }

    if (!data._attachments) return Promise.resolve(null)

    const promises = Object.keys(data._attachments).map(key => {
      if (key.startsWith('_')) {
        return Promise.reject(
          createError(BAD_REQUEST, 'Attachment name can not start with "_"'))
      }
      return processAttachment(data._attachments[key])
        .then(({attachment, dbAttachment}) => {
          data._attachments[key] = attachment
          return dbAttachment
        })
    })

    return Promise.all(promises)
  }

  const getChange = (oldDoc, newDoc) => {
    // pouchdb magic
    const rootIsMissing = doc => doc.rev_tree[0].ids[1].status === 'missing'
    // const getAttachments = () => {}

    const getUpdate = () => {
      // Ignore updates to existing revisions
      if (newDoc.rev in oldDoc.rev_map) return {}

      const merged = merge(oldDoc.rev_tree, newDoc.rev_tree[0], revsLimit)
      newDoc.rev_tree = merged.tree

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
      newDoc.winningRev = computeWinningRev(newDoc)
      newDoc.rev_map[newDoc.rev] = newDoc.seq

      const data = newDoc.deleted ? {_deleted: true} : newDoc.data
      delete newDoc.data
      data._id = newDoc.id
      data._rev = newDoc.rev

      return {
        doc: [forDocument(newDoc.id), newDoc],
        data: [forSequence(newDoc.seq), data],
        result: {
          ok: true,
          id: newDoc.id,
          rev: newDoc.rev
        }
      }
    }
    const getInsert = () => {
      const merged = merge([], newDoc.rev_tree[0], revsLimit)
      newDoc.rev_tree = merged.tree
      newDoc.seq = ++newMeta.update_seq
      newDoc.rev_map = {}
      newDoc.rev_map[newDoc.rev] = newDoc.seq
      newDoc.winningRev = computeWinningRev(newDoc)
      if (!newDoc.deleted) newMeta.doc_count ++

      const data = newDoc.data
      delete newDoc.data
      data._id = newDoc.id
      data._rev = newDoc.rev

      return {
        doc: [forDocument(newDoc.id), newDoc],
        data: [forSequence(newDoc.seq), data],
        result: {
          ok: true,
          id: newDoc.id,
          rev: newDoc.rev
        }
      }
    }

    return new Promise((resolve, reject) => {
      if (wasDelete && !oldDoc) {
        return reject(createError(MISSING_DOC, 'deleted'))
      }
      if (newEdits && !oldDoc && rootIsMissing(newDoc)) {
        return reject(createError(REV_CONFLICT))
      }

      processAllAttachments(newDoc.data)
        .then(attachments => {
          const change = oldDoc ? getUpdate() : getInsert()
          if (change.error) return reject(change.error)
          if (attachments) change.attachments = attachments
          resolve(change)
        })
        .catch(reject)
    })
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

    const promises = newDocs.map(newDoc => {
      let oldDoc = oldDocsObj[newDoc.id]
      oldDoc = typeof oldDoc === 'function' ? undefined : oldDoc

      return getChange(oldDoc, newDoc)
    })
    Promise.all(promises)
      .then(changes => {
        if (changes.length === 0) return callback(null, {})

        const dbChanges = []
        dbChanges.push([forMeta('_local_doc_count'), newMeta.doc_count])
        dbChanges.push([forMeta('_local_last_update_seq'), newMeta.update_seq])

        changes.forEach(change => {
          dbChanges.push(change.doc)
          dbChanges.push(change.data)
          change.attachments && change.attachments.forEach(attachment => {
            if (attachment) dbChanges.push(attachment)
          })
        })

        db.storage.multiPut(dbChanges, error => {
          if (error) return callback(generateErrorFromResponse(error))

          db.meta.doc_count = newMeta.doc_count
          db.meta.update_seq = newMeta.update_seq
          db.changes.notify(db.opts.name)

          callback(null, changes.map(change => change.result))
        })
      })
      .catch(callback)
  })
}
