// src/pages/admin/Articles.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Card, Button, Typography, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination,
  InputAdornment, CircularProgress, MenuItem, Select, FormControl,
  InputLabel, Chip, Tooltip, Alert
} from '@mui/material';
import { Add, Edit, Delete, Search, Close } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  getArticlesWithCategories, addArticle, updateArticle, deleteArticle, getCategories
} from '../../services/articleService';
import { useNotification } from '../../contexts/NotificationContext';

const validSchema = Yup.object({
  designation: Yup.string().required('Désignation requise').min(2),
  prix_unitaire: Yup.number().required('Prix requis').min(0, 'Prix positif'),
  categorie_id: Yup.string().required('Catégorie requise').nullable(),
  tva_pct: Yup.number().required().min(0).max(100)
});

const ArticleDialog = ({ open, onClose, article, categories, onSaved }) => {
  const { showNotification } = useNotification();

  const formik = useFormik({
    initialValues: {
      designation: article?.designation || '',
      prix_unitaire: article?.prix_unitaire || '',
      categorie_id: article?.categorie_id || '',
      tva_pct: article?.tva_pct || 20
    },
    validationSchema: validSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const payload = { ...values, prix_unitaire: Number(values.prix_unitaire), tva_pct: Number(values.tva_pct) };
        if (article?.id) {
          await updateArticle(article.id, payload);
          showNotification('Article modifié', 'success');
        } else {
          await addArticle(payload);
          showNotification('Article ajouté', 'success');
        }
        resetForm();
        onSaved();
        onClose();
      } catch {
        showNotification("Erreur lors de l'enregistrement de l'article", 'error');
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>{article ? 'Modifier l\'article' : 'Nouvel article'}</Typography>
          <IconButton onClick={onClose} size="small"><Close /></IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box display="grid" gap={2} pt={1}>
            <TextField fullWidth label="Désignation" name="designation"
              value={formik.values.designation} onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.designation && Boolean(formik.errors.designation)}
              helperText={formik.touched.designation && formik.errors.designation} />
            <TextField fullWidth label="Prix unitaire (€)" name="prix_unitaire" type="number"
              value={formik.values.prix_unitaire} onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.prix_unitaire && Boolean(formik.errors.prix_unitaire)}
              helperText={formik.touched.prix_unitaire && formik.errors.prix_unitaire}
              inputProps={{ min: 0, step: 0.01 }} />
            <FormControl fullWidth error={formik.touched.categorie_id && Boolean(formik.errors.categorie_id)}>
              <InputLabel>Catégorie</InputLabel>
              <Select name="categorie_id" value={formik.values.categorie_id}
                onChange={formik.handleChange} label="Catégorie">
                {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.nom}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>TVA (%)</InputLabel>
              <Select name="tva_pct" value={formik.values.tva_pct}
                onChange={formik.handleChange} label="TVA (%)">
                {[5.5, 10, 20].map(t => <MenuItem key={t} value={t}>{t}%</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} sx={{ borderRadius: 2 }}>Annuler</Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting} sx={{ borderRadius: 2, px: 3 }}>
            {formik.isSubmitting ? <CircularProgress size={18} color="inherit" /> : (article ? 'Enregistrer' : 'Ajouter')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const { showNotification } = useNotification();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [a, c] = await Promise.all([getArticlesWithCategories(), getCategories()]);
      setArticles(a);
      setCategories(c);
    } catch {
      setError("Impossible de charger les articles depuis l'API Laravel.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return articles.filter(a => {
      const q = search.toLowerCase();
      return (!search || a.designation?.toLowerCase().includes(q)) &&
        (!filterCat || String(a.categorie_id) === String(filterCat));
    });
  }, [articles, search, filterCat]);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet article ?')) return;
    try {
      await deleteArticle(id);
      showNotification('Article supprimé', 'warning');
      load();
    } catch { showNotification('Erreur de suppression', 'error'); }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={400}>Articles</Typography>
          <Typography variant="body2" color="text.secondary">{articles.length} article(s)</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />}
          onClick={() => { setSelected(null); setDialogOpen(true); }}
          sx={{ borderRadius: 2, px: 3 }}>
          Nouvel article
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', gap: 2 }}>
          <TextField size="small" placeholder="Rechercher..."
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" color="action" /></InputAdornment> }}
            sx={{ flex: 1, maxWidth: 320 }} />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Catégorie</InputLabel>
            <Select value={filterCat} onChange={e => setFilterCat(e.target.value)} label="Catégorie">
              <MenuItem value="">Toutes</MenuItem>
              {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.nom}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                {['Désignation', 'Catégorie', 'Prix unitaire', 'TVA', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: 13 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8 }}><CircularProgress /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">Aucun article trouvé</Typography>
                </TableCell></TableRow>
              ) : (
                filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(a => (
                  <TableRow key={a.id} hover>
                    <TableCell><Typography fontWeight={600}>{a.designation}</Typography></TableCell>
                    <TableCell><Chip label={a.categorie_nom || '—'} size="small" variant="outlined" /></TableCell>
                    <TableCell><Typography fontWeight={700} color="primary">{Number(a.prix_unitaire).toFixed(2)} €</Typography></TableCell>
                    <TableCell><Chip label={`${a.tva_pct}%`} size="small" color="info" /></TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="Modifier">
                          <IconButton size="small" color="primary" onClick={() => { setSelected(a); setDialogOpen(true); }}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton size="small" color="error" onClick={() => handleDelete(a.id)}>
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
        <TablePagination component="div" count={filtered.length} page={page}
          rowsPerPage={rowsPerPage} onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={e => { setRowsPerPage(+e.target.value); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Lignes/page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`} />
      </Card>

      <ArticleDialog open={dialogOpen} onClose={() => setDialogOpen(false)}
        article={selected} categories={categories} onSaved={load} />
    </Box>
  );
};

export default Articles;
