'use strict'

/* global describe, it, PouchDB */
describe('react-native.test.issue40.js', function () {
  it('similar results after syncing in different order', function () {
    const sourceDb1 = new PouchDB('sourceDb1')
    const sourceDb2 = new PouchDB('sourceDb2')
    const localDest1 = new PouchDB('localDest')
    const localDest2 = new PouchDB('localDest2')

    return Promise
      .resolve()
      .then(() => Promise
        .all([
          sourceDb1.put({ _id: '1', foo: 'bar' }),
          sourceDb2.put({ _id: '1', bar: 'baz' })
        ])
      )
      .then(() => Promise
        .all([
          sourceDb1.replicate.to(localDest1),
          sourceDb2.replicate.to(localDest1),
          sourceDb2.replicate.to(localDest2),
          sourceDb1.replicate.to(localDest2)
        ])
      )
      .then(() => Promise
        .all([
          sourceDb1.get('1'),
          sourceDb2.get('1'),
          localDest1.get('1'),
          localDest2.get('1')
        ])
      )
      .then(([ sourceDoc1, sourceDoc2, destDoc1, destDoc2 ]) => {
        sourceDoc1._rev.should.not.equal(sourceDoc2._rev, 'Source docs need different revs for test to work')
        destDoc1._rev.should.equal(destDoc2._rev, 'Destination docs have different revs')

        return Promise
          .all([
            localDest1.allDocs(),
            localDest2.allDocs()
          ])
      })
      .then(([ res1, res2 ]) => {
        res1.rows[0].value.rev.should.equal(res2.rows[0].value.rev, 'allDocs should be equal')
      })
  })
})
