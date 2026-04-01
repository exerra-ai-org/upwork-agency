'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, User } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { TaskStatus } from '@/types';
import type { Task } from '@/types';

interface TaskKanbanCardProps {
  task: Task;
  index: number;
  showProject?: boolean;
}

function getStatusClasses(status: TaskStatus) {
  switch (status) {
    case TaskStatus.TODO:
      return 'bg-slate-500/8 border-slate-500/20';
    case TaskStatus.IN_PROGRESS:
      return 'bg-blue-500/8 border-blue-500/20';
    case TaskStatus.IN_REVIEW:
      return 'bg-amber-500/8 border-amber-500/20';
    case TaskStatus.DONE:
      return 'bg-emerald-500/8 border-emerald-500/20';
    case TaskStatus.BLOCKED:
      return 'bg-red-500/8 border-red-500/20';
    case TaskStatus.FINALISED:
      return 'bg-purple-500/8 border-purple-500/20';
    default:
      return 'bg-card border-border/50';
  }
}

function getPriorityBorder(priority: number) {
  if (priority >= 7) return 'border-primary/40';
  if (priority >= 4) return 'border-primary/25';
  return '';
}

export default function TaskKanbanCard({ task, index, showProject }: TaskKanbanCardProps) {
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
        ${getStatusClasses(task.status)}
        ${getPriorityBorder(task.priority)}
        ${urgentClasses}
        ${isDragging ? 'opacity-50 scale-[0.98]' : ''}
      `}
    >
      {showProject && task.project && (
        <p className="mb-1 truncate text-[10px] font-medium text-muted-foreground">
          {(task.project as { title?: string }).title}
        </p>
      )}
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
