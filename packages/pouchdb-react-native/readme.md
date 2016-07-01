![Logo](https://raw.githubusercontent.com/stockulus/pouchdb-react-native/master/static/pouchdb-react-native.png)

pouchdb-react-native
======

PouchDB, the ReactNative-only edition. A preset representing the PouchDB code that runs in ReactNative, without any of the code required to run it in Node.js.

The `pouchdb-react-native` preset contains the version of PouchDB that is designed for ReactNative. In particular, it ships with the AsyncStorage adapters as its default adapters. It also contains the replication, HTTP, and map/reduce plugins.

### Usage

```bash
npm install pouchdb-react-native --save
```

```js
import PouchDB from 'pouchdb-react-native'
const db = new PouchDB('mydb')

// use PouchDB
db.get('4711')
  .then(doc => console.log(doc))

```

For full API documentation and guides on PouchDB, see [PouchDB.com](http://pouchdb.com/). For details on PouchDB sub-packages, see the [Custom Builds documentation](http://pouchdb.com/custom.html).

### Sample App
there is a small example app:
https://github.com/stockulus/pouchdb-react-native/tree/master/example

---
Twitter: [@stockulus](https://twitter.com/stockulus)

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)
