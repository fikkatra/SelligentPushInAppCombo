import {
  checkNotifications,
  PermissionStatus,
  requestNotifications,
} from 'react-native-permissions';

class NotificationPermissionService {
  public async requestNotificationPermission(): Promise<{
    granted: boolean;
    cannotRequest: boolean;
  }> {
    try {
      let permission: PermissionStatus;
      permission = (await requestNotifications([])).status;

      return {
        granted: permission === 'granted',
        cannotRequest: permission === 'blocked',
      };
    } catch (e) {
      console.warn(`Permissions could not be set:\n${JSON.stringify(e)}`);
      return {granted: false, cannotRequest: true};
    }
  }

  public async hasNotificationPermission(): Promise<boolean> {
    try {
      const permissionStatus = (await checkNotifications()).status;
      return permissionStatus === 'granted';
    } catch (e) {
      console.error(`Permissions could not be checked:\n${JSON.stringify(e)}`);
      return false;
    }
  }
}

export const notificationPermissionService =
  new NotificationPermissionService();
