'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, User } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { Task } from '@/types';

interface TaskKanbanCardProps {
  task: Task;
  index: number;
}

function getPriorityClasses(priority: number) {
  if (priority >= 7) return 'bg-primary/10 border-primary/30';
  if (priority >= 4) return 'bg-primary/5 border-primary/20';
  return 'bg-card border-border/50';
}

export default function TaskKanbanCard({ task, index }: TaskKanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const urgentClasses = task.isUrgent
    ? 'shadow-[0_0_12px_rgba(239,68,68,0.4)] ring-1 ring-red-500/30'
    : '';

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className={`
        cursor-grab rounded-lg border p-3 shadow-sm
        ${getPriorityClasses(task.priority)}
        ${urgentClasses}
        ${isDragging ? 'opacity-50 scale-[0.98]' : ''}
      `}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {task.isUrgent && (
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
            )}
            <p className="truncate text-sm font-medium">{task.title}</p>
          </div>
          {task.description && (
            <p className="mt-1 truncate text-xs text-muted-foreground">{task.description}</p>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        {task.assignee && (
          <span className="flex items-center gap-1 truncate">
            <User className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {[task.assignee.firstName, task.assignee.lastName].filter(Boolean).join(' ') ||
                task.assignee.email}
            </span>
          </span>
        )}

        <div className="flex-1" />

        {task.priority > 0 && (
          <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-semibold">
            P{task.priority}
          </Badge>
        )}

        {task.estimatedHours != null && (
          <span className="flex items-center gap-0.5 shrink-0">
            <Clock className="h-3 w-3" />
            {task.estimatedHours}h
          </span>
        )}
      </div>
    </motion.div>
  );
}
