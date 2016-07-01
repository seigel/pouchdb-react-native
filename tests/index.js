import 'react-native-mock/mock'

import test from 'tape'
import Pouchdb from 'pouchdb-react-native'

test('simple test', (assert) => {
  const db = new Pouchdb('test')

  db.remove('123')
    .catch(() => {})
    .then(() => db.put({_id: '123', test: 'test'}))
    .then(() => db.get('123'))
    .then(doc => {
      assert.equal(doc._id, '123')
      assert.equal(doc.test, 'test')
      assert.end()
    })
    .catch(error => assert.error(error))
})
