import React from 'react';
import { Box, Paper, Typography, Avatar, Divider, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { Player } from '../../types/game';

interface PlayerPanelProps {
  players: Player[];
  currentPlayerId: string;
}

const pantheonColors = {
  Greek: '#2196f3',
  Norse: '#f44336',
  Egyptian: '#ff9800',
  Roman: '#4caf50',
  Celtic: '#9c27b0',
};

const PlayerPanel: React.FC<PlayerPanelProps> = ({ players, currentPlayerId }) => {
  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Players
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <List>
        {players.map((player) => (
          <ListItem 
            key={player.id}
            sx={{
              bgcolor: player.id === currentPlayerId ? 'action.hover' : 'transparent',
              borderRadius: 1,
              mb: 1,
            }}
          >
            <ListItemAvatar>
              <Avatar 
                sx={{ 
                  bgcolor: pantheonColors[player.pantheon] || 'grey.500',
                  width: 32, 
                  height: 32,
                  fontSize: '0.8rem',
                }}
              >
                {player.name.charAt(0)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" component="span" fontWeight="bold">
                    {player.name}
                  </Typography>
                  <Typography variant="body2" component="span" color="text.secondary">
                    {player.pantheon}
                  </Typography>
                </Box>
              }
              secondary={
                <>
                  <Typography variant="body2" component="span" display="block">
                    Offerings: {player.offerings}
                  </Typography>
                  <Typography variant="body2" component="span" display="block">
                    Territories: {player.ownedTerritories.length}
                  </Typography>
                  <Typography variant="body2" component="span" display="block">
                    Relics: {player.relics.length}
                  </Typography>
                </>
              }
              secondaryTypographyProps={{ component: 'div' }}
            />
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Game Controls
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Roll the dice to move your god piece around the board. Purchase territories, collect rent, and build monuments to win!
        </Typography>
      </Box>
    </Paper>
  );
};

export default PlayerPanel;
