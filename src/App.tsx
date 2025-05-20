import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { GameState } from './types/game';
import { createInitialGameState } from './utils/gameUtils';
import GameBoard from './components/GameBoard/GameBoard';
import PlayerPanel from './components/PlayerPanel/PlayerPanel';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1.1rem',
      fontWeight: 500,
    },
  },
});

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);

  // Initialize game with sample players
  useEffect(() => {
    const samplePlayers = [
      'Zeus',
      'Odin',
      'Ra',
      'Jupiter',
    ];
    
    setGameState(createInitialGameState(samplePlayers));
  }, []);

  const handleGameStateChange = (newGameState: GameState) => {
    setGameState(newGameState);
  };

  if (!gameState) {
    return <div>Loading game...</div>;
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}>
        {/* Main game board area */}
        <Box sx={{ 
          flexGrow: 1, 
          p: 3,
          overflow: 'auto',
        }}>
          <GameBoard 
            gameState={gameState} 
            onGameStateChange={handleGameStateChange} 
          />
        </Box>
        
        {/* Player panel */}
        <Box sx={{ 
          width: '300px', 
          p: 2,
          borderLeft: '1px solid #e0e0e0',
          bgcolor: 'background.paper',
          overflowY: 'auto',
        }}>
          <PlayerPanel 
            players={gameState.players} 
            currentPlayerId={currentPlayer.id} 
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
