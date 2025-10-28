import React from 'react';
import { Alert, Snackbar } from '@mui/material';
import { NotificationType } from '../hooks/useNotification';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContainerProps {
  notifications: Notification[];
  onClose: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ 
  notifications, 
  onClose 
}) => {
  return (
    <>
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ top: 80 + index * 70 }} // Stack notifications
        >
          <Alert
            severity={notification.type}
            onClose={() => onClose(notification.id)}
            variant="filled"
            sx={{ minWidth: 250 }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default React.memo(NotificationContainer);