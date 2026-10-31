// src/pages/user/CreateInvoice.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  FormControlLabel,
  InputLabel,
  IconButton,
  Divider,
  Chip,
  CircularProgress,
  FormHelperText,
  Switch,
} from "@mui/material";
import {
  PictureAsPdf,
  Save,
  ArrowBack,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { getClients } from "../../services/clientService";
import { getProjets } from "../../services/projetService";
import {
  addFacture,
  getFactureById,
  getNextFactureNumber,
  updateFacture,
} from "../../services/factureService";
import {
  calculerTotaux,
  METHODES_FACTURATION,
  TYPES_VIREMENT,
} from "../../utils/factureCalculs";
import { generateFacturePDF } from "../../utils/pdfGenerator";
import { useNotification } from "../../contexts/NotificationContext";
import { useAuth } from "../../contexts/AuthContext";

const TVA_OPTIONS = [5.5, 10, 20];
const FACTURATION_METHODES_PROJET = METHODES_FACTURATION.filter((m) =>
  ["ht_tva", "remise_globale"].includes(m.value),
);

const inputStyle = {
  "& .MuiInputBase-root": {
    minHeight: 56,
    alignItems: "center",
  },
  "& .MuiSelect-select": {
    minHeight: "24px !important",
    display: "flex",
    alignItems: "center",
  },
};

const inputGridStyle = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, minmax(0, 1fr))",
  },
  gap: 2,
  alignItems: "start",
  width: "100%",
  "& .MuiFormControl-root": {
    width: "100%",
    minHeight: 82,
  },
  "& .MuiTextField-root": {
    width: "100%",
    minHeight: 82,
  },
  "& .MuiInputBase-root": {
    width: "100%",
    minHeight: 56,
    alignItems: "center",
  },
  "& .MuiSelect-select": {
    minHeight: "24px !important",
    display: "flex",
    alignItems: "center",
  },
};

const ligneDefault = () => ({
  projet_id: null,
  designation: "",
  prix_unitaire: 0,
  quantite: 1,
  tva_pct: 20,
  remise_pct: 0,
  categorie_id: null,
});

const CreateInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { currentUser } = useAuth();

  const [clients, setClients] = useState([]);
  const [projets, setProjets] = useState([]);
  const [totaux, setTotaux] = useState({
    total_ht: 0,
    tva: 0,
    total_ttc: 0,
    montant_remise: 0,
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [numeroFacture, setNumeroFacture] = useState("");

  // Chargemement initial
  useEffect(() => {
    const init = async () => {
      try {
        const [c, p, num] = await Promise.all([
          getClients(),
          getProjets(),
          !id ? getNextFactureNumber() : Promise.resolve(""),
        ]);
        setClients(c);
        setProjets(p);
        if (!id) setNumeroFacture(num);

        if (id) {
          const f = await getFactureById(id);
          if (f) {
            setNumeroFacture(f.numero);
            formik.setValues({
              client_id: f.client_id || "",
              projet_id: f.projet_id || null,
              methode_facturation: f.methode_facturation || "ht_tva",
              tva_pct: f.tva_pct || 20,
              remise_globale: f.remise_globale || 0,
              lignes:
                f.articles?.length > 0
                  ? f.articles.map((ligne) => ({
                      ...ligne,
                      projet_id: ligne.projet_id || f.projet_id || null,
                    }))
                  : [ligneDefault()],
              statut: f.statut || "en_attente",
              date_depot: f.date_depot || "",
              date_encaissement: f.date_encaissement || "",
              type_virement: f.type_virement || "",
              notes: f.notes || "",
              digital_signature_enabled: Boolean(f.digital_signature_enabled),
              digital_signature_text: f.digital_signature_text || "",
              send_email_on_validation: Boolean(f.send_email_on_validation),
            });
          }
        }
      } catch (e) {
        showNotification("Erreur lors du chargement", "error");
      } finally {
        setInitialLoading(false);
      }
    };
    init();
  }, [id]);

  const formik = useFormik({
    initialValues: {
      client_id: "",
      projet_id: null,
      methode_facturation: "ht_tva",
      tva_pct: 20,
      remise_globale: 0,
      lignes: [ligneDefault()],
      statut: "en_attente",
      date_depot: "",
      date_encaissement: "",
      type_virement: "",
      notes: "",
      digital_signature_enabled: false,
      digital_signature_text: "",
      send_email_on_validation: false,
    },
    validationSchema: Yup.object({
      client_id: Yup.string().required("Veuillez sélectionner un client"),
      projet_id: Yup.string().required("Veuillez sélectionner un projet"),
      lignes: Yup.array()
        .of(
          Yup.object({
            projet_id: Yup.mixed().required("Projet requis"),
            designation: Yup.string().required("Projet requis"),
            quantite: Yup.number().min(1, "Minimum 1").required(),
            prix_unitaire: Yup.number().min(0, "Prix positif").required(),
          }),
        )
        .min(1),
    }),
    onSubmit: async (values) => {
      console.log("=== Form submitted ===");
      console.log("Values:", values);
      console.log("Errors:", formik.errors);
      setLoading(true);
      try {
        const resultTotaux = calculerTotaux(
          values.lignes,
          values.methode_facturation,
          Number(values.tva_pct),
          Number(values.remise_globale),
        );
        console.log("Calculated totals:", resultTotaux);

        const payload = {
          numero: numeroFacture,
          client_id: values.client_id,
          projet_id: values.projet_id ? Number(values.projet_id) : null,
          methode_facturation: values.methode_facturation,
          tva_pct: Number(values.tva_pct),
          remise_globale: Number(values.remise_globale),
          articles: resultTotaux.articles,
          total_ht: resultTotaux.total_ht,
          tva: resultTotaux.tva,
          total_ttc: resultTotaux.total_ttc,
          montant_remise: resultTotaux.montant_remise,
          statut: values.statut,
          date_creation: new Date().toISOString().split("T")[0],
          date_depot: values.date_depot,
          date_encaissement: values.date_encaissement,
          type_virement: values.type_virement,
          notes: values.notes,
          created_by: currentUser?.uid,
          validated_by_admin: false,
          digital_signature_enabled: values.digital_signature_enabled,
          digital_signature_text: values.digital_signature_text,
          send_email_on_validation: values.send_email_on_validation,
        };

        console.log("Payload to save:", payload);

        if (id) {
          await updateFacture(id, payload);
          showNotification("Facture modifiée avec succès", "success");
        } else {
          await addFacture(payload);
          showNotification("Facture créée avec succès", "success");
        }
        navigate("/factures");
      } catch (error) {
        console.error("Error saving invoice:", error);
        showNotification(
          "Erreur lors de la sauvegarde: " + error.message,
          "error",
        );
      } finally {
        setLoading(false);
      }
    },
  });

  const selectedClientId = formik.values.client_id
    ? String(formik.values.client_id)
    : "";
  const selectedProjetId = formik.values.projet_id
    ? String(formik.values.projet_id)
    : "";
  const filteredProjets = selectedClientId
    ? projets.filter((p) => String(p.client_id || "") === selectedClientId)
    : projets;
  const projetOptions =
    selectedProjetId &&
    !filteredProjets.some((p) => String(p.id) === selectedProjetId)
      ? [
          ...filteredProjets,
          ...projets.filter((p) => String(p.id) === selectedProjetId),
        ]
      : filteredProjets;
  const selectedClientHasNoProject =
    Boolean(selectedClientId) && filteredProjets.length === 0;
  // Recalcul des totaux à chaque changement
  useEffect(() => {
    const t = calculerTotaux(
      formik.values.lignes,
      formik.values.methode_facturation,
      Number(formik.values.tva_pct),
      Number(formik.values.remise_globale),
    );
    setTotaux(t);
  }, [
    formik.values.lignes,
    formik.values.methode_facturation,
    formik.values.tva_pct,
    formik.values.remise_globale,
  ]);

  useEffect(() => {
    const methodIsAllowed = FACTURATION_METHODES_PROJET.some(
      (m) => m.value === formik.values.methode_facturation,
    );
    if (!methodIsAllowed) {
      formik.setFieldValue("methode_facturation", "ht_tva");
    }
  }, [formik.values.methode_facturation]);

  const handleSubmit = () => {
    formik.handleSubmit();
  };

  const selectProjet = (idx, projet) => {
    if (!projet) return;

    const newLignes = [...formik.values.lignes];
    newLignes[idx] = {
      ...newLignes[idx],
      projet_id: projet.id,
      designation: projet.titre,
      prix_unitaire: projet.budget || 0,
      tva_pct: formik.values.tva_pct || 20,
      categorie_id: null,
    };

    formik.setFieldValue("projet_id", projet.id);
    if (projet.client_id) {
      formik.setFieldValue("client_id", projet.client_id);
    }
    formik.setFieldValue("lignes", newLignes);
  };

  const clearProjetSelection = () => {
    formik.setFieldValue("projet_id", "");
    formik.setFieldValue("lignes", [ligneDefault()]);
  };

  const handleClientChange = (event) => {
    const clientId = event.target.value;
    formik.setFieldValue("client_id", clientId);

    const clientProjets = projets.filter(
      (p) => String(p.client_id || "") === String(clientId),
    );
    if (clientProjets.length > 0) {
      selectProjet(0, clientProjets[0]);
    } else {
      clearProjetSelection();
    }
  };

  const handleProjetChange = (event) => {
    const projetId = event.target.value;
    const projet = projets.find((p) => String(p.id) === String(projetId));
    if (projet) {
      selectProjet(0, projet);
    } else {
      clearProjetSelection();
    }
  };

  const handlePreviewPDF = () => {
    const client = clients.find((c) => c.id === formik.values.client_id);
    const factureData = {
      numero: numeroFacture,
      date_creation: new Date().toISOString().split("T")[0],
      methode_facturation: formik.values.methode_facturation,
      articles: totaux.articles || formik.values.lignes,
      total_ht: totaux.total_ht,
      tva: totaux.tva,
      total_ttc: totaux.total_ttc,
      montant_remise: totaux.montant_remise,
      remise_globale: formik.values.remise_globale,
      statut: formik.values.statut,
      date_depot: formik.values.date_depot,
      type_virement: formik.values.type_virement,
      digital_signature_enabled: formik.values.digital_signature_enabled,
      digital_signature_text: formik.values.digital_signature_text,
    };
    generateFacturePDF(factureData, client);
  };

  const methode = formik.values.methode_facturation;

  if (initialLoading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={400}
      >
        <CircularProgress />
      </Box>
    );

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton
            onClick={() => navigate("/factures")}
            sx={{
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={400}>
              {id ? "Modifier la facture" : "Nouvelle facture"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              N° {numeroFacture}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            startIcon={<PictureAsPdf />}
            variant="outlined"
            onClick={handlePreviewPDF}
            disabled={
              !formik.values.client_id || formik.values.lignes.length === 0
            }
            sx={{ borderRadius: 2 }}
          >
            Aperçu PDF
          </Button>
          <Button
            startIcon={
              loading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Save />
              )
            }
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ borderRadius: 2, px: 3 }}
          >
            {id ? "Enregistrer" : "Créer la facture"}
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 2fr) minmax(320px, 1fr)" },
          gap: 3,
          alignItems: "start",
          width: "100%",
        }}
      >
        {/* Colonne Gauche */}
        <Box sx={{ minWidth: 0 }}>
          {/* Client & Méthode */}
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              mb: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Informations générales
              </Typography>
              <Box sx={inputGridStyle}>
                <Box>
                  <FormControl
                    fullWidth
                    sx={inputStyle}
                    error={
                      formik.touched.client_id &&
                      Boolean(formik.errors.client_id)
                    }
                  >
                    <InputLabel>Client *</InputLabel>
                    <Select
                      name="client_id"
                      value={formik.values.client_id}
                      onChange={handleClientChange}
                      label="Client *"
                    >
                      {clients.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {c.nom}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {c.email}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.client_id && formik.errors.client_id && (
                      <FormHelperText>{formik.errors.client_id}</FormHelperText>
                    )}
                  </FormControl>
                </Box>
                <Box>
                  <FormControl
                    fullWidth
                    sx={inputStyle}
                    error={
                      formik.touched.projet_id &&
                      Boolean(formik.errors.projet_id)
                    }
                  >
                    <InputLabel>Projet *</InputLabel>
                    <Select
                      name="projet_id"
                      value={formik.values.projet_id || ""}
                      onChange={handleProjetChange}
                      label="Projet *"
                    >
                      {projetOptions.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {p.titre}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {p.statut}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.projet_id && formik.errors.projet_id && (
                      <FormHelperText>{formik.errors.projet_id}</FormHelperText>
                    )}
                    {selectedClientHasNoProject && (
                      <FormHelperText sx={{ color: "warning.main" }}>
                        Ce client n'a aucun projet pour le moment.
                      </FormHelperText>
                    )}
                  </FormControl>
                </Box>
                <Box>
                  <FormControl fullWidth sx={inputStyle}>
                    <InputLabel>Méthode de facturation</InputLabel>
                    <Select
                      name="methode_facturation"
                      value={formik.values.methode_facturation}
                      onChange={formik.handleChange}
                      label="Méthode de facturation"
                    >
                      {FACTURATION_METHODES_PROJET.map((m) => (
                        <MenuItem key={m.value} value={m.value}>
                          {m.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                {(methode === "ht_tva" || methode === "remise_ligne") && (
                  <Box>
                    <FormControl fullWidth sx={inputStyle}>
                      <InputLabel>TVA globale (%)</InputLabel>
                      <Select
                        name="tva_pct"
                        value={formik.values.tva_pct}
                        onChange={formik.handleChange}
                        label="TVA globale (%)"
                      >
                        {TVA_OPTIONS.map((t) => (
                          <MenuItem key={t} value={t}>
                            {t}%
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                )}
                {methode === "remise_globale" && (
                  <>
                    <Box>
                      <TextField
                        fullWidth
                        sx={inputStyle}
                        label="TVA (%)"
                        name="tva_pct"
                        type="number"
                        value={formik.values.tva_pct}
                        onChange={formik.handleChange}
                        inputProps={{ min: 0, max: 100 }}
                      />
                    </Box>
                    <Box>
                      <TextField
                        fullWidth
                        sx={inputStyle}
                        label="Remise globale (%)"
                        name="remise_globale"
                        type="number"
                        value={formik.values.remise_globale}
                        onChange={formik.handleChange}
                        inputProps={{ min: 0, max: 100 }}
                      />
                    </Box>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Suivi de la facture */}
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Suivi & Paiement
              </Typography>
              <Box sx={inputGridStyle}>
                <Box>
                  <FormControl fullWidth sx={inputStyle}>
                    <InputLabel>Statut</InputLabel>
                    <Select
                      name="statut"
                      value={formik.values.statut}
                      onChange={formik.handleChange}
                      label="Statut"
                    >
                      <MenuItem value="en_attente">En attente</MenuItem>
                      <MenuItem value="payee">Payée</MenuItem>
                      <MenuItem value="rejetee">Rejetée</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    sx={inputStyle}
                    label="Date de dépôt"
                    name="date_depot"
                    type="date"
                    value={formik.values.date_depot}
                    onChange={formik.handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    sx={inputStyle}
                    label="Date d'encaissement"
                    name="date_encaissement"
                    type="date"
                    value={formik.values.date_encaissement}
                    onChange={formik.handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <Box>
                  <FormControl fullWidth sx={inputStyle}>
                    <InputLabel>Type de virement</InputLabel>
                    <Select
                      name="type_virement"
                      value={formik.values.type_virement}
                      onChange={formik.handleChange}
                      label="Type de virement"
                    >
                      {TYPES_VIREMENT.map((t) => (
                        <MenuItem key={t} value={t}>
                          {t}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <TextField
                    fullWidth
                    sx={inputStyle}
                    label="Notes / Commentaires"
                    name="notes"
                    multiline
                    rows={2}
                    value={formik.values.notes}
                    onChange={formik.handleChange}
                  />
                </Box>
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="digital_signature_enabled"
                        checked={formik.values.digital_signature_enabled}
                        onChange={formik.handleChange}
                      />
                    }
                    label="Signature numérique"
                  />
                </Box>
                {formik.values.digital_signature_enabled && (
                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <TextField
                      fullWidth
                      sx={inputStyle}
                      label="Texte de la signature"
                      name="digital_signature_text"
                      value={formik.values.digital_signature_text}
                      onChange={formik.handleChange}
                      placeholder="Ex: Signé numériquement par MaFacture"
                    />
                  </Box>
                )}
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="send_email_on_validation"
                        checked={formik.values.send_email_on_validation}
                        onChange={formik.handleChange}
                      />
                    }
                    label="Envoyer directement par email au client en cas de validation"
                  />
                  <FormHelperText>
                    L'email sera envoyé automatiquement quand la facture sera validée.
                  </FormHelperText>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Colonne Droite – Récapitulatif */}
        <Box sx={{ minWidth: 0 }}>
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              position: "sticky",
              top: 80,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={3}>
                Récapitulatif
              </Typography>

              <Box display="flex" justifyContent="space-between" mb={1.5}>
                <Typography color="text.secondary">Total HT</Typography>
                <Typography fontWeight={600}>
                  {totaux.total_ht.toFixed(2)} €
                </Typography>
              </Box>

              {totaux.montant_remise > 0 && (
                <Box display="flex" justifyContent="space-between" mb={1.5}>
                  <Typography color="error.main">
                    Remise ({formik.values.remise_globale}%)
                  </Typography>
                  <Typography color="error.main" fontWeight={600}>
                    - {totaux.montant_remise.toFixed(2)} €
                  </Typography>
                </Box>
              )}

              <Box display="flex" justifyContent="space-between" mb={1.5}>
                <Typography color="text.secondary">TVA</Typography>
                <Typography fontWeight={600}>
                  {totaux.tva.toFixed(2)} €
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  bgcolor: "primary.main",
                  borderRadius: 2,
                  p: 2,
                  color: "white",
                }}
              >
                <Typography fontWeight={700} fontSize={16}>
                  TOTAL TTC
                </Typography>
                <Typography fontWeight={900} fontSize={22}>
                  {totaux.total_ttc.toFixed(2)} €
                </Typography>
              </Box>

              <Chip
                label={formik.values.methode_facturation
                  .replace(/_/g, " ")
                  .toUpperCase()}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ mt: 2 }}
              />

              <Divider sx={{ my: 2 }} />

              {formik.values.client_id && (
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                  >
                    CLIENT SÉLECTIONNÉ
                  </Typography>
                  <Box
                    sx={{ mt: 1, p: 1.5, bgcolor: "#f8fafc", borderRadius: 2 }}
                  >
                    {(() => {
                      const c = clients.find(
                        (x) => x.id === formik.values.client_id,
                      );
                      return c ? (
                        <>
                          <Typography variant="body2" fontWeight={700}>
                            {c.nom}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {c.email}
                          </Typography>
                        </>
                      ) : null;
                    })()}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default CreateInvoice;







