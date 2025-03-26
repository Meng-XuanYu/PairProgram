// Import snake decision functions
import { greedy_snake_step as snake1 } from './build/debug.js';
import { greedy_snake_step as snake2 } from './build/debug.js';
import { greedy_snake_step as snake3 } from './build/debug.js';
import { greedy_snake_step as snake4 } from './build/debug.js';
import { greedy_snake_step as snake5 } from './build/debug.js';
import { greedy_snake_step as snake6 } from './build/debug.js';
import { greedy_snake_step as snake7 } from './build/debug.js';
import { greedy_snake_step as snake8 } from './build/debug.js';

// Game mode
export const GAME_MODE = "4snakes"; // "1v1" or "4snakes" or "custom" or "bigbattle" or "epicbattle"

// Snake decision functions mapping
export const snakeModules = [
  snake1,
  snake2,
  snake3,
  snake4,
  snake5,
  snake6,
  snake7,
  snake8,
  // You can add more snake decision functions
];

// Game parameter configuration
export const gameParameters = {
  "1v1": {
    boardSize: 5,
    snakeCount: 2,
    foodCount: 5,
    maxRounds: 50,
    // Two snakes positioned at diagonal corners
    initialSnakePositions: [
      [1, 4, 1, 3, 1, 2, 1, 1],
      [5, 2, 5, 3, 5, 4, 5, 5]
    ]
  },
  "4snakes": {
    boardSize: 8,
    snakeCount: 4,
    foodCount: 10,
    maxRounds: 100,
    // Four snakes positioned at four corners
    initialSnakePositions: [
      [4, 1, 3, 1, 2, 1, 1, 1],
      [8, 4, 8, 3, 8, 2, 8, 1],
      [5, 8, 6, 8, 7, 8, 8, 8],
      [1, 5, 1, 6, 1, 7, 1, 8],
    ]
  },
  "custom": {
    boardSize: 12,
    snakeCount: 8,  // Can support more snakes
    foodCount: 20,
    maxRounds: 200,
    // Custom snake positions
    initialSnakePositions: [
        // Eight snakes positioned at corners and sides of the board
        [2, 2, 2, 3, 3, 3, 4, 3],   // Top left corner
        [11, 2, 11, 3, 10, 3, 9, 3], // Top right corner
        [2, 11, 2, 10, 3, 10, 4, 10], // Bottom left corner
        [11, 11, 11, 10, 10, 10, 9, 10], // Bottom right corner
        [2, 6, 3, 6, 4, 6, 5, 6],   // Middle left
        [11, 6, 10, 6, 9, 6, 8, 6],  // Middle right
        [6, 2, 6, 3, 6, 4, 6, 5],    // Middle top
        [6, 11, 6, 10, 6, 9, 6, 8]   // Middle bottom
    ]
  },
  "bigbattle": {
    boardSize: 20,
    snakeCount: 4,  
    foodCount: 40,
    maxRounds: 300,
    // Four snakes positioned strategically on the larger board
    initialSnakePositions: [
        // Four snakes positioned at different corners
        [3, 3, 3, 4, 3, 5, 3, 6],   // Top left area
        [17, 3, 17, 4, 17, 5, 17, 6], // Top right area
        [3, 17, 3, 16, 3, 15, 3, 14], // Bottom left area
        [17, 17, 17, 16, 17, 15, 17, 14], // Bottom right area
    ]
  },
  "epicbattle": {
    boardSize: 30,
    snakeCount: 8,  
    foodCount: 60,
    maxRounds: 500,
    // Eight snakes positioned across the giant board
    initialSnakePositions: [
        // Four corner snakes
        [3, 3, 3, 4, 3, 5, 3, 6],       // Top left corner
        [27, 3, 27, 4, 27, 5, 27, 6],   // Top right corner
        [3, 27, 3, 26, 3, 25, 3, 24],   // Bottom left corner
        [27, 27, 27, 26, 27, 25, 27, 24], // Bottom right corner
        // Four middle area snakes
        [15, 8, 15, 9, 15, 10, 15, 11],  // Upper middle
        [15, 22, 15, 21, 15, 20, 15, 19], // Lower middle
        [8, 15, 9, 15, 10, 15, 11, 15],  // Left middle
        [22, 15, 21, 15, 20, 15, 19, 15]  // Right middle
    ]
  }
};

// Random seed, can be undefined for random generation
// Use BigInt for 64-bit seed support
export const CUSTOM_SEED = undefined; // Example: BigInt("0x123456789ABCDEF0")

// Display configurations for more snakes
export const SNAKE_DISPLAY_CONFIG = {
  // Use Unicode characters to distinguish different snakes, no color dependency
  SYMBOLS: [
    { head: '1', body: '■' },  // Snake 1
    { head: '2', body: '■' },  // Snake 2
    { head: '3', body: '■' },  // Snake 3
    { head: '4', body: '■' },  // Snake 4
    { head: '5', body: '■' },  // Snake 5
    { head: '6', body: '■' },  // Snake 6
    { head: '7', body: '■' },  // Snake 7
    { head: '8', body: '■' },  // Snake 8
    { head: '9', body: '■' },  // Snake 9
    { head: 'A', body: '■' },  // Snake 10
    { head: 'B', body: '■' },  // Snake 11
    { head: 'C', body: '■' },  // Snake 12
    { head: 'D', body: '■' },  // Snake 13
    { head: 'E', body: '■' },  // Snake 14
    { head: 'F', body: '■' },  // Snake 15
    { head: 'G', body: '■' }   // Snake 16
  ],
  
  // Backup color scheme, better display if terminal supports color
  COLORS: [
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'red',
    'white',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'red',
    'white',
    'gray',
  ]
};

// Game element symbols
export const GAME_SYMBOLS = {
  FOOD: '★',       // Food
  EMPTY: ' ',      // Empty cell
  VERTICAL: '│',   // Vertical border
  HORIZONTAL: '─', // Horizontal border
  CORNER_TL: '┌',  // Top left corner
  CORNER_TR: '┐',  // Top right corner  
  CORNER_BL: '└',  // Bottom left corner
  CORNER_BR: '┘',  // Bottom right corner
  CROSS: '┼',      // Cross
  T_DOWN: '┬',     // T-down junction
  T_UP: '┴',       // T-up junction
  T_RIGHT: '├',    // T-right junction
  T_LEFT: '┤',     // T-left junction
};
