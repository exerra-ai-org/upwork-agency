'use client';

import { useState } from 'react';
import { useAllTasks, useCreateTask } from '@/hooks/use-tasks';
import { useProjects } from '@/hooks/use-projects';
import { useAuthContext } from '@/components/auth-provider';
import TaskKanban from '@/components/tasks/task-kanban';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, ListChecks } from 'lucide-react';
import { ProjectStage } from '@/types';

const ALL_PROJECTS_VALUE = '__all__';

const DELIVERY_STAGES = [ProjectStage.IN_PROGRESS, ProjectStage.WON, ProjectStage.COMPLETED];

export default function TasksPage() {
  const { user, activeOrganizationId } = useAuthContext();
  const role = user?.role?.toLowerCase() ?? '';
  const canCreate = ['admin', 'project_manager', 'operator'].includes(role);
  const isDeveloper = role === 'developer';

  const [selectedProjectId, setSelectedProjectId] = useState<string>(ALL_PROJECTS_VALUE);
  const [createOpen, setCreateOpen] = useState(false);
  const [createProjectId, setCreateProjectId] = useState<string>('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('3');
  const [taskUrgent, setTaskUrgent] = useState(false);

  // Fetch delivery-phase projects for the project filter
  const { data: projectsData } = useProjects({
    limit: 200,
    organizationId: activeOrganizationId ?? undefined,
  });
  const deliveryProjects =
    projectsData?.data?.filter((p) => DELIVERY_STAGES.includes(p.stage)) ?? [];

  // Build task query params based on role
  const taskParams: { assigneeId?: string; projectId?: string } = {};
  if (isDeveloper && user?.id) {
    taskParams.assigneeId = user.id;
  }
  if (selectedProjectId && selectedProjectId !== ALL_PROJECTS_VALUE) {
    taskParams.projectId = selectedProjectId;
  }

  const { data: tasks, isLoading: tasksLoading } = useAllTasks(taskParams);
  const createTask = useCreateTask();

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 overflow-hidden p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div className="flex items-center gap-3">
          <ListChecks className="h-6 w-6 text-primary" />
          <div>
            <h1 className="gradient-text text-2xl font-bold tracking-tight">Tasks</h1>
            <p className="text-sm text-muted-foreground">Kanban board for project tasks</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Project filter (optional) */}
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-72">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_PROJECTS_VALUE}>All Projects</SelectItem>
              {deliveryProjects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
              {deliveryProjects.length === 0 && (
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  No delivery-phase projects found
                </div>
              )}
            </SelectContent>
          </Select>

          {/* Create task */}
          {canCreate && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Task</DialogTitle>
                  <DialogDescription>Add a new task to a project.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <div className="space-y-1.5">
                    <Label>
                      Project <span className="text-destructive">*</span>
                    </Label>
                    <Select value={createProjectId} onValueChange={setCreateProjectId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project..." />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveryProjects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Title</Label>
                    <Input
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="Task title"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Description</Label>
                    <Textarea
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      placeholder="Optional description"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Priority (P1-P10)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={taskPriority}
                        onChange={(e) => setTaskPriority(e.target.value)}
                        disabled={taskUrgent}
                      />
                    </div>
                    <div className="flex items-end gap-2 pb-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={taskUrgent}
                          onChange={(e) => setTaskUrgent(e.target.checked)}
                          className="rounded border-border"
                        />
                        <span className="text-sm text-destructive font-medium">Urgent (P0)</span>
                      </label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    disabled={!taskTitle || !createProjectId || createTask.isPending}
                    onClick={() => {
                      const priority = taskUrgent
                        ? 0
                        : Math.max(1, Math.min(10, parseInt(taskPriority) || 1));
                      createTask.mutate(
                        {
                          projectId: createProjectId,
                          title: taskTitle,
                          description: taskDescription || undefined,
                          priority,
                        },
                        {
                          onSuccess: () => {
                            setTaskTitle('');
                            setTaskDescription('');
                            setTaskPriority('3');
                            setTaskUrgent(false);
                            setCreateProjectId('');
                            setCreateOpen(false);
                          },
                        },
                      );
                    }}
                  >
                    {createTask.isPending ? 'Creating...' : 'Create Task'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-hidden">
        {tasksLoading ? (
          <div className="flex gap-4 h-full">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="min-w-[280px] w-[280px] space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <TaskKanban
            tasks={tasks ?? []}
            projectId={selectedProjectId !== ALL_PROJECTS_VALUE ? selectedProjectId : undefined}
          />
        )}
      </div>
    </div>
  );
}
