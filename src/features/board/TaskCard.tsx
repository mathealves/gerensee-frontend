'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { DueDateBadge } from '@/components/shared/DueDateBadge';
import { Avatar } from '@/components/shared/Avatar';
import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  columnId: string;
  onClick: (task: Task) => void;
}

export function TaskCard({ task, columnId, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task, columnId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border bg-card p-3 shadow-sm cursor-pointer hover:border-primary/50 transition-colors group"
      onClick={() => onClick(task)}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={(e) => e.stopPropagation()}
          aria-label="Drag task"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Card content */}
        <div className="flex-1 min-w-0 space-y-2">
          <p className="text-sm font-medium leading-snug line-clamp-2">{task.title}</p>

          <div className="flex flex-wrap items-center gap-1.5">
            <PriorityBadge priority={task.priority} />
            {task.dueDate && <DueDateBadge dueDate={task.dueDate} />}
          </div>

          {task.assignments.length > 0 && (
            <div className="flex -space-x-1.5">
              {task.assignments.slice(0, 4).map((a) => (
                <Avatar
                  key={a.id}
                  name={a.projectMember.member.user.name}
                  className="h-6 w-6 text-[9px] ring-2 ring-card"
                />
              ))}
              {task.assignments.length > 4 && (
                <span className="h-6 w-6 rounded-full bg-muted ring-2 ring-card flex items-center justify-center text-[9px] font-medium">
                  +{task.assignments.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
