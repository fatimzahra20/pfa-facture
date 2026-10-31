import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import projetService from "../../services/projetService";
import { getClients } from "../../services/clientService";
import { useAuth } from "../../contexts/AuthContext";

const Projets = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useAuth();
  const canManage = userRole === "admin";
  const baseProjetsPath = location.pathname.startsWith("/admin")
    ? "/admin/projets"
    : "/projets";
  const [projets, setProjets] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    titre: "",
    client_id: "",
    description: "",
    date_debut: "",
    date_fin: "",
    statut: "en_cours",
    budget: "",
  });

  useEffect(() => {
    loadProjets();
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const loadProjets = async () => {
    try {
      setLoading(true);
      const data = await projetService.getProjets();
      setProjets(data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (projet = null) => {
    if (projet) {
      setEditingId(projet.id);
      setFormData({
        titre: projet.titre,
        client_id: projet.client_id || "",
        description: projet.description || "",
        date_debut: projet.date_debut,
        date_fin: projet.date_fin,
        statut: projet.statut,
        budget: projet.budget || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        titre: "",
        client_id: "",
        description: "",
        date_debut: "",
        date_fin: "",
        statut: "en_cours",
        budget: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const dataToSend = {
        ...formData,
        client_id: formData.client_id ? Number(formData.client_id) : null,
        budget: formData.budget ? parseInt(formData.budget) : null,
      };

      if (editingId) {
        await projetService.updateProjet(editingId, dataToSend);
      } else {
        await projetService.createProjet(dataToSend);
      }
      handleCloseDialog();
      loadProjets();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr?")) {
      try {
        await projetService.deleteProjet(id);
        loadProjets();
      } catch (error) {
        console.error("Erreur:", error);
      }
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case "en_cours":
        return "primary";
      case "termine":
        return "success";
      case "suspendu":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusLabel = (statut) => {
    switch (statut) {
      case "en_cours":
        return "En cours";
      case "termine":
        return "Terminé";
      case "suspendu":
        return "Suspendu";
      default:
        return statut;
    }
  };

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight={400}>
            Projets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {projets.length} projet{projets.length !== 1 ? "s" : ""} enregistré
            {projets.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
        {canManage && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Nouveau Projet
          </Button>
        )}
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell>Titre</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Début</TableCell>
              <TableCell>Fin</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Budget</TableCell>
              {canManage && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {projets.map((projet) => (
              <TableRow key={projet.id} hover>
                <TableCell
                  fontWeight={600}
                  sx={{
                    cursor: "pointer",
                    color: "text.primary",
                  }}
                  onClick={() => navigate(`${baseProjetsPath}/${projet.id}`)}
                >
                  {projet.titre}
                </TableCell>
                <TableCell>{projet.client?.nom || "Sans client"}</TableCell>
                <TableCell>{projet.description?.substring(0, 50)}...</TableCell>
                <TableCell>
                  {new Date(projet.date_debut).toLocaleDateString("fr-FR")}
                </TableCell>
                <TableCell>
                  {new Date(projet.date_fin).toLocaleDateString("fr-FR")}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(projet.statut)}
                    color={getStatusColor(projet.statut)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {projet.budget?.toLocaleString("fr-FR")} DH
                </TableCell>
                {canManage && (
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(projet)}
                      color="primary"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(projet.id)}
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingId ? "Modifier Projet" : "Nouveau Projet"}
        </DialogTitle>
        <DialogContent
          sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Titre"
            name="titre"
            value={formData.titre}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Client"
            name="client_id"
            value={formData.client_id}
            onChange={handleChange}
            select
            fullWidth
          >
            <MenuItem value="">Sans client</MenuItem>
            {clients.map((client) => (
              <MenuItem key={client.id} value={client.id}>
                {client.nom}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            label="Date de début"
            name="date_debut"
            type="date"
            value={formData.date_debut}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Date de fin"
            name="date_fin"
            type="date"
            value={formData.date_fin}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Statut"
            name="statut"
            value={formData.statut}
            onChange={handleChange}
            select
            fullWidth
            SelectProps={{
              native: true,
            }}
          >
            <option value="en_cours">En cours</option>
            <option value="termine">Terminé</option>
            <option value="suspendu">Suspendu</option>
          </TextField>
          <TextField
            label="Budget (DH)"
            name="budget"
            type="number"
            value={formData.budget}
            onChange={handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSave} variant="contained">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projets;
