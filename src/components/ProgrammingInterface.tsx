import React from 'react';
import { Direction } from '@/utils/mazeGenerator';
import DirectionBlock from './DirectionBlock';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgrammingInterfaceProps {
  availableBlocks: Direction[];
  program: Direction[];
  isExecuting: boolean;
  currentStep: number;
  onDrop: (direction: Direction) => void;
  onPlay: () => void;
  onReset: () => void;
  onClear: () => void;
  onBlockClick: (index: number) => void;
  onReorderProgram: (fromIndex: number, toIndex: number) => void;
  className?: string;
}

export default function ProgrammingInterface({
  availableBlocks,
  program,
  isExecuting,
  currentStep,
  onDrop,
  onPlay,
  onReset,
  onClear,
  onBlockClick,
  onReorderProgram,
  className
}: ProgrammingInterfaceProps) {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const direction = e.dataTransfer.getData('direction') as Direction;
    const fromIndex = e.dataTransfer.getData('fromIndex');
    
    if (direction && !fromIndex) {
      // Dropping a new block from available blocks
      onDrop(direction);
    }
  };

  const handleProgramBlockDragStart = (e: React.DragEvent, index: number, direction: Direction) => {
    e.dataTransfer.setData('fromIndex', index.toString());
    e.dataTransfer.setData('direction', direction);
    setDraggedIndex(index);
  };

  const handleProgramBlockDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const fromIndexStr = e.dataTransfer.getData('fromIndex');
    
    if (fromIndexStr) {
      const fromIndex = parseInt(fromIndexStr);
      if (fromIndex !== dropIndex) {
        onReorderProgram(fromIndex, dropIndex);
      }
    }
    setDraggedIndex(null);
  };

  const handleProgramBlockDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Available Blocks */}
      <div className="bg-card rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-card-foreground">Direction Blocks</h3>
        <div className="flex gap-3 justify-center flex-wrap">
          {availableBlocks.map((direction, index) => (
            <DirectionBlock
              key={`${direction}-${index}`}
              direction={direction}
            />
          ))}
        </div>
      </div>

      {/* Program Area */}
      <div className="bg-card rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-card-foreground">Program</h3>
          <div className="flex gap-2">
            <Button
              onClick={onPlay}
              disabled={program.length === 0 || isExecuting}
              size="sm"
              className="bg-gradient-success"
            >
              <Play className="w-4 h-4 mr-1" />
              Play
            </Button>
            <Button
              onClick={onReset}
              disabled={!isExecuting}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
            <Button
              onClick={onClear}
              disabled={program.length === 0 || isExecuting}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
        
        <div
          className={cn(
            'min-h-20 border-2 border-dashed border-muted-foreground/30 rounded-lg p-4',
            'bg-muted/20 transition-colors',
            program.length === 0 && 'bg-muted/10'
          )}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {program.length === 0 ? (
            <div className="flex items-center justify-center h-16">
              <p className="text-muted-foreground text-sm">
                Drag direction blocks here to create your program
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {program.map((direction, index) => (
                <div
                  key={index}
                  className={cn(
                    'relative',
                    currentStep === index && isExecuting && 'ring-4 ring-accent ring-opacity-75 rounded-lg',
                    draggedIndex === index && 'opacity-50'
                  )}
                  onDrop={(e) => handleProgramBlockDrop(e, index)}
                  onDragOver={handleProgramBlockDragOver}
                >
                  <div
                    draggable={!isExecuting}
                    onDragStart={(e) => handleProgramBlockDragStart(e, index, direction)}
                  >
                    <DirectionBlock
                      direction={direction}
                      onClick={() => onBlockClick(index)}
                      className={cn(
                        'cursor-pointer',
                        currentStep === index && isExecuting && 'animate-pulse',
                        index < currentStep && isExecuting && 'opacity-50',
                        !isExecuting && 'hover:scale-105'
                      )}
                    />
                  </div>
                  <span className="absolute -top-2 -left-2 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}