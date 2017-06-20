'use strict'

/* global describe, it, PouchDB */

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

const utf8String = '😷🤒🤕😈👿👹👺💩👻💀☠️👽👾🤖🎃😺😸😹'
const latin1String = '&¡¢£¤¥¦§¨©ª«¬&®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ'

describe.skip('attachments', function () {
  describe('decoding/encoding', function () {
    it('encoding utf8String', function () {
      const b64 = global.Buffer.from(utf8String, 'utf8').toString('base64')
      b64.should.equal('8J+Yt/CfpJLwn6SV8J+YiPCfkb/wn5G58J+RuvCfkqnwn5G78J+SgOKYoO+4j/Cfkb3wn5G+8J+klvCfjoPwn5i68J+YuPCfmLk=')
    })
    it('encoding latin1String', function () {
      const b64 = global.Buffer.from(latin1String, 'latin1').toString('base64')
      b64.should.equal('JqGio6SlpqeoqaqrrCaur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/')
    })
    it('should account for characters in utf8 character encoding on new doc', function () {
      // const b64 = global.Buffer.from(utf8String, 'utf8').toString('base64')
      const utf8db = new PouchDB('utf8Attachments')
      return utf8db.post(buildDocAttachment(utf8String))
        .then(ignore => utf8db.get('demo', { attachments: true }))
        .then(doc => doc._attachments['demo.txt'].data.should.equal('8J+Yt/CfpJLwn6SV8J+YiPCfkb/wn5G58J+RuvCfkqnwn5G78J+SgOKYoO+4j/Cfkb3wn5G+8J+klvCfjoPwn5i68J+YuPCfmLk='))
    })
    it('should account for characters in latin1 character encoding on new doc', function () {
      // const b64 = global.Buffer.from(latin1String, 'utf8').toString('base64')
      const utf8db = new PouchDB('latin1Attachments')
      return utf8db.post(buildDocAttachment(latin1String))
        .then(ignore => utf8db.get('demo', { attachments: true }))
        .then(doc => doc._attachments['demo.txt'].data.should.equal('JsKhwqLCo8KkwqXCpsKnwqjCqcKqwqvCrCbCrsKvwrDCscKywrPCtMK1wrbCt8K4wrnCusK7wrzCvcK+wr/DgMOBw4LDg8OEw4XDhsOHw4jDicOKw4vDjMONw47Dj8OQw5HDksOTw5TDlcOWw5fDmMOZw5rDm8Ocw53DnsOfw6DDocOiw6PDpMOlw6bDp8Oow6nDqsOrw6zDrcOuw6/DsMOxw7LDs8O0w7XDtsO3w7jDucO6w7vDvMO9w77Dvw=='))
    })
  })
})
