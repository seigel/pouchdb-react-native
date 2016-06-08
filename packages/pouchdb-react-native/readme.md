pouchdb-react-native
======

PouchDB, the ReactNative-only edition. A preset representing the PouchDB code that runs in ReactNative, without any of the code required to run it in Node.js.

The `pouchdb-react-native` preset contains the version of PouchDB that is designed for ReactNative. In particular, it ships with the AsyncStorage adapters as its default adapters. It also contains the replication, HTTP, and map/reduce plugins.

Use this preset if you only want to use PouchDB in ReactNative,
and don't want to use it in Node.js. (E.g. to avoid installing LevelDB.)

### Usage

```bash
npm install pouchdb-react-native --save
```

```js
import PouchDB from 'pouchdb-react-native'
const db = new PouchDB('mydb')
```

For full API documentation and guides on PouchDB, see [PouchDB.com](http://pouchdb.com/). For details on PouchDB sub-packages, see the [Custom Builds documentation](http://pouchdb.com/custom.html).

---
Feedback welcome:
Twitter: [@stockulus](https://twitter.com/stockulus)
