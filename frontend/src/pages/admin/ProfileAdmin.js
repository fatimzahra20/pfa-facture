// src/pages/admin/ProfileAdmin.js
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  CameraAlt,
  Email,
  Person,
  Save,
  VerifiedUser,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { getUserById, updateUserProfile } from "../../services/userService";

const API_ORIGIN =
  (process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1").replace(
    /\/api\/v1\/?$/,
    "",
  );

const roleLabels = {
  admin: "Administrateur",
  comptable: "Comptable avance",
  tresorier: "Tresorier",
  user: "Comptable",
};

const ProfileAdmin = () => {
  const { currentUser, userName } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ nom: "", email: "" });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const initials = useMemo(() => {
    const source = formData.nom || userName || formData.email || "A";
    return source
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [formData.email, formData.nom, userName]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (currentUser?.uid) {
          const userData = await getUserById(currentUser.uid);
          setUser(userData);
          setFormData({
            nom: userData.nom || "",
            email: userData.email || "",
          });
          setPhotoPreview(
            userData.photo_path ? `${API_ORIGIN}${userData.photo_path}` : null,
          );
        }
      } catch {
        showNotification("Erreur de chargement du profil", "error");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [currentUser, showNotification]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showNotification("La photo ne doit pas depasser 5MB", "error");
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (event) => setPhotoPreview(event.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!formData.nom.trim()) {
      showNotification("Le nom complet est obligatoire", "error");
      return;
    }

    setSaving(true);
    try {
      const data = new FormData();
      data.append("nom", formData.nom.trim());

      if (photoFile) {
        data.append("photo", photoFile);
      }

      const updatedUser = await updateUserProfile(currentUser.uid, data);
      setUser(updatedUser);
      setPhotoFile(null);
      showNotification("Profil mis a jour avec succes", "success");
    } catch {
      showNotification("Erreur lors de la mise a jour du profil", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={420}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={400}>
          Profil
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Consultez et mettez a jour les informations de votre compte.
        </Typography>
      </Box>

      <Card
        elevation={0}
        sx={{
          maxWidth: 900,
          mx: "auto",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Stack alignItems="center" spacing={2.5}>
              <Box position="relative">
                <Avatar
                  src={photoPreview || undefined}
                  sx={{
                    width: 136,
                    height: 136,
                    bgcolor: "primary.main",
                    color: "white",
                    fontSize: 44,
                    fontWeight: 700,
                    border: "4px solid",
                    borderColor: "background.paper",
                    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
                  }}
                >
                  {initials}
                </Avatar>
                <input
                  accept="image/*"
                  hidden
                  id="profile-photo-input"
                  type="file"
                  onChange={handlePhotoSelect}
                />
                <label htmlFor="profile-photo-input">
                  <IconButton
                    component="span"
                    aria-label="Changer la photo"
                    sx={{
                      position: "absolute",
                      right: 4,
                      bottom: 4,
                      bgcolor: "primary.main",
                      color: "white",
                      border: "2px solid white",
                      "&:hover": { bgcolor: "primary.dark" },
                    }}
                  >
                    <CameraAlt fontSize="small" />
                  </IconButton>
                </label>
              </Box>

              <Box textAlign="center">
                <Typography variant="h6" fontWeight={700}>
                  {formData.nom || roleLabels[user?.role] || "Utilisateur"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formData.email}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  icon={<VerifiedUser fontSize="small" />}
                  label={roleLabels[user?.role] || "Utilisateur"}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={user?.actif === false ? "Inactif" : "Actif"}
                  color={user?.actif === false ? "default" : "success"}
                  variant="outlined"
                />
              </Stack>

              {photoFile && (
                <Alert severity="info" sx={{ width: "100%" }}>
                  Nouvelle photo selectionnee. Enregistrez pour l'appliquer.
                </Alert>
              )}
            </Stack>

            <Divider />

            <Box>
              <Typography variant="h6" fontWeight={700}>
                Informations personnelles
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ces informations apparaissent dans votre espace MaFacture.
              </Typography>
            </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <TextField
                  fullWidth
                  label="Nom complet"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Adresse email"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled
                  helperText="L'email ne peut pas etre modifie"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  startIcon={
                    saving ? <CircularProgress size={18} /> : <Save />
                  }
                  onClick={handleSave}
                  disabled={saving}
                  sx={{ minWidth: 150 }}
                >
                  {saving ? "Enregistrement" : "Enregistrer"}
                </Button>
              </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfileAdmin;
