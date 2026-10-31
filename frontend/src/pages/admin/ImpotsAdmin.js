// src/pages/admin/ImpotsAdmin.js
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { getImpots } from "../../services/impotService";
import { useNotification } from "../../contexts/NotificationContext";

const API_ORIGIN =
  (process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1").replace(
    /\/api\/v1\/?$/,
    "",
  );

const ImpotsAdmin = () => {
  const [impots, setImpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
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
  const filtered = useMemo(() => {
    return impots.filter((i) => {
      const matchSearch =
        !search ||
        i.numero?.toLowerCase().includes(search.toLowerCase()) ||
        i.type?.toLowerCase().includes(search.toLowerCase());
      const matchStatut = !filterStatut || i.statut === filterStatut;
      return matchSearch && matchStatut;
    });
  }, [impots, search, filterStatut]);
  const getStatutColor = (statut) => {
    switch (statut) {
      case "payee":
        return "success";
      case "partiellement_payee":
        return "warning";
      default:
        return "error";
    }
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case "payee":
        return "Payée";
      case "partiellement_payee":
        return "Partiellement payée";
      default:
        return "Non payée";
    }
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={400}>
          Impôts
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {impots.length} impôt{impots.length !== 1 ? "s" : ""} enregistré
          {impots.length !== 1 ? "s" : ""}
        </Typography>
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
              <MenuItem value="impayee">Non payée</MenuItem>
              <MenuItem value="partiellement_payee">
                Partiellement payée
              </MenuItem>
              <MenuItem value="payee">Payée</MenuItem>
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
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
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
    </Box>
  );
};

export default ImpotsAdmin;
