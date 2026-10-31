// src/pages/admin/Dashboard.js
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Receipt,
  People,
  CheckCircle,
  Cancel,
  TrendingUp,
  Euro,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { getFactures } from "../../services/factureService";
import { getClients } from "../../services/clientService";
import StatCard from "../../components/Common/StatCard";
import { STATUTS } from "../../utils/factureCalculs";
import { useNotification } from "../../contexts/NotificationContext";

const MONTHS_FR = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Jun",
  "Jul",
  "Aoû",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];
const PIE_COLORS = ["#f59e0b", "#10b981", "#ef4444"];

const Dashboard = () => {
  const [factures, setFactures] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    const load = async () => {
      try {
        const [f, c] = await Promise.all([getFactures(), getClients()]);
        setFactures(f);
        setClients(c);
      } catch {
        showNotification("Erreur de chargement du dashboard", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const total = factures.length;
    const encaisse = factures
      .filter((f) => f.statut === "payee")
      .reduce((s, f) => s + Number(f.total_ttc || 0), 0);
    const attente = factures.filter((f) => f.statut === "en_attente").length;
    const rejetees = factures.filter((f) => f.statut === "rejetee").length;
    const moy =
      total > 0
        ? factures.reduce((s, f) => s + Number(f.total_ttc || 0), 0) / total
        : 0;
    const nonValidees = factures.filter((f) => !f.validated_by_admin).length;
    return { total, encaisse, attente, rejetees, moy, nonValidees };
  }, [factures]);

  const monthlyData = useMemo(() => {
    const map = {};
    MONTHS_FR.forEach((m, i) => {
      map[i] = { month: m, total: 0, count: 0, encaisse: 0 };
    });
    factures.forEach((f) => {
      const d = f.date_creation ? new Date(f.date_creation) : null;
      if (!d) return;
      const m = d.getMonth();
      map[m].total += Number(f.total_ttc || 0);
      map[m].count += 1;
      if (f.statut === "payee") map[m].encaisse += Number(f.total_ttc || 0);
    });
    return Object.values(map);
  }, [factures]);

  const pieData = useMemo(
    () => [
      {
        name: "En attente",
        value: factures.filter((f) => f.statut === "en_attente").length,
      },
      {
        name: "Payées",
        value: factures.filter((f) => f.statut === "payee").length,
      },
      {
        name: "Rejetées",
        value: factures.filter((f) => f.statut === "rejetee").length,
      },
    ],
    [factures],
  );

  const recentFactures = useMemo(
    () =>
      [...factures]
        .sort((a, b) => (b.created_at || 0) - (a.created_at || 0))
        .slice(0, 5),
    [factures],
  );

  if (loading)
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
      <Box mb={3}>
        <Typography variant="h5" fontWeight={400}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {stats.total} facture{stats.total !== 1 ? "s" : ""} enregistrée
          {stats.total !== 1 ? "s" : ""}
        </Typography>
      </Box>

      {/* Stat Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(3, minmax(0, 1fr))",
            lg: "repeat(6, minmax(0, 1fr))",
          },
          gap: 2.5,
          mb: 3,
        }}
      >
        <StatCard
          title="Total Factures"
          value={stats.total}
          subtitle={`${stats.nonValidees} en attente de validation`}
          icon={<Receipt />}
        />
        <StatCard
          title="Total Encaissé"
          value={`${stats.encaisse.toFixed(0)} €`}
          subtitle="statut payée"
          icon={<Euro />}
        />
        <StatCard
          title="Montant Moyen"
          value={`${stats.moy.toFixed(0)} €`}
          subtitle="Par facture"
          icon={<TrendingUp />}
        />
        <StatCard
          title="En Attente"
          value={stats.attente}
          subtitle=" "
          icon={<Receipt />}
        />
        <StatCard
          title="Factures Rejetées"
          value={stats.rejetees}
          subtitle=" "
          icon={<Cancel />}
        />
        <StatCard
          title="Clients"
          value={clients.length}
          subtitle=" "
          icon={<People />}
        />
      </Box>

      {/* Charts */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Bar Chart mensuel */}
        <Box minWidth={0}>
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              width: "100%",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} mb={2.5}>
                Évolution mensuelle (TTC)
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={monthlyData}
                  margin={{ top: 0, right: 0, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(v) => [`${v.toFixed(2)} €`]}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="total"
                    name="Total facturé"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="encaisse"
                    name="Encaissé"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Pie Chart statuts */}
        <Box minWidth={0}>
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              height: "100%",
              width: "100%",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Répartition des statuts
              </Typography>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    paddingAngle={4}
                    label={({ name, value }) => (value > 0 ? `${value}` : "")}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Dernières factures */}
      <Card
        elevation={0}
        sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Dernières factures
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  {["N°", "Date", "Total TTC", "Statut", "Validée"].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 600, fontSize: 13 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {recentFactures.map((f) => {
                  const statut = STATUTS[f.statut] || {
                    label: f.statut,
                    color: "default",
                  };
                  return (
                    <TableRow key={f.id} hover>
                      <TableCell>
                        <Typography
                          fontWeight={600}
                          variant="body2"
                        >
                          {f.numero}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {f.date_creation
                            ? new Date(f.date_creation).toLocaleDateString(
                                "fr-FR",
                              )
                            : "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={600} variant="body2">
                          {Number(f.total_ttc).toFixed(2)} €
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statut.label}
                          color={statut.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={f.validated_by_admin ? "✓ Oui" : "Non"}
                          size="small"
                          color={f.validated_by_admin ? "success" : "default"}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
