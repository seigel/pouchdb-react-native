![Logo](https://raw.githubusercontent.com/stockulus/pouchdb-react-native/master/static/pouchdb-react-native.png)

pouchdb-adapter-localstorage
======

PouchDB adapter using AsyncStorage as its data store. Designed to run in ReactNative. Its adapter name is `'asyncstorage'`.

### Usage

```bash
npm install pouchdb-adapter-asyncstorage --save
```

```js
import PouchDB from 'pouchdb-core'
PouchDB.plugin(require('pouchdb-adapter-asyncstorage').default)
const db = new PouchDB('mydb', {adapter: 'asyncstorage'})

// use PouchDB
db.get('4711')
  .then(doc => console.log(doc))

```

For full API documentation and guides on PouchDB, see [PouchDB.com](http://pouchdb.com/). For details on PouchDB sub-packages, see the [Custom Builds documentation](http://pouchdb.com/custom.html).

---
Twitter: [@stockulus](https://twitter.com/stockulus)

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)
