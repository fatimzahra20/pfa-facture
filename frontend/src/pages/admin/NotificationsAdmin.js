// src/pages/admin/NotificationsAdmin.js
import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItemButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { MailOutline, Send, TaskAlt } from "@mui/icons-material";
import { getAllUsers } from "../../services/userService";
import notificationService from "../../services/notificationService";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationsContext";
import { useNotification } from "../../contexts/NotificationContext";

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const roleLabels = {
  admin: "Administrateur",
  comptable: "Comptable",
  tresorier: "Tresorier",
  user: "Comptable",
};

const allowedRolesBySender = {
  admin: ["user", "comptable", "tresorier", "admin"],
  comptable: ["admin", "tresorier"],
  user: ["admin", "tresorier"],
  tresorier: ["admin", "comptable", "user"],
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "M";

const NotificationsAdmin = () => {
  const { currentUser, userRole } = useAuth();
  const { notifications, threadMessages, loading, loadNotifications, markAsRead } =
    useNotifications();
  const { showNotification } = useNotification();
  const [users, setUsers] = useState([]);
  const [sending, setSending] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isComposing, setIsComposing] = useState(true);
  const [replyToId, setReplyToId] = useState(null);
  const [formData, setFormData] = useState({
    recipient: "",
    titre: "",
    description: "",
  });

  const allowedRoles = useMemo(
    () => allowedRolesBySender[userRole] || allowedRolesBySender.user,
    [userRole],
  );

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(
          data.filter(
            (user) =>
              allowedRoles.includes(user.role) &&
              String(user.id) !== String(currentUser?.id) &&
              user.actif !== false,
          ),
        );
      } catch {
        showNotification("Impossible de charger les destinataires", "error");
      }
    };

    loadUsers();
  }, [allowedRoles, currentUser?.id, showNotification]);

  const recipientOptions = useMemo(() => {
    return users.map((user) => ({
      value: `user:${user.id}`,
      label: `${user.nom || user.name || user.email} - ${roleLabels[user.role] || user.role}`,
    }));
  }, [users]);

  const selectedMessage =
    notifications.find((notification) => notification.id === selectedId) || null;

  const selectedThreadId = selectedMessage?.data?.thread_id || selectedMessage?.id;
  const selectedSender = selectedMessage
    ? users.find(
        (user) =>
          String(user.id) ===
          String(selectedMessage.data?.from_user_id || selectedMessage.from_user_id),
      )
    : null;
  const selectedSenderRole =
    selectedMessage?.data?.from_role || selectedSender?.role || "user";
  const replies = selectedMessage
    ? (threadMessages || [])
        .filter((message) => {
          if (message.id === selectedMessage.id) return false;
          const messageThreadId = message.data?.thread_id || message.id;
          return (
            String(messageThreadId) === String(selectedThreadId) ||
            String(message.data?.reply_to_id || "") === String(selectedMessage.id)
          );
        })
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    : [];

  const unreadCount = notifications.filter((notification) => !notification.read_at).length;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectMessage = (notification) => {
    setSelectedId(notification.id);
    setIsComposing(false);
    if (!notification.read_at) {
      markAsRead(notification.id);
    }
  };

  const handleNewMessage = () => {
    setIsComposing(true);
    setSelectedId(null);
    setReplyToId(null);
    setFormData({ recipient: "", titre: "", description: "" });
  };

  const handleReply = () => {
    if (!selectedMessage) return;

    const fromUserId = selectedMessage.data?.from_user_id || selectedMessage.from_user_id;
    if (!fromUserId) {
      showNotification("Impossible de trouver l'expediteur du message", "error");
      return;
    }

    const originalTitle = selectedMessage.titre || "";
    setFormData({
      recipient: `user:${fromUserId}`,
      titre: originalTitle.toLowerCase().startsWith("re:")
        ? originalTitle
        : `Re: ${originalTitle}`,
      description: "",
    });
    setReplyToId(selectedMessage.id);
    setIsComposing(true);
  };

  const handleSend = async () => {
    if (!formData.recipient) {
      showNotification("Choisissez un destinataire", "error");
      return;
    }

    if (!formData.titre.trim() || !formData.description.trim()) {
      showNotification("Objet et message sont obligatoires", "error");
      return;
    }

    const [recipientType, recipientValue] = formData.recipient.split(":");
    const payload = {
      titre: formData.titre.trim(),
      description: formData.description.trim(),
      ...(replyToId ? { reply_to_id: replyToId } : {}),
      ...(recipientType === "user"
        ? { target_user_id: Number(recipientValue) }
        : { target_role: recipientValue }),
    };

    setSending(true);
    try {
      const response = await notificationService.sendNotification(payload);
      showNotification(`${response.data.sent_count || 0} message(s) envoye(s)`, "success");
      setFormData({ recipient: "", titre: "", description: "" });
      setReplyToId(null);
      await loadNotifications();
      setIsComposing(false);
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Erreur lors de l'envoi",
        "error",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={500}>
          Messages
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Envoyer et recevoir des messages selon votre role.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "360px minmax(0, 1fr)" },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography fontWeight={700}>Boite de reception</Typography>
                <Chip size="small" label={`${unreadCount} nouveau(x)`} color="primary" />
              </Stack>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress />
              </Box>
            ) : notifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <MailOutline sx={{ color: "text.disabled", fontSize: 44, mb: 1 }} />
                <Typography color="text.secondary">Aucun message recu</Typography>
              </Box>
            ) : (
              <List disablePadding>
                {notifications.map((notification) => {
                  const isSelected = selectedMessage?.id === notification.id;
                  const fromName = notification.data?.from_name || "Systeme";

                  return (
                    <ListItemButton
                      key={notification.id}
                      selected={isSelected}
                      onClick={() => handleSelectMessage(notification)}
                      sx={{
                        alignItems: "flex-start",
                        gap: 1.5,
                        py: 1.5,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main" }}>
                        {getInitials(fromName)}
                      </Avatar>
                      <Box minWidth={0} flex={1}>
                        <Stack direction="row" justifyContent="space-between" gap={1}>
                          <Typography noWrap fontWeight={notification.read_at ? 500 : 800}>
                            {fromName}
                          </Typography>
                          {!notification.read_at && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: "primary.main",
                                mt: 0.75,
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </Stack>
                        <Typography noWrap variant="body2" fontWeight={600}>
                          {notification.titre}
                        </Typography>
                      </Box>
                    </ListItemButton>
                  );
                })}
              </List>
            )}
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent sx={{ p: 3 }}>
            {isComposing ? (
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Send color="primary" fontSize="small" />
                    <Typography variant="h6" fontWeight={700}>
                      Nouveau message
                    </Typography>
                  </Stack>
                  {selectedMessage && (
                    <Button size="small" onClick={() => setIsComposing(false)}>
                      Voir le message
                    </Button>
                  )}
                </Stack>

                <FormControl fullWidth>
                  <InputLabel>A</InputLabel>
                  <Select
                    name="recipient"
                    value={formData.recipient}
                    label="A"
                    onChange={handleChange}
                  >
                    {recipientOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  name="titre"
                  label="Objet"
                  value={formData.titre}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  multiline
                  minRows={8}
                  name="description"
                  label="Message"
                  value={formData.description}
                  onChange={handleChange}
                />

                <Box display="flex" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    startIcon={sending ? <CircularProgress size={18} /> : <Send />}
                    onClick={handleSend}
                    disabled={sending}
                  >
                    {sending ? "Envoi..." : "Envoyer"}
                  </Button>
                </Box>
              </Stack>
            ) : !selectedMessage ? (
              <Box textAlign="center" py={8}>
                <MailOutline sx={{ color: "text.disabled", fontSize: 48, mb: 1 }} />
                <Typography color="text.secondary">Selectionnez un message</Typography>
                <Button sx={{ mt: 2 }} variant="outlined" onClick={handleNewMessage}>
                  Nouveau message
                </Button>
              </Box>
            ) : (
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
                  <Typography variant="h6" fontWeight={800}>
                    {selectedMessage.titre}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" onClick={handleReply}>
                      Repondre
                    </Button>
                    <Button variant="contained" startIcon={<Send />} onClick={handleNewMessage}>
                      Nouveau message
                    </Button>
                  </Stack>
                </Stack>
                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
                  <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      {getInitials(selectedMessage.data?.from_name || "Systeme")}
                    </Avatar>
                    <Box minWidth={0}>
                      <Typography fontWeight={700} noWrap>
                        {selectedMessage.data?.from_name || "Systeme"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {roleLabels[selectedSenderRole] || selectedSenderRole} - {formatDate(selectedMessage.created_at)}
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip
                    icon={selectedMessage.read_at ? <TaskAlt /> : undefined}
                    size="small"
                    label={selectedMessage.read_at ? "Lu" : "Nouveau"}
                    color={selectedMessage.read_at ? "default" : "success"}
                  />
                </Stack>
                <Divider />
                <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
                  {selectedMessage.description}
                </Typography>
                {replies.length > 0 && (
                  <>
                    <Divider />
                    <Box>
                      <Typography fontWeight={800} mb={1.5}>
                        Reponses
                      </Typography>
                      <Stack spacing={1.5}>
                        {replies.map((reply) => {
                          const replyFromName = reply.data?.from_name || "Systeme";
                          const isMine =
                            currentUser?.id &&
                            String(reply.from_user_id || reply.data?.from_user_id) ===
                              String(currentUser.id);

                          return (
                            <Box
                              key={reply.id}
                              sx={{
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1,
                                p: 2,
                                bgcolor: isMine ? "#f8fafc" : "background.paper",
                              }}
                            >
                              <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: isMine ? "secondary.main" : "primary.main" }}>
                                  {getInitials(replyFromName)}
                                </Avatar>
                                <Box minWidth={0}>
                                  <Typography fontWeight={700} noWrap>
                                    {isMine ? "Moi" : replyFromName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDate(reply.created_at)}
                                  </Typography>
                                </Box>
                              </Stack>
                              <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                                {reply.description}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Stack>
                    </Box>
                  </>
                )}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default NotificationsAdmin;


