'use strict'

import React from 'react'
import {
  StyleSheet,
  Text,
  View
} from 'react-native'

export default React.createClass({
  render () {
    return (
      <View style={styles.container}>
        <Text>Here is the example</Text>
      </View>
    )
  }
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  }
})
