// src/pages/tresorier/ImpotsTresorier.js
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { CheckCircle, Search, UploadFile } from "@mui/icons-material";
import { getImpots, markImpotAsPaid } from "../../services/impotService";
import { useNotification } from "../../contexts/NotificationContext";

const API_ORIGIN =
  (process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1").replace(
    /\/api\/v1\/?$/,
    "",
  );

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("fr-FR") : "-";

const getStatutColor = (statut) => {
  if (statut === "payee") return "success";
  if (statut === "partiellement_payee") return "warning";
  return "error";
};

const getStatutLabel = (statut) => {
  if (statut === "payee") return "Payee";
  if (statut === "partiellement_payee") return "Partiellement payee";
  return "Non payee";
};

const ProofDialog = ({ open, impot, onClose, onSaved }) => {
  const { showNotification } = useNotification();
  const [proofFile, setProofFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    setProofFile(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!proofFile) {
      showNotification("Veuillez ajouter une photo comme preuve de paiement", "error");
      return;
    }

    setSaving(true);
    try {
      await markImpotAsPaid(impot.id, proofFile);
      showNotification("Impot marque comme paye avec preuve", "success");
      setProofFile(null);
      onSaved();
      onClose();
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Erreur lors de l'enregistrement",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Preuve de paiement</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Ajoutez une photo du recu ou justificatif pour marquer cet impot comme paye.
        </Typography>
        <Button component="label" variant="outlined" startIcon={<UploadFile />} fullWidth>
          {proofFile ? proofFile.name : "Choisir une photo"}
          <input
            hidden
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setProofFile(event.target.files?.[0] || null)}
          />
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Annuler</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={18} /> : <CheckCircle />}
        >
          {saving ? "Enregistrement..." : "Marquer paye"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ImpotsTresorier = () => {
  const { showNotification } = useNotification();
  const [impots, setImpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [selectedImpot, setSelectedImpot] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setImpots(await getImpots());
    } catch {
      showNotification("Erreur de chargement", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return impots.filter((impot) => {
      const matchSearch =
        !term ||
        impot.numero?.toLowerCase().includes(term) ||
        impot.type?.toLowerCase().includes(term) ||
        impot.reference?.toLowerCase().includes(term);
      const matchStatut = !filterStatut || impot.statut === filterStatut;
      return matchSearch && matchStatut;
    });
  }, [impots, search, filterStatut]);

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={400}>
          Impots
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Consultation des impots et validation du paiement avec preuve.
        </Typography>
      </Box>

      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
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
            placeholder="Rechercher numero, type ou reference..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 240 }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={filterStatut}
              onChange={(event) => setFilterStatut(event.target.value)}
              label="Statut"
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="impayee">Non payee</MenuItem>
              <MenuItem value="partiellement_payee">Partiellement payee</MenuItem>
              <MenuItem value="payee">Payee</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                {[
                  "Numero",
                  "Type",
                  "Montant",
                  "Echeance",
                  "Date paiement",
                  "Statut",
                  "Preuve",
                  "Action",
                ].map((head) => (
                  <TableCell key={head} sx={{ fontWeight: 700, fontSize: 13 }}>
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">Aucun impot</Typography>
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
                        {Number(impot.montant).toFixed(2)} EUR
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(impot.date_echeance)}</TableCell>
                    <TableCell>{formatDate(impot.date_paiement)}</TableCell>
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
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {impot.statut !== "payee" && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<CheckCircle />}
                          onClick={() => setSelectedImpot(impot)}
                        >
                          Marquer paye
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <ProofDialog
        open={Boolean(selectedImpot)}
        impot={selectedImpot}
        onClose={() => setSelectedImpot(null)}
        onSaved={load}
      />
    </Box>
  );
};

export default ImpotsTresorier;
