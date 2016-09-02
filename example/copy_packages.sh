#!/usr/bin/env bash
echo "Copy packages"
cp ../packages/pouchdb-react-native/*.* ./node_modules/pouchdb-react-native
cp ../packages/pouchdb-adapter-asyncstorage/*.* ./node_modules/pouchdb-adapter-asyncstorage
cp ../packages/pouchdb-adapter-asyncstorage/src/*.* ./node_modules/pouchdb-adapter-asyncstorage/src
