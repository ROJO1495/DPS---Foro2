import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import LoginWidget from './src/components/LoginWidget';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <LoginWidget />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
  },
});

export default App;