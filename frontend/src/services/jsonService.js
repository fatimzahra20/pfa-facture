// src/services/jsonService.js
import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

const api = axios.create({ baseURL: BASE_URL });

// ─── ARTICLES ────────────────────────────────────────────────────────────────

export const getArticles = async () => {
  const res = await api.get('/articles');
  return res.data;
};

export const getArticleById = async (id) => {
  const res = await api.get(`/articles/${id}`);
  return res.data;
};

export const addArticle = async (data) => {
  const res = await api.post('/articles', data);
  return res.data;
};

export const updateArticle = async (id, data) => {
  const res = await api.put(`/articles/${id}`, data);
  return res.data;
};

export const deleteArticle = async (id) => {
  await api.delete(`/articles/${id}`);
};

// ─── CATÉGORIES ──────────────────────────────────────────────────────────────

export const getCategories = async () => {
  const res = await api.get('/categories');
  return res.data;
};

export const getCategorieById = async (id) => {
  const res = await api.get(`/categories/${id}`);
  return res.data;
};

export const addCategorie = async (data) => {
  const res = await api.post('/categories', data);
  return res.data;
};

export const updateCategorie = async (id, data) => {
  const res = await api.put(`/categories/${id}`, data);
  return res.data;
};

export const deleteCategorie = async (id) => {
  await api.delete(`/categories/${id}`);
};

// ─── ARTICLES AVEC CATÉGORIES ENRICHIES ──────────────────────────────────────

export const getArticlesWithCategories = async () => {
  const [articles, categories] = await Promise.all([getArticles(), getCategories()]);
  const catMap = {};
  categories.forEach(c => { catMap[c.id] = c.nom; });
  return articles.map(a => ({ ...a, categorie_nom: catMap[a.categorie_id] || 'N/A' }));
};
