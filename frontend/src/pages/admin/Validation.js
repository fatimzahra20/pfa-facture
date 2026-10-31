// src/pages/admin/Validation.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Card, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Chip, IconButton, Button,
  CircularProgress, Tooltip, TextField, InputAdornment, Alert, Dialog,
  DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { CheckCircle, Cancel, Visibility, Search, PictureAsPdf, Email } from '@mui/icons-material';
import { getFactures, updateFacture } from '../../services/factureService';
import { getClients } from '../../services/clientService';
import { generateFacturePDF } from '../../utils/pdfGenerator';
import { STATUTS } from '../../utils/factureCalculs';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';

const DetailDialog = ({ open, onClose, facture, client }) => {
  if (!facture) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>Détail facture — {facture.numero}</Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
          <Box>
            <Typography variant="caption" color="text.secondary">CLIENT</Typography>
            <Typography fontWeight={700}>{client?.nom || '—'}</Typography>
            <Typography variant="body2" color="text.secondary">{client?.email}</Typography>
            <Typography variant="body2" color="text.secondary">{client?.adresse}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">INFORMATIONS</Typography>
            <Typography variant="body2">Date : {facture.date_creation ? new Date(facture.date_creation).toLocaleDateString('fr-FR') : '—'}</Typography>
            <Typography variant="body2">Méthode : {facture.methode_facturation}</Typography>
            <Typography variant="body2">Type virement : {facture.type_virement || '—'}</Typography>
            {facture.notes && <Typography variant="body2" mt={1}><b>Notes :</b> {facture.notes}</Typography>}
          </Box>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                {['Désignation', 'Qté', 'Prix U.', 'TVA%', 'Total HT'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {(facture.articles || []).map((a, i) => (
                <TableRow key={i}>
                  <TableCell>{a.designation}</TableCell>
                  <TableCell>{a.quantite}</TableCell>
                  <TableCell>{Number(a.prix_unitaire).toFixed(2)} €</TableCell>
                  <TableCell>{a.tva_pct}%</TableCell>
                  <TableCell>{Number(a.total_ht_ligne || a.quantite * a.prix_unitaire).toFixed(2)} €</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Box sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 2, minWidth: 220 }}>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <Typography variant="body2" color="text.secondary">Total HT</Typography>
              <Typography variant="body2" fontWeight={600}>{Number(facture.total_ht).toFixed(2)} €</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <Typography variant="body2" color="text.secondary">TVA</Typography>
              <Typography variant="body2" fontWeight={600}>{Number(facture.tva).toFixed(2)} €</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" sx={{ borderTop: '2px solid', borderColor: 'primary.main', pt: 1, mt: 1 }}>
              <Typography fontWeight={700}>Total TTC</Typography>
              <Typography fontWeight={800} color="primary">{Number(facture.total_ttc).toFixed(2)} €</Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={() => generateFacturePDF(facture, client)} startIcon={<PictureAsPdf />} variant="outlined" sx={{ borderRadius: 2 }}>
          Télécharger PDF
        </Button>
        <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2 }}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

const Validation = () => {
  const [factures, setFactures] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const { showNotification } = useNotification();
  const { currentUser } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      const [f, c] = await Promise.all([getFactures(), getClients()]);
      setFactures(f.sort((a, b) => (b.created_at || 0) - (a.created_at || 0)));
      setClients(c);
    } catch { showNotification('Erreur de chargement', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const clientMap = useMemo(() => {
    const m = {};
    clients.forEach(c => { m[c.id] = c; });
    return m;
  }, [clients]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return factures.filter(f => {
      const c = clientMap[f.client_id];
      return !search || f.numero?.toLowerCase().includes(q) || c?.nom?.toLowerCase().includes(q);
    });
  }, [factures, clientMap, search]);

  const handleValidate = async (facture) => {
    try {
      await updateFacture(facture.id, {
        validated_by_admin: true,
        validated_at: new Date().toISOString(),
        validated_by_uid: currentUser?.uid
      });
      showNotification(`Facture ${facture.numero} validée`, 'success');
      load();
    } catch { showNotification('Erreur de validation', 'error'); }
  };

  const handleReject = async (facture) => {
    if (!window.confirm(`Rejeter la facture ${facture.numero} ?`)) return;
    try {
      await updateFacture(facture.id, { statut: 'rejetee', validated_by_admin: false });
      showNotification(`Facture ${facture.numero} rejetée`, 'warning');
      load();
    } catch { showNotification('Erreur', 'error'); }
  };

  const nonValidees = factures.filter(f => !f.validated_by_admin).length;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={400}>Factures</Typography>
          <Typography variant="body2" color="text.secondary">
            {factures.length} facture{factures.length !== 1 ? "s" : ""} enregistrée
            {factures.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
        {nonValidees > 0 && (
          <Chip label={`${nonValidees} à valider`} color="warning" sx={{ fontWeight: 700 }} />
        )}
      </Box>

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField size="small" placeholder="Rechercher n° ou client..."
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" color="action" /></InputAdornment> }}
            sx={{ maxWidth: 360 }} />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                {['N° Facture', 'Client', 'Total TTC', 'Statut', 'Validation admin', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: 13 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8 }}><CircularProgress /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">Aucune facture</Typography>
                </TableCell></TableRow>
              ) : (
                filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(facture => {
                  const client = clientMap[facture.client_id];
                  const statut = STATUTS[facture.statut] || { label: facture.statut, color: 'default' };
                  return (
                    <TableRow key={facture.id} hover sx={{
                      bgcolor: !facture.validated_by_admin ? 'rgba(245,158,11,0.04)' : 'inherit'
                    }}>
                      <TableCell>
                        <Typography fontWeight={700} color="primary">{facture.numero}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{client?.nom || '—'}</Typography>
                        <Typography variant="caption" color="text.secondary">{client?.email}</Typography>
                      </TableCell>
                      <TableCell><Typography fontWeight={700}>{Number(facture.total_ttc).toFixed(2)} €</Typography></TableCell>
                      <TableCell><Chip label={statut.label} color={statut.color} size="small" /></TableCell>
                      <TableCell>
                        <Chip
                          label={facture.validated_by_admin ? '✓ Validée' : '⏳ Non validée'}
                          color={facture.validated_by_admin ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="Voir détails">
                            <IconButton size="small" onClick={() => { setSelectedFacture(facture); setDetailOpen(true); }}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {!facture.validated_by_admin && (
                            <Tooltip title="Valider">
                              <IconButton size="small" color="success" onClick={() => handleValidate(facture)}>
                                <CheckCircle fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {facture.statut !== 'rejetee' && (
                            <Tooltip title="Rejeter">
                              <IconButton size="small" color="error" onClick={() => handleReject(facture)}>
                                <Cancel fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={filtered.length} page={page}
          rowsPerPage={rowsPerPage} onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={e => { setRowsPerPage(+e.target.value); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Lignes/page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`} />
      </Card>

      <DetailDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        facture={selectedFacture}
        client={selectedFacture ? clientMap[selectedFacture.client_id] : null}
      />
    </Box>
  );
};

export default Validation;
