import React from 'react';
import { Maze, Position } from '@/utils/mazeGenerator';
import { cn } from '@/lib/utils';

interface MazeDisplayProps {
  maze: Maze;
  characterPosition: Position;
  fruitPosition: Position;
  path?: Position[];
  className?: string;
}

export default function MazeDisplay({ 
  maze, 
  characterPosition, 
  fruitPosition, 
  path = [],
  className 
}: MazeDisplayProps) {
  const cellSize = 'w-6 h-6';

  const isCharacterPosition = (x: number, y: number) => 
    characterPosition.x === x && characterPosition.y === y;

  const isFruitPosition = (x: number, y: number) =>
    fruitPosition.x === x && fruitPosition.y === y;

  const isInPath = (x: number, y: number) =>
    path.some(pos => pos.x === x && pos.y === y);

  return (
    <div className={cn('inline-block p-4 bg-card rounded-xl shadow-lg', className)}>
      <div className="relative">
        <div className="grid gap-0 border-2 border-border rounded-lg overflow-hidden">
          {maze.map((row, y) => (
            <div key={y} className="flex">
              {row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className={cn(
                    cellSize,
                    'relative',
                    cell.isWall 
                      ? 'bg-maze-wall' 
                      : cn(
                          'bg-maze-path',
                          isInPath(x, y) && 'bg-primary/20'
                        )
                  )}
                >
                  {isFruitPosition(x, y) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 bg-maze-fruit rounded-full shadow-lg animate-bounce" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        
        {/* Animated Character */}
        <div
          className="absolute w-4 h-4 bg-maze-character rounded-full shadow-lg transition-all duration-500 ease-in-out transform"
          style={{
            left: `${characterPosition.x * 24 + 20 - 14}px`, // 24px = cell size (w-6 = 24px) + 20px for padding
            top: `${characterPosition.y * 24 + 20 - 14}px`,
            zIndex: 10
          }}
        />
      </div>
    </div>
  );
}