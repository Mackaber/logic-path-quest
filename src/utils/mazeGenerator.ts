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
  function isMazeValid(maze: Maze): boolean {
    let openCells: Position[] = [];
    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[0].length; x++) {
        if (!maze[y][x].isWall) {
          openCells.push({ x, y });
        }
      }
    }
    if (openCells.length <= 1) return false; // single square
    // Check if all open cells are in a straight line
    const allSameRow = openCells.every(cell => cell.y === openCells[0].y);
    const allSameCol = openCells.every(cell => cell.x === openCells[0].x);
    if (allSameRow || allSameCol) return false;
    return true;
  }

  let maze: Maze;
  let start: Position;
  let end: Position;
  let tries = 0;
  do {
    tries++;
    const random = seedRandom(seed + tries); // change seed for each try
    maze = [];
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

    function carvePassage(x: number, y: number) {
      if (x < 0 || x >= width || y < 0 || y >= height) return;
      maze[y][x].isWall = false;
      maze[y][x].visited = true;
      const directions: Direction[] = ['up', 'down', 'left', 'right'];
      for (let i = directions.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [directions[i], directions[j]] = [directions[j], directions[i]];
      }
      for (const direction of directions) {
        if (!direction || !DIRECTIONS[direction]) continue;
        const dx = DIRECTIONS[direction].x * 2;
        const dy = DIRECTIONS[direction].y * 2;
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height && !maze[ny][nx].visited) {
          const wallX = x + DIRECTIONS[direction].x;
          const wallY = y + DIRECTIONS[direction].y;
          if (wallX >= 0 && wallX < width && wallY >= 0 && wallY < height) {
            maze[wallY][wallX].isWall = false;
          }
          carvePassage(nx, ny);
        }
      }
    }
    carvePassage(1, 1);
    start = { x: 1, y: 1 };
    end = { x: width - 2, y: height - 2 };
    if (maze[end.y][end.x].isWall) {
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
  } while (!isMazeValid(maze));
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