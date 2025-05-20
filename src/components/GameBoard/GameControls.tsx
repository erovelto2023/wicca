import React from 'react';
import { Box, Button, Typography, Stack, Paper, Divider } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import Dice from './Dice';

interface GameControlsProps {
  currentPlayer: string;
  currentPhase: 'roll' | 'move' | 'action' | 'end';
  diceRoll: [number, number] | null;
  onRollDice: () => void;
  onEndTurn: () => void;
  isRolling: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  currentPlayer,
  currentPhase,
  diceRoll,
  onRollDice,
  onEndTurn,
  isRolling,
}) => {
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        mb: 3,
        backgroundColor: 'background.paper',
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Game Controls
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Stack direction="row" spacing={3} alignItems="center" mb={2}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Current Turn
          </Typography>
          <Typography variant="h6" color="primary">
            {currentPlayer}
          </Typography>
        </Box>
        
        <Divider orientation="vertical" flexItem />
        
        <Box>
          <Typography variant="body2" color="text.secondary">
            Phase
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}
          </Typography>
        </Box>
        
        <Divider orientation="vertical" flexItem />
        
        <Box>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={0.5}>
            Dice Roll
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, minHeight: '48px', alignItems: 'center' }}>
            {diceRoll ? (
              <>
                <Dice 
                  value={diceRoll[0]} 
                  size={40} 
                  isRolling={false}
                />
                <Dice 
                  value={diceRoll[1]} 
                  size={40} 
                  isRolling={false}
                />
              </>
            ) : isRolling ? (
              <>
                <Dice 
                  value={1} 
                  size={40} 
                  isRolling={true}
                />
                <Dice 
                  value={1} 
                  size={40} 
                  isRolling={true}
                />
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Click Roll Dice
              </Typography>
            )}
          </Box>
        </Box>
      </Stack>
      
      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          variant="contained"
          color="primary"
          startIcon={<CasinoIcon />}
          onClick={onRollDice}
          disabled={currentPhase !== 'roll' || isRolling}
          size="large"
          sx={{
            minWidth: '160px',
            py: 1.5,
            fontWeight: 'bold',
            textTransform: 'none',
            borderRadius: 2,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
            },
          }}
        >
          {isRolling ? 'Rolling...' : 'Roll Dice'}
        </Button>
        
        <Button
          variant="outlined"
          color="primary"
          startIcon={<SkipNextIcon />}
          onClick={onEndTurn}
          disabled={currentPhase !== 'end'}
          size="large"
          sx={{
            minWidth: '160px',
            py: 1.5,
            fontWeight: 'bold',
            textTransform: 'none',
            borderRadius: 2,
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          End Turn
        </Button>
      </Stack>
    </Paper>
  );
};

export default GameControls;
