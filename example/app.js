'use strict'

import React from 'react'
import {
  ListView,
  Navigator,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View
} from 'react-native'

import ActionButton from 'react-native-action-button'
import PouchDB from 'pouchdb-react-native'

const localDB = new PouchDB('myDB')
console.log(localDB.adapter)

// import { AsyncStorage } from 'react-native'
// AsyncStorage.getAllKeys((error, keys) => console.log(keys))

export default React.createClass({
  getInitialState () {
    const updateDocs = () => {
      localDB.allDocs({include_docs: true, limit: null})
        .then(result => {
          const items = result.rows.map(row => row.doc)
          const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1.id !== r2.id})
          this.setState({
            dataSource: ds.cloneWithRows(items)})
        })
        .catch(error => console.warn('Could not load Documents', error, error.message))
    }

    localDB.changes({since: 'now', live: true})
      .on('change', () => updateDocs())

    updateDocs()

    return {
      dataSource: null,
      syncUrl: ''
    }
  },
  _renderMain () {
    const { dataSource } = this.state

    const renderSeparator = (sectionID, rowID) => (
      <View
        key={rowID}
        style={{borderColor: '#969A99', borderBottomWidth: StyleSheet.hairlineWidth}} />
    )

    const renderRow = (row) => (
      <View key={row._id}>
        <Text style={{fontWeight: 'bold'}}>{row._id}</Text>
        <Text>{JSON.stringify(row, null, 4)}</Text>
      </View>
    )

    const renderList = () => (
      <ListView
        dataSource={dataSource}
        renderRow={renderRow}
        renderSeparator={renderSeparator}
        enableEmptySections />
    )

    return (
      <View style={{flex: 1}}>
        {!dataSource
          ? (<Text>Loading...</Text>)
          : renderList()
        }
        <ActionButton buttonColor='#78B55E'>
          <ActionButton.Item
            buttonColor='#005BFF'
            title='Add Item'
            onPress={() => this._navigator.push({name: 'AddItem', render: this._renderAddItem})}>
            <Text>+</Text>
          </ActionButton.Item>
          <ActionButton.Item
            buttonColor='#005BFF'
            title='Sync'
            onPress={() => this._navigator.push({name: 'Sync', render: this._renderSync})}>
            <Text>sync</Text>
          </ActionButton.Item>
        </ActionButton>
      </View>
    )
  },
  _renderSync () {
    const addSync = () => {
      if (this._sync) {
        this._sync.cancel()
        this._sync = null
      }

      if (this.state.syncUrl) {
        const remoteDb = new PouchDB(this.state.syncUrl, {ajax: {cache: false}})
        this._sync = PouchDB.sync(localDB, remoteDb, {live: true, retry: true})
          .on('error', error => console.error('Sync Error', error))
          .on('change', info => console.log('Sync change', info))
          .on('paused', info => console.log('Sync paused', info))
      }

      this._navigator.pop()
    }

    return (
      <View style={{flex: 1}}>
        <TextInput
          style={{
            height: 40,
            lineHeight: 40,
            fontSize: 16,
            paddingLeft: 10,
            paddingRight: 10
          }}
          autoFocus
          keyboardType='url'
          clearButtonMode='always'
          placeholder='enter URL'
          onChangeText={(text) => this.setState({syncUrl: text})}
          value={this.state.syncUrl} />
        {this._renderButton('Add Sync', addSync)}
      </View>
    )
  },
  _renderAddItem () {
    const addItem = () => {
      localDB.post(JSON.parse(this.state.newItem))
        .then(result => {
          this.setState({newItem: ''})
          this._navigator.pop()
        })
        .catch(error => console.error('Error during create Item', error))
    }

    return (
      <View style={{flex: 1}}>
        <TextInput
          style={{
            height: 340,
            lineHeight: 40,
            fontSize: 16,
            paddingLeft: 10,
            paddingRight: 10
          }}
          autoFocus
          clearButtonMode='always'
          multiline
          placeholder='JSON Object here'
          onChangeText={(text) => this.setState({newItem: text})}
          value={this.state.newItem} />
        {this._renderButton('Add Item', addItem)}
      </View>
    )
  },
  _renderButton (text, onPress) {
    return (
      <TouchableHighlight
        onPress={onPress}
        style={{
          flexDirection: 'column',
          paddingTop: 3,
          paddingBottom: 3,
          marginLeft: 10,
          marginRight: 10,
          backgroundColor: '#78B55E',
          borderRadius: 5
        }}>
        <Text
          style={{
            flex: 1,
            fontSize: 18,
            fontWeight: 'bold',
            color: '#FFFFFF',
            paddingLeft: 10,
            paddingRight: 10,
            paddingTop: 2,
            alignSelf: 'center'
          }}>
          {text}
        </Text>
      </TouchableHighlight>
    )
  },
  _renderScene (route, navigator) {
    return (
      <View style={{flex: 1, marginTop: 20, backgroundColor: '#FFFFFF'}}>
        {route.render()}
      </View>
    )
  },
  render () {
    return (
      <View style={{flex: 1}}>
        <Navigator
          ref={(navigator) => { this._navigator = navigator }}
          renderScene={this._renderScene}
          initialRoute={{name: 'Main', render: this._renderMain}}
        />
      </View>
    )
  }
})
