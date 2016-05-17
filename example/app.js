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

import PouchDB from 'pouchdb'
import 'pouchdb-asyncstorage-down'

const localDB = new PouchDB('mydb', {adapter: 'asyncstorage'})

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
        .catch(error => console.error('Could not load Documents', error))
    }

    localDB.changes({
      since: 'now',
      live: true
    }).on('change', () => updateDocs())

    updateDocs()

    return {
      dataSource: null
    }
  },
  renderMain () {
    const { dataSource } = this.state

    const renderSeparator = (sectionID, rowID) => (
      <View
        key={rowID}
        style={{borderColor: '#969A99', borderBottomWidth: StyleSheet.hairlineWidth
      }} />)

    const renderRow = (row) => (
      <View key={row._id}>
        <Text style={{fontWeight: 'bold'}}>{row._id}</Text>
        <Text>{JSON.stringify(row, null, 4)}</Text>
      </View>
    )

    return (
      <View style={{flex: 1}}>
        {!dataSource
          ? (<Text>Loading...</Text>)
          : (<ListView
               dataSource={dataSource}
               renderRow={renderRow}
               renderSeparator={renderSeparator}
               enableEmptySections />)
        }
        <ActionButton buttonColor='#78B55E'>
          <ActionButton.Item
             buttonColor='#005BFF'
             title='Add Item'
             onPress={() => this._navigator.push({name: 'AddItem', render: this.renderAddItem})}>
            <Text>+</Text>
          </ActionButton.Item>
        </ActionButton>
      </View>
    )
  },
  renderAddItem () {
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
        <TouchableHighlight
          onPress={addItem}
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
            Add
          </Text>
        </TouchableHighlight>
      </View>
    )
  },
  renderScene (route, navigator) {
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
          renderScene={this.renderScene}
          initialRoute={{name: 'Main', render: this.renderMain}}
        />
      </View>
    )
  }
})
