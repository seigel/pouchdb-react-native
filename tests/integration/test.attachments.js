'use strict'

import { base64StringToBlobOrBuffer } from 'pouchdb-binary-utils'
import jpegB64 from '../__mocks/test-jpeg-as-b64'

const jpegBinary = base64StringToBlobOrBuffer(jpegB64, 'image/jpeg')

/* global describe, it, should, PouchDB */

function buildDocAttachment (attachmentId, data, type = 'text/plain') {
  return {
    _id: 'demo',
    _attachments: {
      [attachmentId]: {
        content_type: type,
        data
      }
    }
  }
}

describe('attachments', function () {
  describe('add b64', function () {
    it('should support inline post', function () {
      const db = new PouchDB('image/jpeg-post')
      return db.post(buildDocAttachment('demo.jpeg', jpegB64, 'image/jpeg'))
        .then(() => db.get('demo', { attachments: true }))
        .then(doc => doc._attachments['demo.jpeg'].data.should.equal(jpegB64))
        .then(() => db.get('demo', { attachments: true, binary: true }))
        .then(doc => jpegBinary.equals(doc._attachments['demo.jpeg'].data).should.equal(true))
    })
    it('should support inline put', function () {
      const db = new PouchDB('image/jpeg-put')
      return db.post({ _id: 'demo' })
        .then(() => db.get('demo'))
        .then(doc => db.put({
          ...doc,
          ...buildDocAttachment('demo.jpeg', jpegB64, 'image/jpeg')
        }))
        .then(() => db.get('demo', { attachments: true }))
        .then(doc => doc._attachments['demo.jpeg'].data.should.equal(jpegB64))
        .then(() => db.get('demo', { attachments: true, binary: true }))
        .then(doc => jpegBinary.equals(doc._attachments['demo.jpeg'].data).should.equal(true))
    })
    it('should support many inline attachments at once', function () {
      const db = new PouchDB('image/jpeg-many')
      return db.post({
        _id: 'demo',
        _attachments: {
          'test-1.jpeg': {
            content_type: 'image/jpeg',
            data: jpegB64
          },
          'test-2.jpeg': {
            content_type: 'image/jpeg',
            data: jpegB64
          },
          'test-3.jpeg': {
            content_type: 'image/jpeg',
            data: jpegB64
          }
        }
      })
        .then(() => db.get('demo', { attachments: true }))
        .then(doc => {
          Object.keys(doc._attachments).length.should.equal(3)
          doc._attachments['test-1.jpeg'].data.should.equal(jpegB64)
          doc._attachments['test-2.jpeg'].data.should.equal(jpegB64)
          doc._attachments['test-3.jpeg'].data.should.equal(jpegB64)
        })
        .then(() => db.get('demo', { attachments: true, binary: true }))
        .then(doc => {
          Object.keys(doc._attachments).length.should.equal(3)
          jpegBinary.equals(doc._attachments['test-1.jpeg'].data).should.equal(true)
          jpegBinary.equals(doc._attachments['test-2.jpeg'].data).should.equal(true)
          jpegBinary.equals(doc._attachments['test-3.jpeg'].data).should.equal(true)
        })
    })
    it('should support putAttachment', function () {
      const db = new PouchDB('image/jpeg-putAttachment')
      return db.post({ _id: 'demo' })
        .then(result => db.putAttachment('demo', 'demo.jpeg', result.rev, jpegB64, 'image/jpeg'))
        .then(() => db.get('demo', { attachments: true }))
        .then(doc => doc._attachments['demo.jpeg'].data.should.equal(jpegB64))
        .then(() => db.get('demo', { attachments: true, binary: true }))
        .then(doc => jpegBinary.equals(doc._attachments['demo.jpeg'].data).should.equal(true))
    })
    it('should fail on empty attachment', function () {
      const db = new PouchDB('image/jpeg-empty')
      return db.post({ _id: 'demo' })
        .then(result => db.putAttachment('demo', 'demo.jpeg', result.rev, null, 'image/jpeg'))
        .catch(error => {
          error.reason.should.equal('Attachment is not a valid buffer/blob')
          error.message.should.equal('Some query argument is invalid')
        })
    })
  })
  describe('add binary', function () {
    it('should support inline post', function () {
      const db = new PouchDB('binary-image/jpeg-post')
      return db.post(buildDocAttachment('demo.jpeg', jpegBinary, 'image/jpeg'))
        .then(() => db.get('demo', { attachments: true }))
        .then(doc => doc._attachments['demo.jpeg'].data.should.equal(jpegB64))
        .then(() => db.get('demo', { attachments: true, binary: true }))
        .then(doc => jpegBinary.equals(doc._attachments['demo.jpeg'].data).should.equal(true))
    })
    it('should support inline put', function () {
      const db = new PouchDB('binary-image/jpeg-put')
      return db.post({ _id: 'demo' })
        .then(() => db.get('demo'))
        .then(doc => db.put({
          ...doc,
          ...buildDocAttachment('demo.jpeg', jpegBinary, 'image/jpeg')
        }))
        .then(() => db.get('demo', { attachments: true }))
        .then(doc => doc._attachments['demo.jpeg'].data.should.equal(jpegB64))
        .then(() => db.get('demo', { attachments: true, binary: true }))
        .then(doc => jpegBinary.equals(doc._attachments['demo.jpeg'].data).should.equal(true))
    })
    it('should support many inline attachments at once', function () {
      const db = new PouchDB('binary-image/jpeg-many')
      return db.post({
        _id: 'demo',
        _attachments: {
          'test-1.jpeg': {
            content_type: 'image/jpeg',
            data: jpegBinary
          },
          'test-2.jpeg': {
            content_type: 'image/jpeg',
            data: jpegBinary
          },
          'test-3.jpeg': {
            content_type: 'image/jpeg',
            data: jpegBinary
          }
        }
      })
        .then(() => db.get('demo', { attachments: true }))
        .then(doc => {
          Object.keys(doc._attachments).length.should.equal(3)
          doc._attachments['test-1.jpeg'].data.should.equal(jpegB64)
          doc._attachments['test-2.jpeg'].data.should.equal(jpegB64)
          doc._attachments['test-3.jpeg'].data.should.equal(jpegB64)
        })
        .then(() => db.get('demo', { attachments: true, binary: true }))
        .then(doc => {
          Object.keys(doc._attachments).length.should.equal(3)
          jpegBinary.equals(doc._attachments['test-1.jpeg'].data).should.equal(true)
          jpegBinary.equals(doc._attachments['test-2.jpeg'].data).should.equal(true)
          jpegBinary.equals(doc._attachments['test-3.jpeg'].data).should.equal(true)
        })
    })
    it('should support putAttachment', function () {
      const db = new PouchDB('binary-image/jpeg-putAttachment')
      return db.post({ _id: 'demo' })
        .then(result => db.putAttachment('demo', 'demo.jpeg', result.rev, jpegBinary, 'image/jpeg'))
        .then(() => db.get('demo', { attachments: true }))
        .then(doc => doc._attachments['demo.jpeg'].data.should.equal(jpegB64))
        .then(() => db.get('demo', { attachments: true, binary: true }))
        .then(doc => jpegBinary.equals(doc._attachments['demo.jpeg'].data).should.equal(true))
    })
  })
  describe('get', function () {
    it('should support getAttachment - ensure returns binary', function () {
      const db = new PouchDB('getAttachment')
      return db.post({ _id: 'demo' })
        .then(result => db.putAttachment('demo', 'demo.jpeg', result.rev, jpegBinary, 'image/jpeg'))
        .then(() => db.getAttachment('demo', 'demo.jpeg'))
        .then(attachment => jpegBinary.equals(attachment).should.equal(true))
    })
  })
  describe('updating docs with attachments', function () {
    it('should retrieve doc with attachment', function () {
      const data = global.Buffer.from('some data here', 'utf8').toString('base64')
      data.should.equal('c29tZSBkYXRhIGhlcmU=')

      const utf8db = new PouchDB('getDocWithAttachments')
      return utf8db.post(buildDocAttachment('demo.txt', data))
        .then(() => utf8db.get('demo', { attachments: true }))
        .then(doc => doc._attachments['demo.txt'].data.should.equal(data))
    })
    it('should retrieve doc with stub attachment', function () {
      const data = global.Buffer.from('some data here', 'utf8').toString('base64')
      data.should.equal('c29tZSBkYXRhIGhlcmU=')

      const utf8db = new PouchDB('getDocWithoutAttachments')
      return utf8db.post(buildDocAttachment('demo.txt', data))
        .then(() => utf8db.get('demo', { attachments: false }))
        .then(doc => {
          should.not.exist(doc._attachments['demo.txt'].data)
          doc._attachments['demo.txt'].stub.should.equal(true)
        })
    })
    it('should keep attachments when updating a doc fetched with attachments', function () {
      const data = global.Buffer.from('some data here', 'utf8').toString('base64')
      data.should.equal('c29tZSBkYXRhIGhlcmU=')

      const utf8db = new PouchDB('getDocWithAttachmentsAndUpdate')
      return utf8db.post(buildDocAttachment('demo.txt', data))
        .then(() => utf8db.get('demo', { attachments: true }))
        .then(doc => utf8db.put({ ...doc, title: 'add some new data' }))
        .then(() => utf8db.get('demo', { attachments: true }))
        .then(doc => doc._attachments['demo.txt'].data.should.equal(data))
    })
    it('should keep attachments when updating a doc fetched without attachments', function () {
      const data = global.Buffer.from('some data here', 'utf8').toString('base64')
      data.should.equal('c29tZSBkYXRhIGhlcmU=')

      const utf8db = new PouchDB('getDocWithoutAttachmentsAndUpdate')
      return utf8db.post(buildDocAttachment('demo.txt', data))
        .then(() => utf8db.get('demo', { attachments: false }))
        .then(doc => utf8db.put({ ...doc, title: 'add some new data' }))
        .then(() => utf8db.get('demo', { attachments: true }))
        .then(doc => doc._attachments['demo.txt'].data.should.equal(data))
    })
  })
})
