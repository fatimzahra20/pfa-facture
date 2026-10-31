// src/pages/Unauthorized.js
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Lock } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center"
      minHeight="100vh" gap={2} sx={{ bgcolor: '#f8fafc' }}>
      <Box sx={{ width: 80, height: 80, borderRadius: 3, bgcolor: 'error.light',
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Lock sx={{ fontSize: 40, color: 'error.main' }} />
      </Box>
      <Typography variant="h4" fontWeight={800}>Accès refusé</Typography>
      <Typography color="text.secondary">Vous n'avez pas les droits nécessaires pour accéder à cette page.</Typography>
      <Button variant="contained" onClick={() => navigate(-1)} sx={{ borderRadius: 2, mt: 1 }}>
        Retour
      </Button>
    </Box>
  );
};

export default Unauthorized;
