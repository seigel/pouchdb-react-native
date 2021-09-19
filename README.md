![Logo](https://raw.githubusercontent.com/seigel/pouchdb-react-native/master/static/pouchdb-react-native.png)

[![npm Package](https://img.shields.io/npm/dm/pouchdb-react-native.svg)](https://www.npmjs.com/package/pouchdb-react-native) [![npm Package](https://img.shields.io/npm/v/pouchdb-react-native.svg)](https://www.npmjs.com/package/pouchdb-react-native) [![travis-ci.org](https://travis-ci.org/seigel/pouchdb-react-native.svg)](https://travis-ci.org/seigel/pouchdb-react-native) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![license](https://img.shields.io/npm/l/pouchdb-react-native.svg?maxAge=2592000)](https://opensource.org/licenses/MIT)



NEWS
======
Hello!  Welcome to pouchdb-react-native.  I am James and have been lucky enough to been entrusted with the care and feeding
of this repository.  I am going to work on getting it functional again with the latest pouchdb AND react native versions using
a little help from @craftzdog's work to fill the the gaps.  Please be patient and offer bug reports and patches through 
the Issues system here.  I am just getting my feet settled.  Looking forward to working with you.

Cheers

pouchdb-react-native
======

PouchDB, the React Native-only edition. A preset representing the PouchDB code that runs in React Native.

The `pouchdb-react-native` preset contains the version of PouchDB that is designed for React Native. In particular, it
ships with the AsyncStorage adapter as its default adapter. It also contains the replication, HTTP, and map/reduce plugins.

### Usage

```bash
npm install pouchdb-react-native --save
```

npm >= 3 / node >= 6 works best, there are some known issues with npm 2

### PouchDB 7.0

```bash
npm install pouchdb-react-native@next --save
```

```js
import PouchDB from 'pouchdb-react-native'

const db = new PouchDB('mydb')

// use PouchDB
db.get('4711')
  .then(doc => console.log(doc))

```

For full API documentation and guides on PouchDB, see [PouchDB.com](http://pouchdb.com/).

### Sample App

there is a small example app:
https://github.com/seigel/pouchdb-react-native/tree/master/example

pouchdb-adapter-asyncstorage
======

PouchDB adapter using AsyncStorage as its data store. Designed to run in React Native. Its adapter name
is `'asyncstorage'`.

### Usage

```bash
npm install pouchdb-adapter-asyncstorage --save
```

```js
import PouchDB from 'pouchdb-core'

PouchDB.plugin(require('pouchdb-adapter-asyncstorage').default)
const db = new PouchDB('mydb', { adapter: 'asyncstorage' })

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

### Known Issues

There are still problems with attachments. Currently, there is work being done on them. See
(https://github.com/seigel/pouchdb-react-native/issues/68)

Development
======

```bash
git clone https://github.com/seigel/pouchdb-react-native.git
cd pouchdb-react-native
git submodule init
git submodule update
npm install
npm test
cd example
npm run ios

```

---
[![Twitter URL](https://img.shields.io/twitter/url/http/shields.io.svg?style=social&maxAge=2592000)](https://twitter.com/cgul) [![GitHub stars](https://img.shields.io/github/stars/seigel/pouchdb-react-native.svg?style=social&label=Star)](https://github.com/seigel/pouchdb-react-native)
