import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Avatar,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Delete,
  DescriptionOutlined,
  Phone,
  Email,
  LocationOn,
  AttachMoney,
  Add,
} from "@mui/icons-material";
import { getClientById, deleteClient } from "../../services/clientService";
import { getFacturesByClient } from "../../services/factureService";
import { useNotification } from "../../contexts/NotificationContext";
import { useAuth } from "../../contexts/AuthContext";

// ==================== Composants Auxiliaires ====================

/**
 * En-tête avec informations principales du client
 */
const HeaderSection = ({
  client,
  initials,
  baseClientsPath,
  id,
  navigate,
  onDelete,
  invoices,
  totalAmount,
}) => (
  <Box
    sx={{
      background: "#064e3b",
      color: "white",
      p: 4,
      mb: 4,
      boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
    }}
  >
    <Box display="flex" alignItems="center" gap={2} mb={3}>
      <Tooltip title="Retour">
        <IconButton
          onClick={() => navigate(baseClientsPath)}
          sx={{ color: "white" }}
        >
          <ArrowBack />
        </IconButton>
      </Tooltip>
    </Box>

    <Box
      display="flex"
      alignItems="center"
      gap={4}
      justifyContent="space-between"
    >
      <Box flex={1}>
        <Typography variant="h5" fontWeight={400} mb={2}>
          {client.nom}
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Chip
            icon={<Email sx={{ color: "white" }} />}
            label={client.email}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              "& .MuiChip-icon": { color: "white" },
            }}
          />
          <Chip
            icon={<Phone sx={{ color: "white" }} />}
            label={client.tel}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              "& .MuiChip-icon": { color: "white" },
            }}
          />
        </Box>
      </Box>

      <Box display="flex" gap={3} ml={10}>
        {/* Carte Factures */}
        <Box
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            p: 2,
            minWidth: "140px",
            textAlign: "center",
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={1}
            mb={1}
          >
            <DescriptionOutlined sx={{ fontSize: "18px" }} />
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{ fontSize: "11px", letterSpacing: "0.5px" }}
            >
              FACTURES
            </Typography>
          </Box>
          <Typography variant="body1" fontWeight={800}>
            {invoices?.length || 0}
          </Typography>
        </Box>

        {/* Carte Budget */}
        <Box
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            p: 2,
            minWidth: "140px",
            textAlign: "center",
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={1}
            mb={1}
          >
            <AttachMoney sx={{ fontSize: "18px" }} />
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{ fontSize: "11px", letterSpacing: "0.5px" }}
            >
              BUDGET
            </Typography>
          </Box>
          <Typography variant="body1" fontWeight={800}>
            {(totalAmount || 0).toLocaleString("fr-FR", {
              style: "currency",
              currency: "MAD",
            })}
          </Typography>
        </Box>
      </Box>

      <Box flex={1} />

      <Box display="flex" gap={1} flexShrink={0}>
        <Tooltip title="Modifier">
          <IconButton
            sx={{ color: "white", bgcolor: "rgba(255, 255, 255, 0.2)" }}
            onClick={() => navigate(`${baseClientsPath}/${id}/edit`)}
          >
            <Edit />
          </IconButton>
        </Tooltip>
        <Tooltip title="Supprimer">
          <IconButton
            sx={{ color: "white", bgcolor: "rgba(255, 255, 255, 0.2)" }}
            onClick={onDelete}
          >
            <Delete />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  </Box>
);

/**
 * Carte des informations de contact
 */
