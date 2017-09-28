![Logo](https://raw.githubusercontent.com/stockulus/pouchdb-react-native/master/static/pouchdb-react-native.png)

pouchdb-adapter-asyncstorage
======

PouchDB adapter using AsyncStorage as its data store. Designed to run in ReactNative. Its adapter name is `'asyncstorage'`.

[![bitHound Overall Score](https://www.bithound.io/github/stockulus/pouchdb-react-native/badges/score.svg)](https://www.bithound.io/github/stockulus/pouchdb-react-native) [![npm Package](https://img.shields.io/npm/dm/pouchdb-adapter-asyncstorage.svg)](https://www.npmjs.com/package/pouchdb-adapter-asyncstorage) [![npm Package](https://img.shields.io/npm/v/pouchdb-adapter-asyncstorage.svg)](https://www.npmjs.com/package/pouchdb-adapter-asyncstorage) [![travis-ci.org](https://travis-ci.org/stockulus/pouchdb-react-native.svg)](https://travis-ci.org/stockulus/pouchdb-react-native) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![license](https://img.shields.io/npm/l/pouchdb-adapter-asyncstorage.svg?maxAge=2592000)](https://opensource.org/licenses/MIT)

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

### Android limit

On Android asyncstorage has a limitation of 6 MB per default, you might want to increase it

```java
// MainApplication.getPackages()
long size = 50L * 1024L * 1024L; // 50 MB
com.facebook.react.modules.storage.ReactDatabaseSupplier.getInstance(getApplicationContext()).setMaximumSize(size);
```

For full API documentation and guides on PouchDB, see [PouchDB.com](http://pouchdb.com/). For details on PouchDB sub-packages, see the [Custom Builds documentation](http://pouchdb.com/custom.html).

---
[![Twitter URL](https://img.shields.io/twitter/url/http/shields.io.svg?style=social&maxAge=2592000)](https://twitter.com/stockulus) [![GitHub stars](https://img.shields.io/github/stars/stockulus/pouchdb-react-native.svg?style=social&label=Star)](https://github.com/stockulus/pouchdb-react-native)
