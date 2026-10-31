import api from './api';

const notificationService = {
  getNotifications: () => {
    return api.get('/notifications');
  },

  sendNotification: (data) => {
    return api.post('/notifications/send', data);
  },

  markAsRead: (id) => {
    return api.put(`/notifications/${id}/read`);
  },

  markAllAsRead: () => {
    return api.put('/notifications/read-all');
  },

  deleteNotification: (id) => {
    return api.delete(`/notifications/${id}`);
  },
};

export default notificationService;
