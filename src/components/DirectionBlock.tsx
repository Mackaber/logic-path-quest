import React from 'react';
import { Button } from '@/components/ui/button';
import { Direction } from '@/utils/mazeGenerator';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DirectionBlockProps {
  direction: Direction;
  isDragging?: boolean;
  onDragStart?: (direction: Direction) => void;
  onClick?: () => void;
  className?: string;
}

const DIRECTION_ICONS = {
  up: ChevronUp,
  down: ChevronDown,
  left: ChevronLeft,
  right: ChevronRight,
};

const DIRECTION_COLORS = {
  up: 'bg-block-up hover:bg-block-up/90',
  down: 'bg-block-down hover:bg-block-down/90', 
  left: 'bg-block-left hover:bg-block-left/90',
  right: 'bg-block-right hover:bg-block-right/90',
};

export default function DirectionBlock({ 
  direction, 
  isDragging = false, 
  onDragStart, 
  onClick,
  className 
}: DirectionBlockProps) {
  const Icon = DIRECTION_ICONS[direction];
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('direction', direction);
    onDragStart?.(direction);
  };

  return (
    <Button
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className={cn(
        'w-16 h-16 p-0 cursor-grab active:cursor-grabbing shadow-lg',
        'border-2 border-white/20 backdrop-blur-sm',
        'transition-all duration-200 hover:scale-105 hover:shadow-xl',
        DIRECTION_COLORS[direction],
        isDragging && 'opacity-50 scale-95',
        className
      )}
      variant="secondary"
    >
      <Icon className="w-8 h-8 text-white" />
    </Button>
  );
}