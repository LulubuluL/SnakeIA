import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

const Snake = () => {
  const [snake, setSnake] = useState([[5, 5]]);
  const [food, setFood] = useState([10, 10]);
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const generateFood = useCallback(() => {
    let newFood;
    let isValidPosition;
    
    do {
      newFood = [
        Math.floor(Math.random() * GRID_SIZE),
        Math.floor(Math.random() * GRID_SIZE)
      ];
      // Vérifie que la nouvelle position n'est pas sur le serpent
      isValidPosition = !snake.some(segment => 
        segment[0] === newFood[0] && segment[1] === newFood[1]
      );
    } while (!isValidPosition);
    
    return newFood;
  }, [snake]);

  const handleKeyPress = useCallback((event) => {
    if (!isPlaying) return;
    
    const key = event.key;
    
    if (key === ' ') {
      setIsPaused(prev => !prev);
      return;
    }
    
    if (key === 'ArrowUp' && direction !== 'DOWN') setDirection('UP');
    if (key === 'ArrowDown' && direction !== 'UP') setDirection('DOWN');
    if (key === 'ArrowLeft' && direction !== 'RIGHT') setDirection('LEFT');
    if (key === 'ArrowRight' && direction !== 'LEFT') setDirection('RIGHT');
  }, [direction, isPlaying]);

  const checkCollision = (pos1, pos2) => {
    return pos1[0] === pos2[0] && pos1[1] === pos2[1];
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused || !isPlaying) return;

    const newSnake = [...snake];
    const head = [...newSnake[0]];

    switch (direction) {
      case 'UP':
        head[1] -= 1;
        break;
      case 'DOWN':
        head[1] += 1;
        break;
      case 'LEFT':
        head[0] -= 1;
        break;
      case 'RIGHT':
        head[0] += 1;
        break;
      default:
        break;
    }

    if (
      head[0] < 0 ||
      head[0] >= GRID_SIZE ||
      head[1] < 0 ||
      head[1] >= GRID_SIZE
    ) {
      setGameOver(true);
      return;
    }

    for (let segment of snake) {
      if (checkCollision(head, segment)) {
        setGameOver(true);
        return;
      }
    }

    newSnake.unshift(head);

    if (checkCollision(head, food)) {
      setScore(prev => prev + 10);
      setFood(generateFood());
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [snake, direction, food, gameOver, isPaused, isPlaying, generateFood]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, INITIAL_SPEED);
    return () => clearInterval(gameLoop);
  }, [moveSnake]);

  const resetGame = () => {
    const initialSnake = [[5, 5]];
    setSnake(initialSnake);
    setFood(generateFood());
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    setIsPlaying(false);
  };

  const startGame = () => {
    resetGame();
    setIsPlaying(true);
  };

  const renderSnakeSegment = (segment, index, totalSegments) => {
    const isHead = index === 0;
    
    if (isHead) {
      return (
        <>
          <div
            className="absolute bg-green-600 rounded-full"
            style={{
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              left: segment[0] * CELL_SIZE,
              top: segment[1] * CELL_SIZE,
            }}
          />
          {/* Yeux */}
          <div
            className="absolute bg-white rounded-full"
            style={{
              width: 4,
              height: 4,
              left: segment[0] * CELL_SIZE + 4,
              top: segment[1] * CELL_SIZE + 4,
            }}
          />
          <div
            className="absolute bg-white rounded-full"
            style={{
              width: 4,
              height: 4,
              left: segment[0] * CELL_SIZE + 12,
              top: segment[1] * CELL_SIZE + 4,
            }}
          />
        </>
      );
    }

    // Calcul de la teinte de vert en fonction de la position dans le corps
    const greenIntensity = 500 - Math.min(Math.floor(index / totalSegments * 100), 100);
    
    return (
      <div
        key={index}
        className={`absolute rounded-full`}
        style={{
          width: CELL_SIZE - 2,
          height: CELL_SIZE - 2,
          left: segment[0] * CELL_SIZE,
          top: segment[1] * CELL_SIZE,
          backgroundColor: `rgb(${34 + index * 2}, ${greenIntensity - index * 2}, ${34 + index * 2})`,
          boxShadow: 'inset 0 0 4px rgba(0, 0, 0, 0.1)'
        }}
      />
    );
  };

  const renderApple = () => (
    <>
      {/* Corps de la pomme */}
      <div
        className="absolute bg-red-500 rounded-full"
        style={{
          width: CELL_SIZE - 4,
          height: CELL_SIZE - 4,
          left: food[0] * CELL_SIZE + 2,
          top: food[1] * CELL_SIZE + 2,
          boxShadow: 'inset -2px -2px 4px rgba(0, 0, 0, 0.2)'
        }}
      />
      {/* Tige */}
      <div
        className="absolute bg-green-700"
        style={{
          width: 2,
          height: 6,
          left: food[0] * CELL_SIZE + 9,
          top: food[1] * CELL_SIZE,
        }}
      />
      {/* Feuille */}
      <div
        className="absolute bg-green-500 rotate-45"
        style={{
          width: 6,
          height: 6,
          left: food[0] * CELL_SIZE + 12,
          top: food[1] * CELL_SIZE + 2,
        }}
      />
    </>
  );

  return (
    <Card className="w-full max-w-lg mx-auto bg-gradient-to-b from-green-50 to-green-100">
      <CardHeader>
        <CardTitle className="text-center text-3xl font-bold text-green-800">Snake Game</CardTitle>
      </CardHeader>
      <CardContent>
        {!isPlaying && !gameOver ? (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-semibold text-green-700">Bienvenue dans Snake !</h2>
            <p className="text-gray-600">
              Utilisez les flèches directionnelles pour diriger le serpent.<br />
              Mangez les pommes pour grandir et marquer des points !
            </p>
            <button 
              onClick={startGame}
              className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors duration-200 shadow-lg"
            >
              Jouer
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-green-800 mb-2">Score: {score}</div>
              {gameOver && (
                <div className="space-y-4">
                  <div className="text-red-500 text-xl font-bold mb-2">Game Over!</div>
                  <button 
                    onClick={resetGame}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md"
                  >
                    Rejouer
                  </button>
                </div>
              )}
              {isPlaying && !gameOver && (
                <button 
                  onClick={() => setIsPaused(p => !p)}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-md"
                >
                  {isPaused ? 'Reprendre' : 'Pause'}
                </button>
              )}
            </div>
            <div 
              className="border-2 border-green-300 relative mx-auto bg-green-50 shadow-lg rounded-lg overflow-hidden"
              style={{
                width: GRID_SIZE * CELL_SIZE,
                height: GRID_SIZE * CELL_SIZE
              }}
            >
              {renderApple()}
              {snake.map((segment, index) => renderSnakeSegment(segment, index, snake.length))}
            </div>
            
            <div className="text-center mt-4 text-sm text-gray-600">
              Utilisez les flèches pour diriger le serpent<br />
              Appuyez sur Espace pour mettre en pause
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Snake;
