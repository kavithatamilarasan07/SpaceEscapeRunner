import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [score, setScore] = useState(0);
  const [shipOffset, setShipOffset] = useState(0);
  const [asteroidY, setAsteroidY] = useState(-80);
  const [asteroidX, setAsteroidX] = useState(() => (Math.random() * 240) - 120);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [shipPulse, setShipPulse] = useState(1);
  const { width, height } = useWindowDimensions();

  const restartGame = () => {
    setScore(0);
    setShipOffset(0);
    setAsteroidY(-80);
    setAsteroidX((Math.random() * 240) - 120);
    setGameOver(false);
  };

  useEffect(() => {
    const loadHighScore = async () => {
      try {
        const storedHighScore = await AsyncStorage.getItem('highScore');
        if (storedHighScore !== null) {
          setHighScore(Number(storedHighScore));
        }
      } catch (error) {
        console.log('Failed to load high score', error);
      }
    };

    loadHighScore();
  }, []);

  const moveShip = (direction: number) => {
    if (gameOver) {
      return;
    }

    setShipOffset((current) => {
      const nextValue = current + direction * 30;
      const maxOffset = 140;
      return Math.max(-maxOffset, Math.min(maxOffset, nextValue));
    });
  };

  useEffect(() => {
    if (gameOver) {
      return;
    }

    const pulseId = setInterval(() => {
      setShipPulse((value) => (value === 1 ? 1.03 : 1));
    }, 400);

    return () => clearInterval(pulseId);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) {
      return;
    }

    const intervalId = setInterval(() => {
      setAsteroidY((currentY) => {
        const nextY = currentY + 8;
        const asteroidLeft = width / 2 + asteroidX - 22;
        const asteroidRight = asteroidLeft + 44;
        const asteroidTop = nextY;
        const asteroidBottom = asteroidTop + 44;
        const shipLeft = width / 2 + shipOffset - 60;
        const shipRight = shipLeft + 120;
        const shipTop = height - 140;
        const shipBottom = shipTop + 72;

        const hit =
          asteroidLeft < shipRight &&
          asteroidRight > shipLeft &&
          asteroidTop < shipBottom &&
          asteroidBottom > shipTop;

        if (hit) {
          setGameOver(true);
          return currentY;
        }

        if (nextY > height + 20) {
          setScore((currentScore) => {
            const nextScore = currentScore + 1;
            if (nextScore > highScore) {
              setHighScore(nextScore);
              AsyncStorage.setItem('highScore', String(nextScore));
            }
            return nextScore;
          });
          setAsteroidX((Math.random() * 240) - 120);
          return -80;
        }

        return nextY;
      });
    }, 30);

    return () => clearInterval(intervalId);
  }, [gameOver, asteroidX, shipOffset, width, height, highScore]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#07111f', '#11213d', '#1d3f6b']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.backgroundGlow} />
      <View style={styles.backgroundGlowSmall} />

      <View style={styles.card}>
        <Text style={styles.title}>Space Escape Runner</Text>
        <Text style={styles.subtitle}>Avoid the hazards and survive!</Text>

        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Current Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>

        <View style={styles.highScoreBox}>
          <Text style={styles.scoreLabel}>High Score</Text>
          <Text style={styles.scoreValue}>{highScore}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={restartGame}>
          <Text style={styles.buttonText}>Start Game</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.asteroid, { top: asteroidY, transform: [{ translateX: asteroidX }] }]}>
        <View style={styles.asteroidRock} />
        <View style={styles.asteroidShard} />
        <View style={styles.asteroidShardSmall} />
      </View>

      <View style={styles.shipArea}>
        <View style={[styles.shipBody, { transform: [{ translateX: shipOffset }, { scale: shipPulse }] }]}>
          <View style={styles.shipWingLeft} />
          <View style={styles.shipWingRight} />
          <View style={styles.shipWindow} />
          <View style={styles.shipGlow} />
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.controlButton} onPress={() => moveShip(-1)}>
            <Text style={styles.controlButtonText}>Move Left</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={() => moveShip(1)}>
            <Text style={styles.controlButtonText}>Move Right</Text>
          </TouchableOpacity>
        </View>
      </View>

      {gameOver ? (
        <View style={styles.gameOverBox}>
          <Text style={styles.gameOverTitle}>Game Over</Text>
          <Text style={styles.gameOverText}>Final Score: {score}</Text>
          <TouchableOpacity style={styles.button} onPress={restartGame}>
            <Text style={styles.buttonText}>Restart Game</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111f',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    position: 'relative',
  },
  backgroundGlow: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(79, 140, 255, 0.24)',
  },
  backgroundGlowSmall: {
    position: 'absolute',
    bottom: 120,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(122, 232, 255, 0.16)',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    zIndex: 2,
    shadowColor: '#4f8cff',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9fb3cf',
    textAlign: 'center',
    marginBottom: 24,
  },
  scoreBox: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  highScoreBox: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#9fb3cf',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  scoreValue: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
  },
  button: {
    backgroundColor: '#4f8cff',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 999,
    shadowColor: '#4f8cff',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  asteroid: {
    position: 'absolute',
    left: '50%',
    width: 44,
    height: 44,
    zIndex: 1,
  },
  asteroidRock: {
    width: 44,
    height: 44,
    backgroundColor: '#7c5b2a',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#d7b56a',
  },
  asteroidShard: {
    position: 'absolute',
    top: 6,
    right: -8,
    width: 16,
    height: 16,
    backgroundColor: '#b8893f',
    borderRadius: 8,
  },
  asteroidShardSmall: {
    position: 'absolute',
    bottom: 4,
    left: -6,
    width: 12,
    height: 12,
    backgroundColor: '#4f3420',
    borderRadius: 6,
  },
  shipArea: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  gameOverBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7, 17, 31, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    padding: 24,
  },
  gameOverTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  gameOverText: {
    fontSize: 20,
    color: '#9fb3cf',
    marginBottom: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  controlButton: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  shipBody: {
    width: 120,
    height: 72,
    backgroundColor: '#5f8cff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#cde6ff',
    shadowColor: '#6ebdff',
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  shipWingLeft: {
    position: 'absolute',
    left: -18,
    top: 16,
    width: 30,
    height: 30,
    backgroundColor: '#3757b3',
    borderRadius: 10,
    transform: [{ rotate: '-25deg' }],
  },
  shipWingRight: {
    position: 'absolute',
    right: -18,
    top: 16,
    width: 30,
    height: 30,
    backgroundColor: '#3757b3',
    borderRadius: 10,
    transform: [{ rotate: '25deg' }],
  },
  shipWindow: {
    width: 32,
    height: 24,
    backgroundColor: '#9fe7ff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  shipGlow: {
    position: 'absolute',
    bottom: -10,
    width: 70,
    height: 16,
    backgroundColor: '#7ae8ff',
    borderRadius: 999,
    opacity: 0.75,
  },
});
