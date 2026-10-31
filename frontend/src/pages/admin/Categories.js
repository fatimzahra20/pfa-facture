// src/pages/admin/Categories.js
import React, { useState, useEffect } from 'react';
import {
  Box, Card, Button, Typography, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, InputAdornment,
  CircularProgress, Alert, Tooltip
} from '@mui/material';
import { Add, Edit, Delete, Search, Close, Category } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getCategories, addCategorie, updateCategorie, deleteCategorie } from '../../services/categoryService';
import { useNotification } from '../../contexts/NotificationContext';

const CategorieDialog = ({ open, onClose, categorie, onSaved }) => {
  const { showNotification } = useNotification();

  const formik = useFormik({
    initialValues: { nom: categorie?.nom || '' },
    validationSchema: Yup.object({ nom: Yup.string().required('Nom requis').min(2) }),
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        if (categorie?.id) {
          await updateCategorie(categorie.id, values);
          showNotification('Catégorie modifiée', 'success');
        } else {
          await addCategorie(values);
          showNotification('Catégorie ajoutée', 'success');
        }
        resetForm();
        onSaved();
        onClose();
      } catch {
        showNotification("Erreur lors de l'enregistrement de la categorie", 'error');
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>
            {categorie ? 'Modifier' : 'Nouvelle catégorie'}
          </Typography>
          <IconButton onClick={onClose} size="small"><Close /></IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <TextField fullWidth label="Nom de la catégorie" name="nom"
            value={formik.values.nom} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.nom && Boolean(formik.errors.nom)}
            helperText={formik.touched.nom && formik.errors.nom}
            autoFocus sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} sx={{ borderRadius: 2 }}>Annuler</Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting} sx={{ borderRadius: 2, px: 3 }}>
            {formik.isSubmitting ? <CircularProgress size={18} color="inherit" /> : (categorie ? 'Enregistrer' : 'Ajouter')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const { showNotification } = useNotification();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      setError("Impossible de charger les categories depuis l'API Laravel.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = categories.filter(c =>
    !search || c.nom?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return;
    try {
      await deleteCategorie(id);
      showNotification('Catégorie supprimée', 'warning');
      load();
    } catch { showNotification('Erreur de suppression', 'error'); }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={400}>Catégories</Typography>
          <Typography variant="body2" color="text.secondary">{categories.length} catégorie(s)</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />}
          onClick={() => { setSelected(null); setDialogOpen(true); }}
          sx={{ borderRadius: 2, px: 3 }}>
          Nouvelle catégorie
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField size="small" placeholder="Rechercher..."
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" color="action" /></InputAdornment> }}
            sx={{ maxWidth: 320 }} />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Nom de la catégorie</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={3} align="center" sx={{ py: 8 }}><CircularProgress /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">Aucune catégorie</Typography>
                </TableCell></TableRow>
              ) : (
                filtered.map((cat, idx) => (
                  <TableRow key={cat.id} hover>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>#{idx + 1}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: 'primary.light',
                          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Category sx={{ fontSize: 16, color: 'primary.dark' }} />
                        </Box>
                        <Typography fontWeight={600}>{cat.nom}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="Modifier">
                          <IconButton size="small" color="primary" onClick={() => { setSelected(cat); setDialogOpen(true); }}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton size="small" color="error" onClick={() => handleDelete(cat.id)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <CategorieDialog open={dialogOpen} onClose={() => setDialogOpen(false)}
        categorie={selected} onSaved={load} />
    </Box>
  );
};

export default Categories;
