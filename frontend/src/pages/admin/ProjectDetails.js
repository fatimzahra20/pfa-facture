import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Delete,
  AttachMoney,
  Event,
  Person,
  DescriptionOutlined,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import projetService from "../../services/projetService";
import factureService from "../../services/factureService";
import { useNotification } from "../../contexts/NotificationContext";
import { useAuth } from "../../contexts/AuthContext";

/**
 * En-tête avec informations principales du projet
 */
const HeaderSection = ({
  project,
  navigate,
  onDelete,
  factures = [],
  totalAmount = 0,
  baseProjetsPath,
  canManage,
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
          onClick={() => navigate(baseProjetsPath)}
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
          {project.titre}
        </Typography>
        {project.description && (
          <Typography
            variant="body2"
            sx={{ mb: 2, color: "rgba(255, 255, 255, 0.9)" }}
          >
            {project.description}
          </Typography>
        )}
        <Box display="flex" gap={2} flexWrap="wrap">
          <Chip
            icon={<Event sx={{ color: "white" }} />}
            label={`${new Date(project.date_debut).toLocaleDateString(
              "fr-FR",
            )} - ${new Date(project.date_fin).toLocaleDateString("fr-FR")}`}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              "& .MuiChip-icon": { color: "white" },
            }}
          />
          <Chip
            label={project.responsable || "Sans responsable"}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              color: "white",
            }}
          />
          <Chip
            label={
              project.statut
                ? project.statut.charAt(0).toUpperCase() +
                  project.statut.slice(1).replace("_", " ")
                : "Statut inconnu"
            }
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              color: "white",
            }}
          />
        </Box>
      </Box>

      <Box display="flex" gap={3} ml={10}>
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
            {(project.budget || 0).toLocaleString("fr-FR", {
              style: "currency",
              currency: "MAD",
            })}
          </Typography>
        </Box>
      </Box>

      {canManage && <Box display="flex" gap={1} flexShrink={0}>
        <Tooltip title="Modifier">
          <IconButton
            sx={{ color: "white", bgcolor: "rgba(255, 255, 255, 0.2)" }}
            onClick={() => navigate(`/admin/projets/${project.id}/edit`)}
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
      </Box>}
    </Box>
  </Box>
);

/**
 * Section des factures
 */
const InvoicesSection = ({ invoices = [] }) => (
  <Card
    sx={{
      borderRadius: 3,
      boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      border: "1px solid rgba(0, 0, 0, 0.04)",
    }}
  >
    <CardContent sx={{ p: 0 }}>
      <Box sx={{ p: 3, pb: 0 }}>
        <Typography
          variant="h6"
          fontWeight={700}
          color="primary"
          sx={{ letterSpacing: "-0.3px" }}
        >
          Historique des Factures
        </Typography>
      </Box>
      <Divider sx={{ my: 2 }} />

      {invoices.length === 0 ? (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Box sx={{ mb: 2 }}>
            <DescriptionOutlined
              sx={{ fontSize: 48, color: "action.disabled", mb: 1 }}
            />
          </Box>
          <Typography color="textSecondary">
            Aucune facture pour ce projet
          </Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>Numéro</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Montant HT</TableCell>
                <TableCell>Montant TTC</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id} hover>
                  <TableCell fontWeight={600}>{invoice.numero}</TableCell>
                  <TableCell>{invoice.client?.nom}</TableCell>
                  <TableCell>
                    {invoice.total_ht?.toLocaleString("fr-FR")} DH
                  </TableCell>
                  <TableCell>
                    {invoice.total_ttc?.toLocaleString("fr-FR")} DH
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        invoice.statut === "en_attente"
                          ? "En attente"
                          : invoice.statut === "validee"
                            ? "Validée"
                            : "Payée"
                      }
                      size="small"
                      color={
                        invoice.statut === "en_attente"
                          ? "warning"
                          : invoice.statut === "validee"
                            ? "primary"
                            : "success"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(invoice.created_at).toLocaleDateString("fr-FR")}
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
 * Dialog de suppression
 */
const DeleteConfirmDialog = ({ open, onClose, onConfirm, isDeleting }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Confirmer la suppression</DialogTitle>
    <DialogContent>
      <Typography>
        Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est
        irréversible.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={isDeleting}>
        Annuler
      </Button>
      <Button
        onClick={onConfirm}
        color="error"
        variant="contained"
        disabled={isDeleting}
      >
        {isDeleting ? <CircularProgress size={20} /> : "Supprimer"}
      </Button>
    </DialogActions>
  </Dialog>
);

/**
 * Page principale de détails du projet
 */
const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { userRole } = useAuth();
  const canManage = userRole === "admin";
  const baseProjetsPath = canManage ? "/admin/projets" : "/projets";

  const [project, setProject] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const projectData = await projetService.getProjet(id);
      setProject(projectData);

      // Charger les factures du projet
      if (projectData.factures) {
        setInvoices(projectData.factures);
      }
    } catch (error) {
      console.error("Erreur:", error);
      showNotification("Erreur lors du chargement", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await projetService.deleteProjet(id);
      showNotification("Projet supprimé avec succès", "success");
      navigate(baseProjetsPath);
    } catch (error) {
      console.error("Erreur:", error);
      showNotification("Erreur lors de la suppression", "error");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

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

  if (!project) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          Projet non trouvé
        </Typography>
      </Box>
    );
  }

  const totalAmount = invoices.reduce(
    (sum, inv) => sum + (inv.total_ttc || 0),
    0,
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa", pb: 6 }}>
      <HeaderSection
        project={project}
        navigate={navigate}
        onDelete={() => setDeleteDialogOpen(true)}
        factures={invoices}
        totalAmount={totalAmount}
        baseProjetsPath={baseProjetsPath}
        canManage={canManage}
      />

      <Box sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <InvoicesSection invoices={invoices} />
      </Box>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </Box>
  );
};

export default ProjectDetails;

