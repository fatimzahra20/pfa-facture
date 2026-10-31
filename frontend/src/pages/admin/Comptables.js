// src/pages/admin/Comptables.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Button,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  CircularProgress,
  Chip,
  Tooltip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
} from "@mui/material";
import {
  Edit,
  Search,
  Close,
  PersonAdd,
  LockReset,
  Delete,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  getAllUsers,
  createUser,
  updateUserProfile,
  deleteUserProfile,
  updateUserPassword,
} from "../../services/userService";
import { useNotification } from "../../contexts/NotificationContext";

const USER_ROLES = ["user", "comptable", "tresorier", "admin"];

const validSchemaNew = Yup.object({
  nom: Yup.string().required("Nom requis").min(2),
  email: Yup.string().email("Email invalide").required("Email requis"),
  password: Yup.string()
    .min(6, "Minimum 6 caractères")
    .required("Mot de passe requis"),
  role: Yup.string().oneOf(USER_ROLES).required("Rôle requis"),
});

const validSchemaEdit = Yup.object({
  nom: Yup.string().required("Nom requis").min(2),
  role: Yup.string().oneOf(USER_ROLES).required("Rôle requis"),
});

const validSchemaPassword = Yup.object({
  newPassword: Yup.string()
    .min(6, "Minimum 6 caractères")
    .required("Mot de passe requis"),
  confirmPassword: Yup.string()
    .oneOf(
      [Yup.ref("newPassword"), null],
      "Les mots de passe doivent correspondre",
    )
    .required("Confirmation requise"),
});

