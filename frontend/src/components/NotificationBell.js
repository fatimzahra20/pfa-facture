import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { NotificationsOutlined, DeleteOutline } from '@mui/icons-material';
import { useNotifications } from '../contexts/NotificationsContext';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (id) => {
    markAsRead(id);
  };

  const handleDelete = (id) => {
    deleteNotification(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    handleClose();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          color: 'inherit',
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsOutlined />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            backgroundColor: '#f5f5f5',
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllAsRead}>
              Tout marquer comme lu
            </Button>
          )}
        </Box>
        <Divider />

        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography textAlign="center" sx={{ width: '100%', py: 2 }}>
              Aucune notification
            </Typography>
          </MenuItem>
        ) : (
          <List sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {notifications.map((notif) => (
              <React.Fragment key={notif.id}>
                <ListItem
                  sx={{
                    backgroundColor: notif.read_at ? 'white' : '#e3f2fd',
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: notif.read_at ? '#f5f5f5' : '#bbdefb' },
                    py: 1.5,
                  }}
                >
                  <ListItemText
                    onClick={() => !notif.read_at && handleMarkAsRead(notif.id)}
                    primary={notif.titre}
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                          {notif.description}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#999' }}>
                          {formatDate(notif.created_at)}
                        </Typography>
                      </>
                    }
                  />
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => handleDelete(notif.id)}
                    sx={{ ml: 1 }}
                  >
                    <DeleteOutline sx={{ fontSize: 18 }} />
                  </IconButton>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