const ContactCard = ({ client }) => (
  <Card
    sx={{
      borderRadius: 3,
      boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      border: "1px solid rgba(0, 0, 0, 0.04)",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      "&:hover": {
        boxShadow: "0 8px 32px rgba(6, 78, 59, 0.12)",
        transform: "translateY(-6px)",
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Typography
        variant="h6"
        fontWeight={700}
        mb={2.5}
        color="primary"
        sx={{ letterSpacing: "-0.3px" }}
      >
        Informations de contact
      </Typography>
      <Divider sx={{ mb: 2.5 }} />

      <Box display="flex" alignItems="center" gap={2.5} mb={2.5}>
        <Email sx={{ color: "primary.main", fontSize: "24px" }} />
        <Box>
          <Typography
            variant="caption"
            color="textSecondary"
            fontWeight={600}
            sx={{ fontSize: "11px", letterSpacing: "0.5px" }}
          >
            EMAIL
          </Typography>
          <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>
            {client.email}
          </Typography>
        </Box>
      </Box>

      <Box display="flex" alignItems="center" gap={2.5} mb={2.5}>
        <Phone sx={{ color: "primary.main", fontSize: "24px" }} />
        <Box>
          <Typography
            variant="caption"
            color="textSecondary"
            fontWeight={600}
            sx={{ fontSize: "11px", letterSpacing: "0.5px" }}
          >
            TÉLÉPHONE
          </Typography>
          <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>
            {client.tel}
          </Typography>
        </Box>
      </Box>

      <Box display="flex" alignItems="flex-start" gap={2.5}>
        <LocationOn sx={{ color: "primary.main", mt: 0.5, fontSize: "24px" }} />
        <Box>
          <Typography
            variant="caption"
            color="textSecondary"
            fontWeight={600}
            sx={{ fontSize: "11px", letterSpacing: "0.5px" }}
          >
            ADRESSE
          </Typography>
          <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>
            {client.adresse}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

/**
 * Cartes de statistiques (Factures et Montant Total)
 */
const StatisticsCards = ({ invoices, totalAmount }) => (
  <>
    <Card
      sx={{
        borderRadius: 3,
        background: "#064e3b",
        color: "white",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 12px 40px rgba(15, 23, 42, 0.3)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
          <DescriptionOutlined sx={{ fontSize: "22px" }} />
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{ fontSize: "12px", letterSpacing: "0.5px" }}
          >
            FACTURES
          </Typography>
        </Box>
        <Typography variant="h3" fontWeight={800}>
          {invoices.length}
        </Typography>
      </CardContent>
    </Card>

    <Card
      sx={{
        borderRadius: 3,
        background: "#064e3b",
        color: "white",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 12px 40px rgba(15, 23, 42, 0.3)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
          <AttachMoney sx={{ fontSize: "22px" }} />
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{ fontSize: "12px", letterSpacing: "0.5px" }}
          >
            MONTANT TOTAL
          </Typography>
        </Box>
        <Typography variant="h3" fontWeight={800}>
          {totalAmount.toLocaleString("fr-FR", {
            style: "currency",
            currency: "TND",
          })}
        </Typography>
      </CardContent>
    </Card>
  </>
);

/**
 * Section d'historique des factures avec tableau
 */
const InvoicesSection = ({ invoices, onCreateInvoice, navigate }) => (
  <Card
    sx={{
      borderRadius: 3,
      boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      border: "1px solid rgba(0, 0, 0, 0.04)",
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2.5}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          color="primary"
          sx={{ letterSpacing: "-0.3px" }}
        >
          Historique des factures
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onCreateInvoice}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            background: "#064e3b",
            boxShadow: "0 4px 12px rgba(6, 78, 59, 0.25)",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "#053f30",
              boxShadow: "0 6px 20px rgba(6, 78, 59, 0.35)",
              transform: "translateY(-2px)",
            },
          }}
        >
          Nouvelle facture
        </Button>
      </Box>
      <Divider sx={{ mb: 2.5 }} />

      {invoices.length === 0 ? (
        <Box textAlign="center" py={5}>
          <DescriptionOutlined
            sx={{ fontSize: 56, color: "text.disabled", mb: 2, opacity: 0.5 }}
          />
          <Typography color="textSecondary" fontWeight={500}>
            Aucune facture pour ce client
          </Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{ bgcolor: "#fafbfc", borderBottom: "2px solid #d1fae5" }}
              >
                <TableCell
                  fontWeight={700}
                  sx={{
                    fontSize: "12px",
                    letterSpacing: "0.5px",
                    color: "#666",
                  }}
                >
                  RÉFÉRENCE
                </TableCell>
                <TableCell
                  align="right"
                  fontWeight={700}
                  sx={{
                    fontSize: "12px",
                    letterSpacing: "0.5px",
                    color: "#666",
                  }}
                >
                  MONTANT
                </TableCell>
                <TableCell
                  fontWeight={700}
                  sx={{
                    fontSize: "12px",
                    letterSpacing: "0.5px",
                    color: "#666",
                  }}
                >
                  DATE
                </TableCell>
                <TableCell
                  fontWeight={700}
                  sx={{
                    fontSize: "12px",
                    letterSpacing: "0.5px",
                    color: "#666",
                  }}
                >
                  STATUT
                </TableCell>
                <TableCell
                  align="center"
                  fontWeight={700}
                  sx={{
                    fontSize: "12px",
                    letterSpacing: "0.5px",
                    color: "#666",
                  }}
                >
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  sx={{
                    borderBottom: "1px solid #f0f0f0",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "rgba(6, 78, 59, 0.04)",
                    },
                  }}
                >
                  <TableCell fontWeight={600} sx={{ color: "#064e3b" }}>
                    {invoice.numero}
                  </TableCell>
                  <TableCell
                    align="right"
                    fontWeight={600}
                    sx={{ color: "#064e3b" }}
                  >
                    {(invoice.montant || 0).toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "TND",
                    })}
                  </TableCell>
                  <TableCell sx={{ color: "#666" }}>
                    {new Date(invoice.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.statut || "Créée"}
                      size="small"
                      sx={{
                        bgcolor:
                          invoice.statut === "payée" ? "#d4edda" : "#fff3cd",
                        color:
                          invoice.statut === "payée" ? "#155724" : "#856404",
                        fontWeight: 600,
                        border: "1px solid",
                        borderColor:
                          invoice.statut === "payée" ? "#c3e6cb" : "#ffeaa7",
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Voir la facture">
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate(`/factures/modifier/${invoice.id}`)
                        }
                        sx={{
                          color: "primary.main",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: "rgba(6, 78, 59, 0.1)",
                            transform: "scale(1.1)",
                          },
                        }}
                      >
                        <DescriptionOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </CardContent>
  </Card>
);

/**
 * Dialog de confirmation de suppression
 */
const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  clientName,
  isLoading,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    PaperProps={{
      sx: {
        borderRadius: 3,
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
      },
    }}
  >
    <DialogTitle
      fontWeight={800}
      sx={{ pb: 1.5, fontSize: "18px", letterSpacing: "-0.3px" }}
    >
      Confirmer la suppression
    </DialogTitle>
    <DialogContent sx={{ py: 2.5 }}>
      <Typography sx={{ mt: 1 }}>
        Êtes-vous sûr de vouloir supprimer le client{" "}
        <strong>{clientName}</strong> ? Cette action est{" "}
        <strong>irréversible</strong>.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ p: 2, gap: 1 }}>
      <Button
        onClick={onClose}
        disabled={isLoading}
        sx={{ textTransform: "none", fontWeight: 600 }}
      >
        Annuler
      </Button>
      <Button
        variant="contained"
        color="error"
        onClick={onConfirm}
        disabled={isLoading}
        sx={{
          textTransform: "none",
          fontWeight: 600,
          background: "linear-gradient(135deg, #f44336 0%, #e91e63 100%)",
          boxShadow: "0 4px 12px rgba(244, 67, 54, 0.3)",
          transition: "all 0.3s ease",
          "&:hover:not(:disabled)": {
            boxShadow: "0 6px 20px rgba(244, 67, 54, 0.4)",
            transform: "translateY(-2px)",
          },
          "&:disabled": {
            opacity: 0.7,
          },
        }}
      >
        {isLoading ? "Suppression..." : "Supprimer"}
      </Button>
    </DialogActions>
  </Dialog>
);

