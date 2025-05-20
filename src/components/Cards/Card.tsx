import React from 'react';
import { Card as MuiCard, CardContent, Typography, Paper, Box } from '@mui/material';
import { Card as GameCard } from '../../types/game';

interface CardProps {
  card: GameCard;
  onClick?: () => void;
  isSelected?: boolean;
}

const cardStyles = {
  Fate: {
    bgcolor: '#f3e5f5',
    borderColor: '#9c27b0',
  },
  Relic: {
    bgcolor: '#e8f5e9',
    borderColor: '#4caf50',
  },
  Power: {
    bgcolor: '#e3f2fd',
    borderColor: '#2196f3',
  },
};

const Card: React.FC<CardProps> = ({ card, onClick, isSelected = false }) => {
  const style = cardStyles[card.type] || cardStyles.Fate;
  
  return (
    <Paper
      elevation={isSelected ? 8 : 2}
      onClick={onClick}
      sx={{
        width: 200,
        minHeight: 120,
        borderRadius: 2,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        transform: isSelected ? 'translateY(-8px)' : 'none',
        '&:hover': {
          transform: onClick ? 'translateY(-4px)' : 'none',
          boxShadow: 4,
        },
      }}
    >
      <Box
        sx={{
          height: 8,
          bgcolor: style.borderColor,
        }}
      />
      <Box
        sx={{
          p: 2,
          height: '100%',
          bgcolor: style.bgcolor,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography
          variant="subtitle1"
          component="div"
          sx={{
            fontWeight: 'bold',
            color: style.borderColor,
            mb: 1,
            borderBottom: `2px solid ${style.borderColor}`,
            pb: 0.5,
          }}
        >
          {card.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
          {card.description}
        </Typography>
        <Box
          sx={{
            mt: 1,
            pt: 1,
            borderTop: '1px solid rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              bgcolor: 'rgba(0,0,0,0.05)',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              color: style.borderColor,
              fontWeight: 'medium',
            }}
          >
            {card.type}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default Card;
