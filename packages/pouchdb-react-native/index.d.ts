/// <reference types="pouchdb-core" />

declare module "pouchdb-react-native" {
    const pouchdbPlugin: PouchDB.Static;
    export default pouchdbPlugin;
}

declare var PouchDB: PouchDB.Static;
