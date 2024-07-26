import Selligent from '@selligent-marketing-cloud/selligent-react-native';
import SelligentConstants from '@selligent-marketing-cloud/selligent-react-native/constants';

import {Alert} from 'react-native';

// As Selligent does not provide a way to unsubscribe from events, it is important to only subscribe once. Therefore, we use this singleton service + an 'initialized' check in each method.
class NotificationService {
  private initializedPushNotifications = false;
  private initializedInAppMessages = false;

  public async initialize(): Promise<void> {
    // Only initialize InAppMessages, because the initialization of PushNotifications should be done after the deeplinking handler is set up.
    await this.initializeInAppMessages();

    Selligent.getDeviceId((deviceId: string) => {
      console.log('Selligent device id', deviceId);
    });
  }

  /*
   * Initializes push notifications. This should be called after the deeplinking handler is set up.
   */
  public async initializePushNotifications(): Promise<void> {
    if (this.initializedPushNotifications) {
      return;
    }
    this.initializedPushNotifications = true;
    this.enableSelligentPushNotifications();

    // By default, deeplinks behind push notifications do not work when the App is killed. This is because the JS layer is loaded after the native iOS SDK executes the deeplink, so the JS event listeners are not there yet. To fix this:
    Selligent.executePushAction();
  }

  public login(selligentUserId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      Selligent.sendEvent(
        resolve,
        (error: unknown) => {
          console.error('Selligent login failed', error);
          reject(error);
        },
        {
          type: SelligentConstants.EventType.USER_LOGIN,
          data: {
            IDENTIFIER: selligentUserId,
          },
          // When using a custom identifier, email should be set to an empty string
          email: '',
        },
      );
    });
  }

  public markInAppMessageAsSeen(inAppMessageId: string): void {
    if (!inAppMessageId) {
      return;
    }
    Selligent.setInAppMessageAsSeen(
      () => {},
      (error: unknown) => {
        console.error('Selligent setInAppMessageAsSeen failed', error);
      },
      inAppMessageId,
    );
  }

  public registerInAppMessageButtonClick(inAppMessageId: string, buttonId: string): void {
    Selligent.executeButtonAction(
      () => {},
      (error: unknown) => {
        console.error('Selligent executeButtonAction failed', error);
      },
      buttonId,
      inAppMessageId,
    );
  }

  private enableSelligentPushNotifications(): Promise<void> {
    return new Promise(resolve => {
      Selligent.enableNotifications(
        () => {
          resolve();
        },
        () => {
          console.error('Selligent enableNotifications failed');
          // Swallow error
          resolve();
        },
        true,
      );
    });
  }

  private async initializeInAppMessages(): Promise<void> {
    if (this.initializedInAppMessages) {
      return;
    }
    this.initializedInAppMessages = true;
    try {
      await this.enableInAppMessages();
      this.listenToInAppMessages();
    } catch (error) {
      console.error('Selligent initializeInAppMessages error', error);
    }
  }

  private enableInAppMessages(): Promise<void> {
    return new Promise((resolve, reject) => {
      Selligent.enableInAppMessages(
        () => resolve(),
        (e: unknown) => reject(e),
        true,
      );
    });
  }

  private listenToInAppMessages(): void {
    // This event will be triggered when a 'regular' InApp message (not a Push+InApp) is received
    Selligent.subscribeToEvent(e => {
      console.log('Selligent ReceivedInAppMessage event', e);
      this.onSelligentInAppMessagesReceived();
    }, SelligentConstants.BroadcastEventType.RECEIVED_IN_APP_MESSAGE);

    // This event will be triggered when an InApp+Push message is received and the customInAppUi flag is enabled
    Selligent.subscribeToEvent(e => {
      console.log('Selligent DisplayingInAppMessage event', e);
      this.onSelligentInAppMessagesReceived();
    }, SelligentConstants.BroadcastEventType.DISPLAYING_IN_APP_MESSAGE);
  }

  private async onSelligentInAppMessagesReceived(): Promise<void> {
    try {
      const messagesDetails = await this.getUnseenInAppMessages();
      messagesDetails.forEach(message => {
        Alert.alert('New InApp message', message.title, [
          {
            text: 'OK',
            onPress: () => this.markInAppMessageAsSeen(message.id),
          },
        ]);
      });
    } catch (error) {
      console.error('Selligent onSelligentInAppMessagesReceived error', error);
    }
  }

  private getUnseenInAppMessages(): Promise<SelligentInAppMessage[]> {
    return new Promise((resolve, reject) => {
      try {
        Selligent.getInAppMessages((messages: SelligentInAppMessage[]) => {
          const unseen = messages?.filter(
            message =>
              !message.hasBeenSeen && (!message.expirationDate || new Date(message.expirationDate * 1000) > new Date()),
          );
          resolve(unseen || []);
          console.log(`Selligent getInAppMessages: ${unseen?.length} unseen messages`);
        });
      } catch (e) {
        reject(e);
      }
    });
  }
}

type SelligentInAppMessage = {
  id: string;
  hasBeenSeen: boolean;
  title?: string;
  body?: string; // contains json
  buttons?: SelligentInAppMessageButton[];
  expirationDate?: number; // Expiration date in unix time
  creationDate: number; // Creation date in unix time
};

type SelligentInAppMessageButton = {
  id: string;
  label: string;
  value?: string; // For a button of type DeepLink, this is the deep link URL
  type: number; // SelligentConstants.NotificationButtonType
};

export const notificationService = new NotificationService();
