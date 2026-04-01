'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Info } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUpdateTask } from '@/hooks/use-tasks';
import { TaskStatus } from '@/types';
import type { Task } from '@/types';
import TaskKanbanCard from './task-kanban-card';

const KANBAN_COLUMNS = [
  { id: TaskStatus.TODO, title: 'To Do', color: 'bg-slate-400' },
  { id: TaskStatus.IN_PROGRESS, title: 'In Progress', color: 'bg-blue-400' },
  { id: TaskStatus.IN_REVIEW, title: 'In Review', color: 'bg-amber-400' },
  { id: TaskStatus.DONE, title: 'Done', color: 'bg-emerald-400' },
  { id: TaskStatus.BLOCKED, title: 'Blocked', color: 'bg-red-400' },
];

const FINALISED_COLUMN = {
  id: TaskStatus.FINALISED,
  title: 'Finalised',
  color: 'bg-purple-400',
};

const COLUMN_BG: Record<string, string> = {
  [TaskStatus.TODO]: 'bg-slate-400/5',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-400/5',
  [TaskStatus.IN_REVIEW]: 'bg-amber-400/5',
  [TaskStatus.DONE]: 'bg-emerald-400/5',
  [TaskStatus.BLOCKED]: 'bg-red-400/5',
  [TaskStatus.FINALISED]: 'bg-purple-400/5',
};

// ─── Droppable Column ────────────────────────────────────────────────────────

interface KanbanColumnProps {
  column: { id: TaskStatus; title: string; color: string };
  tasks: Task[];
  showProject?: boolean;
}

function KanbanColumn({ column, tasks, showProject }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const taskIds = tasks.map((t) => t.id);

  return (
    <div className="flex min-w-[280px] w-[280px] shrink-0 flex-col">
      {/* Column header */}
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className={`h-2.5 w-2.5 rounded-full ${column.color}`} />
        <span className="text-sm font-semibold">{column.title}</span>
        <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-[10px]">
          {tasks.length}
        </Badge>
      </div>

      {/* Droppable zone */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 rounded-lg border border-border/40 p-2
          max-h-[calc(100vh-16rem)] overflow-y-auto
          transition-colors duration-200
          ${COLUMN_BG[column.id] ?? 'bg-muted/30'}
          ${isOver ? 'ring-2 ring-primary/30 bg-primary/5' : ''}
        `}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {tasks.map((task, i) => (
              <TaskKanbanCard key={task.id} task={task} index={i} showProject={showProject} />
            ))}
            {tasks.length === 0 && (
              <p className="py-8 text-center text-xs text-muted-foreground/60">No tasks</p>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

// ─── Kanban Board ────────────────────────────────────────────────────────────

interface TaskKanbanProps {
  tasks: Task[];
  projectId?: string;
}

export default function TaskKanban({ tasks, projectId }: TaskKanbanProps) {
  const [showFinalised, setShowFinalised] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [optimisticTasks, setOptimisticTasks] = useState<Task[] | null>(null);
  const updateTask = useUpdateTask();

  const showProject = !projectId; // show project name when viewing all tasks

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const columns = showFinalised ? [...KANBAN_COLUMNS, FINALISED_COLUMN] : KANBAN_COLUMNS;

  const effectiveTasks = optimisticTasks ?? tasks;
  const tasksByStatus = columns.reduce(
    (acc, col) => {
      acc[col.id] = effectiveTasks.filter((t) => t.status === col.id);
      return acc;
    },
    {} as Record<TaskStatus, Task[]>,
  );

  function handleDragStart(event: DragStartEvent) {
    const task = event.active.data.current?.task as Task | undefined;
    if (task) setActiveTask(task);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const draggedTask = active.data.current?.task as Task | undefined;
    if (!draggedTask) return;

    // Determine target status — over.id could be a column id or another task id
    let newStatus: TaskStatus | undefined;

    if (Object.values(TaskStatus).includes(over.id as TaskStatus)) {
      newStatus = over.id as TaskStatus;
    } else {
      const targetTask = effectiveTasks.find((t) => t.id === over.id);
      if (targetTask) newStatus = targetTask.status;
    }

    if (!newStatus || newStatus === draggedTask.status) return;

    // Optimistic: update local state immediately
    const updated = effectiveTasks.map((t) =>
      t.id === draggedTask.id ? { ...t, status: newStatus! } : t,
    );
    setOptimisticTasks(updated);

    // Call backend — clear optimistic state when done
    updateTask.mutate(
      { id: draggedTask.id, status: newStatus },
      {
        onSuccess: () => {},
        onSettled: () => setOptimisticTasks(null),
      },
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5" />
          <span>DONE = dev complete. FINALISED = billed and shared with client.</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFinalised((v) => !v)}
          className="shrink-0 gap-1.5"
        >
          {showFinalised ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {showFinalised ? 'Hide Finalised' : 'Show Finalised'}
        </Button>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <motion.div
          className="flex gap-4 overflow-x-auto pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {columns.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={tasksByStatus[col.id] ?? []}
              showProject={showProject}
            />
          ))}
        </motion.div>

        <DragOverlay>
          {activeTask ? <TaskKanbanCard task={activeTask} index={0} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
