// src/pages/user/InvoiceList.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Card, Button, Typography, TextField, Chip, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, InputAdornment, Tooltip, CircularProgress,
  MenuItem, Select, FormControl, InputLabel, Menu
} from '@mui/material';
import {
  Add, Edit, Delete, Search, PictureAsPdf, MoreVert, FilterList, Visibility
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getFactures, deleteFacture } from '../../services/factureService';
import { getClients } from '../../services/clientService';
import { generateFacturePDF } from '../../utils/pdfGenerator';
import { STATUTS } from '../../utils/factureCalculs';
import { useNotification } from '../../contexts/NotificationContext';

const InvoiceList = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [factures, setFactures] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadData = async () => {
    setLoading(true);
    try {
      const [f, c] = await Promise.all([getFactures(), getClients()]);
      setFactures(f);
      setClients(c);
    } catch {
      showNotification('Erreur de chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const clientMap = useMemo(() => {
    const m = {};
    clients.forEach(c => { m[c.id] = c; });
    return m;
  }, [clients]);

  const filtered = useMemo(() => {
    return factures.filter(f => {
      const client = clientMap[f.client_id];
      const matchSearch = !search ||
        f.numero?.toLowerCase().includes(search.toLowerCase()) ||
        client?.nom?.toLowerCase().includes(search.toLowerCase());
      const matchStatut = !filterStatut || f.statut === filterStatut;
      return matchSearch && matchStatut;
    }).sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
  }, [factures, clientMap, search, filterStatut]);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette facture ?')) return;
    try {
      await deleteFacture(id);
      showNotification('Facture supprimée', 'warning');
      loadData();
    } catch {
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  const handlePDF = (facture) => {
    const client = clientMap[facture.client_id];
    generateFacturePDF(facture, client);
  };

  const totalTTC = useMemo(() => filtered.reduce((s, f) => s + (Number(f.total_ttc) || 0), 0), [filtered]);
  const totalPayee = useMemo(() => filtered.filter(f => f.statut === 'payee').reduce((s, f) => s + (Number(f.total_ttc) || 0), 0), [filtered]);

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={400}>Factures</Typography>
          <Typography variant="body2" color="text.secondary">{filtered.length} facture(s)</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/factures/creer')}
          sx={{ borderRadius: 2, px: 3 }}>
          Nouvelle facture
        </Button>
      </Box>

      {/* Résumé rapide */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        {[
          { label: 'Total (affiché)', value: `${totalTTC.toFixed(2)} €` },
          { label: 'Encaissé', value: `${totalPayee.toFixed(2)} €` },
          { label: 'En attente', value: filtered.filter(f => f.statut === 'en_attente').length },
          { label: 'Rejetées', value: filtered.filter(f => f.statut === 'rejetee').length }
        ].map(stat => (
          <Card key={stat.label} elevation={0}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 2.5, py: 1.5, flex: '1 1 130px' }}>
            <Typography variant="caption" sx={{ color: "#000" }}>{stat.label}</Typography>
            <Typography variant="h6" fontWeight={800} sx={{ color: "#000" }}>{stat.value}</Typography>
          </Card>
        ))}
      </Box>

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        {/* Filtres */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', gap: 2 }}>
          <TextField
            size="small" placeholder="Rechercher n° facture, client..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" color="action" /></InputAdornment> }}
            sx={{ flex: 1, maxWidth: 360 }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Statut</InputLabel>
            <Select value={filterStatut} onChange={e => { setFilterStatut(e.target.value); setPage(0); }} label="Statut">
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="en_attente">En attente</MenuItem>
              <MenuItem value="payee">Payée</MenuItem>
              <MenuItem value="rejetee">Rejetée</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                {['N° Facture', 'Client', 'Date', 'Total TTC', 'Statut', 'Validée', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: 13 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">Aucune facture trouvée</Typography>
                </TableCell></TableRow>
              ) : (
                filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(facture => {
                  const client = clientMap[facture.client_id];
                  const statut = STATUTS[facture.statut] || { label: facture.statut, color: 'default' };
                  return (
                    <TableRow key={facture.id} hover>
                      <TableCell>
                        <Typography fontWeight={700} color="primary">{facture.numero}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{client?.nom || '—'}</Typography>
                        <Typography variant="caption" color="text.secondary">{client?.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {facture.date_creation ? new Date(facture.date_creation).toLocaleDateString('fr-FR') : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={700}>{Number(facture.total_ttc).toFixed(2)} €</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={statut.label} color={statut.color} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={facture.validated_by_admin ? 'Validée' : 'En attente'}
                          color={facture.validated_by_admin ? 'success' : 'default'}
                          size="small" variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="Modifier">
                            <IconButton size="small" color="primary"
                              onClick={() => navigate(`/factures/modifier/${facture.id}`)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Télécharger PDF">
                            <IconButton size="small" color="secondary" onClick={() => handlePDF(facture)}>
                              <PictureAsPdf fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton size="small" color="error" onClick={() => handleDelete(facture.id)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div" count={filtered.length} page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={e => { setRowsPerPage(+e.target.value); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Lignes/page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </Card>
    </Box>
  );
};

export default InvoiceList;

