// src/pages/user/Clients.js
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  Avatar,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Search,
  Person,
  Email,
  Phone,
  LocationOn,
  Close,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  getClients,
  addClient,
  updateClient,
  deleteClient,
} from "../../services/clientService";
import { useNotification } from "../../contexts/NotificationContext";
import { useAuth } from "../../contexts/AuthContext";

const validationSchema = Yup.object({
  nom: Yup.string().required("Nom requis").min(2, "Minimum 2 caractères"),
  email: Yup.string().email("Email invalide").required("Email requis"),
  tel: Yup.string()
    .required("Téléphone requis")
    .matches(/^[\d\s\+\-()]+$/, "Numéro invalide"),
  adresse: Yup.string().required("Adresse requise"),
});

const ClientDialog = ({ open, onClose, client, onSaved }) => {
  const { showNotification } = useNotification();

  const formik = useFormik({
    initialValues: {
      nom: client?.nom || "",
      email: client?.email || "",
      tel: client?.tel || "",
      adresse: client?.adresse || "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        if (client?.id) {
          await updateClient(client.id, values);
          showNotification("Client modifié avec succès", "success");
        } else {
          await addClient(values);
          showNotification("Client ajouté avec succès", "success");
        }
        resetForm();
        onSaved();
        onClose();
      } catch {
        showNotification("Erreur lors de la sauvegarde", "error");
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
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={600}>
            {client ? "Modifier le client" : "Nouveau client"}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          <Box display="grid" gap={2}>
            <TextField
              fullWidth
              label="Nom complet"
              name="nom"
              value={formik.values.nom}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.nom && Boolean(formik.errors.nom)}
              helperText={formik.touched.nom && formik.errors.nom}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Téléphone"
              name="tel"
              value={formik.values.tel}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.tel && Boolean(formik.errors.tel)}
              helperText={formik.touched.tel && formik.errors.tel}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Adresse"
              name="adresse"
              multiline
              rows={2}
              value={formik.values.adresse}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.adresse && Boolean(formik.errors.adresse)}
              helperText={formik.touched.adresse && formik.errors.adresse}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
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
            ) : client ? (
              "Enregistrer"
            ) : (
              "Ajouter"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const { showNotification } = useNotification();
  const { userRole } = useAuth();
  const isAdmin = userRole === "admin";
  const canEdit = isAdmin;
  const baseClientsPath = isAdmin ? "/admin/clients" : "/clients";

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await getClients();
      setClients(data);
    } catch {
      showNotification("Erreur lors du chargement des clients", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.nom?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.tel?.includes(q),
    );
  }, [clients, search]);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce client ?")) return;
    try {
      await deleteClient(id);
      showNotification("Client supprimé", "warning");
      loadClients();
    } catch {
      showNotification("Erreur lors de la suppression", "error");
    }
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setDialogOpen(true);
  };
  const handleAdd = () => {
    setSelectedClient(null);
    setDialogOpen(true);
  };

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight={400}>
            Clients
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {clients.length} client{clients.length !== 1 ? "s" : ""} enregistré
            {clients.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAdd}
            sx={{ borderRadius: 2, px: 3, py: 1.2, fontWeight: 500 }}
          >
            Nouveau client
          </Button>
        )}
      </Box>

      <Card
        elevation={0}
        sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
      >
        {/* Barre de recherche */}
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <TextField
            size="small"
            placeholder="Rechercher par nom, email, téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 360 }}
          />
        </Box>

        {/* Tableau */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                {["Client", "Email", "Téléphone", "Adresse", "Actions"].map(
                  (h) => (
                    <TableCell key={h} sx={{ fontWeight: 600, fontSize: 13 }}>
                      {h}
                    </TableCell>
                  ),
                )}
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
                      Aucun client trouvé
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((client) => (
                    <TableRow key={client.id} hover>
                      <TableCell>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1.5}
                          sx={{
                            cursor: "pointer",
                            "&:hover": { opacity: 0.7 },
                          }}
                          onClick={() =>
                            navigate(`${baseClientsPath}/${client.id}`)
                          }
                        >
                          <Avatar
                            sx={{
                              bgcolor: "primary.light",
                              color: "primary.dark",
                              width: 36,
                              height: 36,
                              fontSize: 14,
                              fontWeight: 600,
                            }}
                          >
                            {client.nom?.[0]?.toUpperCase()}
                          </Avatar>
                          <Typography fontWeight={500}>{client.nom}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {client.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={client.tel}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                          sx={{ maxWidth: 200 }}
                        >
                          {client.adresse}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <Tooltip title="Voir les détails">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() =>
                                navigate(`${baseClientsPath}/${client.id}`)
                              }
                            >
                              <Person fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {canEdit && (
                            <>
                              <Tooltip title="Modifier">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleEdit(client)}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDelete(client.id)}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(+e.target.value);
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} sur ${count}`
          }
        />
      </Card>

      <ClientDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        client={selectedClient}
        onSaved={loadClients}
      />
    </Box>
  );
};

export default Clients;
