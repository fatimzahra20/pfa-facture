// src/pages/tresorier/Tresorerie.js
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { CheckCircle, Search } from "@mui/icons-material";
import { getFactures, updateFacture } from "../../services/factureService";
import { getImpots } from "../../services/impotService";
import { useNotification } from "../../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";

const today = () => new Date().toISOString().split("T")[0];

const formatMoney = (value) => `${Number(value || 0).toFixed(2)} EUR`;

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("fr-FR") : "-";

const Tresorerie = ({ initialTab = 0 }) => {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [factures, setFactures] = useState([]);
  const [impots, setImpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(initialTab);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [facturesData, impotsData] = await Promise.all([
        getFactures(),
        getImpots(),
      ]);
      setFactures(facturesData);
      setImpots(impotsData);
    } catch {
      showNotification("Erreur de chargement de la tresorerie", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredFactures = useMemo(() => {
    const term = search.toLowerCase();
    return factures.filter(
      (facture) =>
        !term ||
        facture.numero?.toLowerCase().includes(term) ||
        facture.type_virement?.toLowerCase().includes(term),
    );
  }, [factures, search]);

  const filteredImpots = useMemo(() => {
    const term = search.toLowerCase();
    return impots.filter(
      (impot) =>
        !term ||
        impot.numero?.toLowerCase().includes(term) ||
        impot.type?.toLowerCase().includes(term) ||
        impot.reference?.toLowerCase().includes(term),
    );
  }, [impots, search]);

  const stats = useMemo(() => {
    const encaisse = factures
      .filter((facture) => facture.statut === "payee")
      .reduce((sum, facture) => sum + Number(facture.total_ttc || 0), 0);
    const aEncaisser = factures
      .filter((facture) => facture.statut !== "payee")
      .reduce((sum, facture) => sum + Number(facture.total_ttc || 0), 0);
    const decaisse = impots
      .filter((impot) => impot.statut === "payee")
      .reduce((sum, impot) => sum + Number(impot.montant || 0), 0);
    const aDecaisser = impots
      .filter((impot) => impot.statut !== "payee")
      .reduce((sum, impot) => sum + Number(impot.montant || 0), 0);

    return { encaisse, aEncaisser, decaisse, aDecaisser };
  }, [factures, impots]);

  const markFacturePaid = async (facture) => {
    try {
      await updateFacture(facture.id, {
        statut: "payee",
        date_encaissement: facture.date_encaissement || today(),
      });
      showNotification("Encaissement enregistre", "success");
      load();
    } catch {
      showNotification("Erreur lors de l'encaissement", "error");
    }
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={500}>
          Tresorerie
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Suivi des encaissements et decaissements.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        {[
          ["Encaisse", stats.encaisse, "success"],
          ["A encaisser", stats.aEncaisser, "warning"],
          ["Decaisse", stats.decaisse, "primary"],
          ["A decaisser", stats.aDecaisser, "error"],
        ].map(([label, value, color]) => (
          <Card key={label} elevation={0} sx={{ border: "1px solid", borderColor: "divider", p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h6" fontWeight={800}>
              {formatMoney(value)}
            </Typography>
            <Chip size="small" color={color} label={label} sx={{ mt: 1 }} />
          </Card>
        ))}
      </Box>

      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <Box sx={{ p: 2, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <Tabs value={tab} onChange={(_, value) => setTab(value)}>
            <Tab label="Encaissements" />
            <Tab label="Decaissements" />
          </Tabs>
          <Box flex={1} />
          <TextField
            size="small"
            placeholder="Rechercher..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            InputProps={{ startAdornment: <Search fontSize="small" color="action" sx={{ mr: 1 }} /> }}
            sx={{ minWidth: 240 }}
          />
        </Box>
        <Divider />

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : tab === 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  {["Facture", "Montant TTC", "Mode", "Date encaissement", "Statut", "Actions"].map((head) => (
                    <TableCell key={head} sx={{ fontWeight: 700 }}>{head}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFactures.map((facture) => (
                  <TableRow key={facture.id} hover>
                    <TableCell><Typography fontWeight={700}>{facture.numero}</Typography></TableCell>
                    <TableCell>{formatMoney(facture.total_ttc)}</TableCell>
                    <TableCell>{facture.type_virement || "-"}</TableCell>
                    <TableCell>{formatDate(facture.date_encaissement)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={facture.statut === "payee" ? "success" : "warning"}
                        label={facture.statut === "payee" ? "Encaissee" : "A encaisser"}
                      />
                    </TableCell>
                    <TableCell>
                      {facture.statut !== "payee" && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<CheckCircle />}
                          onClick={() => markFacturePaid(facture)}
                        >
                          Encaisser
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredFactures.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      Aucune facture
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  {["Impot", "Type", "Montant", "Date paiement", "Statut", "Actions"].map((head) => (
                    <TableCell key={head} sx={{ fontWeight: 700 }}>{head}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredImpots.map((impot) => (
                  <TableRow key={impot.id} hover>
                    <TableCell><Typography fontWeight={700}>{impot.numero}</Typography></TableCell>
                    <TableCell>{impot.type}</TableCell>
                    <TableCell>{formatMoney(impot.montant)}</TableCell>
                    <TableCell>{formatDate(impot.date_paiement)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={impot.statut === "payee" ? "success" : "error"}
                        label={impot.statut === "payee" ? "Decaisse" : "A decaisser"}
                      />
                    </TableCell>
                    <TableCell>
                      {impot.statut !== "payee" && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<CheckCircle />}
                          onClick={() => navigate("/impots")}
                        >
                          Joindre preuve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredImpots.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      Aucun impot
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
};

export default Tresorerie;
