export type Cell = {
  x: number;
  y: number;
  isWall: boolean;
  visited: boolean;
};

export type Maze = Cell[][];

export type Position = {
  x: number;
  y: number;
};

export type Direction = 'up' | 'down' | 'left' | 'right';

export const DIRECTIONS: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

export function seedRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return function() {
    hash = (hash * 9301 + 49297) % 233280;
    return hash / 233280;
  };
}

export function generateMaze(width: number, height: number, seed: string): {
  maze: Maze;
  start: Position;
  end: Position;
} {
  const random = seedRandom(seed);
  
  // Initialize maze with walls
  const maze: Maze = [];
  for (let y = 0; y < height; y++) {
    maze[y] = [];
    for (let x = 0; x < width; x++) {
      maze[y][x] = {
        x,
        y,
        isWall: true,
        visited: false
      };
    }
  }

  // Recursive backtracking algorithm
  function carvePassage(x: number, y: number) {
    maze[y][x].isWall = false;
    maze[y][x].visited = true;

    // Get random directions
    const directions: Direction[] = ['up', 'down', 'left', 'right'];
    for (let i = directions.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [directions[i], directions[j]] = [directions[j], directions[i]];
    }

    for (const direction of directions) {
      const dx = DIRECTIONS[direction].x * 2;
      const dy = DIRECTIONS[direction].y * 2;
      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < width && ny >= 0 && ny < height && !maze[ny][nx].visited) {
        // Carve the wall between current cell and next cell
        maze[y + DIRECTIONS[direction].y][x + DIRECTIONS[direction].x].isWall = false;
        carvePassage(nx, ny);
      }
    }
  }

  // Start carving from (1, 1) - always odd coordinates to ensure proper maze structure
  carvePassage(1, 1);

  // Find start and end positions
  const start: Position = { x: 1, y: 1 };
  let end: Position = { x: width - 2, y: height - 2 };

  // Ensure end position is not a wall
  if (maze[end.y][end.x].isWall) {
    // Find the nearest non-wall cell to the bottom-right
    for (let y = height - 1; y >= 0; y--) {
      for (let x = width - 1; x >= 0; x--) {
        if (!maze[y][x].isWall) {
          end = { x, y };
          break;
        }
      }
      if (end.x !== width - 2 || end.y !== height - 2) break;
    }
  }

  return { maze, start, end };
}

export function isValidMove(maze: Maze, from: Position, direction: Direction): boolean {
  const to = {
    x: from.x + DIRECTIONS[direction].x,
    y: from.y + DIRECTIONS[direction].y
  };

  if (to.x < 0 || to.x >= maze[0].length || to.y < 0 || to.y >= maze.length) {
    return false;
  }

  return !maze[to.y][to.x].isWall;
}

export function move(from: Position, direction: Direction): Position {
  return {
    x: from.x + DIRECTIONS[direction].x,
    y: from.y + DIRECTIONS[direction].y
  };
}