pouchdb-asyncstorage-down
====

Adds an async storage Adapter to the PouchDB + Polifills core-js that PouchDB with leveldown Adapter is running with react-native

Usage
---

You should be able to just do:

    npm install pouchdb-asyncstorage-down --save

Then require it after PouchDB:

```js
const PouchDB = require('pouchdb')
require('pouchdb-asyncstorage-down')

const db = new PouchDB('mydb', {adapter: 'asyncstorage'})

// or import style

import PouchDB from 'pouchdb'
import 'pouchdb-asyncstorage-down'

const db = new PouchDB('mydb', {adapter: 'asyncstorage'})
```

Sample App
---
there is a small example app:
https://github.com/stockulus/pouchdb-asyncstorage-down/tree/master/example

Tests
---
Currently done manually by me, not sure how to easy simulate a running IOS / Android device

Currently working on getting tests running, but a little struggling in running react-native as node tests

Contact
---
Feedback welcome:
Twitter: @stockulus
