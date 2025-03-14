import { Row, Spin, Typography, Button } from 'antd';
import React, { FC, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { accessTokenAtom, clientConfigStateAtom } from '../../stores/ClientConfigStore';
import {
  registerWebPushNotifications,
  saveNotificationRegistration,
} from '../../../services/notifications-service';
import styles from './BrowserNotifyModal.module.scss';
import isPushNotificationSupported from '../../../utils/browserPushNotifications';

const { Title } = Typography;

const NotificationsNotSupported = () => (
  <div>Browser notifications are not supported in your browser.</div>
);

export type PermissionPopupPreviewProps = {
  start: () => void;
};

const PermissionPopupPreview: FC<PermissionPopupPreviewProps> = ({ start }) => (
  <div id="browser-push-preview-box" className={styles.pushPreview}>
    <div className={styles.inner}>
      <div className={styles.title}>{window.location.toString()} wants to</div>
      <div className={styles.permissionLine}>
        <svg
          className={styles.bell}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 12.3333V13H2V12.3333L3.33333 11V7C3.33333 4.93333 4.68667 3.11333 6.66667 2.52667C6.66667 2.46 6.66667 2.4 6.66667 2.33333C6.66667 1.97971 6.80714 1.64057 7.05719 1.39052C7.30724 1.14048 7.64638 1 8 1C8.35362 1 8.69276 1.14048 8.94281 1.39052C9.19286 1.64057 9.33333 1.97971 9.33333 2.33333C9.33333 2.4 9.33333 2.46 9.33333 2.52667C11.3133 3.11333 12.6667 4.93333 12.6667 7V11L14 12.3333ZM9.33333 13.6667C9.33333 14.0203 9.19286 14.3594 8.94281 14.6095C8.69276 14.8595 8.35362 15 8 15C7.64638 15 7.30724 14.8595 7.05719 14.6095C6.80714 14.3594 6.66667 14.0203 6.66667 13.6667"
            fill="#676670"
          />
        </svg>
        <span className={styles.showNotificationsText}>Show notifications</span>
      </div>
      <div className={styles.buttonRow}>
        <Button
          type="primary"
          onClick={() => {
            start();
          }}
        >
          Allow
        </Button>
        <button type="button" className={styles.disabled}>
          Block
        </button>
      </div>
    </div>
  </div>
);

const NotificationsEnabled = () => (
  <div>
    <Title>Notifications are enabled</Title>
    To disable push notifications from {window.location.hostname.toString()} access your browser
    permissions for this site and turn off notifications.
    <a href="https://owncast.online/docs/notifications"> Learn more.</a>
  </div>
);

export const BrowserNotifyModal = () => {
  const [error, setError] = useState<string>(null);
  const accessToken = useRecoilValue(accessTokenAtom);
  const config = useRecoilValue(clientConfigStateAtom);
  const [browserPushPermissionsPending, setBrowserPushPermissionsPending] =
    useState<boolean>(false);
  const notificationsPermitted =
    isPushNotificationSupported() && Notification.permission !== 'default';

  const { notifications } = config;
  const { browser } = notifications;
  const { publicKey } = browser;

  const browserPushSupported = browser.enabled && isPushNotificationSupported();

  // If notification permissions are granted, show user info how to disable them
  if (notificationsPermitted) {
    return <NotificationsEnabled />;
  }

  const startBrowserPushRegistration = async () => {
    // If notification permissions are already denied or granted, don't do anything.
    if (isPushNotificationSupported() && Notification.permission !== 'default') {
      return;
    }

    setBrowserPushPermissionsPending(true);
    try {
      const subscription = await registerWebPushNotifications(publicKey);
      saveNotificationRegistration('BROWSER_PUSH_NOTIFICATION', subscription, accessToken);
      setError(null);
    } catch (e) {
      setError(
        `Error registering for live notifications: ${e.message}. Make sure you're not inside a private browser environment or have previously disabled notifications for this stream.`,
      );
    }
    setBrowserPushPermissionsPending(false);
  };

  if (!browserPushSupported) {
    return <NotificationsNotSupported />;
  }

  return (
    <Spin spinning={browserPushPermissionsPending}>
      <Row className={styles.description}>
        Get notified right in the browser each time this stream goes live.
        <a href="https://owncast.online/docs/notifications/#browser-notifications">Learn more</a>
        &nbsp; about Owncast browser notifications.
      </Row>
      <Row>{error}</Row>
      <PermissionPopupPreview start={() => startBrowserPushRegistration()} />
    </Spin>
  );
};
