import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import './App.css';

function App() {
  return (
    <>
      <AppBar position="sticky" color="inherit" elevation={1} width="screen">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
            Pontoon
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button color="primary">Home</Button>
            <Button color="primary">Features</Button>
            <Button color="primary">Contact</Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button color="primary" variant="outlined">Login</Button>
            <Button color="primary" variant="contained">Sign Up</Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Typography variant="h3" align="center" sx={{ mt: 8, fontWeight: 'bold' }}>
        Pontoon
      </Typography>
    </>
  );
}

export default App;