const ComptableDialog = ({ open, onClose, user, onSaved }) => {
  const { showNotification } = useNotification();
  const isEditing = Boolean(user);
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      nom: user?.nom || "",
      email: user?.email || "",
      password: "",
      role: user?.role || "user",
    },
    validationSchema: isEditing ? validSchemaEdit : validSchemaNew,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        if (isEditing) {
          await updateUserProfile(user.id, {
            nom: values.nom,
            role: values.role,
          });
          showNotification("Profil modifié avec succès", "success");
        } else {
          await createUser({
            email: values.email,
            password: values.password,
            role: values.role,
            nom: values.nom,
            actif: true,
          });
          showNotification("Nouveau compte créé", "success");
        }
        resetForm();
        onSaved();
        onClose();
      } catch (e) {
        showNotification("Erreur : " + e.message, "error");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>
            {isEditing ? "Modifier le compte" : "Nouveau compte"}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {isEditing && (
            <Alert severity="info" sx={{ mb: 2 }}>
              L'adresse email ne peut être modifiée pour des raisons de
              sécurité.
            </Alert>
          )}
          <Box display="grid" gap={2} pt={1}>
            <TextField
              fullWidth
              label="Nom complet"
              name="nom"
              value={formik.values.nom}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.nom && Boolean(formik.errors.nom)}
              helperText={formik.touched.nom && formik.errors.nom}
            />

            <TextField
              fullWidth
              label="Adresse Email"
              name="email"
              type="email"
              disabled={isEditing}
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />

            {!isEditing && (
              <TextField
                fullWidth
                label="Mot de passe provisoire"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.password && Boolean(formik.errors.password)
                }
                helperText={formik.touched.password && formik.errors.password}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  ),
                }}
              />
            )}

            <FormControl
              fullWidth
              error={formik.touched.role && Boolean(formik.errors.role)}
            >
              <InputLabel>Rôle d'accès</InputLabel>
              <Select
                name="role"
                value={formik.values.role}
                onChange={formik.handleChange}
                label="Rôle d'accès"
              >
                <MenuItem value="user">Comptable</MenuItem>
                <MenuItem value="comptable">Comptable avancé</MenuItem>
                <MenuItem value="tresorier">Trésorier</MenuItem>
                <MenuItem value="admin">Administrateur</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} sx={{ borderRadius: 2 }}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
            sx={{ borderRadius: 2, px: 3 }}
          >
            {formik.isSubmitting ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Enregistrer"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const PasswordDialog = ({ open, onClose, user, onSaved }) => {
  const { showNotification } = useNotification();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: validSchemaPassword,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await updateUserPassword(user.id, values.newPassword);
        showNotification("Mot de passe mis à jour avec succès", "success");
        resetForm();
        onSaved();
        onClose();
      } catch (e) {
        showNotification("Erreur : " + e.message, "error");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            Modifier le mot de passe
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Définissez directement un nouveau mot de passe pour ce compte.
          </Alert>

          <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Compte :</strong> {user?.nom}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Email :</strong> {user?.email}
            </Typography>
          </Box>

          <Box display="grid" gap={2}>
            <TextField
              fullWidth
              label="Nouveau mot de passe"
              name="newPassword"
              type={showPassword ? "text" : "password"}
              value={formik.values.newPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.newPassword && Boolean(formik.errors.newPassword)
              }
              helperText={
                formik.touched.newPassword && formik.errors.newPassword
              }
              InputProps={{
                endAdornment: (
                  <IconButton
                    size="small"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? (
                      <VisibilityOff fontSize="small" />
                    ) : (
                      <Visibility fontSize="small" />
                    )}
                  </IconButton>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirmer le mot de passe"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.confirmPassword &&
                Boolean(formik.errors.confirmPassword)
              }
              helperText={
                formik.touched.confirmPassword && formik.errors.confirmPassword
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} sx={{ borderRadius: 2 }}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
            sx={{ borderRadius: 2, px: 3 }}
          >
            {formik.isSubmitting ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Enregistrer"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const Comptables = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const { showNotification } = useNotification();

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch {
      showNotification("Impossible de charger les utilisateurs.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !search ||
      (u.nom || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q)
    );
  });

  const handleToggleActif = async (user) => {
    const newActifStatus = user.actif === false ? true : false;
    try {
      await updateUserProfile(user.id, { actif: newActifStatus });
      showNotification(
        newActifStatus
          ? "Compte activé"
          : "Compte désactivé, ce profil ne peut plus se connecter",
        newActifStatus ? "success" : "warning",
      );
      load();
    } catch {
      showNotification("Erreur réseau lors de la modification", "error");
    }
  };

  const handleDelete = async (user) => {
    if (
      !window.confirm(
        `Vous êtes sur le point de supprimer DÉFINITIVEMENT le profil de ${user.nom}.\nAttention : L'adresse email restera enregistrée dans l'onglet 'Authentication' de la console Firebase. Vous devez la supprimer de là-bas si vous souhaitez la réutiliser un jour.\nContinuer ?`,
      )
    )
      return;
    try {
      await deleteUserProfile(user.id);
      showNotification("Profil supprimé avec succès.", "success");
      load();
    } catch {
      showNotification("Erreur réseau lors de la suppression.", "error");
    }
  };

  const handleChangePassword = (user) => {
    setSelected(user);
    setPasswordDialogOpen(true);
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight={400}>
            Utilisateurs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {users.length} utilisateur{users.length !== 1 ? "s" : ""} enregistré
            {users.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => {
            setSelected(null);
            setDialogOpen(true);
          }}
          sx={{
            borderRadius: 2,
            px: 3,
            background: "#064e3b",
            "&:hover": { background: "#053f30" },
          }}
        >
          Nouveau Compte
        </Button>
      </Box>

      <Card
        elevation={0}
        sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
          }}
        >
          <TextField
            size="small"
            placeholder="Rechercher (nom, email)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 320, flex: 1 }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 700 }}>Actif</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Nom complet</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Rôle</TableCell>
                <TableCell sx={{ fontWeight: 700, align: "right" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      Aucun utilisateur trouvé
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => {
                  const isActiveAccount = u.actif !== false;
                  return (
                    <TableRow
                      key={u.id}
                      hover
                      sx={{ opacity: isActiveAccount ? 1 : 0.6 }}
                    >
                      <TableCell>
                        <Switch
                          checked={isActiveAccount}
                          onChange={() => handleToggleActif(u)}
                          color="success"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          fontWeight={600}
                          color={
                            isActiveAccount ? "text.primary" : "text.disabled"
                          }
                        >
                          {u.nom}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          color={
                            isActiveAccount ? "text.primary" : "text.disabled"
                          }
                        >
                          {u.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            u.role === "admin"
                              ? "Administrateur"
                              : u.role === "tresorier"
                                ? "Trésorier"
                                : u.role === "comptable"
                                  ? "Comptable avancé"
                                  : "Comptable"
                          }
                          size="small"
                          color={
                            isActiveAccount
                              ? u.role === "admin"
                                ? "warning"
                                : u.role === "tresorier"
                                  ? "success"
                                  : "primary"
                              : "default"
                          }
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" gap={0.5} justifyContent="flex-end">
                          <Tooltip title="Changer le mot de passe">
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => handleChangePassword(u)}
                            >
                              <LockReset fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Modifier le profil">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setSelected(u);
                                setDialogOpen(true);
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer le profil">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(u)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <ComptableDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        user={selected}
        onSaved={load}
      />

      <PasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        user={selected}
        onSaved={load}
      />
    </Box>
  );
};

export default Comptables;
