import api from "./api";
import { getCategories } from "./categoryService";

const mapArticle = (article) => ({
  ...article,
  categorie_id: article.category_id,
});

export const getArticles = async () => {
  const response = await api.get("/articles");
  return response.data.map(mapArticle);
};

export const getArticleById = async (id) => {
  const response = await api.get(`/articles/${id}`);
  return mapArticle(response.data);
};

export const addArticle = async (data) => {
  const payload = {
    designation: data.designation,
    prix_unitaire: Number(data.prix_unitaire),
    category_id: data.categorie_id || data.category_id || null,
    tva_pct: Number(data.tva_pct || 20),
  };

  const response = await api.post("/articles", payload);
  return mapArticle(response.data);
};

export const updateArticle = async (id, data) => {
  const payload = {
    designation: data.designation,
    prix_unitaire: Number(data.prix_unitaire),
    category_id: data.categorie_id || data.category_id || null,
    tva_pct: Number(data.tva_pct || 20),
  };

  const response = await api.put(`/articles/${id}`, payload);
  return mapArticle(response.data);
};

export const deleteArticle = async (id) => {
  await api.delete(`/articles/${id}`);
};

export const getArticlesWithCategories = async () => {
  const [articles, categories] = await Promise.all([getArticles(), getCategories()]);
  const categoryMap = categories.reduce((acc, category) => {
    acc[String(category.id)] = category.nom;
    return acc;
  }, {});

  return articles.map((article) => ({
    ...article,
    categorie_nom: categoryMap[String(article.categorie_id)] || "N/A",
  }));
};

export { getCategories };
