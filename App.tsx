/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useCallback, useEffect, useState} from 'react';
import {Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text} from 'react-native';
import {notificationPermissionService} from './src/notifications/services/notificationPermissionService';

function App(): React.JSX.Element {
  const [hasPermission, setHasPermission] = useState<boolean>();

  const requestNotificationPermission = useCallback(async () => {
    const permissionResult = await notificationPermissionService.hasNotificationPermission();

    if (permissionResult) {
      return true;
    }

    const {granted, cannotRequest} = await notificationPermissionService.requestNotificationPermission();
    if (cannotRequest) {
      Alert.alert(
        'Permission error',
        'Notification permission cannot be requested. Manually enable it in the settings',
      );
    }
    return granted;
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const permissionResult = await requestNotificationPermission();
      setHasPermission(permissionResult);
    };
    initialize();
  }, [requestNotificationPermission]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.scrollView}>
        <Text style={styles.title}>Welcome to SelligentPOC</Text>
        <Text style={{textAlign: 'center'}}>
          {hasPermission === undefined
            ? 'Initializing...'
            : hasPermission
            ? 'Ready to receive Push and InApp messages'
            : 'App does not have permission for push notifications. Only InApp messages are supported.'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingBottom: 20,
  },
});

export default App;
