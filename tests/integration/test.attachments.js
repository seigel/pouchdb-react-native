'use strict'

/* global describe, it, should, PouchDB */

function buildDocAttachment (data) {
  return {
    _id: 'demo',
    _attachments: {
      'demo.txt': {
        content_type: 'text/plain',
        data
      }
    }
  }
}

describe('attachments', function () {
  describe('updating docs with attachments', function () {
    it('should retrieve doc with attachment', function () {
      const data = global.Buffer.from('some data here', 'utf8').toString('base64')
      data.should.equal('c29tZSBkYXRhIGhlcmU=')

      const utf8db = new PouchDB('getDocWithAttachments')
      return utf8db.post(buildDocAttachment(data))
        .then(ignore => utf8db.get('demo', { attachments: true }))
        .then(doc => doc._attachments['demo.txt'].data.should.equal(data))
    })
    it('should retrieve doc with stub attachment', function () {
      const data = global.Buffer.from('some data here', 'utf8').toString('base64')
      data.should.equal('c29tZSBkYXRhIGhlcmU=')

      const utf8db = new PouchDB('getDocWithoutAttachments')
      return utf8db.post(buildDocAttachment(data))
        .then(ignore => utf8db.get('demo', { attachments: false }))
        .then(doc => {
          should.not.exist(doc._attachments['demo.txt'].data)
          doc._attachments['demo.txt'].stub.should.equal(true)
        })
    })
    it('should keep attachments when updating a doc fetched with attachments', function () {
      const data = global.Buffer.from('some data here', 'utf8').toString('base64')
      data.should.equal('c29tZSBkYXRhIGhlcmU=')

      const utf8db = new PouchDB('getDocWithAttachmentsAndUpdate')
      return utf8db.post(buildDocAttachment(data))
        .then(ignore => utf8db.get('demo', { attachments: true }))
        .then(doc => utf8db.put({ ...doc, title: 'add some new data' }))
        .then(() => utf8db.get('demo', { attachments: true }))
        .then(doc => doc._attachments['demo.txt'].data.should.equal(data))
    })
    it('should keep attachments when updating a doc fetched without attachments', function () {
      const data = global.Buffer.from('some data here', 'utf8').toString('base64')
      data.should.equal('c29tZSBkYXRhIGhlcmU=')

      const utf8db = new PouchDB('getDocWithoutAttachmentsAndUpdate')
      return utf8db.post(buildDocAttachment(data))
        .then(ignore => utf8db.get('demo', { attachments: false }))
        .then(doc => utf8db.put({ ...doc, title: 'add some new data' }))
        .then(() => utf8db.get('demo', { attachments: true }))
        .then(doc => doc._attachments['demo.txt'].data.should.equal(data))
    })
  })
})
