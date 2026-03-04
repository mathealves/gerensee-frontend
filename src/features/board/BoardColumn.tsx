'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskCard } from '@/features/board/TaskCard';
import type { BoardColumn as BoardColumnType, Task } from '@/types';

interface BoardColumnProps {
  column: BoardColumnType;
  onTaskClick: (task: Task) => void;
  onQuickCreate: (statusId: string, title: string) => Promise<void>;
}

export function BoardColumn({ column, onTaskClick, onQuickCreate }: BoardColumnProps) {
  const [quickTitle, setQuickTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [showInput, setShowInput] = useState(false);

  // Sortable for column drag-to-reorder
  const {
    attributes,
    listeners,
    setNodeRef: setColumnRef,
    transform,
    transition,
    isDragging: isColumnDragging,
  } = useSortable({
    id: column.id,
    data: { type: 'column' },
  });

  const columnStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isColumnDragging ? 0.5 : 1,
  };

  // Droppable area for tasks inside the column
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: column.id,
    data: { columnId: column.id },
  });

  const handleQuickCreate = async () => {
    const title = quickTitle.trim();
    if (!title) return;
    setCreating(true);
    try {
      await onQuickCreate(column.id, title);
      setQuickTitle('');
      setShowInput(false);
    } finally {
      setCreating(false);
    }
  };

  const taskIds = column.tasks.map((t) => t.id);

  return (
    <div
      ref={setColumnRef}
      style={columnStyle}
      className="flex flex-col w-72 shrink-0 rounded-xl border bg-muted/40"
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Drag column"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        {column.color && (
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: column.color }}
          />
        )}
        <span className="flex-1 text-sm font-semibold truncate">{column.name}</span>
        <span className="text-xs text-muted-foreground ml-auto shrink-0">
          {column.tasks.length}
        </span>
      </div>

      {/* Tasks area */}
      <div
        ref={setDropRef}
        className={cn(
          'flex-1 p-2 space-y-2 min-h-[80px] rounded-b-xl transition-colors',
          isOver && 'bg-primary/5',
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} columnId={column.id} onClick={onTaskClick} />
          ))}
        </SortableContext>

        {/* Quick-create */}
        {showInput ? (
          <div className="space-y-1.5">
            <Input
              autoFocus
              placeholder="Task title…"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleQuickCreate();
                if (e.key === 'Escape') setShowInput(false);
              }}
              className="h-8 text-sm"
            />
            <div className="flex gap-1">
              <Button
                size="sm"
                className="h-7 text-xs"
                disabled={creating}
                onClick={handleQuickCreate}
              >
                {creating ? '…' : 'Add'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => setShowInput(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="w-full flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add task
          </button>
        )}
      </div>
    </div>
  );
}
