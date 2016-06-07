pouchdb-adapter-localstorage
======

PouchDB adapter using AsyncStorage as its data store. Designed to run in ReactNative. Its adapter name is `'asyncstorage'`.

### Usage

```bash
npm install pouchdb-adapter-asyncstorage --save
```

```js
PouchDB.plugin(require('pouchdb-adapter-asyncstorage'))
var db = new PouchDB('mydb', {adapter: 'asyncstorage'})
```

For full API documentation and guides on PouchDB, see [PouchDB.com](http://pouchdb.com/). For details on PouchDB sub-packages, see the [Custom Builds documentation](http://pouchdb.com/custom.html).