// ==================== Composant Principal ====================

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { userRole } = useAuth();
  const [client, setClient] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const baseClientsPath = userRole === "admin" ? "/admin/clients" : "/clients";

  // ==================== Effects ====================

  useEffect(() => {
    loadClientDetails();
  }, [id]);

  // ==================== Functions ====================

  const loadClientDetails = async () => {
    try {
      setLoading(true);
      const clientData = await getClientById(id);
      setClient(clientData);

      // Charger les factures du client
      try {
        const invoicesData = await getFacturesByClient(id);
        setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      } catch {
        setInvoices([]);
      }
    } catch (error) {
      showNotification("Erreur lors du chargement du client", "error");
      navigate(baseClientsPath);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteClient(id);
      showNotification("Client supprimé avec succès", "success");
      setDeleteDialogOpen(false);
      navigate(baseClientsPath);
    } catch {
      showNotification("Erreur lors de la suppression", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateInvoice = () => {
    navigate("/factures/creer", { state: { clientId: id } });
  };

  // ==================== Render ====================

  // État de chargement
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Client non trouvé
  if (!client) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          Client non trouvé
        </Typography>
      </Box>
    );
  }

  // Calculs utiles
  const totalAmount = invoices.reduce(
    (sum, inv) => sum + (inv.montant || 0),
    0,
  );
  const initials =
    client.nom
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "C";

  // Render principal
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa", pb: 6 }}>
      {/* En-tête avec gradient */}
      <HeaderSection
        client={client}
        initials={initials}
        baseClientsPath={baseClientsPath}
        id={id}
        navigate={navigate}
        onDelete={() => setDeleteDialogOpen(true)}
        invoices={invoices}
        totalAmount={totalAmount}
      />

      {/* Contenu principal */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Section Factures */}
        <InvoicesSection
          invoices={invoices}
          onCreateInvoice={handleCreateInvoice}
          navigate={navigate}
        />
      </Box>

      {/* Dialog de suppression */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        clientName={client?.nom}
        isLoading={isDeleting}
      />
    </Box>
  );
};

export default ClientDetails;
