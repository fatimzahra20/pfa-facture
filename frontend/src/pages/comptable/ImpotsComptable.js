// src/pages/comptable/ImpotsComptable.js
import React, { useState, useEffect, useMemo } from "react";
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
  InputAdornment,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import { Add, Close, Search } from "@mui/icons-material";
import { createImpot, getImpots } from "../../services/impotService";
import { useNotification } from "../../contexts/NotificationContext";

const currentYear = new Date().getFullYear();

const API_ORIGIN =
  (process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1").replace(
    /\/api\/v1\/?$/,
    "",
  );

const annualImpotDefault = () => ({
  annee: currentYear,
  type: "Impot annuel",
  montant: "",
  date_echeance: `${currentYear}-12-31`,
  reference: "",
  description: "",
});

const normalizeStatut = (statut) => (statut === "payee" ? "payee" : "impayee");

const ImpotsComptable = () => {
  const [impots, setImpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [annualForm, setAnnualForm] = useState(annualImpotDefault());
  const [saving, setSaving] = useState(false);
  const { showNotification } = useNotification();

  const load = async () => {
    setLoading(true);
    try {
      const data = await getImpots();
      setImpots(data);
    } catch {
      showNotification("Erreur de chargement", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAnnualChange = (event) => {
    const { name, value } = event.target;
    setAnnualForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "annee" ? { date_echeance: `${value}-12-31` } : {}),
    }));
  };

  const handleCreateAnnualImpot = async () => {
    if (!annualForm.type || !annualForm.montant || !annualForm.date_echeance) {
      showNotification("Veuillez remplir le type, le montant et l'echeance", "error");
      return;
    }

    setSaving(true);
    try {
      const numero = `IMP-${annualForm.annee}-${Date.now()}`;
      await createImpot({
        numero,
        type: annualForm.type,
        montant: Number(annualForm.montant),
        date_echeance: annualForm.date_echeance,
        date_paiement: null,
        statut: "impayee",
        reference: annualForm.reference,
        description: annualForm.description,
      });
      showNotification("Impot annuel cree avec succes", "success");
      setDialogOpen(false);
      setAnnualForm(annualImpotDefault());
      load();
    } catch (error) {
      showNotification("Erreur lors de la creation de l'impot", "error");
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(() => {
    const total = impots.length;
    const payees = impots.filter((i) => i.statut === "payee").length;
    const impayees = impots.filter((i) => i.statut === "impayee").length;
    const montantTotal = impots.reduce(
      (sum, i) => sum + Number(i.montant || 0),
      0,
    );
    const montantPayee = impots
      .filter((i) => i.statut === "payee")
      .reduce((sum, i) => sum + Number(i.montant || 0), 0);
    return { total, payees, impayees, montantTotal, montantPayee };
  }, [impots]);

  const filtered = useMemo(() => {
    return impots.filter((i) => {
      const matchSearch =
        !search ||
        i.numero?.toLowerCase().includes(search.toLowerCase()) ||
        i.type?.toLowerCase().includes(search.toLowerCase());
      const matchStatut = !filterStatut || normalizeStatut(i.statut) === filterStatut;
      return matchSearch && matchStatut;
    });
  }, [impots, search, filterStatut]);

  const getStatutColor = (statut) =>
    normalizeStatut(statut) === "payee" ? "success" : "error";

  const getStatutLabel = (statut) =>
    normalizeStatut(statut) === "payee" ? "Paye" : "Non paye";
  return (
    <Box>
      <Box
        mb={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap={2}
        flexWrap="wrap"
      >
        <Box>
          <Typography variant="h5" fontWeight={400}>
            Impots
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {impots.length} impot{impots.length !== 1 ? "s" : ""} enregistre
            {impots.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Impot annuel
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        Vous pouvez creer un impot annuel et consulter l'etat des impots.
      </Alert>
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
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <TextField
            size="small"
            placeholder="Rechercher numéro ou type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              label="Statut"
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="impayee">Non paye</MenuItem>
              <MenuItem value="payee">Paye</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                {[
                  "Numéro",
                  "Type",
                  "Montant",
                  "Échéance",
                  "Paiement",
                  "Statut",
                  "Preuve",
                ].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: 13 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">Aucun impôt</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((impot) => (
                  <TableRow key={impot.id} hover>
                    <TableCell>
                      <Typography fontWeight={700}>{impot.numero}</Typography>
                    </TableCell>
                    <TableCell>{impot.type}</TableCell>
                    <TableCell>
                      <Typography fontWeight={700}>
                        {Number(impot.montant).toFixed(2)} €
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(impot.date_echeance).toLocaleDateString(
                        "fr-FR",
                      )}
                    </TableCell>
                    <TableCell>
                      {impot.date_paiement
                        ? new Date(impot.date_paiement).toLocaleDateString(
                            "fr-FR",
                          )
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatutLabel(impot.statut)}
                        color={getStatutColor(impot.statut)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {impot.preuve_paiement_path ? (
                        <Button
                          size="small"
                          component="a"
                          href={`${API_ORIGIN}${impot.preuve_paiement_path}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Voir
                        </Button>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={700}>
              Creer un impot annuel
            </Typography>
            <IconButton onClick={() => setDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              pt: 1,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              gap: 2,
              "& .MuiTextField-root": {
                width: "100%",
              },
              "& .MuiInputBase-root": {
                minHeight: 56,
              },
            }}
          >
            <Box>
              <TextField
                fullWidth
                label="Annee"
                name="annee"
                type="number"
                value={annualForm.annee}
                onChange={handleAnnualChange}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Type"
                name="type"
                value={annualForm.type}
                onChange={handleAnnualChange}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Montant"
                name="montant"
                type="number"
                inputProps={{ min: 0, step: "0.01" }}
                value={annualForm.montant}
                onChange={handleAnnualChange}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Date d'echeance"
                name="date_echeance"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={annualForm.date_echeance}
                onChange={handleAnnualChange}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Reference"
                name="reference"
                value={annualForm.reference}
                onChange={handleAnnualChange}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={3}
                value={annualForm.description}
                onChange={handleAnnualChange}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleCreateAnnualImpot}
            disabled={saving}
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImpotsComptable;


