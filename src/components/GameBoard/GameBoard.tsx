import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Button as MuiButton } from '@mui/material';
import { GameState, Player, Territory, Card } from '../../types/game';
import { rollDice, rollFateDie } from '../../utils/gameUtils';
import GameControls from './GameControls';
import CardComponent from '../Cards/Card';
import Dice from './Dice';

interface GameBoardProps {
  gameState: GameState;
  onGameStateChange: (newGameState: GameState) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, onGameStateChange }) => {
  const [currentPlayer, setCurrentPlayer] = useState<Player>(gameState.players[gameState.currentPlayerIndex]);
  const [diceRoll, setDiceRoll] = useState<[number, number] | null>(gameState.diceRoll);
  const [message, setMessage] = useState('Welcome to Mythic Realms: Divine Dominion!');
  const [isRolling, setIsRolling] = useState(false);
  const [drawnCard, setDrawnCard] = useState<Card | null>(null);
  const [showCardDialog, setShowCardDialog] = useState(false);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    actions: { text: string; onClick: () => void; color?: 'primary' | 'secondary' }[];
  }>({
    open: false,
    title: '',
    content: '',
    actions: [],
  });

  useEffect(() => {
    setCurrentPlayer(gameState.players[gameState.currentPlayerIndex]);
    setDiceRoll(gameState.diceRoll);
  }, [gameState.currentPlayerIndex, gameState.players, gameState.diceRoll]);

  const showMessage = useCallback((title: string, content: string, actions: { text: string; onClick: () => void; color?: 'primary' | 'secondary' }[]) => {
    setActionDialog({
      open: true,
      title,
      content,
      actions,
    });
  }, []);

  const closeDialog = useCallback(() => {
    setActionDialog(prev => ({ ...prev, open: false }));
  }, []);

  const handleRollDice = async () => {
    if (gameState.gamePhase !== 'roll') return;
    
    setIsRolling(true);
    setDiceRoll(null);
    
    // Simulate dice rolling animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const roll = rollDice();
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const newPosition = (currentPlayer.position + roll[0] + roll[1]) % gameState.board.length;
    
    const updatedPlayers = [...gameState.players];
    updatedPlayers[gameState.currentPlayerIndex] = {
      ...currentPlayer,
      position: newPosition,
    };

    const newGameState: GameState = {
      ...gameState,
      players: updatedPlayers,
      diceRoll: roll,
      gamePhase: 'move',
    };

    onGameStateChange(newGameState);
    setMessage(`You rolled ${roll[0]} + ${roll[1]} = ${roll[0] + roll[1]}`);
    setIsRolling(false);
    handleLandOnSpace(newGameState, newPosition);
  };

  const handleEndTurn = () => {
    if (gameState.gamePhase === 'setup') {
      // Handle setup phase completion
      const newGameState: GameState = {
        ...gameState,
        gamePhase: 'roll' as const,
      };
      onGameStateChange(newGameState);
      setMessage('Setup complete. Roll the dice to start playing!');
      return;
    }
    
    if (gameState.gamePhase !== 'end' && gameState.gamePhase !== 'action' && gameState.gamePhase !== 'move') return;
    
    const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    
    const newGameState: GameState = {
      ...gameState,
      currentPlayerIndex: nextPlayerIndex,
      gamePhase: 'roll' as const,
      diceRoll: null,
    };
    
    onGameStateChange(newGameState);
    setMessage(`${newGameState.players[nextPlayerIndex].name}'s turn`);
  };

  const handleBuyProperty = (territory: Territory) => {
    if (currentPlayer.offerings < territory.baseValue) {
      setMessage('Not enough offerings to buy this property!');
      return;
    }
    
    const updatedPlayers = [...gameState.players];
    const updatedPlayer = {
      ...currentPlayer,
      offerings: currentPlayer.offerings - territory.baseValue,
      ownedTerritories: [...currentPlayer.ownedTerritories, territory.id],
    };
    updatedPlayers[gameState.currentPlayerIndex] = updatedPlayer;
    
    const updatedTerritories = { ...gameState.territories };
    updatedTerritories[territory.id] = {
      ...territory,
      ownerId: currentPlayer.id,
    };
    
    const newGameState: GameState = {
      ...gameState,
      players: updatedPlayers,
      territories: updatedTerritories,
      gamePhase: 'end' as const,
    };
    
    onGameStateChange(newGameState);
    setMessage(`You bought ${territory.name} for ${territory.baseValue} offerings!`);
  };

  const handleDrawCard = (type: 'Fate' | 'Relic') => {
    const deck = type === 'Fate' ? gameState.fateDeck : gameState.relicDeck;
    if (deck.length === 0) {
      setMessage(`No more ${type} cards left!`);
      return;
    }
    
    const card = deck[0];
    setDrawnCard(card);
    setShowCardDialog(true);
    
    // Remove the drawn card from the deck
    const newDeck = deck.slice(1);
    const newGameState: GameState = {
      ...gameState,
      [type === 'Fate' ? 'fateDeck' : 'relicDeck']: newDeck,
      gamePhase: 'end',
    };
    
    onGameStateChange(newGameState);
  };

  const handleLandOnSpace = (gameState: GameState, position: number) => {
    // Ensure we have a valid game phase for movement
    const validPhases: Array<GameState['gamePhase']> = ['move'];
    if (!validPhases.includes(gameState.gamePhase)) {
      console.error('Cannot move in current phase:', gameState.gamePhase);
      return;
    }
    const spaceId = gameState.board[position];
    const territory = gameState.territories[spaceId];
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    if (territory) {
      if (territory.ownerId === null) {
        // Unowned territory
        showMessage(
          'Unowned Territory',
          `Would you like to buy ${territory.name} for ${territory.baseValue} offerings?`,
          [
            {
              text: 'Buy',
              onClick: () => handleBuyProperty(territory),
              color: 'primary',
            },
            {
              text: 'Pass',
              onClick: () => {
                const newGameState: GameState = { 
                  ...gameState, 
                  gamePhase: 'end' as const 
                };
                onGameStateChange(newGameState);
                setMessage('You passed on buying this property.');
              },
            },
          ]
        );
      } else if (territory.ownerId === currentPlayer.id) {
        // Owned by current player
        setMessage(`You own ${territory.name}.`);
        const newGameState: GameState = { 
          ...gameState, 
          gamePhase: 'end' as const 
        };
        onGameStateChange(newGameState);
      } else {
        // Owned by another player
        const owner = gameState.players.find(p => p.id === territory.ownerId);
        const rent = territory.rent[territory.currentLevel];
        
        if (currentPlayer.offerings >= rent) {
          const updatedPlayers = [...gameState.players];
          const ownerIndex = updatedPlayers.findIndex(p => p.id === territory.ownerId);
          
          // Deduct rent from current player
          updatedPlayers[gameState.currentPlayerIndex] = {
            ...currentPlayer,
            offerings: currentPlayer.offerings - rent,
          };
          
          // Add rent to owner
          if (owner) {
            updatedPlayers[ownerIndex] = {
              ...owner,
              offerings: owner.offerings + rent,
            };
          }
          
          const newGameState: GameState = {
            ...gameState,
            players: updatedPlayers,
            gamePhase: 'end',
          };
          
          onGameStateChange(newGameState);
          setMessage(`You paid ${rent} offerings in rent to ${owner?.name}.`);
        } else {
          // Player can't pay rent
          setMessage(`You can't afford to pay ${rent} offerings in rent to ${owner?.name}!`);
          // TODO: Handle bankruptcy
          const newGameState: GameState = { 
            ...gameState, 
            gamePhase: 'end' as const 
          };
          onGameStateChange(newGameState);
        }
      }
    } else {
      // Special space
      switch (spaceId) {
        case 'fate':
          handleDrawCard('Fate');
          break;
        case 'relic-chest':
          handleDrawCard('Relic');
          break;
        case 'chaos-portal':
          // Move to random space
          const randomPosition = Math.floor(Math.random() * gameState.board.length);
          const updatedPlayers = [...gameState.players];
          updatedPlayers[gameState.currentPlayerIndex] = {
            ...currentPlayer,
            position: randomPosition,
          };
          
          const newGameState: GameState = {
            ...gameState,
            players: updatedPlayers,
            gamePhase: 'end',
          };
          
          onGameStateChange(newGameState);
          setMessage('You were teleported to a random location by the Chaos Portal!');
          break;
        case 'divine-rest':
          setMessage('You take a moment to rest. Nothing happens.');
          onGameStateChange({ ...gameState, gamePhase: 'end' });
          break;
        case 'trial-chamber':
          // TODO: Implement Pantheon Trial logic
          setMessage('You face the Pantheon Trial! (Feature coming soon)');
          onGameStateChange({ ...gameState, gamePhase: 'end' });
          break;
        case 'pay-tribute': {
          const tribute = 100;
          if (currentPlayer.offerings >= tribute) {
            const updatedPlayers = [...gameState.players];
            updatedPlayers[gameState.currentPlayerIndex] = {
              ...currentPlayer,
              offerings: currentPlayer.offerings - tribute,
            };
            
            const newGameState: GameState = {
              ...gameState,
              players: updatedPlayers,
              gamePhase: 'end' as const,
            };
            
            onGameStateChange(newGameState);
            setMessage(`You paid ${tribute} offerings in tribute to the gods.`);
          } else {
            setMessage(`You can't afford to pay ${tribute} offerings in tribute!`);
            // TODO: Handle bankruptcy
            onGameStateChange({ ...gameState, gamePhase: 'end' });
          }
          break;
        }
        default:
          setMessage('You landed on an empty space.');
          onGameStateChange({ ...gameState, gamePhase: 'end' });
      }
    }
  };

  const renderSpace = (spaceId: string, index: number) => {
    const territory = gameState.territories[spaceId];
    const isCurrentSpace = currentPlayer.position === index;
    const playersHere = gameState.players.filter(p => p.position === index);
    const isCorner = [0, 9, 19, 29].includes(index);
    
    // Player piece colors
    const playerColors = ['#ff5252', '#4caf50', '#2196f3', '#ff9800'];
    
    // Calculate positions for multiple players on the same space
    const getPlayerPiecePosition = (playerIndex: number, totalPlayers: number) => {
      if (totalPlayers === 1) return { top: '10%', left: '10%' };
      if (totalPlayers === 2) return [
        { top: '10%', left: '10%' },
        { top: '60%', left: '60%' }
      ][playerIndex];
      if (totalPlayers === 3) return [
        { top: '10%', left: '10%' },
        { top: '10%', left: '60%' },
        { top: '60%', left: '35%' }
      ][playerIndex];
      return [
        { top: '10%', left: '10%' },
        { top: '10%', left: '60%' },
        { top: '60%', left: '10%' },
        { top: '60%', left: '60%' }
      ][playerIndex];
    };
    
    // Get color based on region or special space
    const getSpaceColor = () => {
      if (isCorner) return 'background.paper';
      if (territory) {
        const regionColors: Record<string, string> = {
          'Olympus': '#f8bbd0',
          'Asgard': '#bbdefb',
          'Duat': '#d1c4e9',
          'Capitolium': '#c8e6c9',
          'Celtica': '#fff9c4',
        };
        return regionColors[territory.region] || 'background.paper';
      }
      return 'background.paper';
    };

    const renderSpecialSpace = () => {
      const specialSpaces: Record<string, { emoji: string; color: string }> = {
        'fate': { emoji: '✨', color: '#ffeb3b' },
        'relic-chest': { emoji: '🏺', color: '#8d6e63' },
        'start': { emoji: '🏁', color: '#4caf50' },
        'jail': { emoji: '🚓', color: '#f44336' },
        'free-parking': { emoji: '🅿️', color: '#9e9e9e' },
        'go-to-jail': { emoji: '🚨', color: '#f44336' },
        'chance': { emoji: '🎲', color: '#ff9800' },
        'community-chest': { emoji: '💎', color: '#2196f3' },
      };

      const special = specialSpaces[spaceId];
      if (!special) return null;

      return (
        <Box sx={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${special.color}33`, // Add transparency
          borderRadius: 1,
        }}>
          <Box sx={{ fontSize: '2rem', lineHeight: 1 }}>{special.emoji}</Box>
          <Typography variant="caption" sx={{ textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {spaceId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </Typography>
        </Box>
      );
    };

    return (
      <Paper
        key={index}
        elevation={isCurrentSpace ? 8 : 2}
        sx={{
          width: '100px',
          height: '100px',
          position: 'relative',
          backgroundColor: getSpaceColor(),
          p: 0.5,
          overflow: 'visible',
          border: isCurrentSpace ? '2px solid #ffeb3b' : '1px solid #e0e0e0',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            zIndex: 10,
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
          }
        }}
      >
        {/* Player pieces */}
        {playersHere.map((player, idx) => (
          <Box
            key={player.id}
            sx={{
              position: 'absolute',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: playerColors[Number(player.id) % playerColors.length],
              border: '2px solid #fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              zIndex: 100,
              ...getPlayerPiecePosition(idx, playersHere.length),
              transition: 'all 0.5s ease',
            }}
          />
        ))}
        {territory ? (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 0.5,
          }}>
            <Box>
              <Typography variant="caption" component="div" noWrap fontWeight="bold" color="text.primary">
                {territory.name}
              </Typography>
              <Typography variant="caption" component="div" noWrap color="text.secondary">
                {territory.region}
              </Typography>
            </Box>
            
            {territory.ownerId && (
              <Box sx={{ 
                mt: 'auto',
                textAlign: 'center',
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: 1,
                p: 0.25,
              }}>
                <Typography variant="caption" component="div" noWrap fontWeight="bold">
                  {territory.currentLevel}
                </Typography>
                <Typography variant="caption" component="div" noWrap>
                  ${territory.rent[territory.currentLevel]}
                </Typography>
              </Box>
            )}
          </Box>
        ) : renderSpecialSpace() || (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            p: 1,
          }}>
            <Typography variant="caption" fontWeight="bold">
              {spaceId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Typography>
          </Box>
        )}
        
        {/* Player tokens */}
        {playersHere.length > 0 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 0.5,
              p: 0.5,
              backgroundColor: 'rgba(0,0,0,0.1)',
              borderTop: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            {playersHere.map((player) => (
              <Box
                key={player.id}
                sx={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  bgcolor: player.id === currentPlayer.id ? 'primary.main' : 'secondary.main',
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.2)',
                    zIndex: 10,
                  }
                }}
                title={`${player.name} (${player.pantheon})`}
              />
            ))}
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, color: 'primary.main' }}>
        Mythic Realms: Divine Dominion
      </Typography>
      
      <GameControls
        currentPlayer={currentPlayer.name}
        currentPhase={gameState.gamePhase === 'setup' ? 'roll' : gameState.gamePhase}
        diceRoll={diceRoll}
        onRollDice={handleRollDice}
        onEndTurn={handleEndTurn}
        isRolling={isRolling}
      />
      
      {message && (
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            mb: 3, 
            bgcolor: 'background.paper',
            borderLeft: '4px solid',
            borderColor: 'primary.main',
          }}
        >
          <Typography color="text.primary" sx={{ fontWeight: 'medium' }}>
            {message}
          </Typography>
        </Paper>
      )}

      <Paper 
        elevation={6} 
        sx={{ 
          p: 3, 
          mb: 3, 
          overflow: 'hidden', 
          bgcolor: 'background.default',
          borderRadius: 4,
          background: 'linear-gradient(145deg, #1a237e 0%, #283593 100%)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Box sx={{ 
          position: 'relative', 
          width: '1000px', 
          height: '1000px', 
          margin: '0 auto',
          backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 70%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%239C92AC\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
            opacity: 0.5,
          }
        }}>
          
          {/* Center area */}
          <Box 
            sx={{ 
              position: 'absolute',
              top: '25%',
              left: '25%',
              width: '50%',
              height: '50%',
              backgroundColor: 'rgba(10, 15, 40, 0.8)',
              borderRadius: 4,
              boxShadow: [
                'inset 0 0 30px rgba(255, 255, 255, 0.1)',
                '0 10px 30px rgba(0, 0, 0, 0.5)'
              ],
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1,
              p: 4,
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 3,
                padding: '2px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              }
            }}
          >
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{
                color: 'white',
                textShadow: '0 0 10px rgba(100, 181, 246, 0.7)',
                fontWeight: 'bold',
                letterSpacing: '2px',
                mb: 2,
                background: 'linear-gradient(to right, #64b5f6, #9c27b0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Mythic Realms
            </Typography>
            <Typography 
              variant="h6" 
              sx={{
                color: '#bbdefb',
                mb: 3,
                fontWeight: 500,
                letterSpacing: '1px',
              }}
            >
              Divine Dominion
            </Typography>
            <Box sx={{
              width: '120px',
              height: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
              mb: 3,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '50%',
                padding: '2px',
                background: 'linear-gradient(135deg, #64b5f6, #9c27b0)',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              }
            }}>
              <Dice value={6} size={80} color="#ffffff" />
            </Box>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#90caf9',
                fontSize: '0.9rem',
                maxWidth: '80%',
                lineHeight: 1.6,
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              Roll the dice to begin your divine journey through the realms of myth and legend!
            </Typography>
          </Box>
          
          {/* Game board container */}
          <Box sx={{
            position: 'relative',
            width: '1000px',
            height: '1000px',
            backgroundImage: 'url(/images/game-board.png)',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            margin: '0 auto',
            '& > *': {
              position: 'absolute',
              width: '60px',
              height: '60px',
              zIndex: 2,
              opacity: 0.8,
              '&:hover': {
                zIndex: 10,
                transform: 'scale(1.1)',
                transition: 'transform 0.2s',
              },
            }
          }}>
            {/* Game board spaces */}
            {gameState.board.map((spaceId, index) => {
              // Define positions for each space based on the board layout
              const positions = [
                // Start (0) - Bottom left corner (Pay Tribute)
                { top: '860px', left: '60px' },
                
                // Bottom row (1-8) - Left to right
                { top: '860px', left: '140px' }, // Celtica I
                { top: '860px', left: '220px' }, // Celtica II
                { top: '860px', left: '300px' }, // Fate
                { top: '860px', left: '380px' }, // Celtica III
                { top: '860px', left: '460px' }, // Celtica IV
                { top: '860px', left: '540px' }, // Relic Chest
                { top: '860px', left: '620px' }, // Capitolium I
                { top: '860px', left: '700px' }, // Capitolium II
                
                // Trial Chamber (9) - Bottom right corner
                { top: '860px', right: '60px' },
                
                // Right side (10-18) - Bottom to top
                { top: '780px', right: '60px' }, // Capitolium III
                { top: '700px', right: '60px' }, // Capitolium IV
                { top: '620px', right: '60px' }, // Fate
                { top: '540px', right: '60px' }, // Duat I
                { top: '460px', right: '60px' }, // Duat II
                { top: '380px', right: '60px' }, // Duat III
                { top: '300px', right: '60px' }, // Duat IV
                { top: '220px', right: '60px' }, // Divine Rest
                { top: '140px', right: '60px' }, // Asgard IV
                
                // Chaos Portal (19) - Top right corner
                { top: '60px', right: '60px' },
                
                // Top row (20-28) - Right to left
                { top: '60px', right: '140px' }, // Asgard III
                { top: '60px', right: '220px' }, // Asgard II
                { top: '60px', right: '300px' }, // Relic Chest
                { top: '60px', right: '380px' }, // Asgard I
                { top: '60px', right: '460px' }, // Olympus IV
                { top: '60px', right: '540px' }, // Olympus III
                { top: '60px', right: '620px' }, // Fate
                { top: '60px', right: '700px' }, // Olympus II
                { top: '60px', right: '780px' }, // Olympus I
                
                // Start (29) - Top left corner
                { top: '60px', left: '60px' },
                
                // Left side (30-38) - Top to bottom
                { top: '140px', left: '60px' }, // Olympus I
                { top: '220px', left: '60px' }, // Olympus II
                { top: '300px', left: '60px' }, // Relic Chest
                { top: '380px', left: '60px' }, // Olympus III
                { top: '460px', left: '60px' }, // Olympus IV
                { top: '540px', left: '60px' }, // Fate
                { top: '620px', left: '60px' }, // Celtica I
                { top: '700px', left: '60px' }, // Celtica II
                { top: '780px', left: '60px' }, // Celtica III
                
                // Back to start (39) - Already defined as start position
                { top: '860px', left: '60px' }
              ];
              
              // Get the position for the current index
              const position = positions[index] || { top: 0, left: 0 };
            
              return (
                <Box
                  key={index}
                  sx={{
                    ...position,
                  }}
                >
                  {renderSpace(spaceId, index)}
                </Box>
              );
            })}
            
            {/* Center of the board (invisible clickable area) */}
            <Box 
              sx={{
                gridRow: '2 / 11',
                gridColumn: '2 / 11',
                position: 'relative',
                zIndex: 1,
              }}
            />
          </Box>
        </Box>
      </Paper>
      
      {/* Card Draw Dialog */}
      <Dialog 
        open={showCardDialog} 
        onClose={() => setShowCardDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>You drew a {drawnCard?.type} card!</DialogTitle>
        <DialogContent>
          {drawnCard && <CardComponent card={drawnCard} />}
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setShowCardDialog(false)} color="primary">
            Close
          </MuiButton>
        </DialogActions>
      </Dialog>
      
      {/* Action Dialog */}
      <Dialog 
        open={actionDialog.open} 
        onClose={closeDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{actionDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{actionDialog.content}</Typography>
        </DialogContent>
        <DialogActions>
          {actionDialog.actions.map((action, index) => (
            <MuiButton 
              key={index} 
              onClick={() => {
                action.onClick();
                closeDialog();
              }} 
              color={action.color || 'primary'}
              variant="contained"
            >
              {action.text}
            </MuiButton>
          ))}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GameBoard;
