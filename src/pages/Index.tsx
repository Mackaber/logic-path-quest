import React, { useState, useCallback, useEffect } from 'react';
import { generateMaze, Direction, Position, isValidMove, move, DIRECTIONS } from '@/utils/mazeGenerator';
import MazeDisplay from '@/components/MazeDisplay';
import ProgrammingInterface from '@/components/ProgrammingInterface';
import DirectionBlock from '@/components/DirectionBlock';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Shuffle, Trophy, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type GameState = 'idle' | 'running' | 'success' | 'error';

const Index = () => {
  const [seed, setSeed] = useState(() => Math.random().toString(36).substring(7));
  const [gameState, setGameState] = useState<GameState>('idle');
  const [program, setProgram] = useState<Direction[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [characterPosition, setCharacterPosition] = useState<Position>({ x: 1, y: 1 });
  const [executionPath, setExecutionPath] = useState<Position[]>([]);
  const [mazeData, setMazeData] = useState(() => generateMaze(15, 15, seed));

  // Generate maze when seed changes
  useEffect(() => {
    const newMazeData = generateMaze(15, 15, seed);
    setMazeData(newMazeData);
    setCharacterPosition(newMazeData.start);
    setExecutionPath([newMazeData.start]);
  }, [seed]);

  const { maze, start, end } = mazeData;

  const availableBlocks: Direction[] = ['up', 'down', 'left', 'right'];

  const generateNewMaze = () => {
    if (gameState === 'running') return;
    const newSeed = Math.random().toString(36).substring(7);
    setSeed(newSeed);
    setProgram([]);
    setCurrentStep(0);
    setGameState('idle');
    setExecutionPath([]);
  };

  const addToProgram = useCallback((direction: Direction) => {
    if (gameState === 'running') return;
    setProgram(prev => [...prev, direction]);
  }, [gameState]);

  const executeProgram = useCallback(async () => {
    if (program.length === 0 || gameState === 'running') return;

    setGameState('running');
    setCurrentStep(0);
    setCharacterPosition(start);
    setExecutionPath([start]);

    let currentPos = start;
    const path = [start];

    for (let i = 0; i < program.length; i++) {
      setCurrentStep(i);
      
      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 600));

      const direction = program[i];
      
      if (!isValidMove(maze, currentPos, direction)) {
        setGameState('error');
        toast({
          title: "Error!",
          description: `Can't move ${direction} from current position. Program stopped at step ${i + 1}.`,
          variant: "destructive",
        });
        return;
      }

      currentPos = move(currentPos, direction);
      path.push(currentPos);
      setCharacterPosition(currentPos);
      setExecutionPath([...path]);

      // Check if reached the fruit
      if (currentPos.x === end.x && currentPos.y === end.y) {
        setGameState('success');
        toast({
          title: "Success! 🎉",
          description: "You've reached the fruit! Well done!",
          variant: "default",
        });
        return;
      }
    }

    // Program finished but didn't reach the fruit
    setGameState('idle');
    toast({
      title: "Program Complete",
      description: "Program finished, but you didn't reach the fruit. Try adding more steps!",
      variant: "destructive",
    });
  }, [program, maze, start, end]);

  const resetExecution = () => {
    setGameState('idle');
    setCurrentStep(0);
    setCharacterPosition(start);
    setExecutionPath([start]);
  };

  const clearProgram = () => {
    if (gameState === 'running') return;
    setProgram([]);
    resetExecution();
  };

  const removeFromProgram = (index: number) => {
    if (gameState === 'running') return;
    setProgram(prev => prev.filter((_, i) => i !== index));
  };

  const reorderProgram = (fromIndex: number, toIndex: number) => {
    if (gameState === 'running') return;
    setProgram(prev => {
      const newProgram = [...prev];
      const [movedBlock] = newProgram.splice(fromIndex, 1);
      newProgram.splice(toIndex, 0, movedBlock);
      return newProgram;
    });
  };

  const getStatusColor = () => {
    switch (gameState) {
      case 'success': return 'text-secondary';
      case 'error': return 'text-destructive';
      case 'running': return 'text-accent';
      default: return 'text-primary';
    }
  };

  const getStatusIcon = () => {
    switch (gameState) {
      case 'success': return <Trophy className="w-5 h-5" />;
      case 'error': return <AlertTriangle className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-game">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Logic Path Quest
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Drag direction blocks to guide the character to the fruit!
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className={cn('flex items-center gap-2 transition-colors', getStatusColor())}>
              {getStatusIcon()}
              <span className="font-medium">
                {gameState === 'idle' && 'Ready to start'}
                {gameState === 'running' && `Step ${currentStep + 1}/${program.length}`}
                {gameState === 'success' && 'Success!'}
                {gameState === 'error' && 'Error occurred'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <span className="text-sm text-muted-foreground">
              Maze Seed: <code className="bg-muted px-2 py-1 rounded font-mono">{seed}</code>
            </span>
            <Button onClick={generateNewMaze} variant="outline" size="sm">
              <Shuffle className="w-4 h-4 mr-2" />
              New Maze
            </Button>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Maze Display */}
          <div className="flex justify-center">
            <MazeDisplay
              maze={maze}
              characterPosition={characterPosition}
              fruitPosition={end}
              path={executionPath}
            />
          </div>

          {/* Programming Interface */}
          <ProgrammingInterface
            availableBlocks={availableBlocks}
            program={program}
            isExecuting={gameState === 'running'}
            currentStep={currentStep}
            onDrop={addToProgram}
            onPlay={executeProgram}
            onReset={resetExecution}
            onClear={clearProgram}
            onBlockClick={removeFromProgram}
            onReorderProgram={reorderProgram}
          />
        </div>

        {/* Game Instructions */}
        <Card className="mt-8 p-6 bg-card/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-3">How to Play</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p className="mb-2">
                <strong>Goal:</strong> Guide the blue character to the red fruit using direction blocks.
              </p>
              <p className="mb-2">
                <strong>Instructions:</strong> Drag direction blocks from the top panel into the program area.
              </p>
            </div>
            <div>
              <p className="mb-2">
                <strong>Execution:</strong> Click "Play" to execute your program step by step.
              </p>
              <p>
                <strong>Tips:</strong> Plan your path carefully - the program stops if you hit a wall!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
